import { prisma } from "../../../database/prisma";
import { AccountType } from "@prisma/client";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { lawFirm: true, role: true },
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
};
