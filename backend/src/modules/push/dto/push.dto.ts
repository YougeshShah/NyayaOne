import { z } from "zod";

export const registerPushTokenSchema = z.object({
  pushToken: z.string().min(10, "Invalid push token"),
});
export type RegisterPushTokenInput = z.infer<typeof registerPushTokenSchema>;
