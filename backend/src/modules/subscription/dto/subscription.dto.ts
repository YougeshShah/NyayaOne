import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(2, "Plan name is required"),
  description: z.string().optional(),
  priceMonthly: z.coerce.number().int().nonnegative().optional(),
  maxLawyers: z.coerce.number().int().positive().optional(),
  maxCases: z.coerce.number().int().positive().optional(),
  maxStorageMb: z.coerce.number().int().positive().optional(),
});
export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const updatePlanSchema = createPlanSchema.partial().extend({
  isActive: z.coerce.boolean().optional(),
});
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

export const assignPlanSchema = z.object({
  lawFirmId: z.string().uuid(),
  planId: z.string().uuid(),
  status: z.enum(["TRIAL", "ACTIVE", "EXPIRED", "CANCELLED"]).default("ACTIVE"),
  expiresAt: z.coerce.date().optional(),
});
export type AssignPlanInput = z.infer<typeof assignPlanSchema>;

export const updateSubscriptionStatusSchema = z.object({
  status: z.enum(["TRIAL", "ACTIVE", "EXPIRED", "CANCELLED"]),
  expiresAt: z.coerce.date().optional(),
});
export type UpdateSubscriptionStatusInput = z.infer<typeof updateSubscriptionStatusSchema>;

export const planIdParamSchema = z.object({ id: z.string().uuid() });
export const lawFirmIdParamSchema = z.object({ lawFirmId: z.string().uuid() });
