import { Router } from "express";

import { authValidator } from "../middleware/authValidator";
import protectedController from "../controllers/protected/protectedController";

const router = Router();

router.get("/protected", authValidator.verifyAccessToken, protectedController.protected);

router.get(
  "/adminprotected",
  authValidator.verifyAccessToken,
  authValidator.adminOnly,
  protectedController.adminProtected,
);

export default router;
