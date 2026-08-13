import { AppError } from "../../../common/errors/AppError";
import { hashPassword, comparePassword } from "../../../common/utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../../common/utils/jwt";
import { authRepository } from "../repository/auth.repository";
import { prisma } from "../../../database/prisma";
import { RegisterLawFirmInput, RegisterStudentInput, LoginInput } from "../dto/auth.dto";
import { courseService } from "../../course/service/course.service";

const REFRESH_TOKEN_TTL_DAYS = 7;

export const authService = {
  /**
   * A law firm self-registers along with its first admin user.
   * The firm starts as PENDING and must be approved by TrailBlaze Tech (Company)
   * before the admin/lawyers can fully operate — see LawFirm.status.
   */
  async registerLawFirm(input: RegisterLawFirmInput) {
    const existing = await authRepository.findUserByEmail(input.adminEmail);
    if (existing) {
      throw AppError.conflict("An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);

    const { lawFirm, admin } = await authRepository.createLawFirmWithAdmin({
      lawFirmName: input.lawFirmName,
      lawFirmEmail: input.lawFirmEmail,
      adminFullName: input.adminFullName,
      adminEmail: input.adminEmail,
      adminPhone: input.adminPhone,
      passwordHash,
    });

    return {
      lawFirm: { id: lawFirm.id, name: lawFirm.name, status: lawFirm.status },
      admin: { id: admin.id, fullName: admin.fullName, email: admin.email },
      message: "Registration submitted. Your firm is pending approval from TrailBlaze Tech.",
    };
  },

  /**
   * Phase 2 — a student self-registers directly, with no law firm and no
   * approval step (unlike lawyers). Active immediately after registration.
   */
  async registerStudent(input: RegisterStudentInput, addedByLawFirmId?: string) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw AppError.conflict("An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const student = await authRepository.createStudent({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      addedByLawFirmId,
      preferredCourseId: input.interestedCourseId,
      preferredExamType: input.preferredExamType,
    });

    // An institution adding their own student is enrolling them in a
    // specific sector (IELTS / Law / etc.) — unlike self-registration where
    // interestedCourseId is just a stated preference, here it grants real
    // access immediately, since the institution is vouching for this student.
    if (addedByLawFirmId && input.interestedCourseId) {
      await courseService.grantSubscription(student.id, input.interestedCourseId);
    }

    return {
      student: { id: student.id, fullName: student.fullName, email: student.email },
      message: addedByLawFirmId ? "Student added." : "Registration successful. You can log in now.",
    };
  },

  async listInstitutionStudents(lawFirmId: string) {
    return authRepository.findStudentsByLawFirmId(lawFirmId);
  },

  async updateInstitutionStudent(id: string, lawFirmId: string, input: { fullName?: string; phone?: string }) {
    const result = await authRepository.updateStudentScoped(id, lawFirmId, input);
    if (result.count === 0) throw AppError.notFound("Student not found in your institution");
    return authRepository.findStudentById(id);
  },

  async removeInstitutionStudent(id: string, lawFirmId: string) {
    const result = await authRepository.removeStudentScoped(id, lawFirmId);
    if (result.count === 0) throw AppError.notFound("Student not found in your institution");
  },

  async login(input: LoginInput) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw AppError.unauthorized("Invalid email or password");
    }

    if (user.status === "SUSPENDED") {
      throw AppError.forbidden("Your account has been suspended. Contact support.");
    }

    // Law firm tenants must be ACTIVE (approved by Company) before their own
    // STAFF can log in — this does NOT apply to students or clients, who are
    // being taught/served by the institution, not employed by it. Blocking
    // them just because the institution's own approval status lapsed would
    // cut off people who did nothing wrong.
    const staffAccountTypes = ["LAWYER", "STAFF"];
    if (user.lawFirm && user.lawFirm.status !== "ACTIVE" && staffAccountTypes.includes(user.accountType)) {
      throw AppError.forbidden("Your law firm account is not yet active");
    }

    const accessToken = signAccessToken({
      userId: user.id,
      accountType: user.accountType,
      lawFirmId: user.lawFirmId,
      roleId: user.roleId,
      preferredExamType: (user as any).preferredExamType ?? null,
    });

    const refreshToken = signRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await authRepository.storeRefreshToken(user.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        accountType: user.accountType,
        lawFirmId: user.lawFirmId,
        lawFirmStatus: user.lawFirm?.status ?? null,
        modulesEnabled: user.lawFirm?.modulesEnabled ?? null,
        tenantType: user.lawFirm?.tenantType ?? null,
        tenantName: user.lawFirm?.name ?? null,
        allowedCourseIds: user.lawFirm?.allowedCourseIds ?? null,
        // "Super Admin" carries every permission implicitly (see requirePermission
        // middleware) — null here means "unrestricted", not "no access".
        roleName: user.role?.name ?? null,
        permissions:
          user.role && user.role.name !== "Super Admin"
            ? user.role.permissions.map((rp: any) => rp.permission.key)
            : null,
        preferredCourseId: user.preferredCourseId ?? null,
      },
    };
  },

  async refresh(refreshToken: string) {
    let decoded: { userId: string };
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized("Invalid or expired refresh token");
    }

    const stored = await authRepository.findRefreshToken(refreshToken);
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw AppError.unauthorized("Refresh token is no longer valid");
    }

    const user = await authRepository.findUserById(decoded.userId);
    if (!user) {
      throw AppError.unauthorized("User no longer exists");
    }

    const accessToken = signAccessToken({
      userId: user.id,
      accountType: user.accountType,
      lawFirmId: user.lawFirmId,
      roleId: user.roleId,
      preferredExamType: (user as any).preferredExamType ?? null,
    });

    return { accessToken };
  },

  async logout(refreshToken: string) {
    const stored = await authRepository.findRefreshToken(refreshToken);
    if (stored && !stored.revoked) {
      await authRepository.revokeRefreshToken(refreshToken);
    }
    return { message: "Logged out successfully" };
  },

  /**
   * Self-service password change — requires the current password as proof of
   * identity even though the request is already authenticated (defense in depth,
   * e.g. protects against a stolen unlocked device / session).
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw AppError.unauthorized("User no longer exists");
    }

    const matches = await comparePassword(currentPassword, user.passwordHash);
    if (!matches) {
      throw AppError.badRequest("Current password is incorrect");
    }

    const newHash = await hashPassword(newPassword);
    await authRepository.updatePassword(userId, newHash);

    return { message: "Password changed successfully" };
  },

  /**
   * Self-service profile edit. Lawyer-specific fields (bar registration,
   * specialization) are only persisted if the account is actually a LAWYER —
   * silently ignored otherwise, rather than erroring, since a client/staff
   * account simply doesn't have those fields.
   */
  async updateMyProfile(
    userId: string,
    input: { fullName?: string; phone?: string; barRegistrationNo?: string; specialization?: string }
  ) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw AppError.unauthorized("User no longer exists");
    }

    const data: { fullName?: string; phone?: string; barRegistrationNo?: string; specialization?: string } = {
      fullName: input.fullName,
      phone: input.phone,
    };
    if (user.accountType === "LAWYER") {
      data.barRegistrationNo = input.barRegistrationNo;
      data.specialization = input.specialization;
    }

    return authRepository.updateMyProfile(userId, data);
  },

  async updateAvatar(userId: string, avatarUrl: string) {
    return authRepository.updateAvatar(userId, avatarUrl);
  },

  async requestPasswordReset(email: string, note?: string) {
    await prisma.passwordResetRequest.create({ data: { email, note } });
    // Always return the same message regardless of whether the email
    // exists — avoids leaking which emails are registered.
    return { message: "If an account exists for this email, your institution/admin has been notified." };
  },

  async listPasswordResetRequests(auth: { accountType: string; lawFirmId: string | null }) {
    if (auth.accountType === "COMPANY") {
      return prisma.passwordResetRequest.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" } });
    }
    // Institution/Law Firm admin — only requests from emails belonging to their own organization's users.
    if (!auth.lawFirmId) return [];
    const orgUsers = await prisma.user.findMany({ where: { lawFirmId: auth.lawFirmId }, select: { email: true } });
    const orgEmails = orgUsers.map((u) => u.email);
    return prisma.passwordResetRequest.findMany({
      where: { status: "PENDING", email: { in: orgEmails } },
      orderBy: { createdAt: "desc" },
    });
  },

  async resolvePasswordResetRequest(id: string, resolvedBy: string) {
    return prisma.passwordResetRequest.update({
      where: { id },
      data: { status: "RESOLVED", resolvedAt: new Date(), resolvedBy },
    });
  },
};
