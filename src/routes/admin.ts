import { Router } from "express";

import { authVerifier } from "../middleware/authVerifier";
import { adminController } from "../controllers";
import { validators } from "../middleware/validators";

const router = Router();

router.post(
  "/createAccount",
  authVerifier.verifyAccessToken,
  authVerifier.adminOnly,
  validators.createAccountValidationRules,
  validators.validate,
  adminController.createAccount,
);

router.get(
  "/user/:userId",
  authVerifier.verifyAccessToken,
  authVerifier.adminOnly,
  validators.userIdValidationRule,
  validators.validate,
  adminController.getUser,
);

router.patch(
  "/user/:userId",
  authVerifier.verifyAccessToken,
  authVerifier.adminOnly,
  validators.updateUserValidationRules,
  validators.validate,
  adminController.updateUser,
);

router.delete(
  "/user/:userId",
  authVerifier.verifyAccessToken,
  authVerifier.adminOnly,
  validators.userIdValidationRule,
  validators.validate,
  adminController.deleteUser,
);

router.get(
  "/users",
  authVerifier.verifyAccessToken,
  authVerifier.adminOnly,
  adminController.getAllUsers,
);

export default router;
