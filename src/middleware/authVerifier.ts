import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import passport from "passport";

import { JwtPayload } from "../types";
import { logger, sendError } from "../helpers";
import { messages } from "../constants";

export const authVerifier = {
  verifyAccessToken: (req: Request, res: Response, next: NextFunction) =>
    passport.authenticate(
      "jwt",
      { session: false },
      (err: Error, jwtPayload: JwtPayload, info: { message: string }) => {
        if (err) {
          next(createError(500, err));
        }

        if (!jwtPayload) {
          const { message } = info;
          next(createError(401, message));
        }

        req.userId = jwtPayload.id;
        req.userRole = jwtPayload.role;
        req.tokenExp = jwtPayload.exp;

        next();
      },
    )(req, res, next),

  verifyRefreshToken: (req: Request, res: Response, next: NextFunction) =>
    passport.authenticate(
      "jwt-refresh",
      { session: false },
      (err: Error, jwtPayload: JwtPayload, info: { message: string }) => {
        if (err) {
          next(createError(500, err));
        }

        if (!jwtPayload) {
          const { message } = info;
          next(createError(403, message));
        }

        req.userId = jwtPayload.id;
        req.userRole = jwtPayload.role;
        req.tokenExp = jwtPayload.exp;

        next();
      },
    )(req, res, next),

  adminOnly: (req: Request, res: Response, next: NextFunction) => {
    const { userId, userRole } = req;

    if (userRole !== "admin") {
      logger.error(`user ${userId} attempted to access admin only route`);
      return sendError(res, createError(403, messages.ACCESS_DENIED));
    }

    return next();
  },
};
