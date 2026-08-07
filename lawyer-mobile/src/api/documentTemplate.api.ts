import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types";

export type FieldType = "text" | "textarea" | "date" | "number";

export interface TemplateField {
  key: string;
  label: string;
  type: FieldType;
  autoFillSource?: string;
  required?: boolean;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: string | null;
  fields: TemplateField[];
}

export const documentTemplateApi = {
  async list(): Promise<PaginatedResult<DocumentTemplate>> {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<DocumentTemplate>>>("/document-templates", {
      params: { limit: 200 },
    });
    return data.data;
  },

  async getById(id: string): Promise<DocumentTemplate> {
    const { data } = await apiClient.get<ApiSuccessResponse<DocumentTemplate>>(`/document-templates/${id}`);
    return data.data;
  },
};
