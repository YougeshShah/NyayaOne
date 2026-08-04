import { Request, Response } from "express";
import { documentTemplateService, AUTOFILL_SOURCES } from "../service/document-template.service";
import {
  createTemplateSchema,
  updateTemplateSchema,
  listTemplatesQuerySchema,
  templateIdParamSchema,
  generateDocumentSchema,
  analyzeSampleSchema,
} from "../dto/document-template.dto";
import { AppError } from "../../../common/errors/AppError";

export const documentTemplateController = {
  async list(req: Request, res: Response) {
    const query = listTemplatesQuerySchema.parse(req.query);
    const result = await documentTemplateService.list(query);
    res.status(200).json({ success: true, data: result });
  },

  async autofillSources(req: Request, res: Response) {
    res.status(200).json({ success: true, data: AUTOFILL_SOURCES });
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

  async analyzeSample(req: Request, res: Response) {
    const input = analyzeSampleSchema.parse(req.body);
    const result = documentTemplateService.analyzeSample(input.text);
    res.status(200).json({ success: true, data: result });
  },

  async generate(req: Request, res: Response) {
    if (!req.auth || !req.auth.lawFirmId) throw AppError.forbidden("This action requires a law firm account");
    const input = generateDocumentSchema.parse(req.body);
    const { buffer, fileName } = await documentTemplateService.generate(req.auth.lawFirmId, input);

    // HTTP headers only allow ASCII (ISO-8859-1) bytes — most of our filenames
    // contain Devanagari (Nepali) characters, which would crash res.setHeader
    // if used directly. RFC 5987 solves this: send both a plain ASCII fallback
    // name (filename=) and the real UTF-8 name, percent-encoded (filename*=) —
    // browsers use filename* when present and fall back to filename otherwise.
    // The fallback still needs to be meaningful (not just "document.pdf") since
    // some download managers/older browsers ignore filename* entirely.
    const asciiFallback = `Document_${input.caseId.slice(0, 8)}.pdf`;
    const encodedName = encodeURIComponent(fileName);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodedName}`);
    res.send(buffer);
  },
};
