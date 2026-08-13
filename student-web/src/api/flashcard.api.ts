import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface StudentFlashcard {
  id: string;
  term: string;
  definition: string;
  example: string | null;
  courseId: string;
  subjectId: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  familiarity: "AGAIN" | "GOOD" | "EASY" | null;
}

export const flashcardApi = {
  async list(courseId: string, subjectId?: string): Promise<StudentFlashcard[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentFlashcard[]>>("/flashcards", { params: { courseId, subjectId } });
    return data.data;
  },

  async submitFamiliarity(id: string, familiarity: "AGAIN" | "GOOD" | "EASY") {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>(`/flashcards/${id}/familiarity`, { familiarity });
    return data.data;
  },
};
