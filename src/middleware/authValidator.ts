import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import passport from "passport";

import { User } from "../types";
import { logger, sendError } from "../helpers";
import { messages } from "../constants";

export const authValidator = {
  verifyAccessToken: (req: Request, res: Response, next: NextFunction) =>
    passport.authenticate(
      "jwt",
      { session: false },
      (err: Error, user: User, info: { message: string }) => {
        if (err) {
          next(createError(500, err));
        }

        if (!user) {
          const { message } = info;
          next(createError(401, message));
        }

        req.user = user;

        next();
      },
    )(req, res, next),

  verifyRefreshToken: (req: Request, res: Response, next: NextFunction) =>
    passport.authenticate(
      "jwt-refresh",
      { session: false },
      (err: Error, user: User, info: { message: string }) => {
        if (err) {
          next(createError(500, err));
        }

        if (!user) {
          const { message } = info;
          next(createError(403, message));
        }

        req.user = user;

        next();
      },
    )(req, res, next),

  adminOnly: (req: Request, res: Response, next: NextFunction) => {
    const { email, role } = req.user as User;

    if (role !== "admin") {
      logger.error(`user ${email} attempted to access admin only route`);
      return sendError(res, createError(403, messages.ACCESS_DENIED));
    }

    return next();
  },
};
