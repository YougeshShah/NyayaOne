import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface UsageStatus {
  limit: number | null;
  used: number;
  remaining: number | null;
  unlimited: boolean;
}

export interface AllUsageStatuses {
  practice: UsageStatus;
  mockTest: UsageStatus;
  speaking: UsageStatus;
}

export const usageStatusApi = {
  async getStatus(courseId: string): Promise<AllUsageStatuses> {
    const { data } = await apiClient.get<ApiSuccessResponse<AllUsageStatuses>>(`/usage-limits/status/${courseId}`);
    return data.data;
  },
};
