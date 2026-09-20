import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { Court } from "../types/court.types";

export const courtApi = {
  async list(params: { search?: string; province?: string; type?: string; limit?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<Court>>>("/courts", {
      params: { ...params, isActive: true },
    });
    return data.data;
  },
};
