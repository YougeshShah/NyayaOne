import { Request, Response } from "express";
import { lawFirmService } from "../service/lawfirm.service";
import { listLawFirmsQuerySchema, lawFirmIdParamSchema, suspendLawFirmSchema, createLawFirmSchema, updateModulesSchema } from "../dto/lawfirm.dto";
import { AppError } from "../../../common/errors/AppError";

export const lawFirmController = {
  async listPublic(req: Request, res: Response) {
    const result = await lawFirmService.listPublicInstitutions();
    res.status(200).json({ success: true, data: result });
  },
  async create(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = createLawFirmSchema.parse(req.body);
    const result = await lawFirmService.create(input, req.auth.userId);
    res.status(201).json({ success: true, message: "Law firm created and activated", data: result });
  },

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

  async updateModules(req: Request, res: Response) {
    const { id } = lawFirmIdParamSchema.parse(req.params);
    const { modulesEnabled, allowedCourseIds, allowedExamTypes } = updateModulesSchema.parse(req.body);
    if (!req.auth) throw AppError.unauthorized();
    const result = await lawFirmService.updateModules(id, modulesEnabled, req.auth.userId, allowedCourseIds, allowedExamTypes);
    res.status(200).json({ success: true, message: "Modules updated successfully", data: result });
  },

  async remove(req: Request, res: Response) {
    const { id } = lawFirmIdParamSchema.parse(req.params);
    await lawFirmService.remove(id);
    res.status(200).json({ success: true, message: "Organization permanently deleted" });
  },
  async monthlyGrowth(req: Request, res: Response) {
    const months = req.query.months ? parseInt(req.query.months as string, 10) : 6;
    const result = await lawFirmService.monthlyGrowth(months);
    res.status(200).json({ success: true, data: result });
  },
};
