import { apiClient } from "./client";

export const lawFirmWebsiteApi = {
  async update(id: string, websiteHtml: string) {
    const { data } = await apiClient.put(`/law-firms/${id}/website`, { websiteHtml });
    return data.data;
  },
};
