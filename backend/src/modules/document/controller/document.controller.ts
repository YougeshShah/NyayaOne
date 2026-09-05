import { Request, Response } from "express";
import path from "path";
import { documentService } from "../service/document.service";
import { uploadDocumentSchema, listDocumentsQuerySchema, documentIdParamSchema } from "../dto/document.dto";
import { AppError } from "../../../common/errors/AppError";
import { env } from "../../../config/env";

function requireFirmContext(req: Request): { lawFirmId: string; userId: string } {
  if (!req.auth || !req.auth.lawFirmId) {
    throw AppError.forbidden("This action requires a law firm account");
  }
  return { lawFirmId: req.auth.lawFirmId, userId: req.auth.userId };
}

export const documentController = {
  async list(req: Request, res: Response) {
    const { lawFirmId } = requireFirmContext(req);
    const query = listDocumentsQuerySchema.parse(req.query);
    const result = await documentService.list(lawFirmId, query);
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    const { lawFirmId } = requireFirmContext(req);
    const { id } = documentIdParamSchema.parse(req.params);
    const result = await documentService.getById(id, lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async upload(req: Request, res: Response) {
    const { lawFirmId, userId } = requireFirmContext(req);
    if (!req.file) {
      throw AppError.badRequest("No file was uploaded. Attach a file under field name 'file'.");
    }
    const input = uploadDocumentSchema.parse(req.body);
    const result = await documentService.create(lawFirmId, userId, input, req.file);
    res.status(201).json({ success: true, message: "Document uploaded successfully", data: result });
  },

  /**
   * Streams the file to the client. Access is enforced the same way as any
   * other resource — the document must belong to the requester's law firm —
   * so files are never served from a public/static path.
   */
  async download(req: Request, res: Response) {
    const { lawFirmId } = requireFirmContext(req);
    const { id } = documentIdParamSchema.parse(req.params);
    const doc = await documentService.getById(id, lawFirmId);

    const fullPath = path.join(process.cwd(), env.storage.localUploadDir, doc.fileUrl);
    res.download(fullPath, doc.fileName, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ success: false, message: "File not found on server" });
      }
    });
  },

  async remove(req: Request, res: Response) {
    const { lawFirmId } = requireFirmContext(req);
    const { id } = documentIdParamSchema.parse(req.params);
    await documentService.remove(id, lawFirmId);
    res.status(200).json({ success: true, message: "Document deleted" });
  },
  async toggleClientVisibility(req: Request, res: Response) {
    const { lawFirmId } = requireFirmContext(req);
    const { id } = documentIdParamSchema.parse(req.params);
    const visibleToClient = !!req.body.visibleToClient;
    await documentService.toggleClientVisibility(id, lawFirmId, visibleToClient);
    res.status(200).json({ success: true, message: "Visibility updated" });
  },
};
