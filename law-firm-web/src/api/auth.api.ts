import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";
import { LoginPayload, LoginResponse } from "../types/auth.types";

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiSuccessResponse<LoginResponse>>("/auth/login", payload);
    return data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post("/auth/logout", { refreshToken });
  },
};
