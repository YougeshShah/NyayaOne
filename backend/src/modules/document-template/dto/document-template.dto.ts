import { z } from "zod";

const fieldTypes = ["text", "textarea", "date", "number"] as const;

export const templateFieldSchema = z.object({
  key: z.string().min(1), // used as {{key}} in bodyTemplate — must be unique per template
  label: z.string().min(1),
  type: z.enum(fieldTypes).default("text"),
  autoFillSource: z.string().optional(), // e.g. "client.fullName" — omit for manual-entry fields
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
});
export type TemplateField = z.infer<typeof templateFieldSchema>;

export const createTemplateSchema = z.object({
  title: z.string().min(2, "Title is required"),
  category: z.string().optional(),
  description: z.string().optional(),
  bodyTemplate: z.string().min(10, "Template body is required"),
  fields: z.array(templateFieldSchema).default([]),
});
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = createTemplateSchema.partial().extend({
  isActive: z.coerce.boolean().optional(),
});
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

export const listTemplatesQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(100),
});
export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>;

export const templateIdParamSchema = z.object({ id: z.string().uuid() });

export const generateDocumentSchema = z.object({
  templateId: z.string().uuid(),
  caseId: z.string().uuid(),
  clientId: z.string().uuid().optional(),
  // Lawyer-submitted answers for fields that don't have an autoFillSource —
  // keyed by field.key. Auto-fillable fields are resolved server-side and
  // any value submitted for them here is ignored (server data wins).
  values: z.record(z.string()).default({}),
});
export type GenerateDocumentInput = z.infer<typeof generateDocumentSchema>;

// Lightweight heuristic "suggest fields from pasted text" helper — pattern-based,
// not true document understanding. Staff must review/edit suggestions before saving.
export const analyzeSampleSchema = z.object({
  text: z.string().min(20, "Paste at least a few lines of the sample document"),
});
export type AnalyzeSampleInput = z.infer<typeof analyzeSampleSchema>;
