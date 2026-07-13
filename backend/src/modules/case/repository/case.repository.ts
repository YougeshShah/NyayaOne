import { prisma } from "../../../database/prisma";
import { CaseStatus, CasePriority, Prisma } from "@prisma/client";

const CASE_INCLUDE = {
  court: { select: { id: true, name: true, type: true, province: true } },
  clients: { include: { client: { select: { id: true, fullName: true, phone: true } } } },
  lawyers: { include: { lawyer: { select: { id: true, fullName: true, email: true } } } },
  _count: { select: { hearings: true, documents: true } },
} satisfies Prisma.CaseInclude;

export const caseRepository = {
  async findMany(params: {
    lawFirmId: string;
    status?: CaseStatus;
    priority?: CasePriority;
    lawyerId?: string;
    clientId?: string;
    search?: string;
    skip: number;
    take: number;
  }) {
    const where: Prisma.CaseWhereInput = {
      lawFirmId: params.lawFirmId,
      ...(params.status ? { status: params.status } : {}),
      ...(params.priority ? { priority: params.priority } : {}),
      ...(params.lawyerId ? { lawyers: { some: { lawyerId: params.lawyerId } } } : {}),
      ...(params.clientId ? { clients: { some: { clientId: params.clientId } } } : {}),
      ...(params.search
        ? {
            OR: [
              { caseTitle: { contains: params.search, mode: "insensitive" } },
              { caseNumber: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.case.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: CASE_INCLUDE,
      }),
      prisma.case.count({ where }),
    ]);

    return { items, total };
  },

  findByIdScoped(id: string, lawFirmId: string) {
    return prisma.case.findFirst({
      where: { id, lawFirmId },
      include: {
        ...CASE_INCLUDE,
        hearings: { orderBy: { hearingDate: "desc" }, take: 10 },
      },
    });
  },

  existsByCaseNumber(lawFirmId: string, caseNumber: string) {
    return prisma.case.findUnique({
      where: { lawFirmId_caseNumber: { lawFirmId, caseNumber } },
    });
  },

  async create(params: {
    lawFirmId: string;
    caseNumber: string;
    caseTitle: string;
    courtId: string;
    clientIds: string[];
    lawyerIds: string[];
    leadLawyerId?: string;
    opposingParty?: string;
    opposingLawyer?: string;
    courtSubject?: string;
    category?: string;
    filingDate?: Date;
    judge?: string;
    priority: CasePriority;
    remarks?: string;
  }) {
    return prisma.case.create({
      data: {
        lawFirmId: params.lawFirmId,
        caseNumber: params.caseNumber,
        caseTitle: params.caseTitle,
        courtId: params.courtId,
        opposingParty: params.opposingParty,
        opposingLawyer: params.opposingLawyer,
        courtSubject: params.courtSubject,
        category: params.category,
        filingDate: params.filingDate,
        judge: params.judge,
        priority: params.priority,
        remarks: params.remarks,
        clients: { create: params.clientIds.map((clientId) => ({ clientId })) },
        lawyers: {
          create: params.lawyerIds.map((lawyerId) => ({
            lawyerId,
            isLead: lawyerId === params.leadLawyerId,
          })),
        },
      },
      include: CASE_INCLUDE,
    });
  },

  updateScoped(id: string, lawFirmId: string, data: Prisma.CaseUpdateInput) {
    return prisma.case.updateMany({ where: { id, lawFirmId }, data });
  },

  // Used by court module to block deactivation of a court with open cases (referenced from court module already).
  countByStatusForFirm(lawFirmId: string) {
    return prisma.case.groupBy({
      by: ["status"],
      where: { lawFirmId },
      _count: true,
    });
  },
};
