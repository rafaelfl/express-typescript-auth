import { Request, Response } from "express";
import createHttpError from "http-errors";

import { asyncWrapper } from "../utils/asyncWrapper";
import { hashPassword, logger, sendError, sendResponse } from "../../helpers";
import { userService } from "../../services/userService";
import { messages } from "../../constants";

const profileController = {
  getProfile: asyncWrapper(async (req: Request, res: Response) => {
    try {
      const { userId } = req;

      if (!userId) {
        throw createHttpError(403, messages.CANNOT_RETRIEVE_USER_DATA);
      }

      const user = await userService.findUserById(userId);

      if (!user) {
        throw createHttpError(403, messages.USER_NOT_FOUND);
      }

      // return user data
      return sendResponse(
        res,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          photo: user.photo,
          aboutMe: user.aboutMe,
        },
        200,
      );
    } catch (err) {
      const error = err as Error;

      logger.error(error.message);
      return sendError(res, createHttpError(403, error));
    }
  }),

  updateProfile: asyncWrapper(async (req: Request, res: Response) => {
    try {
      const { userId } = req;

      if (!userId) {
        throw createHttpError(403, messages.CANNOT_RETRIEVE_USER_DATA);
      }

      const { name, password, photo, aboutMe } = req.body;

      const hash = await hashPassword(password);

      const user = await userService.findAndUpdateUserById(userId, name, hash, photo, aboutMe);

      if (!user) {
        return sendError(res, createHttpError(400, messages.USER_NOT_UPDATED));
      }

      // return user data
      return sendResponse(
        res,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          photo: user.photo,
          aboutMe: user.aboutMe,
        },
        200,
      );
    } catch (err) {
      const error = err as Error;

      logger.error(error.message);
      return sendError(res, createHttpError(403, error));
    }
  }),
};

export default profileController;
