import { NextFunction, Request, Response } from "express";
import passport from "passport";
import createError from "http-errors";

import {
  convertTimeStrToMillisec,
  generateAccessToken,
  generateTokens,
  logger,
  sendError,
  sendResponse,
  verifyRefreshToken,
} from "../../helpers";
import { asyncWrapper } from "../asyncWrapper";
import { userTokenService } from "../../services/userTokenService";
import { config } from "../../config";
import { Error, User } from "../../types";
import { messages } from "../../constants";

function promisifiedPassportLocalAuthentication(req: Request, res: Response, next: NextFunction) {
  return new Promise<{ user: User; accessToken: string; refreshToken: string }>(
    (resolve, reject) => {
      passport.authenticate(
        "local",
        { session: false },
        (err: Error, user: User, info: { message: string }) => {
          if (err) {
            reject(createError(500, err));
          }

          if (!user) {
            const { message } = info;
            reject(createError(401, message));
          }

          const { accessToken, refreshToken } = generateTokens(user);

          resolve({ user, accessToken, refreshToken });
        },
      )(req, res, next);
    },
  );
}

export const authController = {
  login: asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await promisifiedPassportLocalAuthentication(req, res, next);

      const { user, accessToken, refreshToken } = result;

      await userTokenService.removeUserTokenById(user.id ?? "");
      await userTokenService.create(user.id ?? "", refreshToken);

      res.cookie(config.refreshTokenName, refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        domain: config.cookieDomain,
        maxAge: convertTimeStrToMillisec(config.refreshTokenExpiration),
      });

      return sendResponse(res, { token: accessToken }, 201);
    } catch (err) {
      const error = err as Error;

      logger.error(error.message);
      return sendError(res, error);
    }
  }),

  refreshToken: asyncWrapper(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    try {
      const userToken = await userTokenService.findUserTokenByToken(refreshToken);

      if (!userToken) {
        throw createError(403, messages.INVALID_TOKEN);
      }

      const result = await verifyRefreshToken(userToken);

      const accessToken = generateAccessToken(result.id, result.role);

      return sendResponse(res, { token: accessToken }, 200);
    } catch (err) {
      const error = err as Error;

      logger.error(error.message);
      return sendError(res, createError(403, error));
    }
  }),

  logout: asyncWrapper(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    await userTokenService.removeUserTokenByToken(refreshToken);

    // invalidate refresh token cookie
    res.clearCookie(config.refreshTokenName);

    res.setHeader("Location", "/");
    return sendResponse(res, messages.SUCCESS_LOGOUT, 303);
  }),
};
