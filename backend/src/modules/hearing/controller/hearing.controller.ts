import { Request, Response } from "express";
import { hearingService } from "../service/hearing.service";
import {
  createHearingSchema,
  updateHearingSchema,
  listHearingsQuerySchema,
  hearingIdParamSchema,
} from "../dto/hearing.dto";
import { AppError } from "../../../common/errors/AppError";

function requireFirmContext(req: Request): { lawFirmId: string; userId: string } {
  if (!req.auth || !req.auth.lawFirmId) {
    throw AppError.forbidden("This action requires a law firm account");
  }
  return { lawFirmId: req.auth.lawFirmId, userId: req.auth.userId };
}

export const hearingController = {
  async list(req: Request, res: Response) {
    const { lawFirmId } = requireFirmContext(req);
    const query = listHearingsQuerySchema.parse(req.query);
    const result = await hearingService.list(lawFirmId, query);
    res.status(200).json({ success: true, data: result });
  },

  async today(req: Request, res: Response) {
    const { lawFirmId } = requireFirmContext(req);
    const result = await hearingService.today(lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async upcoming(req: Request, res: Response) {
    const { lawFirmId } = requireFirmContext(req);
    const result = await hearingService.upcoming(lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    const { lawFirmId } = requireFirmContext(req);
    const { id } = hearingIdParamSchema.parse(req.params);
    const result = await hearingService.getById(id, lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    const { lawFirmId, userId } = requireFirmContext(req);
    const input = createHearingSchema.parse(req.body);
    const result = await hearingService.create(lawFirmId, userId, input);
    res
      .status(201)
      .json({ success: true, message: "Hearing scheduled — reminders created automatically", data: result });
  },

  async update(req: Request, res: Response) {
    const { lawFirmId } = requireFirmContext(req);
    const { id } = hearingIdParamSchema.parse(req.params);
    const input = updateHearingSchema.parse(req.body);
    const result = await hearingService.update(id, lawFirmId, input);
    res.status(200).json({ success: true, message: "Hearing updated successfully", data: result });
  },
};
