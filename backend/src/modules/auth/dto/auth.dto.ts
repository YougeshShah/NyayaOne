import { z } from "zod";

export const registerLawFirmSchema = z.object({
  lawFirmName: z.string().min(2, "Law firm name is required"),
  lawFirmEmail: z.string().email(),
  adminFullName: z.string().min(2, "Admin name is required"),
  adminEmail: z.string().email(),
  adminPhone: z.string().min(7).optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type RegisterLawFirmInput = z.infer<typeof registerLawFirmSchema>;

// Phase 2 — students self-register directly, no law firm / approval step
// (unlike lawyers, who register via a law firm that Company then approves).
export const registerStudentSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  interestedCourseId: z.string().uuid().optional(), // "what are you preparing for?" — used only to personalize the dashboard on first login
  preferredExamType: z.string().optional(), // e.g. KHARIDAR — which level within a multi-level course (Loksewa) this student is preparing for
  // Self-registration under a specific institution, detected from the
  // subdomain the student registered on (e.g. "raju-law" from
  // raju-law.technocraftx.com) -- the student never picks this manually.
  // If set, the account is created PENDING_VERIFICATION and that
  // institution must approve it before login works. Omitted = a
  // direct/Company student (unchanged behavior, account is immediately
  // ACTIVE) -- e.g. registering on the bare technocraftx.com domain.
  institutionSlug: z.string().optional(),
});
export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updateMyProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  // Lawyer-only fields — ignored for other account types by the service layer
  barRegistrationNo: z.string().optional(),
  specialization: z.string().optional(),
});
export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;
