import { Request, Response } from "express";
import createHttpError from "http-errors";

import { asyncWrapper } from "../utils/asyncWrapper";
import { config } from "../../config";
import {
  logger,
  generateTokens,
  convertTimeStrToMillisec,
  sendResponse,
  sendError,
} from "../../helpers";
import { userTokenService } from "../../services/userTokenService";
import { messages } from "../../constants";

const refreshTokenController = asyncWrapper(async (req: Request, res: Response) => {
  const { userId, userRole } = req;

  try {
    if (!userId || !userRole) {
      throw createHttpError(403, messages.CANNOT_RETRIEVE_USER_DATA);
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
      throw createHttpError(
        403,
        "Refresh token unavailable. You need to perform the sign in again.",
      );
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
    return sendError(res, createHttpError(403, error));
  }
});

export default refreshTokenController;
