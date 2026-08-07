import { Request, Response } from "express";
import path from "path";
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
    const result = await authService.listInstitutionStudents(req.auth.lawFirmId);
    res.status(200).json({ success: true, data: result });
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
};
