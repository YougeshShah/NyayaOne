import { useQuery } from "@tanstack/react-query";
import { auditLogApi } from "../api/auditLog.api";

export function useAuditLogs(params: { entityType?: string; search?: string; page?: number }) {
  return useQuery({ queryKey: ["audit-logs", params], queryFn: () => auditLogApi.list(params) });
}

export function useAuditLogEntityTypes() {
  return useQuery({ queryKey: ["audit-log-entity-types"], queryFn: () => auditLogApi.listEntityTypes() });
}
