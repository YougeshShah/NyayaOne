import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z.string().min(3).max(200),
  description: z.string().min(1).max(4000),
  attachmentUrl: z.string().optional(),
  attachmentType: z.string().optional(),
});

export const addCommentSchema = z.object({
  content: z.string().max(4000).optional().default(""),
  attachmentUrl: z.string().optional(),
  attachmentType: z.string().optional(),
});

export const ticketIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
});

export const listTicketsQuerySchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
