import { z } from "zod";

const staffAccountTypes = ["LAWYER", "STAFF"] as const;

export const createUserSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  accountType: z.enum(staffAccountTypes),
  // Lawyer-specific (ignored for STAFF accounts)
  barRegistrationNo: z.string().optional(),
  specialization: z.string().optional(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  barRegistrationNo: z.string().optional(),
  specialization: z.string().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

export const listUsersQuerySchema = z.object({
  accountType: z.enum(staffAccountTypes).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const userIdParamSchema = z.object({
  id: z.string().uuid("Invalid user id"),
});
