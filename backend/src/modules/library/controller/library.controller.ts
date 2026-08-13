import { Request, Response } from "express";
import path from "path";
import { z } from "zod";
import { libraryService } from "../service/library.service";
import {
  createLibraryResourceSchema,
  updateLibraryResourceSchema,
  listLibraryResourcesQuerySchema,
  libraryResourceIdParamSchema,
} from "../dto/library.dto";
import { AppError } from "../../../common/errors/AppError";
import { env } from "../../../config/env";

export const libraryController = {
  async list(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const query = listLibraryResourcesQuerySchema.parse(req.query);
    if (req.auth.accountType === "STUDENT" && !query.courseId) {
      throw AppError.badRequest("courseId is required");
    }
    const studentId = req.auth.accountType === "STUDENT" ? req.auth.userId : null;
    const isInstitutionStaff = req.auth.accountType === "LAW_FIRM_ADMIN" || req.auth.accountType === "LAWYER" || req.auth.accountType === "STAFF";
    const result = await libraryService.list(query, studentId, {
      studentLawFirmId: req.auth.accountType === "STUDENT" ? req.auth.lawFirmId : undefined,
      forLawFirmId: isInstitutionStaff && query.courseId ? req.auth.lawFirmId ?? undefined : undefined,
    });
    res.status(200).json({ success: true, data: result });
  },

  async listCategories(req: Request, res: Response) {
    const result = await libraryService.listCategories();
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    const { id } = libraryResourceIdParamSchema.parse(req.params);
    const result = await libraryService.getById(id);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = createLibraryResourceSchema.parse(req.body);
    const fileUrl = req.file ? path.join("library", req.file.filename) : undefined;
    const result = await libraryService.create(input, req.auth.userId, fileUrl, req.file?.path);
    res.status(201).json({ success: true, message: "Resource published successfully", data: result });
  },

  async createInstitutionResource(req: Request, res: Response) {
    if (!req.auth?.lawFirmId) throw AppError.forbidden("No organization associated with this account");
    const input = z
      .object({
        title: z.string().min(2, "Title is required"),
        subjectId: z.string().uuid("Subject is required"),
        content: z.string().optional(), // optional when a PDF is uploaded — text gets extracted from it instead
        isFreeDemo: z.coerce.boolean().default(false),
      })
      .parse(req.body);
    if (!input.content && !req.file) {
      throw AppError.badRequest("Provide either written content or upload a PDF");
    }
    const fileUrl = req.file ? path.join("library", req.file.filename) : undefined;
    const result = await libraryService.createInstitutionResource(
      { ...input, content: input.content ?? "" },
      req.auth.userId,
      req.auth.lawFirmId,
      fileUrl,
      req.file?.path
    );
    res.status(201).json({ success: true, message: "Resource published to your students", data: result });
  },

  async update(req: Request, res: Response) {
    const { id } = libraryResourceIdParamSchema.parse(req.params);
    const input = updateLibraryResourceSchema.parse(req.body);
    const fileUrl = req.file ? path.join("library", req.file.filename) : undefined;
    const result = await libraryService.update(id, input, fileUrl, req.file?.path);
    res.status(200).json({ success: true, message: "Resource updated successfully", data: result });
  },

  async remove(req: Request, res: Response) {
    const { id } = libraryResourceIdParamSchema.parse(req.params);
    await libraryService.remove(id);
    res.status(200).json({ success: true, message: "Resource deleted" });
  },

  async download(req: Request, res: Response) {
    const { id } = libraryResourceIdParamSchema.parse(req.params);
    const resource = await libraryService.getById(id);
    if (!resource.fileUrl) {
      throw AppError.notFound("This resource has no downloadable file");
    }
    if (!resource.isDownloadable) {
      throw AppError.forbidden("This resource is not downloadable");
    }
    const fullPath = path.join(process.cwd(), env.storage.localUploadDir, resource.fileUrl);
    res.download(fullPath, resource.title, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ success: false, message: "File not found on server" });
      }
    });
  },
};
