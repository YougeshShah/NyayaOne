import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { DocumentTemplate } from "../types/documentTemplate.types";

export interface CreateTemplatePayload {
  title: string;
  category?: string;
  description?: string;
  bodyTemplate: string;
}

export const documentTemplateApi = {
  async list(): Promise<PaginatedResult<DocumentTemplate>> {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<DocumentTemplate>>>("/document-templates", {
      params: { limit: 100 },
    });
    return data.data;
  },

  async placeholders(): Promise<string[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<string[]>>("/document-templates/placeholders");
    return data.data;
  },

  async create(payload: CreateTemplatePayload): Promise<DocumentTemplate> {
    const { data } = await apiClient.post<ApiSuccessResponse<DocumentTemplate>>("/document-templates", payload);
    return data.data;
  },

  async update(id: string, payload: Partial<CreateTemplatePayload> & { isActive?: boolean }): Promise<DocumentTemplate> {
    const { data } = await apiClient.patch<ApiSuccessResponse<DocumentTemplate>>(`/document-templates/${id}`, payload);
    return data.data;
  },
};
