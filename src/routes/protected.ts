import { Router } from "express";

import { authValidator } from "../middleware/authVerifier";
import { protectedController } from "../controllers";

const router = Router();

router.get("/protected", authValidator.verifyAccessToken, protectedController.protected);

router.get(
  "/adminProtected",
  authValidator.verifyAccessToken,
  authValidator.adminOnly,
  protectedController.adminProtected,
);

export default router;
