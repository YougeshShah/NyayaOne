import { apiClient } from "./client";

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  barRegistrationNo?: string;
  specialization?: string;
}

export interface UpdatedProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  accountType: string;
  barRegistrationNo: string | null;
  specialization: string | null;
}

export const authExtraApi = {
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await apiClient.patch("/auth/change-password", { currentPassword, newPassword });
    return data.data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UpdatedProfile> {
    const { data } = await apiClient.patch("/auth/me", payload);
    return data.data;
  },
};
