import mongoose from "mongoose";
import { Pool } from "./pool.model.js";
import { PoolMember } from "./pool-member.model.js";
import { Vehicle } from "../vehicle/vehicle.model.js";
import { RideRequest } from "../ride/ride-request.model.js";
import { RideStatusHistory } from "../ride/ride-status-history.model.js";
import { canShareRoute } from "./route-matching.js";
import { getRouteDistance } from "../ride/route-distance.js";
import { calculateFare } from "../ride/fare.js";
import { AppError } from "../../utils/AppError.js";

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

      if (
        canShareRoute(existingRequest, rideRequest) &&
        pool.occupiedSeats + rideRequest.requestedSeats <= pool.capacity
      ) {
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

  const updatedPool = await Pool.findOneAndUpdate(
    {
      _id: pool._id,
      status: "OPEN",
      occupiedSeats: {
        $lte: pool.capacity - rideRequest.requestedSeats,
      },
    },
    {
      $inc: {
        occupiedSeats: rideRequest.requestedSeats,
      },
    },
    {
      new: true,
    },
  );

  if (!updatedPool) {
    throw new Error("Not enough seats available");
  }

  const poolMember = await PoolMember.create({
    poolId: pool._id,
    passengerId: rideRequest.passengerId,
    rideRequestId: rideRequest._id,
    farePaisa,
  });

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
    rideRequest.destinationArea,
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
  if (rideRequest.status !== "WAITING") {
    throw new Error("Ride request is not waiting");
  }

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

export const updatePoolStatus = async ({ poolId, driverId, newStatus }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const vehicle = await Vehicle.findOne({
      driverId,
    }).session(session);

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    const pool = await Pool.findOne({
      _id: poolId,
      vehicleId: vehicle._id,
    }).session(session);

    if (!pool) {
      throw new AppError("Pool not found", 404);
    }

    const allowedTransitions = {
      OPEN: ["IN_PROGRESS"],
      IN_PROGRESS: ["COMPLETED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!allowedTransitions[pool.status].includes(newStatus)) {
      throw new Error(
        `Cannot change pool status from ${pool.status} to ${newStatus}`,
        400,
      );
    }

    pool.status = newStatus;

    await pool.save({ session });

    if (newStatus === "IN_PROGRESS") {
      vehicle.status = "OFFLINE";

      await vehicle.save({ session });

      const rideRequests = await RideRequest.find({
        poolId: pool._id,
        status: "MATCHED",
      }).session(session);

      for (const rideRequest of rideRequests) {
        rideRequest.status = "IN_PROGRESS";

        await rideRequest.save({ session });

        await RideStatusHistory.create(
          [
            {
              poolId: pool._id,
              rideRequestId: rideRequest._id,
              status: "IN_PROGRESS",
              changedBy: driverId,
            },
          ],
          { session },
        );
      }
    } else if (newStatus === "COMPLETED") {
      vehicle.status = "AVAILABLE";

      await vehicle.save({ session });

      const rideRequests = await RideRequest.find({
        poolId: pool._id,
        status: "IN_PROGRESS",
      }).session(session);

      for (const rideRequest of rideRequests) {
        rideRequest.status = "COMPLETED";

        await rideRequest.save({ session });

        await RideStatusHistory.create(
          [
            {
              poolId: pool._id,
              rideRequestId: rideRequest._id,
              status: "COMPLETED",
              changedBy: driverId,
            },
          ],
          { session },
        );
      }
    }

    await session.commitTransaction();

    if (newStatus === "COMPLETED") {
      await matchWaitingRideRequests();
    }

    return pool;
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};

export const matchWaitingRideRequests = async () => {
  const waitingRequests = await RideRequest.find({
    status: "WAITING",
  });

  for (const rideRequest of waitingRequests) {
    try {
      await matchRideRequest(rideRequest);
    } catch (error) {
      if (
        error.message !== "Not enough seats available" &&
        error.message !== "No available vehicle found"
      ) {
        throw error;
      }
    }
  }
};
