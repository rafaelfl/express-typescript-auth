import { Request, Response } from "express";
import createHttpError from "http-errors";

import { asyncWrapper } from "../utils/asyncWrapper";
import { logger, sendError, hashPassword, sendResponse } from "../../helpers";
import { userService } from "../../services/userService";
import { messages } from "../../constants";

const registerController = asyncWrapper(async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await userService.findUserByEmail(email);

    if (existingUser) {
      logger.error(messages.EXISTING_EMAIL);
      return sendError(res, createHttpError(409, messages.EXISTING_EMAIL));
    }

    const hash = await hashPassword(password);

    await userService.create(name, email, hash, "user");

    return sendResponse(res, messages.ACCOUNT_CREATED, 201);
  } catch (err) {
    const error = err as Error;

    logger.error(error.message);
    return sendError(res, error);
  }
});

export default registerController;
