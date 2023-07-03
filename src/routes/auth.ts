import { Router } from "express";

import { validators } from "../middleware/validators";
import { authController } from "../controllers/auth/authController";
import { authValidator } from "../middleware/authValidator";

const router = Router();

router.post("/login", validators.loginValidationRules, validators.validate, authController.login);

router.post("/refresh", authValidator.verifyRefreshToken, authController.refreshToken);

router.post("/logout", authController.logout);

export default router;
