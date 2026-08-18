import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types";

export interface LiveClassItem {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
  course?: { name: string };
  host?: { id: string; fullName: string } | null;
  recordingUrl?: string | null;
}

export const liveClassApi = {
  async myClasses(): Promise<LiveClassItem[]> {
    // No courseId filter -- backend already scopes this to "my assigned
    // classes only" for a LAWYER/STAFF account, or "all institution
    // classes" for LAW_FIRM_ADMIN, based on the logged-in account type.
    const { data } = await apiClient.get<ApiSuccessResponse<LiveClassItem[]>>("/live-classes");
    return data.data;
  },

  async joinAsHost(id: string): Promise<{ meetingUrl: string; roomName: string; title: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ meetingUrl: string; roomName: string; title: string }>>(
      `/live-classes/${id}/host-join`
    );
    return data.data;
  },
};
