import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { DocumentTemplate, TemplateField, AnalyzeSampleSuggestion } from "../types/documentTemplate.types";

export interface CreateTemplatePayload {
  title: string;
  category?: string;
  description?: string;
  bodyTemplate: string;
  fields: TemplateField[];
}

export const documentTemplateApi = {
  async list(): Promise<PaginatedResult<DocumentTemplate>> {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<DocumentTemplate>>>("/document-templates", {
      params: { limit: 200 },
    });
    return data.data;
  },

  async autofillSources(): Promise<string[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<string[]>>("/document-templates/autofill-sources");
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

  async analyzeSample(text: string): Promise<{ suggestions: AnalyzeSampleSuggestion[]; note: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ suggestions: AnalyzeSampleSuggestion[]; note: string }>>(
      "/document-templates/analyze-sample",
      { text }
    );
    return data.data;
  },
};
