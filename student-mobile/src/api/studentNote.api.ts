import { apiClient } from "./client";

export interface StudentNote {
  id: string;
  title: string;
  content: string;
  courseId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const studentNoteApi = {
  async list(): Promise<StudentNote[]> {
    const { data } = await apiClient.get("/student-notes");
    return data.data;
  },
  async create(title: string, content: string, courseId?: string): Promise<StudentNote> {
    const { data } = await apiClient.post("/student-notes", { title, content, courseId });
    return data.data;
  },
  async update(id: string, title: string, content: string): Promise<StudentNote> {
    const { data } = await apiClient.patch(`/student-notes/${id}`, { title, content });
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/student-notes/${id}`);
  },
};
