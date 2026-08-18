import { Request, Response } from "express";
import { AppError } from "../../../common/errors/AppError";
import { userPermissionService } from "../service/user-permission.service";
import { setOverrideSchema, userIdParamSchema, removeOverrideParamSchema } from "../dto/user-permission.dto";

export const userPermissionController = {
  // Company-side: any user across any organization (Company staff aren't
  // scoped to a single firm, hence no lawFirmId check here).
  async listForUserAsCompany(req: Request, res: Response) {
    const { userId } = userIdParamSchema.parse(req.params);
    const result = await userPermissionService.listForUser(userId);
    res.status(200).json({ success: true, data: result });
  },

  async setOverrideAsCompany(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { userId } = userIdParamSchema.parse(req.params);
    const input = setOverrideSchema.parse(req.body);
    const result = await userPermissionService.setOverride(userId, input, req.auth.userId);
    res.status(200).json({ success: true, message: "Permission override saved", data: result });
  },

  async removeOverrideAsCompany(req: Request, res: Response) {
    const { userId, permissionId } = removeOverrideParamSchema.parse(req.params);
    await userPermissionService.removeOverride(userId, permissionId);
    res.status(200).json({ success: true, message: "Override removed -- back to role default" });
  },

  // Tenant-side (Law Firm / Institution admin managing their own staff or
  // students): lawFirmId scoping enforced so an admin can't touch another
  // organization's users.
  async listForUserAsTenant(req: Request, res: Response) {
    if (!req.auth?.lawFirmId) throw AppError.forbidden("This action requires a law firm account");
    const { userId } = userIdParamSchema.parse(req.params);
    const result = await userPermissionService.listForUser(userId, req.auth.lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async setOverrideAsTenant(req: Request, res: Response) {
    if (!req.auth?.lawFirmId) throw AppError.forbidden("This action requires a law firm account");
    const { userId } = userIdParamSchema.parse(req.params);
    const input = setOverrideSchema.parse(req.body);
    const result = await userPermissionService.setOverride(userId, input, req.auth.userId, req.auth.lawFirmId);
    res.status(200).json({ success: true, message: "Permission override saved", data: result });
  },

  async removeOverrideAsTenant(req: Request, res: Response) {
    if (!req.auth?.lawFirmId) throw AppError.forbidden("This action requires a law firm account");
    const { userId, permissionId } = removeOverrideParamSchema.parse(req.params);
    await userPermissionService.removeOverride(userId, permissionId, req.auth.lawFirmId);
    res.status(200).json({ success: true, message: "Override removed -- back to role default" });
  },
};
