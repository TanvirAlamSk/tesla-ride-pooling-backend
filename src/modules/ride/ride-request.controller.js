import { createRideRequest,getMyRideRequests,getRideRequestById } from "./ride-request.service.js";

export const createRideRequestController = async (req, res) => {
  try {
    const rideRequest = await createRideRequest({
      passengerId: req.user.userId,
      pickupArea: req.body.pickupArea,
      destinationArea: req.body.destinationArea,
      requestedSeats: req.body.requestedSeats,
    });

    res.status(201).json({
      success: true,
      message: "Ride request created successfully",
      data: rideRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyRideRequestsController = async (req, res) => {
  try {
    const rides = await getMyRideRequests(req.user.userId);

    res.status(200).json({
      success: true,
      data: rides,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRideRequestByIdController = async (req, res) => {
  try {
    const ride = await getRideRequestById({
      rideId: req.params.id,
      passengerId: req.user.userId,
    });

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};