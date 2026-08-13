import { z } from "zod";

export const createFlashcardSchema = z.object({
  term: z.string().min(1, "Term is required"),
  definition: z.string().min(1, "Definition is required"),
  example: z.string().optional(),
  courseId: z.string().uuid(),
  subjectId: z.string().uuid().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
});
export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;

export const updateFlashcardSchema = createFlashcardSchema.partial();
export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;

export const listFlashcardsQuerySchema = z.object({
  courseId: z.string().uuid(),
  subjectId: z.string().uuid().optional(),
});
export type ListFlashcardsQuery = z.infer<typeof listFlashcardsQuerySchema>;

export const submitFamiliaritySchema = z.object({
  familiarity: z.enum(["AGAIN", "GOOD", "EASY"]),
});
export type SubmitFamiliarityInput = z.infer<typeof submitFamiliaritySchema>;
