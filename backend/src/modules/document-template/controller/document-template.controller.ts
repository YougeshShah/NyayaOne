import { Request, Response } from "express";
import { documentTemplateService, PLACEHOLDER_HELP } from "../service/document-template.service";
import {
  createTemplateSchema,
  updateTemplateSchema,
  listTemplatesQuerySchema,
  templateIdParamSchema,
  generateDocumentSchema,
} from "../dto/document-template.dto";
import { AppError } from "../../../common/errors/AppError";

export const documentTemplateController = {
  async list(req: Request, res: Response) {
    const query = listTemplatesQuerySchema.parse(req.query);
    const result = await documentTemplateService.list(query);
    res.status(200).json({ success: true, data: result });
  },

  async placeholders(req: Request, res: Response) {
    res.status(200).json({ success: true, data: PLACEHOLDER_HELP });
  },

  async getById(req: Request, res: Response) {
    const { id } = templateIdParamSchema.parse(req.params);
    const result = await documentTemplateService.getById(id);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = createTemplateSchema.parse(req.body);
    const result = await documentTemplateService.create(input, req.auth.userId);
    res.status(201).json({ success: true, message: "Template created", data: result });
  },

  async update(req: Request, res: Response) {
    const { id } = templateIdParamSchema.parse(req.params);
    const input = updateTemplateSchema.parse(req.body);
    const result = await documentTemplateService.update(id, input);
    res.status(200).json({ success: true, message: "Template updated", data: result });
  },

  async generate(req: Request, res: Response) {
    if (!req.auth || !req.auth.lawFirmId) throw AppError.forbidden("This action requires a law firm account");
    const input = generateDocumentSchema.parse(req.body);
    const { buffer, fileName } = await documentTemplateService.generate(req.auth.lawFirmId, input);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(buffer);
  },
};
