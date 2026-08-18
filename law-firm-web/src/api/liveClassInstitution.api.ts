import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface LiveClassInstitution {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  scheduledAt: string;
  durationMinutes: number;
  isFreeDemo: boolean;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
  jitsiRoomName?: string;
  course?: { name: string };
  host?: { id: string; fullName: string } | null;
  _count?: { attendees: number };
}

export interface CourseOption {
  id: string;
  name: string;
  category?: "LAW" | "LANGUAGE" | "OTHER";
}

export const liveClassInstitutionApi = {
  async list(): Promise<LiveClassInstitution[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<LiveClassInstitution[]>>("/live-classes");
    return data.data;
  },

  async courses(): Promise<CourseOption[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<CourseOption[]>>("/courses");
    return data.data;
  },

  async create(payload: {
    title: string;
    description?: string;
    courseId: string;
    scheduledAt: string;
    durationMinutes: number;
    isFreeDemo: boolean;
  }) {
    const { data } = await apiClient.post<ApiSuccessResponse<LiveClassInstitution>>("/live-classes", payload);
    return data.data;
  },

  async hostJoin(id: string): Promise<{ meetingUrl: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ meetingUrl: string }>>(`/live-classes/${id}/host-join`);
    return data.data;
  },

  async markLive(id: string) {
    await apiClient.patch(`/live-classes/${id}/mark-live`);
  },

  async cancel(id: string) {
    await apiClient.patch(`/live-classes/${id}/cancel`);
  },
  async remove(id: string) {
    await apiClient.delete(`/live-classes/${id}`);
  },
  async uploadRecording(id: string, recordingUrl: string) {
    await apiClient.patch(`/live-classes/${id}/recording`, { recordingUrl });
  },
  async listAttendees(id: string): Promise<{ id: string; joinedAt: string; student: { id: string; fullName: string; email: string } }[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<any[]>>(`/live-classes/${id}/attendees`);
    return data.data;
  },
};
