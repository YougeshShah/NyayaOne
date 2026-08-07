import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";

export interface McqQuestionAdmin {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
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
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation?: string;
  courseId: string;
  subjectId: string;
  examType?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  isFreeDemo: boolean;
}

export const mcqAdminApi = {
  async list(params: { courseId?: string; subjectId?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<McqQuestionAdmin>>>("/mcq", { params });
    return data.data;
  },

  async create(payload: CreateMcqPayload) {
    const { data } = await apiClient.post<ApiSuccessResponse<McqQuestionAdmin>>("/mcq", payload);
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
