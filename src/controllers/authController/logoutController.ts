import { Request, Response } from "express";
import { ExtractJwt } from "passport-jwt";
import createHttpError from "http-errors";

import { config } from "../../config";
import { messages } from "../../constants";
import { asyncWrapper } from "../utils/asyncWrapper";
import { convertTimeStrToMillisec, logger, sendError, sendResponse } from "../../helpers";
import { tokenBlackListService } from "../../services/tokenBlackListService";
import { userTokenService } from "../../services/userTokenService";

const logoutController = asyncWrapper(async (req: Request, res: Response) => {
  try {
    const { tokenExp } = req;

    const refreshToken = req.cookies[config.refreshTokenName];
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    await userTokenService.removeUserTokenByToken(refreshToken);

    if (accessToken) {
      await tokenBlackListService.addTokenToBlacklist(
        accessToken,
        tokenExp ?? convertTimeStrToMillisec(config.accessTokenExpiration),
      );
    }

    // invalidate refresh token cookie
    res.clearCookie(config.refreshTokenName);

    res.setHeader("Location", "/");
    return sendResponse(res, messages.SUCCESS_LOGOUT, 303);
  } catch (err) {
    const error = err as Error;

    logger.error(error.message);
    return sendError(res, createHttpError(403, error));
  }
});

export default logoutController;
