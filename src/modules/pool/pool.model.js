import mongoose from "mongoose";

const poolSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    occupiedSeats: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "OPEN",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "OPEN",
    },
  },
  {
    timestamps: true,
  }
);

poolSchema.index(
  { vehicleId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "OPEN",
    },
  }
);

export const Pool = mongoose.model("Pool", poolSchema);