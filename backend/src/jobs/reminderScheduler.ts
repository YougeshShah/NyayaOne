import { prisma } from "../database/prisma";
import { pushRepository } from "../modules/push/repository/push.repository";
import { notificationRepository } from "../modules/notification/repository/notification.repository";
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

/**
 * Finds LiveClasses starting within the next 10 minutes that haven't had
 * their reminder sent yet, notifies every student subscribed to that
 * course at the hosting institution (push + in-app), and marks reminderSent.
 * Scoped the same way the "class scheduled" notification is -- only that
 * institution's own students who are actually subscribed to the course.
 */
async function processDueLiveClassReminders() {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 10 * 60 * 1000);
  const dueClasses = await prisma.liveClass.findMany({
    where: {
      scheduledAt: { gte: now, lte: windowEnd },
      reminderSent: false,
      status: "SCHEDULED",
    },
    take: 50,
  });
  if (dueClasses.length === 0) return;

  for (const liveClass of dueClasses) {
    if (!liveClass.hostLawFirmId) {
      // Company-hosted classes for all subscribers aren't institution-scoped
      // reminders -- skip for now, mark sent so it isn't rechecked forever.
      await prisma.liveClass.update({ where: { id: liveClass.id }, data: { reminderSent: true } });
      continue;
    }

    const students = await prisma.user.findMany({
      where: {
        accountType: "STUDENT",
        lawFirmId: liveClass.hostLawFirmId,
        courseSubscriptions: { some: { courseId: liveClass.courseId } },
      },
      select: { id: true, pushToken: true },
    });

    const title = "Class Starting Soon";
    const body = `"${liveClass.title}" starts in 10 minutes.`;

    const pushMessages = students
      .filter((s) => s.pushToken)
      .map((s) => ({ to: s.pushToken as string, title, body, data: { liveClassId: liveClass.id, type: "LIVE_CLASS_REMINDER" } }));
    if (pushMessages.length > 0) {
      await pushRepository.sendPushBatch(pushMessages);
    }

    for (const student of students) {
      try {
        const notification = await notificationRepository.createNotification({
          title,
          body,
          audience: "INDIVIDUAL_USER",
          targetId: student.id,
          createdBy: liveClass.hostId,
        });
        await notificationRepository.bulkCreateUserNotifications(notification.id, [student.id]);
      } catch {
        // Notification failure should never block the reminder loop.
      }
    }

    await prisma.liveClass.update({ where: { id: liveClass.id }, data: { reminderSent: true } });
    logger.info(`Sent live class reminder for "${liveClass.title}" to ${students.length} student(s)`);
  }
}

export function startReminderScheduler() {
  logger.info("Hearing reminder scheduler started (checking every 30s)");
  setInterval(() => {
    processDueReminders().catch((err) => {
      logger.error(`Reminder scheduler error: ${err instanceof Error ? err.message : String(err)}`);
    });
    processDueLiveClassReminders().catch((err) => {
      logger.error(`Live class reminder scheduler error: ${err instanceof Error ? err.message : String(err)}`);
    });
  }, CHECK_INTERVAL_MS);
}
