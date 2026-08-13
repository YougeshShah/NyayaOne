import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface MockTestAdmin {
  id: string;
  title: string;
  courseId: string;
  subjectId: string | null;
  durationMinutes: number;
  isPublished: boolean;
  isFreeDemo: boolean;
  subject?: { name: string } | null;
  _count?: { questions: number };
}

export interface CreateMockTestPayload {
  title: string;
  courseId: string;
  subjectId?: string;
  examType?: string;
  durationMinutes: number;
  questionCount: number;
  marksPerQuestion?: number;
  negativeMarkingPercent?: number;
}

export const institutionMockTestApi = {
  async list(courseId?: string): Promise<MockTestAdmin[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<MockTestAdmin[]>>("/mock-tests", {
      params: { courseId, publishedOnly: false },
    });
    return data.data;
  },

  async create(payload: CreateMockTestPayload) {
    const { data } = await apiClient.post<ApiSuccessResponse<MockTestAdmin>>("/mock-tests", payload);
    return data.data;
  },

  async publish(id: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<MockTestAdmin>>(`/mock-tests/${id}/publish`);
    return data.data;
  },
};
