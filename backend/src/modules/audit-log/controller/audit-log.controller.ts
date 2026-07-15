import { Request, Response } from "express";
import { auditLogService } from "../service/audit-log.service";
import { listAuditLogsQuerySchema } from "../dto/audit-log.dto";

export const auditLogController = {
  async list(req: Request, res: Response) {
    const query = listAuditLogsQuerySchema.parse(req.query);
    const result = await auditLogService.list(query);
    res.status(200).json({ success: true, data: result });
  },

  async listEntityTypes(req: Request, res: Response) {
    const result = await auditLogService.listEntityTypes();
    res.status(200).json({ success: true, data: result });
  },
};
