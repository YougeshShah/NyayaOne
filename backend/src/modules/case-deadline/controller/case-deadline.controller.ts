import { Request, Response } from "express";
import { z } from "zod";
import { caseDeadlineService } from "../service/case-deadline.service";

const createSchema = z.object({
  title: z.string().min(1),
  dueAt: z.coerce.date(),
  remindAt: z.coerce.date(),
});

export const caseDeadlineController = {
  async create(req: Request, res: Response) {
    const { caseId } = req.params;
    const input = createSchema.parse(req.body);
    const lawFirmId = req.auth!.lawFirmId!;
    const createdBy = req.auth!.userId;
    const result = await caseDeadlineService.create(caseId, lawFirmId, input.title, input.dueAt, input.remindAt, createdBy);
    res.status(201).json({ success: true, data: result });
  },

  async list(req: Request, res: Response) {
    const { caseId } = req.params;
    const lawFirmId = req.auth!.lawFirmId!;
    const result = await caseDeadlineService.listForCase(caseId, lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const lawFirmId = req.auth!.lawFirmId!;
    await caseDeadlineService.remove(id, lawFirmId);
    res.status(200).json({ success: true, message: "Deadline deleted" });
  },
};
