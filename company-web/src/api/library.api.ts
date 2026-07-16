import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { LibraryResource, LibraryResourceType } from "../types/library.types";

export interface LibraryResourceFormValues {
  title: string;
  type: LibraryResourceType;
  category?: string;
  actName?: string;
  section?: string;
  chapter?: string;
  keywords?: string; // comma-separated in the form, backend splits it
  content?: string;
  isDownloadable?: boolean;
  file?: File | null;
}

function toFormData(values: LibraryResourceFormValues): FormData {
  const formData = new FormData();
  formData.append("title", values.title);
  formData.append("type", values.type);
  if (values.category) formData.append("category", values.category);
  if (values.actName) formData.append("actName", values.actName);
  if (values.section) formData.append("section", values.section);
  if (values.chapter) formData.append("chapter", values.chapter);
  if (values.keywords) formData.append("keywords", values.keywords);
  if (values.content) formData.append("content", values.content);
  formData.append("isDownloadable", String(values.isDownloadable ?? true));
  if (values.file) formData.append("file", values.file);
  return formData;
}

export const libraryApi = {
  async list(params: { type?: string; category?: string; search?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<LibraryResource>>>("/library", { params });
    return data.data;
  },

  async listCategories(): Promise<string[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<string[]>>("/library/categories");
    return data.data;
  },

  async create(values: LibraryResourceFormValues): Promise<LibraryResource> {
    const { data } = await apiClient.post<ApiSuccessResponse<LibraryResource>>("/library", toFormData(values), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  async update(id: string, values: LibraryResourceFormValues): Promise<LibraryResource> {
    const { data } = await apiClient.patch<ApiSuccessResponse<LibraryResource>>(`/library/${id}`, toFormData(values), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/library/${id}`);
  },
};
