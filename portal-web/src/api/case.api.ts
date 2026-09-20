import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { CaseListItem, CaseDetail, CreateCasePayload, CaseStatus, CasePriority } from "../types/case.types";

export interface UpdateCasePayload {
  caseTitle?: string;
  opposingParty?: string;
  opposingLawyer?: string;
  courtSubject?: string;
  category?: string;
  judge?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  remarks?: string;
}

export const caseApi = {
  async list(params: { status?: CaseStatus; search?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<CaseListItem>>>("/cases", { params });
    return data.data;
  },

  async getById(id: string): Promise<CaseDetail> {
    const { data } = await apiClient.get<ApiSuccessResponse<CaseDetail>>(`/cases/${id}`);
    return data.data;
  },

  async create(payload: CreateCasePayload): Promise<CaseListItem> {
    const { data } = await apiClient.post<ApiSuccessResponse<CaseListItem>>("/cases", payload);
    return data.data;
  },

  async update(id: string, payload: UpdateCasePayload): Promise<CaseListItem> {
    const { data } = await apiClient.patch<ApiSuccessResponse<CaseListItem>>(`/cases/${id}`, payload);
    return data.data;
  },
};
