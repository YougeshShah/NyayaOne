import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const chatbotApi = {
  async sendMessage(message: string, history: ChatMessage[], courseId?: string): Promise<string> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ reply: string }>>("/chatbot/message", {
      message,
      history,
      courseId,
    });
    return data.data.reply;
  },
};
