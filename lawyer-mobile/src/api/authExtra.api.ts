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
  avatarUrl?: string | null;
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
