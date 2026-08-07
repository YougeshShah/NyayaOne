import { apiClient } from "./client";
import { AuthUser, Course, CourseSubscription, McqQuestion, Subject } from "../types";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export const authApi = {
  async register(payload: { fullName: string; email: string; phone?: string; password: string }) {
    const { data } = await apiClient.post<ApiSuccess<any>>("/auth/register/student", payload);
    return data.data;
  },
  async login(payload: { email: string; password: string }) {
    const { data } = await apiClient.post<ApiSuccess<{ accessToken: string; refreshToken: string; user: AuthUser }>>(
      "/auth/login",
      payload
    );
    return data.data;
  },
};

export const courseApi = {
  async list() {
    const { data } = await apiClient.get<ApiSuccess<Course[]>>("/courses");
    return data.data;
  },
  async mySubscriptions() {
    const { data } = await apiClient.get<ApiSuccess<CourseSubscription[]>>("/courses/my-subscriptions");
    return data.data;
  },
};

export const subjectApi = {
  async list(courseId: string) {
    const { data } = await apiClient.get<ApiSuccess<Subject[]>>("/subjects", { params: { courseId } });
    return data.data;
  },
};

export const mcqApi = {
  async list(courseId: string, subjectId?: string) {
    const { data } = await apiClient.get<ApiSuccess<{ items: McqQuestion[] }>>("/mcq", { params: { courseId, subjectId } });
    return data.data.items;
  },
  async checkAnswer(id: string, selectedOption: "A" | "B" | "C" | "D") {
    const { data } = await apiClient.post<ApiSuccess<{ isCorrect: boolean; correctOption: string; explanation: string | null }>>(
      `/mcq/${id}/check-answer`,
      { selectedOption }
    );
    return data.data;
  },
};
