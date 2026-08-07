import { prisma } from "../../../database/prisma";
import { AccountType } from "@prisma/client";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
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
  }) {
    return prisma.$transaction(async (tx) => {
      const lawFirm = await tx.lawFirm.create({
        data: {
          name: params.lawFirmName,
          email: params.lawFirmEmail,
          status: "PENDING", // Requires Company approval before becoming ACTIVE
        },
      });

      const admin = await tx.user.create({
        data: {
          accountType: AccountType.LAW_FIRM_ADMIN,
          fullName: params.adminFullName,
          email: params.adminEmail,
          phone: params.adminPhone,
          passwordHash: params.passwordHash,
          status: "PENDING_VERIFICATION",
          lawFirmId: lawFirm.id,
        },
      });

      return { lawFirm, admin };
    });
  },

// Phase 2 — students go straight to ACTIVE (no approval workflow), and
  // have no lawFirmId since they're not tied to any firm.
  createStudent(params: { fullName: string; email: string; phone?: string; passwordHash: string; addedByLawFirmId?: string }) {
    return prisma.user.create({
      data: {
        accountType: AccountType.STUDENT,
        fullName: params.fullName,
        email: params.email,
        phone: params.phone,
        passwordHash: params.passwordHash,
        status: "ACTIVE",
        lawFirmId: params.addedByLawFirmId ?? null,
      },
    });
  },

  findStudentsByLawFirmId(lawFirmId: string) {
    return prisma.user.findMany({
      where: { accountType: AccountType.STUDENT, lawFirmId },
      select: { id: true, fullName: true, email: true, phone: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
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

  updateMyProfile(userId: string, data: { fullName?: string; phone?: string; barRegistrationNo?: string; specialization?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        accountType: true,
        barRegistrationNo: true,
        specialization: true,
        avatarUrl: true,
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
