import { Request, Response } from "express";
import { caseService } from "../service/case.service";
import { createCaseSchema, updateCaseSchema, listCasesQuerySchema, caseIdParamSchema } from "../dto/case.dto";
import { AppError } from "../../../common/errors/AppError";

function requireFirmContext(req: Request): string {
  if (!req.auth || !req.auth.lawFirmId) {
    throw AppError.forbidden("This action requires a law firm account");
  }
  return req.auth.lawFirmId;
}

export const caseController = {
  async list(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const query = listCasesQuerySchema.parse(req.query);
    const result = await caseService.list(lawFirmId, query);
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const { id } = caseIdParamSchema.parse(req.params);
    const result = await caseService.getById(id, lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const input = createCaseSchema.parse(req.body);
    const result = await caseService.create(lawFirmId, input);
    res.status(201).json({ success: true, message: "Case created successfully", data: result });
  },

  async update(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const { id } = caseIdParamSchema.parse(req.params);
    const input = updateCaseSchema.parse(req.body);
    const result = await caseService.update(id, lawFirmId, input, req.auth!.userId);
    res.status(200).json({ success: true, message: "Case updated successfully", data: result });
  },

  async statusSummary(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const result = await caseService.statusSummary(lawFirmId);
    res.status(200).json({ success: true, data: result });
  },
};
