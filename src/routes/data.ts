import { Router } from "express";

import { validators } from "../middleware/validators";
import { authVerifier } from "../middleware/authVerifier";
import { dataController } from "../controllers";

const router = Router();

router.get(
  "/data",
  validators.getPaginatedDataValidationRule,
  validators.validate,
  authVerifier.verifyAccessToken,
  dataController.getPaginatedData,
);

export default router;
