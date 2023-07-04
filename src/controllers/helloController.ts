import { Request, Response } from "express";

import { asyncWrapper } from "./utils/asyncWrapper";
import { sendResponse } from "../helpers";

const helloController = {
  hello: asyncWrapper(async (_req: Request, res: Response) => {
    sendResponse(res, { msg: "Hello world" });
  }),
};

export default helloController;
