import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface SpeakingPromptAdmin {
  id: string;
  courseId: string;
  part: number;
  title: string;
  promptText: string;
  prepTimeSeconds: number | null;
  speakTimeSeconds: number;
  isPublished: boolean;
}

export interface SpeakingPromptPayload {
  courseId: string;
  part: number;
  title: string;
  promptText: string;
  prepTimeSeconds?: number;
  speakTimeSeconds: number;
}

export const speakingPromptApi = {
  async list(courseId: string): Promise<SpeakingPromptAdmin[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<SpeakingPromptAdmin[]>>("/speaking/prompts", { params: { courseId } });
    return data.data;
  },
  async create(payload: SpeakingPromptPayload): Promise<SpeakingPromptAdmin> {
    const { data } = await apiClient.post<ApiSuccessResponse<SpeakingPromptAdmin>>("/speaking/prompts", payload);
    return data.data;
  },
  async update(id: string, payload: Partial<SpeakingPromptPayload> & { isPublished?: boolean }): Promise<SpeakingPromptAdmin> {
    const { data } = await apiClient.patch<ApiSuccessResponse<SpeakingPromptAdmin>>(`/speaking/prompts/${id}`, payload);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/speaking/prompts/${id}`);
  },
};
