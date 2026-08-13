import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface TestSectionAdmin {
  id: string;
  type: "MCQ" | "READING" | "LISTENING" | "WRITING" | "SPEAKING";
  title: string;
  passageText: string | null;
  audioUrl: string | null;
  writingPrompt: string | null;
  minWordCount: number | null;
  timeLimitMinutes: number | null;
  order: number;
}

export interface CreateSectionPayload {
  mockTestId: string;
  type: string;
  title: string;
  passageText?: string;
  audioUrl?: string;
  writingPrompt?: string;
  minWordCount?: number;
  timeLimitMinutes?: number;
  order: number;
}

export const institutionTestSectionApi = {
  async list(mockTestId: string): Promise<TestSectionAdmin[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<TestSectionAdmin[]>>("/test-sections", { params: { mockTestId } });
    return data.data;
  },

  async create(payload: CreateSectionPayload & { audioFile?: File | null }) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "audioFile") return;
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    if (payload.audioFile) formData.append("audioFile", payload.audioFile);

    const { data } = await apiClient.post<ApiSuccessResponse<TestSectionAdmin>>("/test-sections", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/test-sections/${id}`);
  },
};
