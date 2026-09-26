import { Vehicle } from "./vehicle.model.js";

export const getMyVehicle = async (driverId) => {
  const vehicle = await Vehicle.findOne({ driverId });

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  return vehicle;
};