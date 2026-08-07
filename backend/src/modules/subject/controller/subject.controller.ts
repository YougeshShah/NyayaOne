import { Request, Response } from "express";
import { subjectService } from "../service/subject.service";
import { createSubjectSchema, listSubjectsQuerySchema, subjectIdParamSchema } from "../dto/subject.dto";

export const subjectController = {
  async list(req: Request, res: Response) {
    const query = listSubjectsQuerySchema.parse(req.query);
    const result = await subjectService.list(query);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    const input = createSubjectSchema.parse(req.body);
    const result = await subjectService.create(input);
    res.status(201).json({ success: true, data: result });
  },

  async remove(req: Request, res: Response) {
    const { id } = subjectIdParamSchema.parse(req.params);
    await subjectService.remove(id);
    res.status(200).json({ success: true, message: "Subject deleted" });
  },
};
