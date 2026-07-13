import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { LawFirmListItem, LawFirmDetail, LawFirmStatus } from "../types/lawfirm.types";

export const lawFirmApi = {
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

  async activate(id: string): Promise<LawFirmDetail> {
    const { data } = await apiClient.patch<ApiSuccessResponse<LawFirmDetail>>(`/law-firms/${id}/activate`);
    return data.data;
  },

  async reject(id: string, reason?: string): Promise<LawFirmDetail> {
    const { data } = await apiClient.patch<ApiSuccessResponse<LawFirmDetail>>(`/law-firms/${id}/reject`, {
      reason,
    });
    return data.data;
  },
};
