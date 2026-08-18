import { Request, Response } from "express";
import { AppError } from "../../../common/errors/AppError";
import { practiceSessionService } from "../service/practice-session.service";
import { startPracticeSchema } from "../dto/practice-session.dto";

export const practiceSessionController = {
  async start(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { courseId } = startPracticeSchema.parse(req.body);
    const result = await practiceSessionService.start(req.auth.userId, courseId, req.auth.lawFirmId ?? null);
    res.status(201).json({ success: true, data: result });
  },
};
