import { NextFunction, Request, Response } from "express";
import { sendError } from "./responseHelper";

export const errorHandler = (error: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }

  return sendError(res, error);
};
