import { apiClient } from "./client";

export interface CourseOption {
  id: string;
  name: string;
  category: string;
}
export interface UsageLimit {
  id: string;
  courseId: string;
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
  async courses(): Promise<CourseOption[]> {
    const { data } = await apiClient.get("/courses");
    return data.data;
  },
  async getAsInstitution(courseId: string): Promise<UsageLimit | null> {
    const { data } = await apiClient.get(`/usage-limits/institution/${courseId}`);
    return data.data;
  },
  async setAsInstitution(payload: SetLimitPayload): Promise<UsageLimit> {
    const { data } = await apiClient.put("/usage-limits/institution", payload);
    return data.data;
  },
};
