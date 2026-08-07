import { z } from "zod";

export const examTypes = ["LLB", "BALLB", "BAR_COUNCIL", "JUDICIAL_SERVICE", "PUBLIC_SERVICE_COMMISSION"] as const;

export const createSubjectSchema = z.object({
  name: z.string().min(2, "Subject name is required"),
  courseId: z.string().uuid("Course is required"),
  examType: z.enum(examTypes).optional(), // Law-specific sub-tag only — omit for IELTS/other courses
});
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;

export const listSubjectsQuerySchema = z.object({
  courseId: z.string().uuid().optional(),
  examType: z.enum(examTypes).optional(),
});
export type ListSubjectsQuery = z.infer<typeof listSubjectsQuerySchema>;

export const subjectIdParamSchema = z.object({
  id: z.string().uuid("Invalid subject id"),
});
