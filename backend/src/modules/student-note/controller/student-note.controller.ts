import { Request, Response } from "express";
import { studentNoteService } from "../service/student-note.service";
import { createNoteSchema, updateNoteSchema } from "../dto/student-note.dto";

export const studentNoteController = {
  async create(req: Request, res: Response) {
    const input = createNoteSchema.parse(req.body);
    const studentId = req.auth!.userId;
    const result = await studentNoteService.create(studentId, input.courseId, input.title, input.content);
    res.status(201).json({ success: true, data: result });
  },

  async myNotes(req: Request, res: Response) {
    const studentId = req.auth!.userId;
    const courseId = req.query.courseId as string | undefined;
    const result = await studentNoteService.myNotes(studentId, courseId);
    res.status(200).json({ success: true, data: result });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const input = updateNoteSchema.parse(req.body);
    const studentId = req.auth!.userId;
    const result = await studentNoteService.update(id, studentId, input.title, input.content);
    res.status(200).json({ success: true, data: result });
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const studentId = req.auth!.userId;
    await studentNoteService.remove(id, studentId);
    res.status(200).json({ success: true, message: "Note deleted" });
  },
};
