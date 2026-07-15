import { apiClient } from "./client";
import { ApiSuccessResponse, CaseListItem, CaseDetail, Hearing, CaseDocument } from "../types";

export const clientPortalApi = {
  async myCases(): Promise<CaseListItem[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<CaseListItem[]>>("/client-portal/cases");
    return data.data;
  },

  async myCaseById(id: string): Promise<CaseDetail> {
    const { data } = await apiClient.get<ApiSuccessResponse<CaseDetail>>(`/client-portal/cases/${id}`);
    return data.data;
  },

  async myHearings(upcomingOnly = false): Promise<Hearing[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<Hearing[]>>("/client-portal/hearings", {
      params: { upcoming: upcomingOnly ? "true" : undefined },
    });
    return data.data;
  },

  async myDocuments(): Promise<CaseDocument[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<CaseDocument[]>>("/client-portal/documents");
    return data.data;
  },
};
