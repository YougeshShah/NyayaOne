import { Request, Response } from "express";
import { emailVerificationService } from "../../email-verification/service/email-verification.service";
import path from "path";
import { z } from "zod";
import { authService } from "../service/auth.service";
import { registerLawFirmSchema, registerStudentSchema, loginSchema, refreshTokenSchema, changePasswordSchema, updateMyProfileSchema } from "../dto/auth.dto";
import { AppError } from "../../../common/errors/AppError";

export const authController = {
  async registerLawFirm(req: Request, res: Response) {
    const input = registerLawFirmSchema.parse(req.body);
    const result = await authService.registerLawFirm(input);
    res.status(201).json({ success: true, data: result });
  },

  async registerStudent(req: Request, res: Response) {
    const input = registerStudentSchema.parse(req.body);
    const result = await authService.registerStudent(input);
    // Fire off the verification email -- failure here shouldn't block the
    // registration itself (the account exists either way; the student can
    // request a fresh code from the login/verify screen if this one fails).
    emailVerificationService.sendCode(input.email, "REGISTRATION").catch((err) => {
      console.error("Failed to send registration verification email:", err);
    });
    res.status(201).json({ success: true, data: result });
  },

  // Institution (Education-type tenant) admin adds a student directly —
  // same underlying account, just tagged with which institution added them.
  async addInstitutionStudent(req: Request, res: Response) {
    if (!req.auth?.lawFirmId) throw AppError.forbidden("No organization associated with this account");
    const input = registerStudentSchema.parse(req.body);
    const result = await authService.registerStudent(input, req.auth.lawFirmId);
    res.status(201).json({ success: true, data: result });
  },

  async listInstitutionStudents(req: Request, res: Response) {
    if (!req.auth?.lawFirmId) throw AppError.forbidden("No organization associated with this account");
    const status = req.query.status as "ACTIVE" | "PENDING_VERIFICATION" | undefined;
    const result = await authService.listInstitutionStudents(req.auth.lawFirmId, status);
    res.status(200).json({ success: true, data: result });
  },

  async updateInstitutionStudent(req: Request, res: Response) {
    if (!req.auth?.lawFirmId) throw AppError.forbidden("No organization associated with this account");
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const input = z
      .object({
        fullName: z.string().min(2).optional(),
        phone: z.string().optional(),
        status: z.enum(["ACTIVE", "PENDING_VERIFICATION", "SUSPENDED"]).optional(),
        preferredCourseId: z.string().uuid().optional(),
        preferredExamType: z.string().optional(),
      })
      .parse(req.body);
    const result = await authService.updateInstitutionStudent(id, req.auth.lawFirmId, input);
    res.status(200).json({ success: true, message: "Student updated", data: result });
  },

  async removeInstitutionStudent(req: Request, res: Response) {
    if (!req.auth?.lawFirmId) throw AppError.forbidden("No organization associated with this account");
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await authService.removeInstitutionStudent(id, req.auth.lawFirmId);
    res.status(200).json({ success: true, message: "Student removed" });
  },

  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.status(200).json({ success: true, data: result });
  },

  async refresh(req: Request, res: Response) {
    const input = refreshTokenSchema.parse(req.body);
    const result = await authService.refresh(input.refreshToken);
    res.status(200).json({ success: true, data: result });
  },

  async logout(req: Request, res: Response) {
    const input = refreshTokenSchema.parse(req.body);
    const result = await authService.logout(input.refreshToken);
    res.status(200).json({ success: true, data: result });
  },

  async changePassword(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(req.auth.userId, input.currentPassword, input.newPassword);
    res.status(200).json({ success: true, data: result });
  },

  async getMe(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const result = await authService.getMe(req.auth.userId);
    res.status(200).json({ success: true, data: result });
  },
  async updateMyProfile(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = updateMyProfileSchema.parse(req.body);
    const result = await authService.updateMyProfile(req.auth.userId, input);
    res.status(200).json({ success: true, message: "Profile updated successfully", data: result });
  },

  async uploadAvatar(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    if (!req.file) throw AppError.badRequest("No image file was uploaded");
    const avatarUrl = path.join("avatars", req.file.filename);
    const result = await authService.updateAvatar(req.auth.userId, avatarUrl);
    res.status(200).json({ success: true, message: "Profile photo updated", data: result });
  },
  async deleteMyAccount(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { password } = req.body;
    if (!password) throw AppError.badRequest("Password is required to delete your account.");
    await authService.deleteMyAccount(req.auth.userId, password);
    res.status(200).json({ success: true, message: "Account deleted." });
  },
  async toggleNotifications(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { enabled } = req.body;
    const result = await authService.toggleNotifications(req.auth.userId, !!enabled);
    res.status(200).json({ success: true, data: { notificationsEnabled: result.notificationsEnabled } });
  },

  async requestPasswordReset(req: Request, res: Response) {
    const { email, note } = z.object({ email: z.string().email(), note: z.string().optional() }).parse(req.body);
    const result = await authService.requestPasswordReset(email, note);
    res.status(200).json({ success: true, message: result.message });
  },

  async listPasswordResetRequests(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const result = await authService.listPasswordResetRequests(req.auth);
    res.status(200).json({ success: true, data: result });
  },

  async resolvePasswordResetRequest(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const result = await authService.resolvePasswordResetRequest(id, req.auth.userId);
    res.status(200).json({ success: true, message: "Marked as resolved", data: result });
  },
};
