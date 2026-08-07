import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface Feedback {
  id: string;
  targetType: "LIVE_CLASS" | "MOCK_TEST" | "COURSE";
  targetId: string;
  rating: number;
  comment: string | null;
}

export const feedbackApi = {
  async submit(payload: { targetType: "LIVE_CLASS" | "MOCK_TEST" | "COURSE"; targetId: string; rating: number; comment?: string }) {
    const { data } = await apiClient.post<ApiSuccessResponse<Feedback>>("/feedback", payload);
    return data.data;
  },

  async mine(): Promise<Feedback[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<Feedback[]>>("/feedback/mine");
    return data.data;
  },
};
