import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { getStaticBaseUrl } from "./profile.api";

export interface LibraryResource {
  id: string;
  title: string;
  type: string;
  category: string | null;
  content: string | null;
  fileUrl: string | null;
  isDownloadable: boolean;
}

export const libraryApi = {
  async list(params: { courseId: string; subjectId?: string; type?: string; search?: string; page?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<LibraryResource>>>("/library", { params });
    return data.data;
  },
};

export function getResourceFileUrl(fileUrl: string | null): string | undefined {
  if (!fileUrl) return undefined;
  return `${getStaticBaseUrl()}/${fileUrl}`;
}
