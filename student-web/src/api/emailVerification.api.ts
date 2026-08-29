import { apiClient } from "./client";

interface ApiSuccess<T> {
  success: true;
  message?: string;
  data?: T;
}

export const emailVerificationApi = {
  async sendCode(email: string, purpose: "REGISTRATION" | "PASSWORD_RESET") {
    const { data } = await apiClient.post<ApiSuccess<void>>("/email-verification/send-code", { email, purpose });
    return data;
  },
  async verifyEmail(email: string, code: string) {
    const { data } = await apiClient.post<ApiSuccess<void>>("/email-verification/verify-email", { email, code });
    return data;
  },
  async resetPassword(email: string, code: string, newPassword: string, institutionSlug?: string) {
    const { data } = await apiClient.post<ApiSuccess<void>>("/email-verification/reset-password", { email, code, newPassword, institutionSlug });
    return data;
  },
};
