import { z } from "zod";

export const createPromptSchema = z.object({
  courseId: z.string().uuid(),
  part: z.coerce.number().int().min(1).max(3),
  title: z.string().min(2),
  promptText: z.string().min(5),
  prepTimeSeconds: z.coerce.number().int().min(0).optional(),
  speakTimeSeconds: z.coerce.number().int().min(10),
});
export type CreatePromptInput = z.infer<typeof createPromptSchema>;

export const updatePromptSchema = createPromptSchema.partial().extend({
  isPublished: z.boolean().optional(),
});
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;

export const listPromptsQuerySchema = z.object({
  courseId: z.string().uuid(),
  part: z.coerce.number().int().min(1).max(3).optional(),
});

export const submitRecordingSchema = z.object({
  promptId: z.string().uuid(),
  recordingType: z.enum(["video", "audio"]),
  durationSeconds: z.coerce.number().int().min(1).optional(),
});
export type SubmitRecordingInput = z.infer<typeof submitRecordingSchema>;

export const idParamSchema = z.object({ id: z.string().uuid() });
