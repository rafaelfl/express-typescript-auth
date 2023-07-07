import { Router } from "express";

import { authValidator } from "../middleware/authVerifier";
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
