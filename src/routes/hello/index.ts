import { Router } from "express";

import { helloController } from "../../controllers";

const router = Router();

/* GET hello */
router.get("/hello", helloController.hello);

export default router;
