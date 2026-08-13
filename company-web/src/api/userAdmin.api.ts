import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface SearchedUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  accountType: string;
  status: string;
  lawFirm: { name: string; tenantType: string } | null;
}

export interface PasswordResetRequest {
  id: string;
  email: string;
  note: string | null;
  status: "PENDING" | "RESOLVED";
  createdAt: string;
}

export const userAdminApi = {
  async search(q: string): Promise<SearchedUser[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<SearchedUser[]>>("/users/company/search", { params: { q } });
    return data.data;
  },

  async resetPassword(id: string): Promise<{ newPassword: string }> {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ newPassword: string }>>(`/users/company/${id}/reset-password`);
    return data.data;
  },

  async updateContact(id: string, payload: { fullName?: string; email?: string; phone?: string }) {
    const { data } = await apiClient.patch<ApiSuccessResponse<SearchedUser>>(`/users/company/${id}/contact`, payload);
    return data.data;
  },

  async listPendingRequests(): Promise<PasswordResetRequest[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<PasswordResetRequest[]>>("/auth/password-reset-requests");
    return data.data;
  },

  async resolveRequest(id: string): Promise<void> {
    await apiClient.patch(`/auth/password-reset-requests/${id}/resolve`);
  },
};
