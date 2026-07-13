import { z } from "zod";

export const createCourtSchema = z.object({
  name: z.string().min(2, "Court name is required"),
  type: z.string().min(2, "Court type is required"), // e.g. "Supreme Court", "District Court" — free text, extensible
  province: z.string().optional(), // null for national-level courts
  location: z.string().optional(),
});
export type CreateCourtInput = z.infer<typeof createCourtSchema>;

export const updateCourtSchema = z.object({
  name: z.string().min(2).optional(),
  type: z.string().min(2).optional(),
  province: z.string().optional(),
  location: z.string().optional(),
});
export type UpdateCourtInput = z.infer<typeof updateCourtSchema>;

export const listCourtsQuerySchema = z.object({
  type: z.string().optional(),
  province: z.string().optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
});
export type ListCourtsQuery = z.infer<typeof listCourtsQuerySchema>;

export const courtIdParamSchema = z.object({
  id: z.string().uuid("Invalid court id"),
});
