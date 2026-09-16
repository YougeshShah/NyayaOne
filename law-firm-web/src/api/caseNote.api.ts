import { apiClient } from "./client";

export interface CaseNoteItem {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; fullName: string };
}

export const caseNoteApi = {
  async listForCase(caseId: string): Promise<CaseNoteItem[]> {
    const { data } = await apiClient.get(`/case-notes/case/${caseId}`);
    return data.data;
  },
  async create(caseId: string, content: string) {
    const { data } = await apiClient.post(`/case-notes/case/${caseId}`, { content });
    return data.data;
  },
  async remove(id: string) {
    await apiClient.delete(`/case-notes/${id}`);
  },
};
