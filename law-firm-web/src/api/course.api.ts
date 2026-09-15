import { apiClient } from "./client";

export interface CourseOption {
  id: string;
  name: string;
  category: string;
  subjects?: { id: string; name: string }[];
}

export const courseApi = {
  async list(): Promise<CourseOption[]> {
    const { data } = await apiClient.get("/courses");
    return data.data;
  },
};
