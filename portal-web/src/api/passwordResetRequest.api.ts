import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface PasswordResetRequest {
  id: string;
  email: string;
  note: string | null;
  status: "PENDING" | "RESOLVED";
  createdAt: string;
}

export const passwordResetRequestApi = {
  async listPending(): Promise<PasswordResetRequest[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<PasswordResetRequest[]>>("/auth/password-reset-requests");
    return data.data;
  },

  async resolve(id: string): Promise<void> {
    await apiClient.patch(`/auth/password-reset-requests/${id}/resolve`);
  },
};
