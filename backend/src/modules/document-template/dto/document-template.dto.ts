import { z } from "zod";

export const createTemplateSchema = z.object({
  title: z.string().min(2, "Title is required"),
  category: z.string().optional(),
  description: z.string().optional(),
  bodyTemplate: z.string().min(10, "Template body is required"),
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
  limit: z.coerce.number().int().positive().max(100).default(50),
});
export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>;

export const templateIdParamSchema = z.object({ id: z.string().uuid() });

export const generateDocumentSchema = z.object({
  templateId: z.string().uuid(),
  caseId: z.string().uuid(),
  clientId: z.string().uuid().optional(), // if the case has multiple clients, pick which one to fill in
});
export type GenerateDocumentInput = z.infer<typeof generateDocumentSchema>;
