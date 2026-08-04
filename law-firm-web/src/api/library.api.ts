import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { LibraryResource, LibraryResourceType } from "../types/library.types";

export const libraryApi = {
  async list(params: { type?: LibraryResourceType; category?: string; isRepealed?: boolean; search?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<LibraryResource>>>("/library", { params });
    return data.data;
  },

  async listCategories(): Promise<string[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<string[]>>("/library/categories");
    return data.data;
  },

  async download(id: string, title: string) {
    const response = await apiClient.get(`/library/${id}/download`, { responseType: "blob" });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
