import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  bio?: string;
  barRegistrationNo?: string;
  specialization?: string;
}

export interface ProfileResult {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  accountType: string;
  avatarUrl: string | null;
  barRegistrationNo: string | null;
  specialization: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export const profileApi = {
  async getMe(): Promise<ProfileResult> {
    const { data } = await apiClient.get<ApiSuccessResponse<ProfileResult>>("/auth/me");
    return data.data;
  },
  async updateProfile(payload: UpdateProfilePayload): Promise<ProfileResult> {
    const { data } = await apiClient.patch<ApiSuccessResponse<ProfileResult>>("/auth/me", payload);
    return data.data;
  },
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ message: string }>>("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return data.data;
  },
  async uploadAvatar(file: File): Promise<{ id: string; avatarUrl: string }> {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await apiClient.post<ApiSuccessResponse<{ id: string; avatarUrl: string }>>("/auth/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },
};

export function getStaticBaseUrl(): string {
  const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:5000/api/v1";
  return apiBase.replace(/\/api\/v\d+\/?$/, "");
}

export function getAvatarUrl(avatarUrl: string | null | undefined): string | undefined {
  if (!avatarUrl) return undefined;
  return `${getStaticBaseUrl()}/uploads/${avatarUrl}`;
}
