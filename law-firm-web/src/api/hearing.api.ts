import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { Hearing, CreateHearingPayload } from "../types/hearing.types";

export const hearingApi = {
  async list(params: { caseId?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<Hearing>>>("/hearings", { params });
    return data.data;
  },

  async today(): Promise<Hearing[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<Hearing[]>>("/hearings/today");
    return data.data;
  },

  async upcoming(): Promise<Hearing[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<Hearing[]>>("/hearings/upcoming");
    return data.data;
  },

  async create(payload: CreateHearingPayload): Promise<Hearing> {
    const { data } = await apiClient.post<ApiSuccessResponse<Hearing>>("/hearings", payload);
    return data.data;
  },

  async update(id: string, payload: { hearingDate?: string; judge?: string; notes?: string; status?: string }): Promise<Hearing> {
    const { data } = await apiClient.patch<ApiSuccessResponse<Hearing>>(`/hearings/${id}`, payload);
    return data.data;
  },
};
