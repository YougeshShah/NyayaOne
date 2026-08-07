import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../common/errors/AppError";
import { mcqService } from "../service/mcq.service";
import { createMcqSchema, updateMcqSchema, listMcqQuerySchema, mcqIdParamSchema } from "../dto/mcq.dto";

export const mcqController = {
  async list(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const query = listMcqQuerySchema.parse(req.query);
    const studentId = req.auth.accountType === "STUDENT" ? req.auth.userId : null;
    // Students must always scope to a single course — an IELTS student
    // should never see Law questions mixed in just because the caller
    // forgot to pass ?courseId=... (courseId is optional for Company staff
    // browsing across courses, but never for students).
    if (studentId && !query.courseId) {
      throw AppError.badRequest("courseId is required");
    }
    const result = await mcqService.list(query, studentId);
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { id } = mcqIdParamSchema.parse(req.params);
    const studentId = req.auth.accountType === "STUDENT" ? req.auth.userId : null;
    const result = await mcqService.getById(id, studentId);
    res.status(200).json({ success: true, data: result });
  },

  // Ungraded, un-persisted answer check — used by the free practice mode so
  // a student gets instant feedback on a single question without it needing
  // to be part of a scored Mock Test attempt.
  async checkAnswer(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { id } = mcqIdParamSchema.parse(req.params);
    const { selectedOption } = z.object({ selectedOption: z.enum(["A", "B", "C", "D"]) }).parse(req.body);
    const studentId = req.auth.accountType === "STUDENT" ? req.auth.userId : null;
    const result = await mcqService.checkAnswer(id, selectedOption, studentId);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = createMcqSchema.parse(req.body);
    const result = await mcqService.create(input, req.auth.userId);
    res.status(201).json({ success: true, data: result });
  },

  async update(req: Request, res: Response) {
    const { id } = mcqIdParamSchema.parse(req.params);
    const input = updateMcqSchema.parse(req.body);
    const result = await mcqService.update(id, input);
    res.status(200).json({ success: true, data: result });
  },

  async remove(req: Request, res: Response) {
    const { id } = mcqIdParamSchema.parse(req.params);
    await mcqService.remove(id);
    res.status(200).json({ success: true, message: "Question deleted" });
  },
};
