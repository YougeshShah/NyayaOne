import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../database/prisma";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { AppError } from "../../common/errors/AppError";

const submitSchema = z.object({
  sectionId: z.string().uuid(),
  attemptId: z.string().uuid(),
  essayText: z.string().min(1, "Essay text is required"),
});

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const router = Router();
router.use(authenticate);

// Student submits a Writing task essay for a section within a test attempt
// they've started. Word count is computed server-side (never trust the
// client's count) so the minWordCount check on the section is meaningful.
router.post("/", authorize("STUDENT"), async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  const input = submitSchema.parse(req.body);

  const attempt = await prisma.testAttempt.findUnique({ where: { id: input.attemptId } });
  if (!attempt) throw AppError.notFound("Attempt not found");
  if (attempt.studentId !== req.auth.userId) throw AppError.forbidden("This is not your attempt");

  const wordCount = countWords(input.essayText);

  const submission = await prisma.writingSubmission.create({
    data: {
      sectionId: input.sectionId,
      attemptId: input.attemptId,
      studentId: req.auth.userId,
      essayText: input.essayText,
      wordCount,
    },
  });
  res.status(201).json({ success: true, data: submission });
});

router.get("/mine", authorize("STUDENT"), async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  const submissions = await prisma.writingSubmission.findMany({
    where: { studentId: req.auth.userId },
    include: { section: { select: { title: true, minWordCount: true } } },
    orderBy: { submittedAt: "desc" },
  });
  res.status(200).json({ success: true, data: submissions });
});

// Company reviews ungraded submissions — the manual-grading queue for
// Writing tasks, since these can't be auto-graded like MCQs.
router.get("/pending", authorize("COMPANY"), async (req: Request, res: Response) => {
  const submissions = await prisma.writingSubmission.findMany({
    where: { score: null },
    include: {
      student: { select: { fullName: true, email: true } },
      section: { select: { title: true, writingPrompt: true, minWordCount: true } },
    },
    orderBy: { submittedAt: "asc" },
  });
  res.status(200).json({ success: true, data: submissions });
});

const gradeSchema = z.object({
  score: z.number().min(0).max(9), // IELTS band score, 0-9
  feedback: z.string().optional(),
});

router.patch("/:id/grade", authorize("COMPANY"), async (req: Request, res: Response) => {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const input = gradeSchema.parse(req.body);

  const submission = await prisma.writingSubmission.findUnique({ where: { id } });
  if (!submission) throw AppError.notFound("Submission not found");

  const updated = await prisma.writingSubmission.update({
    where: { id },
    data: { score: input.score, feedback: input.feedback, reviewedAt: new Date() },
  });
  res.status(200).json({ success: true, data: updated });
});

export default router;
