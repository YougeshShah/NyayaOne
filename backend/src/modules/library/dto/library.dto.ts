import { z } from "zod";

const resourceTypes = [
  "CONSTITUTION",
  "ACT",
  "ORDINANCE",
  "REGULATION",
  "RULE",
  "FORMATION_ORDER",
  "POLICY",
  "INTERNATIONAL_TREATY",
  "HISTORICAL_DOCUMENT",
  "ANNUAL_REPORT",
  "RTI_DISCLOSURE",
  "CIRCULAR",
  "GOVERNMENT_NOTICE",
  "GAZETTE",
  "SUPREME_COURT_DECISION",
  "HIGH_COURT_DECISION",
  "ARTICLE",
  "RESEARCH_PAPER",
  "JOURNAL",
  "TEMPLATE",
  "LEGAL_FORM",
] as const;

export const createLibraryResourceSchema = z.object({
  title: z.string().min(2, "Title is required"),
  type: z.enum(resourceTypes),
  category: z.string().optional(),
  isRepealed: z.coerce.boolean().default(false),
  actName: z.string().optional(),
  section: z.string().optional(),
  chapter: z.string().optional(),
  keywords: z.preprocess((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string" && val.length > 0) return val.split(",").map((k) => k.trim());
    return [];
  }, z.array(z.string())),
  content: z.string().optional(),
  isDownloadable: z.coerce.boolean().default(true),
});
export type CreateLibraryResourceInput = z.infer<typeof createLibraryResourceSchema>;

export const updateLibraryResourceSchema = createLibraryResourceSchema.partial();
export type UpdateLibraryResourceInput = z.infer<typeof updateLibraryResourceSchema>;

export const listLibraryResourcesQuerySchema = z.object({
  type: z.enum(resourceTypes).optional(),
  category: z.string().optional(),
  isRepealed: z.coerce.boolean().optional(),
  search: z.string().optional(), // matches title, actName, keywords, AND full document content (PDF text)
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListLibraryResourcesQuery = z.infer<typeof listLibraryResourcesQuerySchema>;

export const libraryResourceIdParamSchema = z.object({
  id: z.string().uuid("Invalid resource id"),
});
