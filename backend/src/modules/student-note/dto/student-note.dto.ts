import { z } from "zod";

export const createNoteSchema = z.object({
  courseId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
});
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
