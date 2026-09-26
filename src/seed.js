import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { User } from "./modules/user/user.model.js";
import { Vehicle } from "./modules/vehicle/vehicle.model.js";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    // Clear existing demo data
    await Vehicle.deleteMany({});
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("password123", 10);

    const jashim = await User.create({
      name: "Jashim",
      email: "jashim@example.com",
      passwordHash,
      role: "DRIVER",
    });

    const nusrat = await User.create({
      name: "Nusrat",
      email: "nusrat@example.com",
      passwordHash,
      role: "PASSENGER",
    });

    const rafiq = await User.create({
      name: "Rafiq",
      email: "rafiq@example.com",
      passwordHash,
      role: "PASSENGER",
    });

    const shirin = await User.create({
      name: "Shirin",
      email: "shirin@example.com",
      passwordHash,
      role: "PASSENGER",
    });

    const bullet = await Vehicle.create({
      driverId: jashim._id,
      name: "Bullet",
      capacity: 3,
      status: "AVAILABLE",
    });

    console.log("Seed completed successfully");

    console.log({
      jashim: jashim.email,
      nusrat: nusrat.email,
      rafiq: rafiq.email,
      shirin: shirin.email,
      vehicle: bullet.name,
    });
  } catch (error) {
    console.error("Seed failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();