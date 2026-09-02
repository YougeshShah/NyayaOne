import { AppError } from "../../../common/errors/AppError";
import { hearingRepository } from "../repository/hearing.repository";
import { CreateHearingInput, UpdateHearingInput, ListHearingsQuery } from "../dto/hearing.dto";
import { prisma } from "../../../database/prisma";
import { notificationRepository } from "../../notification/repository/notification.repository";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Computes the 4 automatic reminder timestamps for a hearing.
 * The lawyer never creates these manually — this is the single source of
 * truth for the reminder schedule required by the roadmap:
 *   48h before, 24h before, hearing day (8:00 AM), 2h before.
 */
function computeReminders(hearingDate: Date) {
  const hearingDay8am = new Date(hearingDate);
  hearingDay8am.setHours(8, 0, 0, 0);

  return [
    { label: "48_HOURS_BEFORE", remindAt: new Date(hearingDate.getTime() - 48 * HOUR_MS) },
    { label: "24_HOURS_BEFORE", remindAt: new Date(hearingDate.getTime() - 24 * HOUR_MS) },
    { label: "HEARING_DAY", remindAt: hearingDay8am },
    { label: "2_HOURS_BEFORE", remindAt: new Date(hearingDate.getTime() - 2 * HOUR_MS) },
  ].filter((r) => r.remindAt.getTime() > Date.now()); // don't schedule reminders in the past
}

export const hearingService = {
  async list(lawFirmId: string, query: ListHearingsQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await hearingRepository.findMany({
      lawFirmId,
      caseId: query.caseId,
      from: query.from,
      to: query.to,
      skip,
      take: query.limit,
    });
    return {
      items,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async today(lawFirmId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const { items } = await hearingRepository.findMany({ lawFirmId, from: start, to: end, skip: 0, take: 100 });
    return items;
  },

  async upcoming(lawFirmId: string) {
    const { items } = await hearingRepository.findMany({ lawFirmId, from: new Date(), skip: 0, take: 20 });
    return items;
  },

  async getById(id: string, lawFirmId: string) {
    const hearing = await hearingRepository.findByIdScoped(id, lawFirmId);
    if (!hearing) throw AppError.notFound("Hearing not found in your firm");
    return hearing;
  },

  async create(lawFirmId: string, createdById: string, input: CreateHearingInput) {
    const caseRecord = await hearingRepository.findCaseScoped(input.caseId, lawFirmId);
    if (!caseRecord) {
      throw AppError.badRequest("Case not found in your firm");
    }

    const reminders = computeReminders(input.hearingDate);

    if (input.sendTestReminder) {
      reminders.push({ label: "TEST_REMINDER_2MIN", remindAt: new Date(Date.now() + 2 * 60 * 1000) });
    }

    return hearingRepository.createWithReminders({
      caseId: input.caseId,
      hearingDate: input.hearingDate,
      courtName: input.courtName,
      judge: input.judge,
      remarks: input.remarks,
      createdById,
      reminders,
    });
  },

  /**
   * Updating a hearing's status. If marked COMPLETED/ADJOURNED with a
   * nextHearingDate supplied, a follow-up hearing is automatically created
   * and linked — preserving the full hearing history chain (previous <-> next).
   */
  async update(id: string, lawFirmId: string, input: UpdateHearingInput, updatedByUserId: string) {
    const existing = await this.getById(id, lawFirmId);

    const { nextHearingDate, ...rest } = input;
    const result = await hearingRepository.updateScoped(id, lawFirmId, rest);
    if (result.count === 0) throw AppError.notFound("Hearing not found in your firm");

    if (nextHearingDate) {
      const reminders = computeReminders(nextHearingDate);
      const nextHearing = await hearingRepository.createWithReminders({
        caseId: existing.caseId,
        hearingDate: nextHearingDate,
        createdById: existing.createdById,
        reminders,
      });
      await hearingRepository.linkNextHearing(id, nextHearing.id);
    }

    // Notify any client(s) on this case who have portal access (a linked
    // User account) that their hearing was updated -- best-effort, never
    // blocks the actual hearing update if it fails for any reason.
    try {
      const caseClients = await prisma.caseClient.findMany({
        where: { caseId: existing.caseId },
        select: { client: { select: { userId: true } } },
      });
      const clientUserIds = caseClients.map((cc) => cc.client.userId).filter((uid): uid is string => !!uid);
      for (const clientUserId of clientUserIds) {
        const notification = await notificationRepository.createNotification({
          title: "Hearing Updated",
          body: `A hearing for your case has been updated. Check the app for the latest details.`,
          audience: "INDIVIDUAL_USER",
          targetId: clientUserId,
          createdBy: updatedByUserId,
        });
        await notificationRepository.bulkCreateUserNotifications(notification.id, [clientUserId]);
      }
    } catch {
      // Notification failure should never break the actual hearing update.
    }

    return this.getById(id, lawFirmId);
  },
};
