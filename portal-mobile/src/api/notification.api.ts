import { apiClient } from "./client";

export interface MyNotification {
  id: string;
  isRead: boolean;
  readAt: string | null;
  deliveredAt: string | null;
  notification: {
    id: string;
    title: string;
    body: string;
    audience: string;
    createdAt: string;
  };
}

export const notificationApi = {
  async myNotifications(page = 1, limit = 30): Promise<{ items: MyNotification[]; unreadCount: number }> {
    const { data } = await apiClient.get("/notifications/my", { params: { page, limit } });
    return data.data;
  },
  async markRead(id: string) {
    const { data } = await apiClient.patch(`/notifications/my/${id}/read`);
    return data.data;
  },
  async markAllRead() {
    const { data } = await apiClient.patch(`/notifications/my/mark-all-read`);
    return data.data;
  },
};
