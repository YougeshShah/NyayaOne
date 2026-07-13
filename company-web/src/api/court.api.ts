import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { Court, CreateCourtPayload } from "../types/court.types";

export const courtApi = {
  async list(params: { type?: string; province?: string; search?: string; isActive?: boolean; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<Court>>>("/courts", { params });
    return data.data;
  },

  async listProvinces(): Promise<string[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<string[]>>("/courts/provinces");
    return data.data;
  },

  async listTypes(): Promise<string[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<string[]>>("/courts/types");
    return data.data;
  },

  async create(payload: CreateCourtPayload): Promise<Court> {
    const { data } = await apiClient.post<ApiSuccessResponse<Court>>("/courts", payload);
    return data.data;
  },

  async update(id: string, payload: Partial<CreateCourtPayload>): Promise<Court> {
    const { data } = await apiClient.patch<ApiSuccessResponse<Court>>(`/courts/${id}`, payload);
    return data.data;
  },

  async deactivate(id: string): Promise<Court> {
    const { data } = await apiClient.patch<ApiSuccessResponse<Court>>(`/courts/${id}/deactivate`);
    return data.data;
  },

  async activate(id: string): Promise<Court> {
    const { data } = await apiClient.patch<ApiSuccessResponse<Court>>(`/courts/${id}/activate`);
    return data.data;
  },
};
