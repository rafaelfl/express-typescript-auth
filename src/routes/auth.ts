import { Router } from "express";

import { validators } from "../middleware/validators";
import { authVerifier } from "../middleware/authVerifier";
import { authController } from "../controllers";

const router = Router();

router.post("/login", validators.loginValidationRules, validators.validate, authController.login);

router.post(
  "/register",
  validators.registerValidationRules,
  validators.validate,
  authController.register,
);

router.post("/refresh", authVerifier.verifyRefreshToken, authController.refreshToken);

router.post("/logout", authVerifier.verifyAccessToken, authController.logout);

router.get("/profile", authVerifier.verifyAccessToken, authController.getProfile);

router.patch(
  "/profile",
  authVerifier.verifyAccessToken,
  validators.updateProfileValidationRules,
  validators.validate,
  authController.updateProfile,
);

export default router;
