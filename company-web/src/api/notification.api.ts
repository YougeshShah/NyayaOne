import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { SentNotification, SendNotificationPayload } from "../types/notification.types";

export const notificationApi = {
  async listSent(params: { page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<SentNotification>>>("/notifications", { params });
    return data.data;
  },

  async send(payload: SendNotificationPayload): Promise<SentNotification> {
    const { data } = await apiClient.post<ApiSuccessResponse<SentNotification>>("/notifications", payload);
    return data.data;
  },
};
