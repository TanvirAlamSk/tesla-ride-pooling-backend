import { Pool } from "./pool.model.js";
import { PoolMember } from "./pool-member.model.js";
import { Vehicle } from "../vehicle/vehicle.model.js";
import { RideRequest } from "../ride/ride-request.model.js";

import { canShareRoute } from "./route-matching.js";
import { getRouteDistance } from "../ride/route-distance.js";
import { calculateFare } from "../ride/fare.js";

export const findMatchingPool = async (rideRequest) => {
  const openPools = await Pool.find({
    status: "OPEN",
  }).populate("vehicleId");

  for (const pool of openPools) {
    if (!pool.vehicleId) {
      continue;
    }

    const existingMembers = await PoolMember.find({
      poolId: pool._id,
    }).populate("rideRequestId");

    for (const member of existingMembers) {
      const existingRequest = member.rideRequestId;

      if (!existingRequest) {
        continue;
      }

      if (canShareRoute(existingRequest, rideRequest)) {
        return pool;
      }
    }
  }

  return null;
};

export const joinPool = async (rideRequest, pool) => {
  const distanceKm = getRouteDistance(
    rideRequest.pickupArea,
    rideRequest.destinationArea,
  );

  if (distanceKm === null) {
    throw new Error("Route distance is not available");
  }

  const farePaisa = calculateFare(distanceKm);

  const availableSeats = pool.capacity - pool.occupiedSeats;

  if (availableSeats < rideRequest.requestedSeats) {
    throw new Error("Not enough seats available");
  }

  const poolMember = await PoolMember.create({
    poolId: pool._id,
    passengerId: rideRequest.passengerId,
    rideRequestId: rideRequest._id,
    farePaisa,
  });
  pool.occupiedSeats += rideRequest.requestedSeats;
  await pool.save();

  rideRequest.poolId = pool._id;
  rideRequest.farePaisa = farePaisa;
  rideRequest.status = "MATCHED";

  await rideRequest.save();

  return poolMember;
};



export const createPoolForRide = async (rideRequest) => {
  const vehicle = await Vehicle.findOne({
    status: "AVAILABLE",
  });

  if (!vehicle) {
    throw new Error("No available vehicle found");
  }

  if (vehicle.capacity < rideRequest.requestedSeats) {
    throw new Error("Vehicle does not have enough seats");
  }

  const distanceKm = getRouteDistance(
    rideRequest.pickupArea,
    rideRequest.destinationArea
  );

  if (distanceKm === null) {
    throw new Error("Route distance is not available");
  }

  const farePaisa = calculateFare(distanceKm);

  const pool = await Pool.create({
    vehicleId: vehicle._id,
    capacity: vehicle.capacity,
    occupiedSeats: rideRequest.requestedSeats,
    status: "OPEN",
  });

  await PoolMember.create({
    poolId: pool._id,
    passengerId: rideRequest.passengerId,
    rideRequestId: rideRequest._id,
    farePaisa,
  });

  rideRequest.poolId = pool._id;
  rideRequest.farePaisa = farePaisa;
  rideRequest.status = "MATCHED";

  await rideRequest.save();

  return pool;
};


export const matchRideRequest = async (rideRequest) => {
  const matchingPool = await findMatchingPool(rideRequest);

  if (matchingPool) {
    return joinPool(rideRequest, matchingPool);
  }

  return createPoolForRide(rideRequest);
};


export const matchExistingRideRequest = async (rideId) => {
  const rideRequest = await RideRequest.findById(rideId);

  if (!rideRequest) {
    throw new Error("Ride request not found");
  }

  if (rideRequest.status !== "WAITING") {
    throw new Error("Ride request is not waiting");
  }

  return matchRideRequest(rideRequest);
};