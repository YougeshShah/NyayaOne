import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { FirmUser, CreateFirmUserPayload, StaffAccountType, UserStatus } from "../types/user.types";

export const userApi = {
  async list(params: { accountType?: StaffAccountType; status?: UserStatus; search?: string; page?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<FirmUser>>>("/users", { params });
    return data.data;
  },

  async create(payload: CreateFirmUserPayload): Promise<FirmUser> {
    const { data } = await apiClient.post<ApiSuccessResponse<FirmUser>>("/users", payload);
    return data.data;
  },

  async updateStatus(id: string, status: UserStatus): Promise<FirmUser> {
    const { data } = await apiClient.patch<ApiSuccessResponse<FirmUser>>(`/users/${id}/status`, { status });
    return data.data;
  },
};
