import { RideRequest } from "./ride-request.model.js";
import { matchRideRequest } from "../pool/pool.service.js";

export const createRideRequest = async ({
  passengerId,
  pickupArea,
  destinationArea,
  requestedSeats,
}) => {
  const existingRide = await RideRequest.findOne({
    passengerId,
    status: {
      $in: ["WAITING", "MATCHED", "IN_PROGRESS"],
    },
  });

  if (existingRide) {
    throw new Error("You already have an active ride request");
  }

  const rideRequest = await RideRequest.create({
    passengerId,
    pickupArea,
    destinationArea,
    requestedSeats,
    status: "WAITING",
  });

  await matchRideRequest(rideRequest);

  return rideRequest;
};

export const getMyRideRequests = async (passengerId) => {
  return RideRequest.find({
    passengerId,
  }).sort({ createdAt: -1 });
};

export const getRideRequestById = async ({ rideId, passengerId }) => {
  const ride = await RideRequest.findOne({
    _id: rideId,
    passengerId,
  });

  if (!ride) {
    throw new Error("Ride request not found");
  }

  return ride;
};
