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
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  createdAt: string;
  author: { id: string; fullName: string; accountType: string };
}

export interface TicketDetail extends TicketSummary {
  description: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  comments: TicketCommentItem[];
}

// Async support tickets: Law Firm / Institution admin (LAW_FIRM_ADMIN, either
// tenantType) <-> TechnoOne Company support. Unlike messaging this is not
// real-time -- it's a ticket inbox, polled on an interval.
export const ticketApi = {
  async create(subject: string, description: string, attachmentUrl?: string, attachmentType?: string) {
    const { data } = await apiClient.post("/tickets", { subject, description, attachmentUrl, attachmentType });
    return data.data;
  },

  async list(status?: TicketStatus): Promise<{ items: TicketSummary[] }> {
    const { data } = await apiClient.get("/tickets", { params: { status, limit: 50 } });
    return data.data;
  },

  async getById(id: string): Promise<TicketDetail> {
    const { data } = await apiClient.get(`/tickets/${id}`);
    return data.data;
  },

  async addComment(id: string, content: string, attachmentUrl?: string, attachmentType?: string): Promise<TicketCommentItem> {
    const { data } = await apiClient.post(`/tickets/${id}/comments`, { content, attachmentUrl, attachmentType });
    return data.data;
  },

  async updateStatus(id: string, status: TicketStatus) {
    const { data } = await apiClient.patch(`/tickets/${id}/status`, { status });
    return data.data;
  },

  // fileUri is a local device URI from expo-image-picker / expo-document-picker.
  async uploadAttachment(fileUri: string, mimeType: string, fileName: string): Promise<{ attachmentUrl: string; attachmentType: string }> {
    const formData = new FormData();
    formData.append("file", { uri: fileUri, name: fileName, type: mimeType } as any);
    const { data } = await apiClient.post("/tickets/attachments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },
};
