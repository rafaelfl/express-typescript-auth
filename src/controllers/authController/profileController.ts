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
        logger.error(messages.CANNOT_RETRIEVE_USER_DATA);
        throw createHttpError(403, messages.CANNOT_RETRIEVE_USER_DATA);
      }

      const user = await userService.findUserById(userId);

      if (!user) {
        logger.error(messages.CANNOT_RETRIEVE_USER_DATA);
        throw createHttpError(403, messages.CANNOT_RETRIEVE_USER_DATA);
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
        logger.error(messages.INVALID_TOKEN);
        throw createHttpError(403, messages.INVALID_TOKEN);
      }

      const { name, password, photo, aboutMe } = req.body;

      let hash: string | undefined;

      if (password) {
        hash = await hashPassword(password);
      }

      const updatedUser = await userService.findAndUpdateUserById(
        userId,
        name,
        hash,
        photo,
        aboutMe,
      );

      if (!updatedUser) {
        logger.error(messages.UNABLE_UPDATE_USER);
        return sendError(res, createHttpError(400, messages.UNABLE_UPDATE_USER));
      }

      // return user data
      return sendResponse(
        res,
        {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          photo: updatedUser.photo,
          aboutMe: updatedUser.aboutMe,
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
