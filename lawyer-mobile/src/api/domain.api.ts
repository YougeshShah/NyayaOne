import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult, CaseListItem, CaseDetail, CaseStatus, Hearing, Client } from "../types";

export interface Court {
  id: string;
  name: string;
  type: string;
  province: string | null;
}

export interface FirmUser {
  id: string;
  fullName: string;
  email: string;
  accountType: string;
}

export interface CreateCasePayload {
  caseNumber: string;
  caseTitle: string;
  courtId: string;
  clientIds: string[];
  lawyerIds: string[];
  leadLawyerId?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  opposingParty?: string;
  judge?: string;
  remarks?: string;
}

export interface CreateHearingPayload {
  caseId: string;
  hearingDate: string;
  judge?: string;
  remarks?: string;
}

export const caseApi = {
  async list(params: { status?: CaseStatus; search?: string; page?: number; limit?: number } = {}) {
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
  async create(payload: CreateHearingPayload): Promise<Hearing> {
    const { data } = await apiClient.post<ApiSuccessResponse<Hearing>>("/hearings", payload);
    return data.data;
  },
};

export interface CreateClientPayload {
  fullName: string;
  fullNameNepali?: string;
  phone?: string;
  email?: string;
  address?: string;
  identificationType?: string;
  identificationNo?: string;
  notes?: string;
}

export const clientApi = {
  async list(params: { search?: string; page?: number } = {}) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<Client>>>("/clients", { params });
    return data.data;
  },
  async create(payload: CreateClientPayload): Promise<Client> {
    const { data } = await apiClient.post<ApiSuccessResponse<Client>>("/clients", payload);
    return data.data;
  },
};

export const courtApi = {
  async list(params: { search?: string; limit?: number } = {}) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<Court>>>("/courts", {
      params: { ...params, isActive: true, limit: params.limit ?? 200 },
    });
    return data.data;
  },
};

export const userApi = {
  async listLawyers(): Promise<FirmUser[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<FirmUser>>>("/users", {
      params: { accountType: "LAWYER", limit: 100 },
    });
    return data.data.items;
  },
};
