import { z } from "zod";

export const listPrecedentsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(), // full-text search across the entire judgment body
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListPrecedentsQuery = z.infer<typeof listPrecedentsQuerySchema>;

export const precedentIdParamSchema = z.object({ id: z.string().uuid() });

export const createPrecedentSchema = z.object({
  title: z.string().min(2),
  caseType: z.string().optional(),
  category: z.string().optional(),
  court: z.string().optional(),
  benchType: z.string().optional(),
  judges: z.string().optional(),
  decisionDate: z.string().optional(),
  caseNumber: z.string().optional(),
  petitioner: z.string().optional(),
  respondent: z.string().optional(),
  fullContent: z.string().min(10),
  sourceUrl: z.string().url().optional(),
});
export type CreatePrecedentInput = z.infer<typeof createPrecedentSchema>;

// Same shape as create, but every field optional -- a Company admin
// editing a precedent to fix a bad extraction (wrong court name, garbled
// judge name, etc.) only sends the fields they actually changed.
export const updatePrecedentSchema = createPrecedentSchema.partial();
export type UpdatePrecedentInput = z.infer<typeof updatePrecedentSchema>;
