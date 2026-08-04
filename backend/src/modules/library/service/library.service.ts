import fs from "fs";
import path from "path";
import { AppError } from "../../../common/errors/AppError";
import { libraryRepository } from "../repository/library.repository";
import { CreateLibraryResourceInput, UpdateLibraryResourceInput, ListLibraryResourcesQuery } from "../dto/library.dto";
import { logger } from "../../../common/utils/logger";

/**
 * Extracts plain text from an uploaded PDF so it can be searched, not just
 * its title/keywords. If the file isn't a PDF (or extraction fails for any
 * reason — scanned/image-only PDF, corrupt file), this quietly returns
 * undefined rather than blocking the upload; full-text search just won't
 * cover that particular document.
 */
async function extractPdfText(absoluteFilePath: string): Promise<string | undefined> {
  if (!absoluteFilePath.toLowerCase().endsWith(".pdf")) return undefined;
  try {
    // Lazy-required so a broken PDF parser dependency can't crash the whole module.
    const pdfParse = require("pdf-parse");
    const buffer = fs.readFileSync(absoluteFilePath);
    const result = await pdfParse(buffer);
    return result.text?.trim() || undefined;
  } catch (err) {
    logger.error(`PDF text extraction failed for ${absoluteFilePath}: ${err instanceof Error ? err.message : String(err)}`);
    return undefined;
  }
}

export const libraryService = {
  async list(query: ListLibraryResourcesQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await libraryRepository.findMany({
      type: query.type,
      category: query.category,
      isRepealed: query.isRepealed,
      search: query.search,
      skip,
      take: query.limit,
    });
    return {
      items,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async listCategories() {
    return libraryRepository.listDistinctCategories();
  },

  async getById(id: string) {
    const resource = await libraryRepository.findById(id);
    if (!resource) throw AppError.notFound("Library resource not found");
    return resource;
  },

  async create(input: CreateLibraryResourceInput, publishedBy: string, fileUrl?: string, absoluteFilePath?: string) {
    const extractedText = absoluteFilePath ? await extractPdfText(absoluteFilePath) : undefined;
    return libraryRepository.create({
      ...input,
      fileUrl,
      publishedBy,
      content: input.content || extractedText,
    });
  },

  async update(id: string, input: UpdateLibraryResourceInput, fileUrl?: string, absoluteFilePath?: string) {
    await this.getById(id);
    const extractedText = absoluteFilePath ? await extractPdfText(absoluteFilePath) : undefined;
    return libraryRepository.update(id, {
      ...input,
      ...(fileUrl ? { fileUrl } : {}),
      ...(extractedText ? { content: extractedText } : {}),
    });
  },

  async remove(id: string) {
    await this.getById(id);
    await libraryRepository.delete(id);
  },
};
