import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";

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
  async myNotifications(page = 1, limit = 20): Promise<PaginatedResult<MyNotification> & { unreadCount: number }> {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<MyNotification> & { unreadCount: number }>>("/notifications/my", {
      params: { page, limit },
    });
    return data.data;
  },
  async markRead(id: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ message: string }>>(`/notifications/my/${id}/read`);
    return data.data;
  },
  async markAllRead() {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ message: string; count: number }>>(`/notifications/my/mark-all-read`);
    return data.data;
  },
};
