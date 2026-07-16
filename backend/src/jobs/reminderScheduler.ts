import { prisma } from "../database/prisma";
import { pushRepository } from "../modules/push/repository/push.repository";
import { logger } from "../common/utils/logger";

const CHECK_INTERVAL_MS = 30 * 1000; // check every 30 seconds — fine-grained enough for near-term test reminders

/**
 * Finds HearingReminders whose remindAt has passed and haven't been sent yet,
 * sends a push notification to every lawyer assigned to that case (and the
 * client, if they have portal access + a push token), then marks them sent.
 *
 * This is what turns the "automatic reminder" rows created in hearing.service.ts
 * into an actual notification on the lawyer's/client's phone.
 */
async function processDueReminders() {
  const dueReminders = await prisma.hearingReminder.findMany({
    where: { remindAt: { lte: new Date() }, sent: false },
    take: 100,
    include: {
      hearing: {
        include: {
          case: {
            include: {
              lawyers: { include: { lawyer: { select: { id: true, pushToken: true } } } },
              clients: { include: { client: { include: { user: { select: { id: true, pushToken: true } } } } } },
            },
          },
        },
      },
    },
  });

  if (dueReminders.length === 0) return;

  for (const reminder of dueReminders) {
    const caseRecord = reminder.hearing.case;
    const label = reminder.label.replace(/_/g, " ");
    const title = `Hearing Reminder — ${label}`;
    const body = `${caseRecord.caseTitle} (${caseRecord.caseNumber}) — ${reminder.hearing.hearingDate.toLocaleString()}`;

    const messages: { to: string; title: string; body: string; data?: Record<string, unknown> }[] = [];

    for (const cl of caseRecord.lawyers) {
      if (cl.lawyer.pushToken) {
        messages.push({ to: cl.lawyer.pushToken, title, body, data: { caseId: caseRecord.id, type: "HEARING_REMINDER" } });
      }
    }
    for (const cc of caseRecord.clients) {
      const token = cc.client.user?.pushToken;
      if (token) {
        messages.push({ to: token, title, body, data: { caseId: caseRecord.id, type: "HEARING_REMINDER" } });
      }
    }

    await pushRepository.sendPushBatch(messages);

    await prisma.hearingReminder.update({
      where: { id: reminder.id },
      data: { sent: true, sentAt: new Date() },
    });

    logger.info(`Sent hearing reminder "${reminder.label}" for case ${caseRecord.caseNumber} to ${messages.length} recipient(s)`);
  }
}

export function startReminderScheduler() {
  logger.info("Hearing reminder scheduler started (checking every 30s)");
  setInterval(() => {
    processDueReminders().catch((err) => {
      logger.error(`Reminder scheduler error: ${err instanceof Error ? err.message : String(err)}`);
    });
  }, CHECK_INTERVAL_MS);
}
