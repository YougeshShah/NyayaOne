import { z } from "zod";

export const courseCategories = ["LAW", "LANGUAGE", "OTHER"] as const;

export const createCourseSchema = z.object({
  name: z.string().min(2, "Course name is required"),
  category: z.enum(courseCategories),
  description: z.string().optional(),
  iconUrl: z.string().optional(),
});
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export const courseIdParamSchema = z.object({
  id: z.string().uuid("Invalid course id"),
});
