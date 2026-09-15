import { z } from "zod";

export const askAssistantSchema = z.object({
  question: z.string().min(3).max(1000),
});
export type AskAssistantInput = z.infer<typeof askAssistantSchema>;
