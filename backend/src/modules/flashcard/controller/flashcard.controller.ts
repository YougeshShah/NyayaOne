import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../common/errors/AppError";
import { flashcardService } from "../service/flashcard.service";
import { createFlashcardSchema, updateFlashcardSchema, listFlashcardsQuerySchema, submitFamiliaritySchema } from "../dto/flashcard.dto";

const idParamSchema = z.object({ id: z.string().uuid() });

export const flashcardController = {
  async create(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = createFlashcardSchema.parse(req.body);
    const hostLawFirmId = req.auth.accountType === "LAW_FIRM_ADMIN" ? req.auth.lawFirmId ?? undefined : undefined;
    const result = await flashcardService.create(input, req.auth.userId, hostLawFirmId);
    res.status(201).json({ success: true, data: result });
  },

  async update(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params);
    const input = updateFlashcardSchema.parse(req.body);
    const requesterLawFirmId = req.auth?.accountType === "LAW_FIRM_ADMIN" ? req.auth.lawFirmId ?? undefined : undefined;
    const result = await flashcardService.update(id, input, requesterLawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async remove(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params);
    const requesterLawFirmId = req.auth?.accountType === "LAW_FIRM_ADMIN" ? req.auth.lawFirmId ?? undefined : undefined;
    await flashcardService.remove(id, requesterLawFirmId);
    res.status(200).json({ success: true, message: "Flashcard deleted" });
  },

  async list(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const query = listFlashcardsQuerySchema.parse(req.query);

    if (req.auth.accountType === "STUDENT") {
      const result = await flashcardService.listForStudent(req.auth.userId, query.courseId, query.subjectId, req.auth.lawFirmId ?? null);
      return res.status(200).json({ success: true, data: result });
    }

    const forLawFirmId = req.auth.accountType === "LAW_FIRM_ADMIN" ? req.auth.lawFirmId ?? undefined : undefined;
    const result = await flashcardService.list({ courseId: query.courseId, subjectId: query.subjectId, forLawFirmId });
    res.status(200).json({ success: true, data: result });
  },

  async submitFamiliarity(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { id } = idParamSchema.parse(req.params);
    const { familiarity } = submitFamiliaritySchema.parse(req.body);
    const result = await flashcardService.submitFamiliarity(req.auth.userId, id, familiarity);
    res.status(200).json({ success: true, data: result });
  },
};
