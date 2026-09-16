import { Request, Response } from "express";
import { z } from "zod";
import { caseTaskService } from "../service/case-task.service";

const createSchema = z.object({
  title: z.string().min(1),
  assignedTo: z.string().uuid(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
});
const updateStatusSchema = z.object({ status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]) });

export const caseTaskController = {
  async create(req: Request, res: Response) {
    const { caseId } = req.params;
    const input = createSchema.parse(req.body);
    const lawFirmId = req.auth!.lawFirmId!;
    const createdBy = req.auth!.userId;
    const result = await caseTaskService.create(caseId, lawFirmId, input.title, input.assignedTo, input.description, input.dueDate, createdBy);
    res.status(201).json({ success: true, data: result });
  },

  async list(req: Request, res: Response) {
    const { caseId } = req.params;
    const lawFirmId = req.auth!.lawFirmId!;
    const result = await caseTaskService.listForCase(caseId, lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async myTasks(req: Request, res: Response) {
    const userId = req.auth!.userId;
    const result = await caseTaskService.myTasks(userId);
    res.status(200).json({ success: true, data: result });
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);
    const lawFirmId = req.auth!.lawFirmId!;
    const result = await caseTaskService.updateStatus(id, lawFirmId, status);
    res.status(200).json({ success: true, data: result });
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const lawFirmId = req.auth!.lawFirmId!;
    await caseTaskService.remove(id, lawFirmId);
    res.status(200).json({ success: true, message: "Task deleted" });
  },
};
