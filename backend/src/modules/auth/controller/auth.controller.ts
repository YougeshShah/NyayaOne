import { Request, Response } from "express";
import { authService } from "../service/auth.service";
import { registerLawFirmSchema, loginSchema, refreshTokenSchema } from "../dto/auth.dto";

export const authController = {
  async registerLawFirm(req: Request, res: Response) {
    const input = registerLawFirmSchema.parse(req.body);
    const result = await authService.registerLawFirm(input);
    res.status(201).json({ success: true, data: result });
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
};
