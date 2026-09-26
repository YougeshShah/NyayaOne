import { apiClient } from "./client";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface TicketSummary {
  id: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  lawFirm: { id: string; name: string };
  createdBy: { id: string; fullName: string };
}

export interface TicketCommentItem {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: { id: string; fullName: string; accountType: string };
}

export interface TicketDetail extends TicketSummary {
  description: string;
  comments: TicketCommentItem[];
}

export const ticketApi = {
  async list(status?: TicketStatus): Promise<{ items: TicketSummary[] }> {
    const { data } = await apiClient.get("/tickets", { params: { status, limit: 100 } });
    return data.data;
  },

  async getById(id: string): Promise<TicketDetail> {
    const { data } = await apiClient.get(`/tickets/${id}`);
    return data.data;
  },

  async addComment(id: string, content: string): Promise<TicketCommentItem> {
    const { data } = await apiClient.post(`/tickets/${id}/comments`, { content });
    return data.data;
  },

  async updateStatus(id: string, status: TicketStatus) {
    const { data } = await apiClient.patch(`/tickets/${id}/status`, { status });
    return data.data;
  },
};
