import { z } from "zod";

export const startPracticeSchema = z.object({
  courseId: z.string().uuid(),
});
export type StartPracticeInput = z.infer<typeof startPracticeSchema>;
