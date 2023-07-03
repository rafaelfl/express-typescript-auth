import { Response } from "express";

import { Error } from "../types";

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
export const sendError = (res: Response, error: Error, customMessage?: string) => {
  const { statusCode = 500, message, errors } = error;

  const errorMessage = customMessage || message;

  return res.status(statusCode).json({
    success: false,
    message: errorMessage,
    errors,
  });
};
