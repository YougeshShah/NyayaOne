import { AppError } from "../../../common/errors/AppError";
import { hashPassword, comparePassword } from "../../../common/utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../../common/utils/jwt";
import { authRepository } from "../repository/auth.repository";
import { RegisterLawFirmInput, RegisterStudentInput, LoginInput } from "../dto/auth.dto";

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
    });

    return {
      student: { id: student.id, fullName: student.fullName, email: student.email },
      message: addedByLawFirmId ? "Student added." : "Registration successful. You can log in now.",
    };
  },

  async listInstitutionStudents(lawFirmId: string) {
    return authRepository.findStudentsByLawFirmId(lawFirmId);
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

    // Law firm tenants must be ACTIVE (approved by Company) before staff can log in,
    // except the law firm admin, who needs to be able to check status.
    if (user.lawFirm && user.lawFirm.status !== "ACTIVE" && user.accountType !== "LAW_FIRM_ADMIN") {
      throw AppError.forbidden("Your law firm account is not yet active");
    }

    const accessToken = signAccessToken({
      userId: user.id,
      accountType: user.accountType,
      lawFirmId: user.lawFirmId,
      roleId: user.roleId,
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
};
