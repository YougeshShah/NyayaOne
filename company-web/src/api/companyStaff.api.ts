import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { CompanyStaff, CreateCompanyStaffPayload, Role } from "../types/companyStaff.types";

export const companyStaffApi = {
  async list(params: { search?: string; page?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<CompanyStaff>>>("/company-staff", { params });
    return data.data;
  },

  async listRoles(): Promise<Role[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<Role[]>>("/company-staff/roles");
    return data.data;
  },

  async create(payload: CreateCompanyStaffPayload): Promise<CompanyStaff> {
    const { data } = await apiClient.post<ApiSuccessResponse<CompanyStaff>>("/company-staff", payload);
    return data.data;
  },

  async updateStatus(id: string, status: string): Promise<CompanyStaff> {
    const { data } = await apiClient.patch<ApiSuccessResponse<CompanyStaff>>(`/company-staff/${id}/status`, { status });
    return data.data;
  },

  async updateRole(id: string, roleId: string): Promise<CompanyStaff> {
    const { data } = await apiClient.patch<ApiSuccessResponse<CompanyStaff>>(`/company-staff/${id}/role`, { roleId });
    return data.data;
  },
};
