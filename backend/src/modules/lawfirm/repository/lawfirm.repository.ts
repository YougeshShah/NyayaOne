import { prisma } from "../../../database/prisma";
import { LawFirmStatus, Prisma, AccountType } from "@prisma/client";

type AuditMetadata = Record<string, unknown>;

export const lawFirmRepository = {
  async findMany(params: { status?: LawFirmStatus; search?: string; skip: number; take: number }) {
    const where: Prisma.LawFirmWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { email: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.lawFirm.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { users: true, clients: true, cases: true } },
        },
      }),
      prisma.lawFirm.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string) {
    return prisma.lawFirm.findUnique({
      where: { id },
      include: {
        users: {
          where: { accountType: "LAW_FIRM_ADMIN" },
          select: { id: true, fullName: true, email: true, phone: true, status: true, createdAt: true },
        },
        _count: { select: { users: true, clients: true, cases: true } },
      },
    });
  },

  updateStatus(id: string, status: LawFirmStatus, approvedBy?: string) {
    return prisma.lawFirm.update({
      where: { id },
      data: {
        status,
        ...(status === "ACTIVE" ? { approvedAt: new Date(), approvedBy } : {}),
      },
    });
  },

  createAuditLog(params: { userId: string; action: string; entityId: string; metadata?: AuditMetadata }) {
    return prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: "LawFirm",
        entityId: params.entityId,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  },

  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  /**
   * Company staff manually onboards a law firm — unlike self-registration
   * (which starts PENDING and needs approval), a firm created directly by
   * Company is trusted immediately and goes straight to ACTIVE.
   */
  async createWithAdmin(params: {
    lawFirmName: string;
    lawFirmEmail: string;
    adminFullName: string;
    adminEmail: string;
    adminPhone?: string;
    passwordHash: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const lawFirm = await tx.lawFirm.create({
        data: { name: params.lawFirmName, email: params.lawFirmEmail, status: "ACTIVE" },
      });

      const admin = await tx.user.create({
        data: {
          accountType: AccountType.LAW_FIRM_ADMIN,
          fullName: params.adminFullName,
          email: params.adminEmail,
          phone: params.adminPhone,
          passwordHash: params.passwordHash,
          status: "ACTIVE",
          lawFirmId: lawFirm.id,
        },
      });

      return { lawFirm, admin };
    });
  },
};
