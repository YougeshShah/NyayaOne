import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";

export type FieldType = "text" | "textarea" | "date" | "number";

export interface TemplateField {
  key: string;
  label: string;
  type: FieldType;
  autoFillSource?: string;
  required?: boolean;
  placeholder?: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
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

  async generate(
    templateId: string,
    caseId: string,
    values: Record<string, string>,
    clientId?: string
  ): Promise<{ blob: Blob; fileName: string }> {
    const response = await apiClient.post(
      "/document-templates/generate",
      { templateId, caseId, clientId, values },
      { responseType: "blob" }
    );
    const disposition = response.headers["content-disposition"] as string | undefined;

    // Prefer the RFC 5987 UTF-8 name (filename*=UTF-8''...) — this is the real
    // Nepali filename. Only fall back to the plain ASCII filename="..." if the
    // browser/response somehow lacks the UTF-8 variant.
    const utf8Match = disposition?.match(/filename\*=UTF-8''([^;]+)/);
    const asciiMatch = disposition?.match(/filename="([^"]+)"/);
    const fileName = utf8Match ? decodeURIComponent(utf8Match[1]) : asciiMatch?.[1] || "document.pdf";

    return { blob: response.data, fileName };
  },
};
