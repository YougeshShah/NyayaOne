import { prisma } from "../../../database/prisma";
import { DocumentCategory, Prisma } from "@prisma/client";

export const documentRepository = {
  async findMany(params: { lawFirmId: string; caseId?: string; category?: DocumentCategory; skip: number; take: number }) {
    const where: Prisma.DocumentWhereInput = {
      lawFirmId: params.lawFirmId,
      ...(params.caseId ? { caseId: params.caseId } : {}),
      ...(params.category ? { category: params.category } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: { select: { id: true, fullName: true } },
          case: { select: { id: true, caseNumber: true, caseTitle: true } },
        },
      }),
      prisma.document.count({ where }),
    ]);

    return { items, total };
  },

  findByIdScoped(id: string, lawFirmId: string) {
    return prisma.document.findFirst({
      where: { id, lawFirmId },
      include: {
        uploadedBy: { select: { id: true, fullName: true } },
        case: { select: { id: true, caseNumber: true, caseTitle: true } },
      },
    });
  },

  create(data: {
    lawFirmId: string;
    caseId?: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSizeKb: number;
    category: DocumentCategory;
    uploadedById: string;
  }) {
    return prisma.document.create({
      data,
      include: {
        uploadedBy: { select: { id: true, fullName: true } },
        case: { select: { id: true, caseNumber: true, caseTitle: true } },
      },
    });
  },

  deleteScoped(id: string, lawFirmId: string) {
    return prisma.document.deleteMany({ where: { id, lawFirmId } });
  },

  // Validates the case belongs to this firm before attaching a document to it.
  findCaseScoped(caseId: string, lawFirmId: string) {
    return prisma.case.findFirst({ where: { id: caseId, lawFirmId } });
  },
  setClientVisibility(id: string, lawFirmId: string, visibleToClient: boolean) {
    return prisma.document.updateMany({ where: { id, lawFirmId }, data: { visibleToClient } });
  },
};
