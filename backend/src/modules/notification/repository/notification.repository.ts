import { prisma } from "../../../database/prisma";
import { NotificationAudience } from "@prisma/client";

export const notificationRepository = {
  createNotification(data: {
    title: string;
    body: string;
    audience: NotificationAudience;
    targetId?: string;
    createdBy: string;
  }) {
    return prisma.notification.create({ data });
  },

  /**
   * Resolves which user IDs should receive a notification based on audience type.
   * This is the fan-out logic: one Notification record, many UserNotification rows.
   */
  async resolveRecipientUserIds(audience: NotificationAudience, targetId?: string): Promise<string[]> {
    switch (audience) {
      case "ALL_LAWYERS": {
        const users = await prisma.user.findMany({ where: { accountType: "LAWYER" }, select: { id: true } });
        return users.map((u) => u.id);
      }
      case "SPECIFIC_LAW_FIRM": {
        const users = await prisma.user.findMany({ where: { lawFirmId: targetId }, select: { id: true } });
        return users.map((u) => u.id);
      }
      case "ALL_CLIENTS": {
        const users = await prisma.user.findMany({ where: { accountType: "CLIENT" }, select: { id: true } });
        return users.map((u) => u.id);
      }
      case "ALL_STUDENTS": {
        // No STUDENT account type yet — Phase 2 (Student Learning Platform) feature.
        return [];
      }
      case "INDIVIDUAL_USER": {
        return targetId ? [targetId] : [];
      }
      default:
        return [];
    }
  },

  bulkCreateUserNotifications(notificationId: string, userIds: string[]) {
    if (userIds.length === 0) return Promise.resolve({ count: 0 });
    return prisma.userNotification.createMany({
      data: userIds.map((userId) => ({ userId, notificationId })),
      skipDuplicates: true,
    });
  },

  async findSentByCompany(params: { skip: number; take: number }) {
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { recipients: true } } },
      }),
      prisma.notification.count(),
    ]);
    return { items, total };
  },

  async findMyNotifications(userId: string, params: { skip: number; take: number }) {
    const [items, total] = await Promise.all([
      prisma.userNotification.findMany({
        where: { userId },
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { notification: true },
      }),
      prisma.userNotification.count({ where: { userId } }),
    ]);
    return { items, total };
  },

  markReadScoped(userNotificationId: string, userId: string) {
    return prisma.userNotification.updateMany({
      where: { id: userNotificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  },

  countUnread(userId: string) {
    return prisma.userNotification.count({ where: { userId, isRead: false } });
  },
};
