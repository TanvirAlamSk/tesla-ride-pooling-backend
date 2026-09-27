import { getMyVehicle } from "./vehicle.service.js";

export const getMyVehicleController = async (req, res) => {
  try {
    const vehicle = await getMyVehicle(req.user.userId);

    res.status(200).json({
      success: true,
      message: "Vehicle fetched successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};
