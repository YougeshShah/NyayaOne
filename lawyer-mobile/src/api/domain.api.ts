import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult, CaseListItem, CaseDetail, CaseStatus, Hearing, Client } from "../types";

export const caseApi = {
  async list(params: { status?: CaseStatus; search?: string; page?: number; limit?: number } = {}) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<CaseListItem>>>("/cases", { params });
    return data.data;
  },
  async getById(id: string): Promise<CaseDetail> {
    const { data } = await apiClient.get<ApiSuccessResponse<CaseDetail>>(`/cases/${id}`);
    return data.data;
  },
};

export interface UpdateHearingPayload {
  status?: "SCHEDULED" | "COMPLETED" | "ADJOURNED" | "CANCELLED";
  remarks?: string;
  judge?: string;
  nextHearingDate?: string;
}

export const hearingApi = {
  async today(): Promise<Hearing[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<Hearing[]>>("/hearings/today");
    return data.data;
  },
  async upcoming(): Promise<Hearing[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<Hearing[]>>("/hearings/upcoming");
    return data.data;
  },
  async list(params: { page?: number; limit?: number } = {}) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<Hearing>>>("/hearings", { params });
    return data.data;
  },
  async update(id: string, payload: UpdateHearingPayload): Promise<Hearing> {
    const { data } = await apiClient.patch<ApiSuccessResponse<Hearing>>(`/hearings/${id}`, payload);
    return data.data;
  },
};

export const clientApi = {
  async list(params: { search?: string; page?: number } = {}) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<Client>>>("/clients", { params });
    return data.data;
  },
};
