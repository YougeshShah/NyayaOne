import { z } from "zod";

export const createClientSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  fullNameNepali: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  identificationType: z.string().optional(),
  identificationNo: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateClientInput = z.infer<typeof createClientSchema>;

export const updateClientSchema = createClientSchema.partial();
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export const inviteClientSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type InviteClientInput = z.infer<typeof inviteClientSchema>;

export const listClientsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;

export const clientIdParamSchema = z.object({
  id: z.string().uuid("Invalid client id"),
});
