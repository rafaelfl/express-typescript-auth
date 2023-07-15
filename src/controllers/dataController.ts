import { Request, Response } from "express";

import { airbnbDataService } from "../services/airbnbDataService";
import { asyncWrapper } from "./utils/asyncWrapper";
import { sendResponse } from "../helpers";

const dataController = {
  getPaginatedData: asyncWrapper(async (req: Request, res: Response) => {
    const { page = "1", size = "10" } = req.query;

    const pageNumber = parseInt(page.toString(), 10);
    const pageSize = parseInt(size.toString(), 10);

    const airbnbData = await airbnbDataService.getPaginatedData(pageNumber, pageSize);

    sendResponse(res, airbnbData);
  }),
};

export default dataController;
