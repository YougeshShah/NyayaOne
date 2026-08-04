import { z } from "zod";

const audiences = ["ALL_LAWYERS", "SPECIFIC_LAW_FIRM", "ALL_STUDENTS", "ALL_CLIENTS", "INDIVIDUAL_USER"] as const;

export const sendNotificationSchema = z
  .object({
    title: z.string().min(2, "Title is required"),
    body: z.string().min(2, "Message body is required"),
    audience: z.enum(audiences),
    // lawFirmId (SPECIFIC_LAW_FIRM) or userId (INDIVIDUAL_USER) — the frontend
    // form always includes this field even when hidden, so an empty string
    // (not just "missing") must also count as "not provided".
    targetId: z
      .string()
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => v === undefined || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v), {
        message: "Invalid target id",
      }),
  })
  .refine((data) => data.audience !== "SPECIFIC_LAW_FIRM" || !!data.targetId, {
    message: "targetId (law firm id) is required for SPECIFIC_LAW_FIRM audience",
    path: ["targetId"],
  })
  .refine((data) => data.audience !== "INDIVIDUAL_USER" || !!data.targetId, {
    message: "targetId (user id) is required for INDIVIDUAL_USER audience",
    path: ["targetId"],
  });
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

export const notificationIdParamSchema = z.object({
  id: z.string().uuid("Invalid notification id"),
});
