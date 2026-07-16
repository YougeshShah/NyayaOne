import { z } from "zod";

export const createHearingSchema = z.object({
  caseId: z.string().uuid("Invalid case id"),
  hearingDate: z.coerce.date(),
  courtName: z.string().optional(),
  judge: z.string().optional(),
  remarks: z.string().optional(),
  // Testing aid: schedules an extra reminder ~2 minutes from now so push
  // notification delivery can be verified without waiting for the real
  // 48h/24h/2h schedule. Never used in production hearing creation.
  sendTestReminder: z.coerce.boolean().optional().default(false),
});
export type CreateHearingInput = z.infer<typeof createHearingSchema>;

export const updateHearingSchema = z.object({
  status: z.enum(["SCHEDULED", "COMPLETED", "ADJOURNED", "CANCELLED"]).optional(),
  remarks: z.string().optional(),
  judge: z.string().optional(),
  // If provided when marking COMPLETED/ADJOURNED, a follow-up hearing is auto-created and linked.
  nextHearingDate: z.coerce.date().optional(),
});
export type UpdateHearingInput = z.infer<typeof updateHearingSchema>;

export const listHearingsQuerySchema = z.object({
  caseId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
});
export type ListHearingsQuery = z.infer<typeof listHearingsQuerySchema>;

export const hearingIdParamSchema = z.object({
  id: z.string().uuid("Invalid hearing id"),
});
