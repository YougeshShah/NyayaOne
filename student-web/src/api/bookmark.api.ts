import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface Bookmark {
  id: string;
  resourceType: "LIBRARY" | "MCQ";
  resourceId: string;
  preview: string;
  courseId?: string;
  createdAt: string;
}

export const bookmarkApi = {
  async list(): Promise<Bookmark[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<Bookmark[]>>("/bookmarks");
    return data.data;
  },

  async toggle(resourceType: "LIBRARY" | "MCQ", resourceId: string): Promise<{ bookmarked: boolean }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ bookmarked: boolean }>>("/bookmarks/toggle", {
      resourceType,
      resourceId,
    });
    return data.data;
  },
};
