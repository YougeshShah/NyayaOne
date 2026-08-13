import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface InstitutionFlashcard {
  id: string;
  term: string;
  definition: string;
  example: string | null;
  courseId: string;
  subjectId: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  createdAt: string;
}

export interface CreateFlashcardPayload {
  term: string;
  definition: string;
  example?: string;
  courseId: string;
  subjectId?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export const institutionFlashcardApi = {
  async list(courseId: string, subjectId?: string): Promise<InstitutionFlashcard[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<InstitutionFlashcard[]>>("/flashcards", { params: { courseId, subjectId } });
    return data.data;
  },

  async create(payload: CreateFlashcardPayload): Promise<InstitutionFlashcard> {
    const { data } = await apiClient.post<ApiSuccessResponse<InstitutionFlashcard>>("/flashcards", payload);
    return data.data;
  },

  async update(id: string, payload: Partial<CreateFlashcardPayload>): Promise<InstitutionFlashcard> {
    const { data } = await apiClient.patch<ApiSuccessResponse<InstitutionFlashcard>>(`/flashcards/${id}`, payload);
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/flashcards/${id}`);
  },
};
