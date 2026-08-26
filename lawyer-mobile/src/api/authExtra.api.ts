import { apiClient } from "./client";

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  bio?: string;
  barRegistrationNo?: string;
  specialization?: string;
}

export interface UpdatedProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  bio?: string | null;
  accountType: string;
  barRegistrationNo: string | null;
  specialization: string | null;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export const authExtraApi = {
  async getMe(): Promise<UpdatedProfile> {
    const { data } = await apiClient.get("/auth/me");
    return data.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await apiClient.patch("/auth/change-password", { currentPassword, newPassword });
    return data.data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UpdatedProfile> {
    const { data } = await apiClient.patch("/auth/me", payload);
    return data.data;
  },

  async toggleNotifications(enabled: boolean) {
    const { data } = await apiClient.patch("/auth/me/notifications", { enabled });
    return data.data;
  },

  async deleteAccount(password: string) {
    const { data } = await apiClient.delete("/auth/me", { data: { password } });
    return data.data;
  },

  async uploadAvatar(fileUri: string): Promise<{ id: string; avatarUrl: string }> {
    const formData = new FormData();
    const fileName = fileUri.split("/").pop() || "avatar.jpg";
    const ext = fileName.split(".").pop()?.toLowerCase();
    const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    formData.append("avatar", { uri: fileUri, name: fileName, type: mimeType } as any);

    const { data } = await apiClient.post("/auth/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },
};
