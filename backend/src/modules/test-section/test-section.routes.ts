import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../database/prisma";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { audioUpload } from "../../common/middleware/upload";
import { AppError } from "../../common/errors/AppError";

const sectionTypes = ["MCQ", "READING", "LISTENING", "WRITING", "SPEAKING"] as const;

const createSectionSchema = z.object({
  mockTestId: z.string().uuid(),
  type: z.enum(sectionTypes),
  title: z.string().min(2, "Title is required"),
  passageText: z.string().optional(),
  audioUrl: z.string().optional(),
  writingPrompt: z.string().optional(),
  minWordCount: z.coerce.number().int().positive().optional(),
  timeLimitMinutes: z.coerce.number().int().positive().optional(),
  order: z.coerce.number().int().min(0),
});

const router = Router();
router.use(authenticate);

// Any authenticated user can view a test's section structure (students see
// it while taking the test, Company sees it while building/reviewing).
router.get("/", async (req: Request, res: Response) => {
  const { mockTestId } = z.object({ mockTestId: z.string().uuid() }).parse(req.query);
  const sections = await prisma.testSection.findMany({
    where: { mockTestId },
    orderBy: { order: "asc" },
    include: { mockTestQuestions: { include: { question: true } } },
  });
  res.status(200).json({ success: true, data: sections });
});

router.post("/", authorize("COMPANY", "LAW_FIRM_ADMIN"), audioUpload.single("audioFile"), async (req: Request, res: Response) => {
  const input = createSectionSchema.parse(req.body);
  if (req.auth?.accountType === "LAW_FIRM_ADMIN") {
    const test = await prisma.mockTest.findUnique({ where: { id: input.mockTestId } });
    if (!test || (test as any).hostLawFirmId !== req.auth.lawFirmId) {
      throw AppError.forbidden("You can only add sections to your own institution's mock tests.");
    }
  }
  const audioUrl = req.file ? `/uploads/audio/${req.file.filename}` : input.audioUrl || undefined;
  const section = await prisma.testSection.create({ data: { ...input, audioUrl } });
  res.status(201).json({ success: true, data: section });
});

router.delete("/:id", authorize("COMPANY", "LAW_FIRM_ADMIN"), async (req: Request, res: Response) => {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const section = await prisma.testSection.findUnique({ where: { id } });
  if (!section) throw AppError.notFound("Section not found");
  await prisma.testSection.delete({ where: { id } });
  res.status(200).json({ success: true, message: "Section deleted" });
});

export default router;
