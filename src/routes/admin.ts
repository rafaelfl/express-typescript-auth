import { Router } from "express";

import { authVerifier } from "../middleware/authVerifier";
import { adminController } from "../controllers";
import { validators } from "../middleware/validators";

const router = Router();

router.get(
  "/createAccount",
  authVerifier.verifyAccessToken,
  authVerifier.adminOnly,
  validators.createAccountValidationRules,
  validators.validate,
  adminController.createAccount,
);

export default router;
