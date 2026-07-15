import { AppError } from "../../../common/errors/AppError";
import { notificationRepository } from "../repository/notification.repository";
import { SendNotificationInput, ListNotificationsQuery } from "../dto/notification.dto";

export const notificationService = {
  /**
   * Company staff sends an announcement. One Notification record is created,
   * then fanned out to every matching recipient as a UserNotification row
   * (tracks per-user read state independently).
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

    return { notification, recipientCount: recipientIds.length };
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
};
