import { Request, Response } from "express";
import { AppError } from "../../../common/errors/AppError";
import { usageLimitService } from "../service/usage-limit.service";
import { setLimitSchema, courseIdParamSchema } from "../dto/usage-limit.dto";

export const usageLimitController = {
  // Student-facing: "how much do I have left" for a course, all three modules at once.
  async myStatus(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { courseId } = courseIdParamSchema.parse(req.params);
    const result = await usageLimitService.getAllStatuses(req.auth.userId, courseId, req.auth.lawFirmId ?? null);
    res.status(200).json({ success: true, data: result });
  },

  // Company: sets the platform-wide default (lawFirmId = null).
  async setAsCompany(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = setLimitSchema.parse(req.body);
    const result = await usageLimitService.setLimit(input, null, req.auth.userId);
    res.status(200).json({ success: true, message: "Default limit saved", data: result });
  },

  async getAsCompany(req: Request, res: Response) {
    const { courseId } = courseIdParamSchema.parse(req.params);
    const result = await usageLimitService.getLimit(courseId, null);
    res.status(200).json({ success: true, data: result });
  },

  // Institution: sets their own policy for their own students.
  async setAsInstitution(req: Request, res: Response) {
    if (!req.auth?.lawFirmId) throw AppError.forbidden("This action requires an institution account");
    const input = setLimitSchema.parse(req.body);
    const result = await usageLimitService.setLimit(input, req.auth.lawFirmId, req.auth.userId);
    res.status(200).json({ success: true, message: "Institution limit saved", data: result });
  },

  async getAsInstitution(req: Request, res: Response) {
    if (!req.auth?.lawFirmId) throw AppError.forbidden("This action requires an institution account");
    const { courseId } = courseIdParamSchema.parse(req.params);
    const result = await usageLimitService.getLimit(courseId, req.auth.lawFirmId);
    res.status(200).json({ success: true, data: result });
  },
};
