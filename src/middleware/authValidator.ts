import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import passport from "passport";

import { User } from "../types";
import { logger, sendError } from "../helpers";
import { messages } from "../constants";

export const authValidator = {
  verifyAccessToken: (req: Request, res: Response, next: NextFunction) =>
    passport.authenticate("jwt", { session: false })(req, res, next),

  verifyRefreshToken: (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return sendError(res, createHttpError(403, messages.EMPTY_TOKEN));
    }

    return next();
  },

  adminOnly: (req: Request, res: Response, next: NextFunction) => {
    const { email, role } = req.user as User;

    if (role !== "admin") {
      logger.error(`user ${email} attempted to access admin only route`);
      return sendError(res, createHttpError(403, messages.ACCESS_DENIED));
    }

    return next();
  },
};
