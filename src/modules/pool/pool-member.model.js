import mongoose from "mongoose";

const poolMemberSchema = new mongoose.Schema(
  {
    poolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pool",
      required: true,
    },

    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rideRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideRequest",
      required: true,
    },

    farePaisa: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

poolMemberSchema.index(
  { poolId: 1, passengerId: 1 },
  { unique: true }
);

poolMemberSchema.index(
  { rideRequestId: 1 },
  { unique: true }
);

export const PoolMember = mongoose.model(
  "PoolMember",
  poolMemberSchema
);