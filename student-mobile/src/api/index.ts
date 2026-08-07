import { apiClient } from "./client";
import { AuthUser, Course, CourseSubscription, McqQuestion, Subject, MockTest, LiveClass, LibraryResource, Bookmark, ChatMessage } from "../types";

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

export const mockTestApi = {
  async list(courseId: string): Promise<MockTest[]> {
    const { data } = await apiClient.get<ApiSuccess<MockTest[]>>("/mock-tests", { params: { courseId } });
    return data.data;
  },
  async getById(id: string) {
    const { data } = await apiClient.get<ApiSuccess<any>>(`/mock-tests/${id}`);
    return data.data;
  },
  async start(mockTestId: string) {
    const { data } = await apiClient.post<ApiSuccess<{ attemptId: string; totalQuestions: number; durationMinutes: number }>>(
      `/mock-tests/${mockTestId}/start`
    );
    return data.data;
  },
  async submit(attemptId: string, answers: { questionId: string; selectedOption: string | null }[]) {
    const { data } = await apiClient.post<ApiSuccess<{ score: number; totalQuestions: number; percentage: number }>>(
      `/mock-tests/attempts/${attemptId}/submit`,
      { answers }
    );
    return data.data;
  },
};

export const liveClassApi = {
  async list(courseId: string): Promise<LiveClass[]> {
    const { data } = await apiClient.get<ApiSuccess<LiveClass[]>>("/live-classes", { params: { courseId, upcomingOnly: true } });
    return data.data;
  },
  async join(id: string) {
    const { data } = await apiClient.post<ApiSuccess<{ meetingUrl: string }>>(`/live-classes/${id}/join`);
    return data.data;
  },
};

export const libraryApi = {
  async list(courseId: string): Promise<{ items: LibraryResource[] }> {
    const { data } = await apiClient.get<ApiSuccess<{ items: LibraryResource[] }>>("/library", { params: { courseId } });
    return data.data;
  },
};

export const bookmarkApi = {
  async list(): Promise<Bookmark[]> {
    const { data } = await apiClient.get<ApiSuccess<Bookmark[]>>("/bookmarks");
    return data.data;
  },
  async toggle(resourceType: "LIBRARY" | "MCQ", resourceId: string) {
    const { data } = await apiClient.post<ApiSuccess<{ bookmarked: boolean }>>("/bookmarks/toggle", { resourceType, resourceId });
    return data.data;
  },
};

export const chatbotApi = {
  async sendMessage(message: string, history: ChatMessage[], courseId?: string): Promise<string> {
    const { data } = await apiClient.post<ApiSuccess<{ reply: string }>>("/chatbot/message", { message, history, courseId });
    return data.data.reply;
  },
};

export const profileApi = {
  async update(payload: { fullName?: string; phone?: string }): Promise<AuthUser> {
    const { data } = await apiClient.patch<ApiSuccess<AuthUser>>("/auth/me", payload);
    return data.data;
  },
  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await apiClient.patch<ApiSuccess<{ message: string }>>("/auth/change-password", { currentPassword, newPassword });
    return data.data;
  },
};
