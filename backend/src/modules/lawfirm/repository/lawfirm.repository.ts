import { prisma } from "../../../database/prisma";
import { LawFirmStatus, Prisma } from "@prisma/client";
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
};
