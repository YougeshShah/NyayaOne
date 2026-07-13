import { Request, Response } from "express";
import { lawFirmService } from "../service/lawfirm.service";
import { listLawFirmsQuerySchema, lawFirmIdParamSchema, suspendLawFirmSchema } from "../dto/lawfirm.dto";
import { AppError } from "../../../common/errors/AppError";

export const lawFirmController = {
  async list(req: Request, res: Response) {
    const query = listLawFirmsQuerySchema.parse(req.query);
    const result = await lawFirmService.list(query);
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    const { id } = lawFirmIdParamSchema.parse(req.params);
    const result = await lawFirmService.getById(id);
    res.status(200).json({ success: true, data: result });
  },

  async approve(req: Request, res: Response) {
    const { id } = lawFirmIdParamSchema.parse(req.params);
    if (!req.auth) throw AppError.unauthorized();
    const result = await lawFirmService.approve(id, req.auth.userId);
    res.status(200).json({ success: true, message: "Law firm approved successfully", data: result });
  },

  async suspend(req: Request, res: Response) {
    const { id } = lawFirmIdParamSchema.parse(req.params);
    const { reason } = suspendLawFirmSchema.parse(req.body);
    if (!req.auth) throw AppError.unauthorized();
    const result = await lawFirmService.suspend(id, req.auth.userId, reason);
    res.status(200).json({ success: true, message: "Law firm suspended", data: result });
  },

  async activate(req: Request, res: Response) {
    const { id } = lawFirmIdParamSchema.parse(req.params);
    if (!req.auth) throw AppError.unauthorized();
    const result = await lawFirmService.activate(id, req.auth.userId);
    res.status(200).json({ success: true, message: "Law firm reactivated", data: result });
  },

  async reject(req: Request, res: Response) {
    const { id } = lawFirmIdParamSchema.parse(req.params);
    const { reason } = suspendLawFirmSchema.parse(req.body);
    if (!req.auth) throw AppError.unauthorized();
    const result = await lawFirmService.reject(id, req.auth.userId, reason);
    res.status(200).json({ success: true, message: "Law firm registration rejected", data: result });
  },
};
