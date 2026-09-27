import { Vehicle } from "../vehicle/vehicle.model.js";
import { Pool } from "./pool.model.js";
import { updatePoolStatus } from "./pool.service.js";
import { updatePoolStatusSchema } from "./pool.validation.js";

export const getMyPool = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      driverId: req.user.userId,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const pool = await Pool.findOne({
      vehicleId: vehicle._id,
      $in: ["OPEN", "IN_PROGRESS"],
    }).populate("vehicleId");

    if (!pool) {
      return res.status(404).json({
        success: false,
        message: "No open pool found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pool fetched successfully",
      data: pool,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePoolStatusController = async (req, res) => {
  try {
    const { poolId } = req.params;
    const validation = updatePoolStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid pool status",
        errors: validation.error.flatten(),
      });
    }

    const { status } = validation.data;

    const pool = await updatePoolStatus({
      poolId,
      driverId: req.user.userId,
      newStatus: status,
    });

    res.status(200).json({
      success: true,
      message: "Pool status updated successfully",
      data: pool,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};
