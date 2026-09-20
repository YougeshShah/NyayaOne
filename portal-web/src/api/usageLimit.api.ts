import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface UsageLimit {
  id: string;
  courseId: string;
  lawFirmId: string | null;
  practiceLimit: number | null;
  mockTestLimit: number | null;
  speakingLimit: number | null;
}

export interface SetLimitPayload {
  courseId: string;
  practiceLimit?: number | null;
  mockTestLimit?: number | null;
  speakingLimit?: number | null;
}

export const usageLimitApi = {
  async getAsInstitution(courseId: string): Promise<UsageLimit | null> {
    const { data } = await apiClient.get<ApiSuccessResponse<UsageLimit | null>>(`/usage-limits/institution/${courseId}`);
    return data.data;
  },
  async setAsInstitution(payload: SetLimitPayload): Promise<UsageLimit> {
    const { data } = await apiClient.put<ApiSuccessResponse<UsageLimit>>("/usage-limits/institution", payload);
    return data.data;
  },
};
