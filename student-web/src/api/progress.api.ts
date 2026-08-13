import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface StudyAnalytics {
  testsTaken: number;
  averageScorePercent: number;
  overallCompletionPercent: number;
  subjectsInProgress: number;
  practiceQuestionsAnswered: number;
  practiceAccuracyPercent: number;
}

export interface TestAttemptSummary {
  id: string;
  score: number | null;
  totalQuestions: number;
  startedAt: string;
  submittedAt: string | null;
  mockTest: { title: string };
}

export const progressApi = {
  async getAnalytics(): Promise<StudyAnalytics> {
    const { data } = await apiClient.get<ApiSuccessResponse<StudyAnalytics>>("/study-progress/analytics");
    return data.data;
  },

  async myAttempts(): Promise<TestAttemptSummary[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<TestAttemptSummary[]>>("/mock-tests/my-attempts");
    return data.data;
  },
};
