import { auditLogRepository } from "../repository/audit-log.repository";
import { ListAuditLogsQuery } from "../dto/audit-log.dto";

export const auditLogService = {
  async list(query: ListAuditLogsQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await auditLogRepository.findMany({
      entityType: query.entityType,
      userId: query.userId,
      search: query.search,
      skip,
      take: query.limit,
    });
    return {
      items,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async listEntityTypes() {
    return auditLogRepository.listDistinctEntityTypes();
  },
};
