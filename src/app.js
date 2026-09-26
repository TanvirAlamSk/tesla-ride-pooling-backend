import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes.js";
import rideRequestRoutes from "./modules/ride/ride-request.routes.js";
import vehicleRoutes from "./modules/vehicle/vehicle.routes.js";
import poolRoutes from "./modules/pool/pool.routes.js";


const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/ride-requests", rideRequestRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/pools", poolRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

export default app;