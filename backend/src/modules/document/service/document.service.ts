import fs from "fs";
import path from "path";
import { AppError } from "../../../common/errors/AppError";
import { documentRepository } from "../repository/document.repository";
import { UploadDocumentInput, ListDocumentsQuery } from "../dto/document.dto";
import { DocumentCategory } from "@prisma/client";
import { env } from "../../../config/env";

export const documentService = {
  async list(lawFirmId: string, query: ListDocumentsQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await documentRepository.findMany({
      lawFirmId,
      caseId: query.caseId,
      category: query.category as DocumentCategory | undefined,
      skip,
      take: query.limit,
    });
    return {
      items,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async getById(id: string, lawFirmId: string) {
    const doc = await documentRepository.findByIdScoped(id, lawFirmId);
    if (!doc) throw AppError.notFound("Document not found in your firm");
    return doc;
  },

  /**
   * Persists metadata for a file multer has already written to disk.
   * If caseId is provided, verifies the case belongs to this firm — otherwise
   * deletes the just-uploaded file so we don't leave orphaned disk data.
   */
  async create(
    lawFirmId: string,
    uploadedById: string,
    input: UploadDocumentInput,
    file: Express.Multer.File
  ) {
    if (input.caseId) {
      const caseRecord = await documentRepository.findCaseScoped(input.caseId, lawFirmId);
      if (!caseRecord) {
        fs.unlink(file.path, () => {});
        throw AppError.badRequest("Case not found in your firm");
      }
    }

    const relativePath = path.join(lawFirmId, path.basename(file.path));

    return documentRepository.create({
      lawFirmId,
      caseId: input.caseId,
      fileName: file.originalname,
      fileUrl: relativePath,
      fileType: file.mimetype,
      fileSizeKb: Math.ceil(file.size / 1024),
      category: input.category,
      uploadedById,
    });
  },

  async remove(id: string, lawFirmId: string) {
    const doc = await this.getById(id, lawFirmId);
    const result = await documentRepository.deleteScoped(id, lawFirmId);
    if (result.count === 0) throw AppError.notFound("Document not found in your firm");

    const fullPath = path.join(process.cwd(), env.storage.localUploadDir, doc.fileUrl);
    fs.unlink(fullPath, () => {
      // best-effort — DB record is the source of truth; a stray file on disk is not critical
    });
  },
  async toggleClientVisibility(id: string, lawFirmId: string, visibleToClient: boolean) {
    await this.getById(id, lawFirmId);
    return documentRepository.setClientVisibility(id, lawFirmId, visibleToClient);
  },
};
