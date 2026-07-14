import { z } from "zod";

const documentCategories = [
  "CASE_FILING",
  "EVIDENCE",
  "COURT_ORDER",
  "AGREEMENT",
  "CORRESPONDENCE",
  "IDENTIFICATION",
  "OTHER",
] as const;

export const uploadDocumentSchema = z.object({
  caseId: z.string().uuid().optional(),
  category: z.enum(documentCategories).default("OTHER"),
});
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

export const listDocumentsQuerySchema = z.object({
  caseId: z.string().uuid().optional(),
  category: z.enum(documentCategories).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;

export const documentIdParamSchema = z.object({
  id: z.string().uuid("Invalid document id"),
});
