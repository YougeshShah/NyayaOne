import { z } from "zod";

export const sendCodeSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(["REGISTRATION", "PASSWORD_RESET"]),
});
export type SendCodeInput = z.infer<typeof sendCodeSchema>;

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resetPasswordWithCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});
export type ResetPasswordWithCodeInput = z.infer<typeof resetPasswordWithCodeSchema>;
