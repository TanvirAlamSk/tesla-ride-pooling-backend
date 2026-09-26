import express from "express";
import { getMyVehicleController } from "./vehicle.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/my",
  authenticate,
  authorize("DRIVER"),
  getMyVehicleController
);

export default router;