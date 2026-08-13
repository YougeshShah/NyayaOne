import { z } from "zod";

export const createLiveClassSchema = z.object({
  courseId: z.string().uuid(),
  subjectId: z.string().uuid().optional(),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.coerce.number().int().positive().default(60),
  isFreeDemo: z.coerce.boolean().default(false),
});
export type CreateLiveClassInput = z.infer<typeof createLiveClassSchema>;

export const updateLiveClassSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  isFreeDemo: z.coerce.boolean().optional(),
});
export type UpdateLiveClassInput = z.infer<typeof updateLiveClassSchema>;

export const listLiveClassesQuerySchema = z.object({
  courseId: z.string().uuid().optional(),
  upcomingOnly: z.coerce.boolean().default(false),
});
export type ListLiveClassesQuery = z.infer<typeof listLiveClassesQuerySchema>;

export const liveClassIdParamSchema = z.object({
  id: z.string().uuid("Invalid live class id"),
});
