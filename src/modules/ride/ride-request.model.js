import mongoose from "mongoose";

const rideRequestSchema = new mongoose.Schema(
  {
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pickupArea: {
      type: String,
      required: true,
      trim: true,
    },

    destinationArea: {
      type: String,
      required: true,
      trim: true,
    },

    requestedSeats: {
      type: Number,
      default: 1,
      min: 1,
    },

    poolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pool",
      default: null,
    },

    farePaisa: {
      type: Number,
      default: null,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "WAITING",
        "MATCHED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "WAITING",
    },
  },
  {
    timestamps: true,
  }
);

export const RideRequest = mongoose.model(
  "RideRequest",
  rideRequestSchema
);