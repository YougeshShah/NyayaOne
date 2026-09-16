import { apiClient } from "./client";

export interface UkPrecedentItem {
  title: string;
  publishedDate: string;
  court: string;
  url: string;
  citation: string;
}

export const ukPrecedentApi = {
  async search(query: string, page: number = 1): Promise<{ items: UkPrecedentItem[]; page: number; source: string }> {
    const { data } = await apiClient.get("/uk-precedents/search", { params: { query, page } });
    return data.data;
  },
};
