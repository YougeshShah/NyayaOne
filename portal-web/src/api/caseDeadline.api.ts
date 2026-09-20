import { apiClient } from "./client";

export interface CaseDeadlineItem {
  id: string;
  title: string;
  dueAt: string;
  remindAt: string;
  sent: boolean;
}

export const caseDeadlineApi = {
  async listForCase(caseId: string): Promise<CaseDeadlineItem[]> {
    const { data } = await apiClient.get(`/case-deadlines/case/${caseId}`);
    return data.data;
  },
  async create(caseId: string, title: string, dueAt: string, remindAt: string) {
    const { data } = await apiClient.post(`/case-deadlines/case/${caseId}`, { title, dueAt, remindAt });
    return data.data;
  },
  async remove(id: string) {
    await apiClient.delete(`/case-deadlines/${id}`);
  },
};
