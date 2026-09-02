import { apiClient } from "./client";

export interface LiveClassItem {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
  recordingUrl: string | null;
  course?: { id: string; name: string } | null;
  host?: { fullName: string } | null;
}

export const liveClassApi = {
  async listForCourse(courseId: string): Promise<LiveClassItem[]> {
    const { data } = await apiClient.get("/live-classes", { params: { courseId } });
    return data.data ?? [];
  },
  async join(id: string): Promise<{ meetingUrl: string; roomName: string; title: string }> {
    const { data } = await apiClient.post(`/live-classes/${id}/join`);
    return data.data;
  },
};
