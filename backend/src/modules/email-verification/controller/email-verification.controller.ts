import { Request, Response } from "express";
import { emailVerificationService } from "../service/email-verification.service";
import { sendCodeSchema, verifyEmailSchema, resetPasswordWithCodeSchema } from "../dto/email-verification.dto";

export const emailVerificationController = {
  async sendCode(req: Request, res: Response) {
    const input = sendCodeSchema.parse(req.body);
    await emailVerificationService.sendCode(input.email, input.purpose);
    res.status(200).json({ success: true, message: "Verification code sent to your email." });
  },

  async verifyEmail(req: Request, res: Response) {
    const input = verifyEmailSchema.parse(req.body);
    await emailVerificationService.verifyEmail(input.email, input.code);
    res.status(200).json({ success: true, message: "Email verified successfully." });
  },

  async resetPasswordWithCode(req: Request, res: Response) {
    const input = resetPasswordWithCodeSchema.parse(req.body);
    await emailVerificationService.resetPasswordWithCode(input.email, input.code, input.newPassword);
    res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
  },
};
