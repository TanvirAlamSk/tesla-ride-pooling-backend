import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

export default app;