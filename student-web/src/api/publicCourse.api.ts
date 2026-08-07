import { apiClient } from "./client";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface PublicCourse {
  id: string;
  name: string;
  category: string;
}

export const publicCourseApi = {
  async list(): Promise<PublicCourse[]> {
    const { data } = await apiClient.get<ApiSuccess<PublicCourse[]>>("/courses/public");
    return data.data;
  },
};
