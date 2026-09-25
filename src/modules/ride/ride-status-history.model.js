import mongoose from "mongoose";

const rideStatusHistorySchema = new mongoose.Schema(
  {
    poolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pool",
      required: true,
    },

    rideRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideRequest",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "OPEN",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      required: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const RideStatusHistory = mongoose.model(
  "RideStatusHistory",
  rideStatusHistorySchema
);