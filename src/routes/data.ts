import { Router } from "express";

import { validators } from "../middleware/validators";
import { authVerifier } from "../middleware/authVerifier";
import { dataController } from "../controllers";

const router = Router();

router.get(
  "/data",
  authVerifier.verifyAccessToken,
  validators.getPaginatedDataValidationRule,
  validators.validate,
  dataController.getPaginatedData,
);

router.get(
  "/data/:dataId",
  authVerifier.verifyAccessToken,
  validators.dataIdValidationRule,
  validators.validate,
  dataController.getData,
);

export default router;
