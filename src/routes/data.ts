import { Router } from "express";

import { authVerifier } from "../middleware/authVerifier";
import { dataController } from "../controllers";

const router = Router();

router.get("/data", authVerifier.verifyAccessToken, dataController.getData);

export default router;
