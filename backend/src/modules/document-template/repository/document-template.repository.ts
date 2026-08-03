import { prisma } from "../../../database/prisma";
import { Prisma } from "@prisma/client";

export const documentTemplateRepository = {
  async findMany(params: { category?: string; search?: string; skip: number; take: number }) {
    const where: Prisma.DocumentTemplateWhereInput = {
      isActive: true,
      ...(params.category ? { category: params.category } : {}),
      ...(params.search ? { title: { contains: params.search, mode: "insensitive" } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.documentTemplate.findMany({ where, skip: params.skip, take: params.take, orderBy: { title: "asc" } }),
      prisma.documentTemplate.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.documentTemplate.findUnique({ where: { id } });
  },

  create(data: { title: string; category?: string; description?: string; bodyTemplate: string; createdBy: string }) {
    return prisma.documentTemplate.create({ data });
  },

  update(id: string, data: Prisma.DocumentTemplateUpdateInput) {
    return prisma.documentTemplate.update({ where: { id }, data });
  },

  // Fetches everything needed to fill placeholders — scoped by lawFirmId so a
  // lawyer can only generate documents from their own firm's case data.
  findCaseForGeneration(caseId: string, lawFirmId: string) {
    return prisma.case.findFirst({
      where: { id: caseId, lawFirmId },
      include: {
        court: true,
        lawFirm: true,
        clients: { include: { client: true } },
        lawyers: { include: { lawyer: true }, where: { isLead: true } },
      },
    });
  },
};
