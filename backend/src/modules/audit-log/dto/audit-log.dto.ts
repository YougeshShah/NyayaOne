import { z } from "zod";

export const listAuditLogsQuerySchema = z.object({
  entityType: z.string().optional(),
  userId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30),
});
export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
