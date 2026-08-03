import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types";

export type DocumentCategory =
  | "CASE_FILING" | "EVIDENCE" | "COURT_ORDER" | "AGREEMENT" | "CORRESPONDENCE" | "IDENTIFICATION" | "OTHER";

export interface CaseDocument {
  id: string;
  caseId: string | null;
  fileName: string;
  fileType: string;
  category: DocumentCategory;
  uploadedBy: { id: string; fullName: string };
  createdAt: string;
}

export const documentApi = {
  async listForCase(caseId: string): Promise<CaseDocument[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<CaseDocument>>>("/documents", {
      params: { caseId, limit: 100 },
    });
    return data.data.items;
  },

  async upload(caseId: string, category: DocumentCategory, file: { uri: string; name: string; mimeType: string }): Promise<CaseDocument> {
    const formData = new FormData();
    formData.append("caseId", caseId);
    formData.append("category", category);
    // @ts-ignore — React Native's FormData file shape differs from the web File type
    formData.append("file", { uri: file.uri, name: file.name, type: file.mimeType });

    const { data } = await apiClient.post<ApiSuccessResponse<CaseDocument>>("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  },
};
