import { z } from "zod";

export const createRideRequestSchema = z.object({
  pickupArea: z.literal("Banani"),
  destinationArea: z.enum(["Mohakhali", "Gulshan 1"]),
  requestedSeats: z.number().int().min(1).max(3),
});