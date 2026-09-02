import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { LawFirmListItem, LawFirmDetail, LawFirmStatus } from "../types/lawfirm.types";

export interface CreateLawFirmPayload {
  lawFirmName: string;
  lawFirmEmail: string;
  adminFullName: string;
  adminEmail: string;
  adminPhone?: string;
  password: string;
  tenantType: "LAW_FIRM" | "EDUCATION" | "OTHER";
  modulesEnabled: string[];
  allowedCourseIds?: string[];
}

export const lawFirmApi = {
  async create(payload: CreateLawFirmPayload) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ lawFirm: LawFirmListItem; admin: { id: string; fullName: string; email: string } }>>(
      "/law-firms",
      payload
    );
    return data.data;
  },

  async list(params: { status?: LawFirmStatus; search?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<LawFirmListItem>>>("/law-firms", {
      params,
    });
    return data.data;
  },

  async getById(id: string): Promise<LawFirmDetail> {
    const { data } = await apiClient.get<ApiSuccessResponse<LawFirmDetail>>(`/law-firms/${id}`);
    return data.data;
  },

  async approve(id: string): Promise<LawFirmDetail> {
    const { data } = await apiClient.patch<ApiSuccessResponse<LawFirmDetail>>(`/law-firms/${id}/approve`);
    return data.data;
  },

  async suspend(id: string, reason?: string): Promise<LawFirmDetail> {
    const { data } = await apiClient.patch<ApiSuccessResponse<LawFirmDetail>>(`/law-firms/${id}/suspend`, {
      reason,
    });
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/law-firms/${id}`);
  },

  async activate(id: string): Promise<LawFirmDetail> {
    const { data } = await apiClient.patch<ApiSuccessResponse<LawFirmDetail>>(`/law-firms/${id}/activate`);
    return data.data;
  },

  async updateModules(id: string, modulesEnabled: string[], allowedCourseIds?: string[], allowedExamTypes?: string[]): Promise<LawFirmDetail> {
    const { data } = await apiClient.patch<ApiSuccessResponse<LawFirmDetail>>(`/law-firms/${id}/modules`, {
      modulesEnabled,
      allowedCourseIds,
      allowedExamTypes,
    });
    return data.data;
  },

  async reject(id: string, reason?: string): Promise<LawFirmDetail> {
    const { data } = await apiClient.patch<ApiSuccessResponse<LawFirmDetail>>(`/law-firms/${id}/reject`, {
      reason,
    });
    return data.data;
  },
  async monthlyGrowth(months: number = 6): Promise<{ month: string; count: number }[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ month: string; count: number }[]>>("/law-firms/analytics/monthly-growth", {
      params: { months },
    });
    return data.data;
  },
};
