import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface PendingWritingSubmission {
  id: string;
  essayText: string;
  wordCount: number;
  submittedAt: string;
  student: { fullName: string; email: string };
  section: { title: string; writingPrompt: string | null; minWordCount: number | null };
}

export const writingGradingApi = {
  async listPending(): Promise<PendingWritingSubmission[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<PendingWritingSubmission[]>>("/writing-submissions/pending");
    return data.data;
  },

  async grade(id: string, score: number, feedback?: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<any>>(`/writing-submissions/${id}/grade`, { score, feedback });
    return data.data;
  },
};
