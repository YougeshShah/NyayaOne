import { z } from "zod";

export const examTypes = [
  "LLB",
  "BALLB",
  "BAR_COUNCIL",
  "JUDICIAL_SERVICE",
  "PUBLIC_SERVICE_COMMISSION",
  "KHARIDAR",
  "NAYAB_SUBBA",
  "SECTION_OFFICER",
] as const;
export const difficulties = ["EASY", "MEDIUM", "HARD"] as const;
export const optionKeys = ["A", "B", "C", "D"] as const;

export const createMcqSchema = z.object({
  question: z.string().min(3, "Question is required"),
  answerType: z.enum(["MCQ", "TRUE_FALSE_NOT_GIVEN", "YES_NO_NOT_GIVEN", "FILL_BLANK", "SHORT_ANSWER", "MULTI_BLANK"]).default("MCQ"),
  optionA: z.string().optional(),
  optionB: z.string().optional(),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  correctOption: z.enum(optionKeys).optional(),
  correctAnswerText: z.string().optional(),
  explanation: z.string().optional(),
  subjectId: z.string().uuid("Subject is required"),
  courseId: z.string().uuid("Course is required"),
  examType: z.enum(examTypes).optional(), // Law-specific only — omit for IELTS/other courses
  difficulty: z.enum(difficulties).default("MEDIUM"),
  isFreeDemo: z.coerce.boolean().default(false),
  sectionType: z.enum(["LISTENING", "READING", "WRITING", "SPEAKING"]).optional(),
  audioUrl: z.string().url().optional().or(z.literal("")),
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
