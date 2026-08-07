import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export const institutionMcqApi = {
  async create(payload: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    explanation?: string;
    subjectId: string;
    courseId: string;
    isFreeDemo: boolean;
  }) {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>("/mcq/institution", payload);
    return data.data;
  },
};
