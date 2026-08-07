import { z } from "zod";

export const examTypes = ["LLB", "BALLB", "BAR_COUNCIL", "JUDICIAL_SERVICE", "PUBLIC_SERVICE_COMMISSION"] as const;
export const difficulties = ["EASY", "MEDIUM", "HARD"] as const;
export const optionKeys = ["A", "B", "C", "D"] as const;

export const createMcqSchema = z.object({
  question: z.string().min(3, "Question is required"),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  correctOption: z.enum(optionKeys),
  explanation: z.string().optional(),
  subjectId: z.string().uuid("Subject is required"),
  courseId: z.string().uuid("Course is required"),
  examType: z.enum(examTypes).optional(), // Law-specific only — omit for IELTS/other courses
  difficulty: z.enum(difficulties).default("MEDIUM"),
  isFreeDemo: z.coerce.boolean().default(false),
});
export type CreateMcqInput = z.infer<typeof createMcqSchema>;

export const updateMcqSchema = createMcqSchema.partial();
export type UpdateMcqInput = z.infer<typeof updateMcqSchema>;

export const listMcqQuerySchema = z.object({
  courseId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  examType: z.enum(examTypes).optional(),
  difficulty: z.enum(difficulties).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListMcqQuery = z.infer<typeof listMcqQuerySchema>;

export const mcqIdParamSchema = z.object({
  id: z.string().uuid("Invalid question id"),
});
