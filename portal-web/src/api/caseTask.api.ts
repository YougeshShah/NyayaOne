import { apiClient } from "./client";

export interface CaseTaskItem {
  id: string;
  title: string;
  description: string | null;
  assignedTo: string;
  dueDate: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  assignee: { id: string; fullName: string };
}

export const caseTaskApi = {
  async listForCase(caseId: string): Promise<CaseTaskItem[]> {
    const { data } = await apiClient.get(`/case-tasks/case/${caseId}`);
    return data.data;
  },
  async create(caseId: string, title: string, assignedTo: string, description?: string, dueDate?: string) {
    const { data } = await apiClient.post(`/case-tasks/case/${caseId}`, { title, assignedTo, description, dueDate });
    return data.data;
  },
  async updateStatus(id: string, status: "PENDING" | "IN_PROGRESS" | "DONE") {
    const { data } = await apiClient.patch(`/case-tasks/${id}/status`, { status });
    return data.data;
  },
  async remove(id: string) {
    await apiClient.delete(`/case-tasks/${id}`);
  },
};
