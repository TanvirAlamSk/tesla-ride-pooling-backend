import { Router } from "express";
import { registerController,loginController,getMeController } from "./auth.controller.js";
import { registerSchema,loginSchema } from "./auth.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/me",
  authenticate,
  getMeController
);

router.post(
  "/login",
  validate(loginSchema),
  loginController
);

router.post(
  "/register",
  validate(registerSchema),
  registerController
);



export default router;