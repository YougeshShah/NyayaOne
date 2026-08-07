import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface LiveClass {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  scheduledAt: string;
  durationMinutes: number;
  isFreeDemo: boolean;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
  recordingUrl: string | null;
  course?: { name: string };
  subject?: { name: string } | null;
}

export const liveClassApi = {
  async list(courseId?: string, upcomingOnly = true): Promise<LiveClass[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<LiveClass[]>>("/live-classes", {
      params: { courseId, upcomingOnly },
    });
    return data.data;
  },

  async join(id: string): Promise<{ meetingUrl: string; roomName: string; title: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ meetingUrl: string; roomName: string; title: string }>>(
      `/live-classes/${id}/join`
    );
    return data.data;
  },
};
