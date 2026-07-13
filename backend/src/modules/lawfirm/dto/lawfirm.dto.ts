import { z } from "zod";

export const listLawFirmsQuerySchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListLawFirmsQuery = z.infer<typeof listLawFirmsQuerySchema>;

export const lawFirmIdParamSchema = z.object({
  id: z.string().uuid("Invalid law firm id"),
});

export const suspendLawFirmSchema = z.object({
  reason: z.string().min(3, "Please provide a reason for suspension").optional(),
});
export type SuspendLawFirmInput = z.infer<typeof suspendLawFirmSchema>;
