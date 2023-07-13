import { Request, Response } from "express";

import { asyncWrapper } from "./utils/asyncWrapper";
import { sendResponse } from "../helpers";

const protectedController = {
  protected: asyncWrapper(async (_req: Request, res: Response) => {
    sendResponse(res, { message: "Accessing a protected route!" });
  }),

  adminProtected: asyncWrapper(async (_req: Request, res: Response) => {
    sendResponse(res, { message: "Accessing an admin protected route!" });
  }),
};

export default protectedController;
