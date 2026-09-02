import { Request, Response } from "express";
import path from "path";
import { clientPortalService } from "../service/client-portal.service";
import { AppError } from "../../../common/errors/AppError";
import { env } from "../../../config/env";

function requireUserId(req: Request): string {
  if (!req.auth) throw AppError.unauthorized();
  return req.auth.userId;
}

export const clientPortalController = {
  async myCases(req: Request, res: Response) {
    const userId = requireUserId(req);
    const result = await clientPortalService.myCases(userId);
    res.status(200).json({ success: true, data: result });
  },

  async myCaseById(req: Request, res: Response) {
    const userId = requireUserId(req);
    const result = await clientPortalService.myCaseById(userId, req.params.id);
    res.status(200).json({ success: true, data: result });
  },

  async myHearings(req: Request, res: Response) {
    const userId = requireUserId(req);
    const upcomingOnly = req.query.upcoming === "true";
    const result = await clientPortalService.myHearings(userId, upcomingOnly);
    res.status(200).json({ success: true, data: result });
  },

  async myDocuments(req: Request, res: Response) {
    const userId = requireUserId(req);
    const result = await clientPortalService.myDocuments(userId);
    res.status(200).json({ success: true, data: result });
  },

  async downloadMyDocument(req: Request, res: Response) {
    const userId = requireUserId(req);
    const doc = await clientPortalService.myDocumentById(userId, req.params.id);
    const fullPath = path.join(process.cwd(), env.storage.localUploadDir, doc.fileUrl);
    res.download(fullPath, doc.fileName, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ success: false, message: "File not found on server" });
      }
    });
  },
  async uploadDocument(req: Request, res: Response) {
    const userId = requireUserId(req);
    if (!req.file) {
      throw AppError.badRequest("No file was uploaded. Attach a file under field name 'file'.");
    }
    const { caseId, category } = req.body;
    if (!caseId) throw AppError.badRequest("caseId is required.");
    const result = await clientPortalService.uploadDocument(userId, caseId, category || "OTHER", req.file);
    res.status(201).json({ success: true, message: "Document uploaded successfully", data: result });
  },
};
