import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export const institutionMcqApi = {
  async create(payload: {
    question: string;
    answerType?: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctOption?: string;
    correctAnswerText?: string;
    explanation?: string;
    subjectId: string;
    courseId: string;
    isFreeDemo: boolean;
    sectionType?: string;
    audioUrl?: string;
    audioFile?: File | null;
    examType?: string;
  }) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "audioFile") return; // handled separately below
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    if (payload.audioFile) formData.append("audioFile", payload.audioFile);

    const { data } = await apiClient.post<ApiSuccessResponse<any>>("/mcq/institution", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  async list(courseId: string): Promise<any[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ items: any[] }>>("/mcq", { params: { courseId, limit: 200 } });
    return data.data.items;
  },

  async update(id: string, payload: Partial<{
    question: string;
    answerType: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    correctAnswerText: string;
    explanation: string;
    subjectId: string;
    isFreeDemo: boolean;
  }>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<any>>(`/mcq/${id}`, payload);
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/mcq/${id}`);
  },
};
