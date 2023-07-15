import { Request, Response } from "express";
import createHttpError from "http-errors";

import { messages } from "../constants";
import { airbnbDataService } from "../services/airbnbDataService";
import { asyncWrapper } from "./utils/asyncWrapper";
import { logger, sendError, sendResponse } from "../helpers";

const dataController = {
  getPaginatedData: asyncWrapper(async (req: Request, res: Response) => {
    try {
      const { page = "1", size = "10" } = req.query;

      const pageNumber = parseInt(page.toString(), 10);
      const pageSize = parseInt(size.toString(), 10);

      const airbnbData = await airbnbDataService.getPaginatedData(pageNumber, pageSize);

      return sendResponse(res, airbnbData);
    } catch (err) {
      const error = err as Error;

      logger.error(error.message);
      return sendError(res, error);
    }
  }),

  getData: asyncWrapper(async (req: Request, res: Response) => {
    try {
      const { dataId } = req.params;

      const airbnbData = await airbnbDataService.getData(dataId);

      if (!airbnbData) {
        logger.error(messages.UNABLE_RETRIEVE_DATA);
        return sendError(res, createHttpError(404, messages.UNABLE_RETRIEVE_DATA));
      }

      return sendResponse(res, airbnbData);
    } catch (err) {
      const error = err as Error;

      logger.error(error.message);
      return sendError(res, error);
    }
  }),
};

export default dataController;
