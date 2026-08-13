import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export const institutionLibraryApi = {
  async create(payload: { title: string; subjectId: string; content?: string; isFreeDemo: boolean; file?: File | null }) {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("subjectId", payload.subjectId);
    formData.append("isFreeDemo", String(payload.isFreeDemo));
    if (payload.content) formData.append("content", payload.content);
    if (payload.file) formData.append("file", payload.file);

    const { data } = await apiClient.post<ApiSuccessResponse<any>>("/library/institution", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },
};
