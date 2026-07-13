import { prisma } from "../../../database/prisma";
import { HearingStatus, Prisma } from "@prisma/client";

export const hearingRepository = {
  // Scoped through the case's lawFirmId — a hearing has no direct lawFirmId column,
  // so every query joins through `case: { lawFirmId }`.
  async findMany(params: { lawFirmId: string; caseId?: string; from?: Date; to?: Date; skip: number; take: number }) {
    const where: Prisma.HearingWhereInput = {
      case: { lawFirmId: params.lawFirmId },
      ...(params.caseId ? { caseId: params.caseId } : {}),
      ...(params.from || params.to
        ? {
            hearingDate: {
              ...(params.from ? { gte: params.from } : {}),
              ...(params.to ? { lte: params.to } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.hearing.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { hearingDate: "asc" },
        include: {
          case: { select: { id: true, caseNumber: true, caseTitle: true } },
        },
      }),
      prisma.hearing.count({ where }),
    ]);

    return { items, total };
  },

  findByIdScoped(id: string, lawFirmId: string) {
    return prisma.hearing.findFirst({
      where: { id, case: { lawFirmId } },
      include: {
        case: { select: { id: true, caseNumber: true, caseTitle: true } },
        reminders: true,
      },
    });
  },

  findCaseScoped(caseId: string, lawFirmId: string) {
    return prisma.case.findFirst({ where: { id: caseId, lawFirmId } });
  },

  createWithReminders(params: {
    caseId: string;
    hearingDate: Date;
    courtName?: string;
    judge?: string;
    remarks?: string;
    createdById: string;
    reminders: { remindAt: Date; label: string }[];
  }) {
    return prisma.hearing.create({
      data: {
        caseId: params.caseId,
        hearingDate: params.hearingDate,
        courtName: params.courtName,
        judge: params.judge,
        remarks: params.remarks,
        createdById: params.createdById,
        reminders: { create: params.reminders },
      },
      include: { reminders: true },
    });
  },

  updateScoped(id: string, lawFirmId: string, data: Prisma.HearingUpdateInput) {
    return prisma.hearing.updateMany({ where: { id, case: { lawFirmId } }, data });
  },

  linkNextHearing(previousHearingId: string, nextHearingId: string) {
    return prisma.hearing.update({ where: { id: previousHearingId }, data: { nextHearingId } });
  },

  // Used by the (future) notification scheduler job to find reminders due to be sent.
  findDueReminders(now: Date) {
    return prisma.hearingReminder.findMany({
      where: { remindAt: { lte: now }, sent: false },
      include: { hearing: { include: { case: true } } },
    });
  },
};
