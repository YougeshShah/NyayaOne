import { Request, Response } from "express";
import { AppError } from "../../../common/errors/AppError";
import { precedentService } from "../service/precedent.service";
import { listPrecedentsQuerySchema, precedentIdParamSchema, createPrecedentSchema, updatePrecedentSchema } from "../dto/precedent.dto";

export const precedentController = {
  async search(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const query = listPrecedentsQuerySchema.parse(req.query);
    // Company staff see company-wide precedents only (lawFirmId undefined);
    // institution staff/lawyers see company-wide + their own institution's uploads.
    const lawFirmId = req.auth.accountType === "COMPANY" ? undefined : req.auth.lawFirmId;
    const result = await precedentService.search(query, lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    const { id } = precedentIdParamSchema.parse(req.params);
    const result = await precedentService.getById(id);
    res.status(200).json({ success: true, data: result });
  },

  async listCategories(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const lawFirmId = req.auth.accountType === "COMPANY" ? undefined : req.auth.lawFirmId;
    const result = await precedentService.listCategories(lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = createPrecedentSchema.parse(req.body);
    const hostLawFirmId = req.auth.accountType === "LAW_FIRM_ADMIN" ? req.auth.lawFirmId ?? undefined : undefined;
    const result = await precedentService.create(input, req.auth.userId, hostLawFirmId);
    res.status(201).json({ success: true, message: "Precedent added", data: result });
  },

  // Update and delete are Company-only (route-level authorize() enforces
  // this) -- institutions can add their own precedents but Company owns
  // the shared database and is the only one who can correct/remove entries.
  async update(req: Request, res: Response) {
    const { id } = precedentIdParamSchema.parse(req.params);
    const input = updatePrecedentSchema.parse(req.body);
    const result = await precedentService.update(id, input);
    res.status(200).json({ success: true, message: "Precedent updated", data: result });
  },

  async remove(req: Request, res: Response) {
    const { id } = precedentIdParamSchema.parse(req.params);
    await precedentService.remove(id);
    res.status(200).json({ success: true, message: "Precedent deleted" });
  },
};
