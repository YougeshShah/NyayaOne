import { apiClient } from "./client";

export interface MessagingContact {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  accountType: string;
}

export interface ConversationSummary {
  id: string;
  otherUser: MessagingContact;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const messagingApi = {
  async listContacts(): Promise<MessagingContact[]> {
    const { data } = await apiClient.get("/messaging/contacts");
    return data.data;
  },

  async listConversations(): Promise<ConversationSummary[]> {
    const { data } = await apiClient.get("/messaging/conversations");
    return data.data;
  },

  async startConversation(targetUserId: string): Promise<{ id: string }> {
    const { data } = await apiClient.post("/messaging/conversations", { targetUserId });
    return data.data;
  },

  async listMessages(conversationId: string): Promise<{ items: MessageItem[] }> {
    const { data } = await apiClient.get(`/messaging/conversations/${conversationId}/messages`, {
      params: { limit: 50 },
    });
    return data.data;
  },

  async sendMessage(conversationId: string, content: string): Promise<MessageItem> {
    const { data } = await apiClient.post(`/messaging/conversations/${conversationId}/messages`, { content });
    return data.data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await apiClient.get("/messaging/unread-count");
    return data.data.count;
  },
};
