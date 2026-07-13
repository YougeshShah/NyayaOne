import { z } from "zod";

const caseStatuses = ["OPEN", "ONGOING", "ON_HOLD", "CLOSED", "DISMISSED"] as const;
const casePriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const createCaseSchema = z.object({
  caseNumber: z.string().min(1, "Case number is required"),
  caseTitle: z.string().min(2, "Case title is required"),
  courtId: z.string().uuid("Invalid court id"),
  clientIds: z.array(z.string().uuid()).min(1, "At least one client is required"),
  lawyerIds: z.array(z.string().uuid()).min(1, "At least one lawyer must be assigned"),
  leadLawyerId: z.string().uuid().optional(),
  opposingParty: z.string().optional(),
  opposingLawyer: z.string().optional(),
  courtSubject: z.string().optional(),
  category: z.string().optional(),
  filingDate: z.coerce.date().optional(),
  judge: z.string().optional(),
  priority: z.enum(casePriorities).default("MEDIUM"),
  remarks: z.string().optional(),
});
export type CreateCaseInput = z.infer<typeof createCaseSchema>;

export const updateCaseSchema = z.object({
  caseTitle: z.string().min(2).optional(),
  opposingParty: z.string().optional(),
  opposingLawyer: z.string().optional(),
  courtSubject: z.string().optional(),
  category: z.string().optional(),
  judge: z.string().optional(),
  status: z.enum(caseStatuses).optional(),
  priority: z.enum(casePriorities).optional(),
  remarks: z.string().optional(),
});
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;

export const listCasesQuerySchema = z.object({
  status: z.enum(caseStatuses).optional(),
  priority: z.enum(casePriorities).optional(),
  lawyerId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListCasesQuery = z.infer<typeof listCasesQuerySchema>;

export const caseIdParamSchema = z.object({
  id: z.string().uuid("Invalid case id"),
});
