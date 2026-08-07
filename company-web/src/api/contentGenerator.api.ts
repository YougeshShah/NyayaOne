import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export const contentGeneratorApi = {
  async generate(payload: { topic: string; audienceLevel: string; sector?: string; length: string }) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ content: string }>>("/content-generator/generate", payload);
    return data.data.content;
  },
};
