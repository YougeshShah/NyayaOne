import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../database/prisma";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { AppError } from "../../common/errors/AppError";

const submitFeedbackSchema = z.object({
  targetType: z.enum(["LIVE_CLASS", "MOCK_TEST", "COURSE"]),
  targetId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

const router = Router();

// Students submit/view their own feedback.
router.post("/", authenticate, authorize("STUDENT"), async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  const input = submitFeedbackSchema.parse(req.body);

  // One rating per student per target — resubmitting updates the existing
  // one rather than creating duplicates, since a student re-rating the same
  // live class/test/course is an edit, not a second opinion.
  const existing = await prisma.feedback.findFirst({
    where: { studentId: req.auth.userId, targetType: input.targetType, targetId: input.targetId },
  });

  if (existing) {
    const updated = await prisma.feedback.update({
      where: { id: existing.id },
      data: { rating: input.rating, comment: input.comment },
    });
    return res.status(200).json({ success: true, data: updated });
  }

  const created = await prisma.feedback.create({
    data: {
      studentId: req.auth.userId,
      targetType: input.targetType,
      targetId: input.targetId,
      rating: input.rating,
      comment: input.comment,
      ...(input.targetType === "LIVE_CLASS" ? { liveClassId: input.targetId } : {}),
    },
  });
  res.status(201).json({ success: true, data: created });
});

router.get("/mine", authenticate, authorize("STUDENT"), async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  const feedback = await prisma.feedback.findMany({
    where: { studentId: req.auth.userId },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ success: true, data: feedback });
});

// Company can view aggregate feedback for a target — e.g. average rating on
// a live class, to gauge instructor/content quality.
router.get("/summary", authenticate, authorize("COMPANY"), async (req: Request, res: Response) => {
  const { targetType, targetId } = z
    .object({ targetType: z.enum(["LIVE_CLASS", "MOCK_TEST", "COURSE"]), targetId: z.string().uuid() })
    .parse(req.query);

  const feedback = await prisma.feedback.findMany({ where: { targetType, targetId } });
  const count = feedback.length;
  const averageRating = count > 0 ? Math.round((feedback.reduce((sum: number, f: any) => sum + f.rating, 0) / count) * 10) / 10 : 0;

  res.status(200).json({ success: true, data: { count, averageRating, feedback } });
});

export default router;
