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

export const mockTestAdminApi = {
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

  async getById(id: string): Promise<any> {
    const { data } = await apiClient.get<ApiSuccessResponse<any>>(`/mock-tests/${id}`);
    return data.data;
  },

  async addQuestion(mockTestId: string, questionId: string, marks: number) {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>(`/mock-tests/${mockTestId}/questions`, { questionId, marks });
    return data.data;
  },

  async removeQuestion(mockTestId: string, questionId: string) {
    await apiClient.delete(`/mock-tests/${mockTestId}/questions/${questionId}`);
  },
};

export interface LiveClassAdmin {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  subjectId: string | null;
  scheduledAt: string;
  durationMinutes: number;
  isFreeDemo: boolean;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
  recordingUrl: string | null;
  course?: { name: string };
  _count?: { attendees: number };
}

export interface CreateLiveClassPayload {
  title: string;
  description?: string;
  courseId: string;
  subjectId?: string;
  scheduledAt: string;
  durationMinutes: number;
  isFreeDemo: boolean;
}

export const liveClassAdminApi = {
  async list(courseId?: string): Promise<LiveClassAdmin[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<LiveClassAdmin[]>>("/live-classes", { params: { courseId } });
    return data.data;
  },

  async create(payload: CreateLiveClassPayload) {
    const { data } = await apiClient.post<ApiSuccessResponse<LiveClassAdmin>>("/live-classes", payload);
    return data.data;
  },

  async hostJoin(id: string): Promise<{ meetingUrl: string; roomName: string; title: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ meetingUrl: string; roomName: string; title: string }>>(
      `/live-classes/${id}/host-join`
    );
    return data.data;
  },

  async markLive(id: string) {
    await apiClient.patch(`/live-classes/${id}/mark-live`);
  },

  async cancel(id: string) {
    await apiClient.patch(`/live-classes/${id}/cancel`);
  },

  async uploadRecording(id: string, recordingUrl: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<LiveClassAdmin>>(`/live-classes/${id}/recording`, { recordingUrl });
    return data.data;
  },

  async update(id: string, payload: { title?: string; scheduledAt?: string; durationMinutes?: number }) {
    const { data } = await apiClient.patch<ApiSuccessResponse<LiveClassAdmin>>(`/live-classes/${id}`, payload);
    return data.data;
  },
};
