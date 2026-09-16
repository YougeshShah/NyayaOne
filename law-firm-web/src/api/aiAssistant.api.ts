import { apiClient } from "./client";

export interface AiAssistantSource {
  id: string;
  title: string;
  caseType: string | null;
  decisionDate: string | null;
}

export interface AiAssistantResponse {
  answer: string;
  sources: AiAssistantSource[];
}

export const aiAssistantApi = {
  async ask(question: string): Promise<AiAssistantResponse> {
    const { data } = await apiClient.post("/ai-assistant/ask", { question });
    return data.data;
  },
};
