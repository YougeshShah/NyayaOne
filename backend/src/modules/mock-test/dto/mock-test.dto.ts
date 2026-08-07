import { z } from "zod";

const examTypes = ["LLB", "BALLB", "BAR_COUNCIL", "JUDICIAL_SERVICE", "PUBLIC_SERVICE_COMMISSION"] as const;

export const createMockTestSchema = z.object({
  title: z.string().min(2, "Title is required"),
  courseId: z.string().uuid("Course is required"),
  examType: z.enum(examTypes).optional(),
  subjectId: z.string().uuid().optional(),
  durationMinutes: z.coerce.number().int().positive().default(60),
  questionCount: z.coerce.number().int().positive().max(200).default(25), // how many random questions to pull in
});
export type CreateMockTestInput = z.infer<typeof createMockTestSchema>;

export const listMockTestsQuerySchema = z.object({
  courseId: z.string().uuid().optional(),
  examType: z.enum(examTypes).optional(),
  publishedOnly: z.coerce.boolean().default(true),
});
export type ListMockTestsQuery = z.infer<typeof listMockTestsQuerySchema>;

export const mockTestIdParamSchema = z.object({
  id: z.string().uuid("Invalid mock test id"),
});

export const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedOption: z.enum(["A", "B", "C", "D"]).nullable(),
    })
  ),
});
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
