import express from "express";
import { getMyPool,updatePoolStatusController } from "./pool.controller.js";
import {
  authenticate,
  authorize,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/my",
  authenticate,
  authorize("DRIVER"),
  getMyPool
);

router.patch(
  "/:poolId/status",
  authenticate,
  authorize("DRIVER"),
  updatePoolStatusController,
);

export default router;