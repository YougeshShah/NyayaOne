import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { AuditLog } from "../types/auditLog.types";

export const auditLogApi = {
  async list(params: { entityType?: string; search?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<AuditLog>>>("/audit-logs", { params });
    return data.data;
  },

  async listEntityTypes(): Promise<string[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<string[]>>("/audit-logs/entity-types");
    return data.data;
  },
};
