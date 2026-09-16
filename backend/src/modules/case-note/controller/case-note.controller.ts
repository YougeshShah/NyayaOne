import { Request, Response } from "express";
import { z } from "zod";
import { caseNoteService } from "../service/case-note.service";

const createNoteSchema = z.object({ content: z.string().min(1) });

export const caseNoteController = {
  async create(req: Request, res: Response) {
    const { caseId } = req.params;
    const { content } = createNoteSchema.parse(req.body);
    const lawFirmId = req.auth!.lawFirmId!;
    const createdBy = req.auth!.userId;
    const result = await caseNoteService.create(caseId, lawFirmId, content, createdBy);
    res.status(201).json({ success: true, data: result });
  },

  async list(req: Request, res: Response) {
    const { caseId } = req.params;
    const lawFirmId = req.auth!.lawFirmId!;
    const result = await caseNoteService.listForCase(caseId, lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const lawFirmId = req.auth!.lawFirmId!;
    await caseNoteService.remove(id, lawFirmId);
    res.status(200).json({ success: true, message: "Note deleted" });
  },
};
