import { prisma } from "../../../database/prisma";
import { Prisma } from "@prisma/client";

export const auditLogRepository = {
  async findMany(params: { entityType?: string; userId?: string; search?: string; skip: number; take: number }) {
    const where: Prisma.AuditLogWhereInput = {
      ...(params.entityType ? { entityType: params.entityType } : {}),
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.search ? { action: { contains: params.search, mode: "insensitive" } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, fullName: true, email: true, accountType: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  },

  async listDistinctEntityTypes() {
    const rows = await prisma.auditLog.findMany({ distinct: ["entityType"], select: { entityType: true } });
    return rows.map((r) => r.entityType);
  },
};
