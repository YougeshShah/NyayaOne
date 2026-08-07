import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export const institutionLibraryApi = {
  async create(payload: { title: string; subjectId: string; content: string; isFreeDemo: boolean }) {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>("/library/institution", payload);
    return data.data;
  },
};
