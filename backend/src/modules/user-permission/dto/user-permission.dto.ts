import { z } from "zod";

export const setOverrideSchema = z.object({
  permissionId: z.string().uuid(),
  granted: z.boolean(), // true = extra grant beyond the role, false = revoke despite the role
  reason: z.string().optional(),
});
export type SetOverrideInput = z.infer<typeof setOverrideSchema>;

export const userIdParamSchema = z.object({ userId: z.string().uuid() });
export const removeOverrideParamSchema = z.object({ userId: z.string().uuid(), permissionId: z.string().uuid() });
