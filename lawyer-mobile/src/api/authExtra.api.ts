import { apiClient } from "./client";

export const authExtraApi = {
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await apiClient.patch("/auth/change-password", { currentPassword, newPassword });
    return data.data;
  },
};
