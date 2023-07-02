import { Response } from "express";

import { Error } from "../types";
import { messages } from "../constants";

const { APP_SERVER_ERROR } = messages;

/*
 * Send http response
 */
export const sendResponse = (res: Response, data: unknown, code = 200) =>
  res.status(code).json({
    success: true,
    data,
  });

/*
 * Send http error response
 */
export const sendError = (res: Response, error: Error) => {
  const { statusCode = 500, message: errorMessage } = error;

  const message = statusCode === 500 ? APP_SERVER_ERROR : errorMessage;

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
