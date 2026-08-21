import { prisma } from "../../../database/prisma";
import { Prisma } from "@prisma/client";

export const clientRepository = {
  async findMany(params: { lawFirmId: string; search?: string; skip: number; take: number }) {
    const where: Prisma.ClientWhereInput = {
      lawFirmId: params.lawFirmId,
      ...(params.search
        ? {
            OR: [
              { fullName: { contains: params.search, mode: "insensitive" } },
              { phone: { contains: params.search, mode: "insensitive" } },
              { email: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { cases: true } } },
      }),
      prisma.client.count({ where }),
    ]);

    return { items, total };
  },

  findByIdScoped(id: string, lawFirmId: string) {
    return prisma.client.findFirst({
      where: { id, lawFirmId },
      include: {
        _count: { select: { cases: true } },
        cases: {
          include: { case: { select: { id: true, caseNumber: true, caseTitle: true, status: true } } },
        },
      },
    });
  },

  create(lawFirmId: string, data: Omit<Prisma.ClientCreateInput, "lawFirm">) {
    return prisma.client.create({
      data: { ...data, lawFirm: { connect: { id: lawFirmId } } },
    });
  },

  updateScoped(id: string, lawFirmId: string, data: Prisma.ClientUpdateInput) {
    return prisma.client.updateMany({ where: { id, lawFirmId }, data });
  },

  countCases(clientId: string) {
    return prisma.caseClient.count({ where: { clientId } });
  },

  async removeScoped(id: string, lawFirmId: string) {
    await prisma.client.deleteMany({ where: { id, lawFirmId } });
  },

  findUserByEmail(email: string) {
    return prisma.user.findFirst({ where: { email } });
  },

  linkUserToClient(clientId: string, userId: string) {
    return prisma.client.update({ where: { id: clientId }, data: { userId } });
  },

  createPortalUser(data: { lawFirmId: string; fullName: string; email: string; phone?: string; passwordHash: string }) {
    return prisma.user.create({
      data: {
        accountType: "CLIENT",
        lawFirmId: data.lawFirmId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        status: "ACTIVE",
      },
    });
  },
};
