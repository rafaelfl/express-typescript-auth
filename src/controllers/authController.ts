import { NextFunction, Request, Response } from "express";
import passport from "passport";
import createError from "http-errors";

import {
  convertTimeStrToMillisec,
  generateTokens,
  hashPassword,
  logger,
  sendError,
  sendResponse,
} from "../helpers";
import { asyncWrapper } from "./utils/asyncWrapper";
import { userTokenService } from "../services/userTokenService";
import { config } from "../config";
import { Error, User } from "../types";
import { messages } from "../constants";
import { userService } from "../services/userService";

function promisifiedPassportLocalAuthentication(req: Request, res: Response, next: NextFunction) {
  return new Promise<{ user: User; accessToken: string; refreshToken: string }>(
    (resolve, reject) => {
      passport.authenticate(
        "local",
        { session: false },
        (err: Error, user: User, info: { message: string }) => {
          if (err) {
            return reject(createError(500, err));
          }

          if (!user) {
            const { message } = info;
            return reject(createError(401, message));
          }

          const { accessToken, refreshToken } = generateTokens(user.id, user.role);

          return resolve({ user, accessToken, refreshToken });
        },
      )(req, res, next);
    },
  );
}

const authController = {
  login: asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        user,
        accessToken,
        refreshToken: newRefreshToken,
      } = await promisifiedPassportLocalAuthentication(req, res, next);

      const { refreshToken: existingRefreshToken } = req.cookies;

      // in case exists a refresh token cookie...
      if (existingRefreshToken) {
        const userToken = await userTokenService.findUserTokenByToken(existingRefreshToken);

        // if it doesn't exists in the database, it means that someone else rotated it!
        //  So, let's clear all valid refresh tokens
        if (!userToken) {
          logger.warn(
            `The refresh token sent from ${user.id} was used in another device. All devices were signed out`,
          );

          // remove all valid user tokens for that user id
          await userTokenService.removeAllUserTokensById(user.id);
        } else {
          // in case the cookie is available in the session and it's in the database
          // we need rotate it
          await userTokenService.removeUserTokenById(user.id);
        }

        // invalidate refresh token cookie
        res.clearCookie(config.refreshTokenName);
      }

      // register the new refreshToken
      await userTokenService.create(user.id, newRefreshToken);

      res.cookie(config.refreshTokenName, newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: config.cookieDomain,
        maxAge: convertTimeStrToMillisec(config.refreshTokenExpiration),
      });

      return sendResponse(res, { token: accessToken }, 201);
    } catch (err) {
      const error = err as Error;

      logger.error(error.message);

      if (error.message === messages.INVALID_TOKEN || error.message === messages.NO_AUTH_TOKEN) {
        return sendError(res, createError(403, error));
      }

      return sendError(res, error);
    }
  }),

  register: asyncWrapper(async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await userService.findUserByEmail(email);

      if (existingUser) {
        logger.error(messages.EXISTING_EMAIL);
        return sendError(res, createError(409, messages.EXISTING_EMAIL));
      }

      const hash = await hashPassword(password);

      await userService.create(name, email, hash, "user");

      return sendResponse(res, messages.ACCOUNT_CREATED, 201);
    } catch (err) {
      const error = err as Error;

      logger.error(error.message);
      return sendError(res, error);
    }
  }),

  refreshToken: asyncWrapper(async (req: Request, res: Response) => {
    const { userId, userRole } = req;

    try {
      if (!userId || !userRole) {
        throw createError(403, messages.CANNOT_RETRIEVE_USER_DATA);
      }

      const refreshToken = req.cookies[config.refreshTokenName];

      // look for a valid refresh token
      const userToken = await userTokenService.findUserTokenByToken(refreshToken);

      // in case a (valid) refresh token arives here but it is not in the database
      // (i.e., someone else used it), force the sign-in from all devices again
      if (!userToken) {
        await userTokenService.removeAllUserTokensById(userId);

        logger.warn(
          `The refresh token sent from ${userId} was used in another device. All devices were signed out.`,
        );
        throw createError(403, "Refresh token unavailable. You need to perform the sign in again.");
      }

      // let's delete the refresh token to rotate it
      await userTokenService.removeUserTokenByToken(refreshToken);

      // invalidate refresh token cookie
      res.clearCookie(config.refreshTokenName);

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(userId, userRole);

      await userTokenService.create(userId, newRefreshToken);

      res.cookie(config.refreshTokenName, newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: config.cookieDomain,
        maxAge: convertTimeStrToMillisec(config.refreshTokenExpiration),
      });

      return sendResponse(res, { token: accessToken }, 200);
    } catch (err) {
      const error = err as Error;

      logger.error(error.message);
      return sendError(res, createError(403, error));
    }
  }),

  logout: asyncWrapper(async (req: Request, res: Response) => {
    const refreshToken = req.cookies[config.refreshTokenName];

    await userTokenService.removeUserTokenByToken(refreshToken);

    // invalidate refresh token cookie
    res.clearCookie(config.refreshTokenName);

    res.setHeader("Location", "/");
    return sendResponse(res, messages.SUCCESS_LOGOUT, 303);
  }),
};

export default authController;
