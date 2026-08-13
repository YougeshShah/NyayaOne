import { apiClient } from "./client";
import { ApiSuccessResponse, LoginPayload, LoginResponse } from "../types";

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiSuccessResponse<LoginResponse>>("/auth/login", payload);
    return data.data;
  },
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post("/auth/logout", { refreshToken });
  },
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ success: boolean; message: string }>("/auth/request-password-reset", { email });
    return { message: data.message };
  },
};
