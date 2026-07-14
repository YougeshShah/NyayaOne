import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { CaseDocument, DocumentCategory } from "../types/document.types";

export const documentApi = {
  async list(params: { caseId?: string; category?: DocumentCategory; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<CaseDocument>>>("/documents", { params });
    return data.data;
  },

  async upload(file: File, caseId: string, category: DocumentCategory): Promise<CaseDocument> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caseId", caseId);
    formData.append("category", category);
    const { data } = await apiClient.post<ApiSuccessResponse<CaseDocument>>("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  },

  async download(id: string, fileName: string): Promise<void> {
    const response = await apiClient.get(`/documents/${id}/download`, { responseType: "blob" });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  },
};
