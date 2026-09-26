import { z } from "zod";

export const createRideRequestSchema = z.object({
  pickupArea: z.string().min(2),
  destinationArea: z.string().min(2),
  requestedSeats: z.number().int().min(1).max(3),
});