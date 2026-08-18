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

export const emailVerificationApi = {
  async sendCode(email: string, purpose: "REGISTRATION" | "PASSWORD_RESET") {
    const { data } = await apiClient.post<{ success: boolean; message?: string }>("/email-verification/send-code", { email, purpose });
    return data;
  },
  async resetPassword(email: string, code: string, newPassword: string) {
    const { data } = await apiClient.post<{ success: boolean; message?: string }>("/email-verification/reset-password", { email, code, newPassword });
    return data;
  },
};
