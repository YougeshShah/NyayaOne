import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../database/prisma";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { AppError } from "../../common/errors/AppError";

const updateProgressSchema = z.object({
  subjectId: z.string().uuid(),
  topicsCompleted: z.number().int().min(0),
  totalTopics: z.number().int().min(1),
});

const router = Router();
router.use(authenticate, authorize("STUDENT"));

router.get("/", async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  const progress = await prisma.studyProgress.findMany({
    where: { studentId: req.auth.userId },
    include: { subject: true },
  });
  res.status(200).json({ success: true, data: progress });
});

router.put("/", async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  const input = updateProgressSchema.parse(req.body);
  const studentId = req.auth.userId;

  const updated = await prisma.studyProgress.upsert({
    where: { studentId_subjectId: { studentId, subjectId: input.subjectId } },
    update: { topicsCompleted: input.topicsCompleted, totalTopics: input.totalTopics, lastStudiedAt: new Date() },
    create: { studentId, subjectId: input.subjectId, topicsCompleted: input.topicsCompleted, totalTopics: input.totalTopics, lastStudiedAt: new Date() },
  });
  res.status(200).json({ success: true, data: updated });
});

// Simple study analytics — average score across all submitted mock test
// attempts, plus overall topic-completion percentage across subjects, plus
// practice-mode (MCQ Practice page) accuracy and question count.
router.get("/analytics", async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  const studentId = req.auth.userId;

  const [attempts, progress, practiceAttempts] = await Promise.all([
    prisma.testAttempt.findMany({ where: { studentId, submittedAt: { not: null } } }),
    prisma.studyProgress.findMany({ where: { studentId } }),
    prisma.mcqPracticeAttempt.findMany({ where: { studentId } }),
  ]);

  const avgScorePercent =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum: number, a: { score: number | null; totalQuestions: number }) => sum + ((a.score ?? 0) / a.totalQuestions) * 100, 0) /
            attempts.length
        )
      : 0;

  const totalTopics = progress.reduce((sum: number, p: { totalTopics: number }) => sum + p.totalTopics, 0);
  const completedTopics = progress.reduce((sum: number, p: { topicsCompleted: number }) => sum + p.topicsCompleted, 0);
  const overallCompletionPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const practiceQuestionsAnswered = practiceAttempts.length;
  const practiceCorrectCount = practiceAttempts.filter((a: { isCorrect: boolean }) => a.isCorrect).length;
  const practiceAccuracyPercent =
    practiceQuestionsAnswered > 0 ? Math.round((practiceCorrectCount / practiceQuestionsAnswered) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      testsTaken: attempts.length,
      averageScorePercent: avgScorePercent,
      overallCompletionPercent,
      subjectsInProgress: progress.length,
      practiceQuestionsAnswered,
      practiceAccuracyPercent,
    },
  });
});

export default router;
