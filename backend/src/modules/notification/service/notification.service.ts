import { AppError } from "../../../common/errors/AppError";
import { notificationRepository } from "../repository/notification.repository";
import { pushRepository } from "../../push/repository/push.repository";
import { prisma } from "../../../database/prisma";
import { SendNotificationInput, ListNotificationsQuery } from "../dto/notification.dto";

export const notificationService = {
  /**
   * Company staff sends an announcement. One Notification record is created,
   * then fanned out to every matching recipient as a UserNotification row
   * (tracks per-user read state independently) AND as an actual push
   * notification to their phone (previously this only wrote DB rows for the
   * in-app inbox — recipients never got a phone notification for company
   * broadcasts, only for hearing reminders, since that's a separate code path).
   */
  async send(input: SendNotificationInput, createdBy: string) {
    const recipientIds = await notificationRepository.resolveRecipientUserIds(input.audience, input.targetId);

    if (recipientIds.length === 0) {
      throw AppError.badRequest("No recipients matched this audience. Notification was not sent.");
    }

    const notification = await notificationRepository.createNotification({
      title: input.title,
      body: input.body,
      audience: input.audience,
      targetId: input.targetId,
      createdBy,
    });

    await notificationRepository.bulkCreateUserNotifications(notification.id, recipientIds);

    // Fire the actual push — fetch tokens for every recipient that has one registered.
    const recipients = await prisma.user.findMany({
      where: { id: { in: recipientIds }, pushToken: { not: null } },
      select: { pushToken: true },
    });
    const pushMessages = recipients
      .filter((r) => r.pushToken)
      .map((r) => ({ to: r.pushToken as string, title: input.title, body: input.body, data: { type: "COMPANY_ANNOUNCEMENT" } }));
    await pushRepository.sendPushBatch(pushMessages);

    return { notification, recipientCount: recipientIds.length, pushedCount: pushMessages.length };
  },

  async listSent(query: ListNotificationsQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await notificationRepository.findSentByCompany({ skip, take: query.limit });
    return {
      items,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async myNotifications(userId: string, query: ListNotificationsQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await notificationRepository.findMyNotifications(userId, { skip, take: query.limit });
    const unreadCount = await notificationRepository.countUnread(userId);
    return {
      items,
      unreadCount,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async markRead(userNotificationId: string, userId: string) {
    const result = await notificationRepository.markReadScoped(userNotificationId, userId);
    if (result.count === 0) throw AppError.notFound("Notification not found");
    return { message: "Marked as read" };
  },
  async markAllRead(userId: string) {
    const result = await notificationRepository.markAllReadScoped(userId);
    return { message: "Marked all as read", count: result.count };
  },
};
