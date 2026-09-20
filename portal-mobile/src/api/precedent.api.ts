import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types";

export interface PrecedentListItem {
  id: string;
  sourceId: string | null;
  title: string;
  caseType: string | null;
  category: string | null;
  court: string | null;
  benchType: string | null;
  judges: string | null;
  decisionDate: string | null;
  caseNumber: string | null;
  petitioner: string | null;
  respondent: string | null;
  createdAt: string;
}

export interface PrecedentDetail extends PrecedentListItem {
  fullContent: string;
  sourceUrl: string | null;
}

export interface PrecedentSearchResult {
  items: PrecedentListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const precedentApi = {
  async search(params: { search?: string; category?: string; page?: number; limit?: number }): Promise<PrecedentSearchResult> {
    const { data } = await apiClient.get<ApiSuccessResponse<PrecedentSearchResult>>("/precedents", { params });
    return data.data;
  },

  async getById(id: string): Promise<PrecedentDetail> {
    const { data } = await apiClient.get<ApiSuccessResponse<PrecedentDetail>>(`/precedents/${id}`);
    return data.data;
  },

  async listCategories(): Promise<string[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<string[]>>("/precedents/categories");
    return data.data;
  },
};
