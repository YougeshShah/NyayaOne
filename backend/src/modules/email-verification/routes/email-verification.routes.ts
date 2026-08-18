import { Router } from "express";
import { emailVerificationController } from "../controller/email-verification.controller";

const router = Router();
// All public -- these run BEFORE a session exists (registration
// verification, or a password reset when the person can't log in at all).
router.post("/send-code", emailVerificationController.sendCode);
router.post("/verify-email", emailVerificationController.verifyEmail);
router.post("/reset-password", emailVerificationController.resetPasswordWithCode);

export default router;
