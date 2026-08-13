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
    const isInstitutionStaff = req.auth.accountType === "LAW_FIRM_ADMIN" || req.auth.accountType === "LAWYER" || req.auth.accountType === "STAFF";
    const result = await mcqService.list(query, studentId, {
      studentLawFirmId: studentId ? req.auth.lawFirmId : undefined,
      forLawFirmId: isInstitutionStaff && query.courseId ? req.auth.lawFirmId ?? undefined : undefined,
      studentExamType: studentId ? req.auth.preferredExamType ?? null : undefined,
    });
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
    const { selectedOption } = z.object({ selectedOption: z.string().min(1) }).parse(req.body);
    const studentId = req.auth.accountType === "STUDENT" ? req.auth.userId : null;
    const result = await mcqService.checkAnswer(id, selectedOption, studentId);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = createMcqSchema.parse(req.body);
    const audioUrl = req.file ? `/uploads/audio/${req.file.filename}` : input.audioUrl || undefined;
    const result = await mcqService.create({ ...input, audioUrl }, req.auth.userId);
    res.status(201).json({ success: true, data: result });
  },

  async createInstitution(req: Request, res: Response) {
    if (!req.auth?.lawFirmId) throw AppError.forbidden("No organization associated with this account");
    const input = z
      .object({
        question: z.string().min(3),
        answerType: z.enum(["MCQ", "TRUE_FALSE_NOT_GIVEN", "YES_NO_NOT_GIVEN", "FILL_BLANK", "SHORT_ANSWER", "MULTI_BLANK"]).optional(),
        optionA: z.string().optional(),
        optionB: z.string().optional(),
        optionC: z.string().optional(),
        optionD: z.string().optional(),
        correctOption: z.enum(["A", "B", "C", "D"]).optional(),
        correctAnswerText: z.string().optional(),
        explanation: z.string().optional(),
        subjectId: z.string().uuid(),
        courseId: z.string().uuid(),
        isFreeDemo: z.coerce.boolean().default(false),
        sectionType: z.enum(["LISTENING", "READING", "WRITING", "SPEAKING"]).optional(),
        audioUrl: z.string().url().optional().or(z.literal("")),
      })
      .parse(req.body);
    // File upload takes priority over a pasted URL — an institution admin
    // uploads their own recorded/downloaded audio clip rather than needing
    // to host it externally first.
    const audioUrl = req.file ? `/uploads/audio/${req.file.filename}` : input.audioUrl || undefined;
    const result = await mcqService.createInstitution({ ...input, audioUrl }, req.auth.userId, req.auth.lawFirmId);
    res.status(201).json({ success: true, data: result });
  },

  async update(req: Request, res: Response) {
    const { id } = mcqIdParamSchema.parse(req.params);
    const input = updateMcqSchema.parse(req.body);
    const requesterLawFirmId = req.auth?.accountType === "LAW_FIRM_ADMIN" ? req.auth.lawFirmId ?? undefined : undefined;
    const result = await mcqService.update(id, input, requesterLawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async remove(req: Request, res: Response) {
    const { id } = mcqIdParamSchema.parse(req.params);
    const requesterLawFirmId = req.auth?.accountType === "LAW_FIRM_ADMIN" ? req.auth.lawFirmId ?? undefined : undefined;
    await mcqService.remove(id, requesterLawFirmId);
    res.status(200).json({ success: true, message: "Question deleted" });
  },

  async myMistakes(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const courseId = typeof req.query.courseId === "string" ? req.query.courseId : undefined;
    const result = await mcqService.myMistakes(req.auth.userId, courseId);
    res.status(200).json({ success: true, data: result });
  },
};
