import { z } from "zod";

export const createContentSchema = z.object({
  courseId: z.string().uuid(),
  subjectId: z.string().uuid().optional(),
  term: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  fileType: z.enum(["PDF", "IMAGE", "TEXT"]),
  textBody: z.string().optional(),
});
export type CreateContentInput = z.infer<typeof createContentSchema>;

export const updateContentSchema = z.object({
  term: z.string().min(1).max(100).optional(),
  title: z.string().min(1).max(200).optional(),
  textBody: z.string().optional(),
});
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
