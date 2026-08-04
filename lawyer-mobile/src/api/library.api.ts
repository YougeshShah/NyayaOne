import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types";

export type LibraryResourceType =
  | "CONSTITUTION" | "ACT" | "ORDINANCE" | "REGULATION" | "RULE" | "FORMATION_ORDER"
  | "POLICY" | "INTERNATIONAL_TREATY" | "HISTORICAL_DOCUMENT" | "ANNUAL_REPORT" | "RTI_DISCLOSURE"
  | "CIRCULAR" | "GOVERNMENT_NOTICE" | "GAZETTE" | "SUPREME_COURT_DECISION" | "HIGH_COURT_DECISION"
  | "ARTICLE" | "RESEARCH_PAPER" | "JOURNAL" | "TEMPLATE" | "LEGAL_FORM";

export interface LibraryResource {
  id: string;
  title: string;
  type: LibraryResourceType;
  category: string | null;
  isRepealed: boolean;
  fileUrl: string | null;
  isDownloadable: boolean;
}

export const libraryApi = {
  async list(params: { type?: LibraryResourceType; search?: string; page?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<LibraryResource>>>("/library", { params });
    return data.data;
  },
};
