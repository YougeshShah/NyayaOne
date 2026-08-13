import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export const institutionNotificationApi = {
  async notifyMyStudents(title: string, body: string, lawFirmId: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>("/notifications/institution", {
      title,
      body,
      audience: "INSTITUTION_STUDENTS",
      targetId: lawFirmId,
    });
    return data.data;
  },
};
