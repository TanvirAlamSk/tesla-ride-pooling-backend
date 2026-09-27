import { z } from "zod";

export const updatePoolStatusSchema = z.object({
  status: z.enum(["IN_PROGRESS", "COMPLETED"]),
});