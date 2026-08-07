import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface TestSection {
  id: string;
  type: "MCQ" | "READING" | "LISTENING" | "WRITING" | "SPEAKING";
  title: string;
  passageText: string | null;
  audioUrl: string | null;
  writingPrompt: string | null;
  minWordCount: number | null;
  timeLimitMinutes: number | null;
  order: number;
  mockTestQuestions: { questionId: string; order: number; question: { id: string; question: string; optionA: string; optionB: string; optionC: string; optionD: string } }[];
}

export const writingSubmissionApi = {
  async submit(payload: { sectionId: string; attemptId: string; essayText: string }) {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>("/writing-submissions", payload);
    return data.data;
  },
};
