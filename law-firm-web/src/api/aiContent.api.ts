import { apiClient } from "./client";

export const aiContentApi = {
  async generate(documentType: string, details: string, language: "en" | "ne") {
    const { data } = await apiClient.post("/ai-content/generate", { documentType, details, language });
    return data.data as { content: string };
  },
};
