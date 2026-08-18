import { z } from "zod";

export const setLimitSchema = z.object({
  courseId: z.string().uuid(),
  practiceLimit: z.number().int().min(0).nullable().optional(),
  mockTestLimit: z.number().int().min(0).nullable().optional(),
  speakingLimit: z.number().int().min(0).nullable().optional(),
});
export type SetLimitInput = z.infer<typeof setLimitSchema>;

export const courseIdParamSchema = z.object({ courseId: z.string().uuid() });

export const moduleType = z.enum(["practice", "mockTest", "speaking"]);
export type ModuleType = z.infer<typeof moduleType>;
