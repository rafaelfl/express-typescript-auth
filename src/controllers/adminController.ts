import { Request, Response } from "express";
import createError from "http-errors";

import { hashPassword, logger, sendError, sendResponse } from "../helpers";
import { asyncWrapper } from "./utils/asyncWrapper";

import { Error } from "../types";
import { messages } from "../constants";
import { userService } from "../services/userService";

const adminController = {
  createAccount: asyncWrapper(async (req: Request, res: Response) => {
    try {
      const { name, email, password, role } = req.body;

      const existingUser = await userService.findUserByEmail(email);

      if (existingUser) {
        logger.error(messages.EXISTING_EMAIL);
        return sendError(res, createError(409, messages.EXISTING_EMAIL));
      }

      const hash = await hashPassword(password);

      await userService.create(name, email, hash, role);

      return sendResponse(res, messages.ACCOUNT_CREATED, 201);
    } catch (err) {
      const error = err as Error;

      logger.error(error.message);
      return sendError(res, error);
    }
  }),
};

export default adminController;
