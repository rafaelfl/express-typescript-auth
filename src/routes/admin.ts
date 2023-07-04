import { Router } from "express";

import { authValidator } from "../middleware/authValidator";
import { adminController } from "../controllers";
import { validators } from "../middleware/validators";

const router = Router();

router.get(
  "/createAccount",
  authValidator.verifyAccessToken,
  authValidator.adminOnly,
  validators.createAccountValidationRules,
  validators.validate,
  adminController.createAccount,
);

export default router;
