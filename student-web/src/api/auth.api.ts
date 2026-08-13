import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";
import { LoginPayload, LoginResponse, RegisterPayload } from "../types/auth.types";

export const authApi = {
  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ student: { id: string; fullName: string; email: string }; message: string }>>(
      "/auth/register/student",
      payload
    );
    return data.data;
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiSuccessResponse<LoginResponse>>("/auth/login", payload);
    return data.data;
  },

  async logout(refreshToken: string) {
    await apiClient.post("/auth/logout", { refreshToken });
  },

  async requestPasswordReset(email: string, note?: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<null> & { message: string }>("/auth/request-password-reset", {
      email,
      note,
    });
    return { message: data.message };
  },
};
