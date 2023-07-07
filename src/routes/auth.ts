import { Router } from "express";

import { validators } from "../middleware/validators";
import { authValidator } from "../middleware/authVerifier";
import { authController } from "../controllers";

const router = Router();

router.post("/login", validators.loginValidationRules, validators.validate, authController.login);

router.post(
  "/register",
  validators.registerValidationRules,
  validators.validate,
  authController.register,
);

router.post("/refresh", authValidator.verifyRefreshToken, authController.refreshToken);

router.post("/logout", authController.logout);

export default router;
