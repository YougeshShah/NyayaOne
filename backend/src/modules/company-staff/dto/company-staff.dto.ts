import { z } from "zod";

export const createCompanyStaffSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().uuid("A role must be assigned"),
});
export type CreateCompanyStaffInput = z.infer<typeof createCompanyStaffSchema>;

export const updateCompanyStaffStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});
export type UpdateCompanyStaffStatusInput = z.infer<typeof updateCompanyStaffStatusSchema>;

export const updateCompanyStaffRoleSchema = z.object({
  roleId: z.string().uuid(),
});
export type UpdateCompanyStaffRoleInput = z.infer<typeof updateCompanyStaffRoleSchema>;

export const listCompanyStaffQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListCompanyStaffQuery = z.infer<typeof listCompanyStaffQuerySchema>;

export const companyStaffIdParamSchema = z.object({
  id: z.string().uuid("Invalid staff id"),
});
