import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface Course {
  id: string;
  name: string;
  category: "LAW" | "LANGUAGE" | "OTHER";
  description: string | null;
  isActive: boolean;
  _count?: { subjects: number; liveClasses: number; subscriptions: number };
}

export interface Subject {
  id: string;
  name: string;
  courseId: string;
  examType: string | null;
}

export interface StudentSearchResult {
  id: string;
  fullName: string;
  email: string;
}

export const courseApi = {
  async list(): Promise<Course[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<Course[]>>("/courses");
    return data.data;
  },

  async create(payload: { name: string; category: string; description?: string }) {
    const { data } = await apiClient.post<ApiSuccessResponse<Course>>("/courses", payload);
    return data.data;
  },

  async update(id: string, payload: Partial<{ name: string; category: string; description: string; isActive: boolean }>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<Course>>(`/courses/${id}`, payload);
    return data.data;
  },

  async searchStudents(q: string): Promise<StudentSearchResult[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentSearchResult[]>>("/courses/students/search", { params: { q } });
    return data.data;
  },

  async grantSubscription(courseId: string, studentId: string, expiresAt?: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>(`/courses/${courseId}/grant-subscription`, {
      studentId,
      expiresAt,
    });
    return data.data;
  },
};

export const subjectApi = {
  async list(courseId?: string): Promise<Subject[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<Subject[]>>("/subjects", { params: { courseId } });
    return data.data;
  },

  async create(payload: { name: string; courseId: string; examType?: string }) {
    const { data } = await apiClient.post<ApiSuccessResponse<Subject>>("/subjects", payload);
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/subjects/${id}`);
  },
};
