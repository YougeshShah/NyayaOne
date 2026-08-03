import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";

export interface DocumentTemplate {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
}

export const documentTemplateApi = {
  async list(): Promise<PaginatedResult<DocumentTemplate>> {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<DocumentTemplate>>>("/document-templates", {
      params: { limit: 100 },
    });
    return data.data;
  },

  async generate(templateId: string, caseId: string, clientId?: string): Promise<{ blob: Blob; fileName: string }> {
    const response = await apiClient.post(
      "/document-templates/generate",
      { templateId, caseId, clientId },
      { responseType: "blob" }
    );
    const disposition = response.headers["content-disposition"] as string | undefined;
    const match = disposition?.match(/filename="(.+)"/);
    return { blob: response.data, fileName: match?.[1] || "document.pdf" };
  },
};
