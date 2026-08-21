import { prisma } from "../../../database/prisma";
import { AccountType } from "@prisma/client";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
      include: { lawFirm: true, role: { include: { permissions: { include: { permission: true } } } } },
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { lawFirm: true, role: true },
    });
  },

  async createLawFirmWithAdmin(params: {
    lawFirmName: string;
    lawFirmEmail: string;
    adminFullName: string;
    adminEmail: string;
    adminPhone?: string;
    passwordHash: string;
    tenantType?: "LAW_FIRM" | "EDUCATION";
  }) {
    return prisma.$transaction(async (tx) => {
      const lawFirm = await tx.lawFirm.create({
        data: {
          name: params.lawFirmName,
          email: params.lawFirmEmail,
          status: "PENDING", // Requires Company approval before becoming ACTIVE
          tenantType: params.tenantType ?? "LAW_FIRM",
        },
      });

      const admin = await tx.user.create({
        data: {
          accountType: AccountType.LAW_FIRM_ADMIN,
          fullName: params.adminFullName,
          email: params.adminEmail,
          phone: params.adminPhone,
          passwordHash: params.passwordHash,
          status: "PENDING_VERIFICATION", // pending Company's approval of the firm itself
          lawFirmId: lawFirm.id,
        },
      });

      return { lawFirm, admin };
    });
  },

// Phase 2 — students go straight to ACTIVE (no approval workflow), and
  // have no lawFirmId since they're not tied to any firm.
  createStudent(params: {
    fullName: string;
    email: string;
    phone?: string;
    passwordHash: string;
    addedByLawFirmId?: string;
    preferredCourseId?: string;
    preferredExamType?: string;
    status?: "ACTIVE" | "PENDING_VERIFICATION";
    emailVerified?: boolean;
  }) {
    return prisma.user.create({
      data: {
        accountType: AccountType.STUDENT,
        fullName: params.fullName,
        email: params.email.toLowerCase().trim(),
        phone: params.phone,
        passwordHash: params.passwordHash,
        status: params.status ?? "ACTIVE",
        emailVerified: params.emailVerified ?? false,
        lawFirmId: params.addedByLawFirmId ?? null,
        preferredCourseId: params.preferredCourseId,
        preferredExamType: params.preferredExamType,
      },
    });
  },

  findStudentsByLawFirmId(lawFirmId: string, status?: "ACTIVE" | "PENDING_VERIFICATION") {
    return prisma.user.findMany({
      where: { accountType: AccountType.STUDENT, lawFirmId, ...(status ? { status } : {}) },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        preferredCourseId: true,
        preferredExamType: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findStudentById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true, phone: true, createdAt: true },
    });
  },

  updateStudentScoped(id: string, lawFirmId: string, data: { fullName?: string; phone?: string; status?: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED"; preferredCourseId?: string; preferredExamType?: string }) {
    return prisma.user.updateMany({ where: { id, accountType: AccountType.STUDENT, lawFirmId }, data });
  },

  // Unlinks the student from the institution rather than deleting the
  // account outright -- their login, progress, and subscriptions stay
  // intact; they simply stop appearing as this institution's student.
  removeStudentScoped(id: string, lawFirmId: string) {
    return prisma.user.updateMany({ where: { id, accountType: AccountType.STUDENT, lawFirmId }, data: { lawFirmId: null } });
  },

  storeRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  },

  findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  },

  revokeRefreshToken(token: string) {
    return prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  },

  updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  updateMyProfile(userId: string, data: { fullName?: string; phone?: string; email?: string; bio?: string; barRegistrationNo?: string; specialization?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        bio: true,
        accountType: true,
        barRegistrationNo: true,
        specialization: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  },

  updateAvatar(userId: string, avatarUrl: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
  },
};
