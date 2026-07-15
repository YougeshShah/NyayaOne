import { Request, Response } from "express";
import { companyStaffService } from "../service/company-staff.service";
import {
  createCompanyStaffSchema,
  updateCompanyStaffStatusSchema,
  updateCompanyStaffRoleSchema,
  listCompanyStaffQuerySchema,
  companyStaffIdParamSchema,
} from "../dto/company-staff.dto";

export const companyStaffController = {
  async list(req: Request, res: Response) {
    const query = listCompanyStaffQuerySchema.parse(req.query);
    const result = await companyStaffService.list(query);
    res.status(200).json({ success: true, data: result });
  },

  async listRoles(req: Request, res: Response) {
    const result = await companyStaffService.listRoles();
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    const input = createCompanyStaffSchema.parse(req.body);
    const result = await companyStaffService.create(input);
    res.status(201).json({ success: true, message: "Company staff account created", data: result });
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = companyStaffIdParamSchema.parse(req.params);
    const { status } = updateCompanyStaffStatusSchema.parse(req.body);
    const result = await companyStaffService.updateStatus(id, status);
    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: result });
  },

  async updateRole(req: Request, res: Response) {
    const { id } = companyStaffIdParamSchema.parse(req.params);
    const { roleId } = updateCompanyStaffRoleSchema.parse(req.body);
    const result = await companyStaffService.updateRole(id, roleId);
    res.status(200).json({ success: true, message: "Role updated", data: result });
  },
};
