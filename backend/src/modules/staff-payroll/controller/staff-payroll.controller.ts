import { Request, Response } from "express";
import { AppError } from "../../../common/errors/AppError";
import { staffPayrollService } from "../service/staff-payroll.service";
import { setSalarySchema, recordPaymentSchema } from "../dto/staff-payroll.dto";

function requireFirmContext(req: Request): string {
  if (!req.auth?.lawFirmId) throw AppError.forbidden("This action requires an institution account");
  return req.auth.lawFirmId;
}

export const staffPayrollController = {
  async searchStaff(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const query = (req.query.q as string) || "";
    const result = await staffPayrollService.searchStaff(lawFirmId, query);
    res.status(200).json({ success: true, data: result });
  },

  async setSalary(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const lawFirmId = requireFirmContext(req);
    const input = setSalarySchema.parse(req.body);
    const result = await staffPayrollService.setSalary(input, lawFirmId, req.auth.userId);
    res.status(200).json({ success: true, message: "Salary record saved", data: result });
  },

  async listSalaries(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const category = req.query.category as string | undefined;
    const result = await staffPayrollService.listSalaries(lawFirmId, category);
    res.status(200).json({ success: true, data: result });
  },

  async recordPayment(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const lawFirmId = requireFirmContext(req);
    const input = recordPaymentSchema.parse(req.body);
    const result = await staffPayrollService.recordPayment(input, lawFirmId, req.auth.userId);
    res.status(201).json({ success: true, message: "Payment recorded", data: result });
  },

  async listPayments(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const search = req.query.search as string | undefined;
    const result = await staffPayrollService.listPayments(lawFirmId, search);
    res.status(200).json({ success: true, data: result });
  },

  async exportPayments(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const search = req.query.search as string | undefined;
    const buffer = await staffPayrollService.exportPaymentsExcel(lawFirmId, search);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="staff-payments-report.xlsx"');
    res.send(buffer);
  },
};
