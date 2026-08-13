import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";

export interface McqQuestionAdmin {
  id: string;
  question: string;
  answerType?: "MCQ" | "TRUE_FALSE_NOT_GIVEN" | "YES_NO_NOT_GIVEN" | "FILL_BLANK" | "SHORT_ANSWER" | "MULTI_BLANK";
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: "A" | "B" | "C" | "D" | null;
  correctAnswerText: string | null;
  explanation: string | null;
  courseId: string;
  subjectId: string;
  examType: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  isFreeDemo: boolean;
  subject?: { name: string };
}

export interface CreateMcqPayload {
  question: string;
  answerType?: "MCQ" | "TRUE_FALSE_NOT_GIVEN" | "YES_NO_NOT_GIVEN" | "FILL_BLANK" | "SHORT_ANSWER" | "MULTI_BLANK";
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: "A" | "B" | "C" | "D";
  correctAnswerText?: string;
  explanation?: string;
  courseId: string;
  subjectId: string;
  examType?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  isFreeDemo: boolean;
  sectionType?: string;
  audioUrl?: string;
}

export const mcqAdminApi = {
  async list(params: { courseId?: string; subjectId?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<McqQuestionAdmin>>>("/mcq", { params });
    return data.data;
  },

  async create(payload: CreateMcqPayload & { audioFile?: File | null }) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "audioFile") return;
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    if (payload.audioFile) formData.append("audioFile", payload.audioFile);

    const { data } = await apiClient.post<ApiSuccessResponse<McqQuestionAdmin>>("/mcq", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  async update(id: string, payload: Partial<CreateMcqPayload>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<McqQuestionAdmin>>(`/mcq/${id}`, payload);
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/mcq/${id}`);
  },
};
