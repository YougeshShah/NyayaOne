import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../database/prisma";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { AppError } from "../../common/errors/AppError";

const toggleBookmarkSchema = z.object({
  resourceType: z.enum(["LIBRARY", "MCQ"]),
  resourceId: z.string().uuid(),
});

const router = Router();
router.use(authenticate, authorize("STUDENT"));

router.get("/", async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  const bookmarks = await prisma.bookmark.findMany({
    where: { studentId: req.auth.userId },
    orderBy: { createdAt: "desc" },
  });

  // Enrich each bookmark with a short preview of what it points to — the
  // raw bookmark row only has a resourceId, which isn't useful to render.
  const enriched = await Promise.all(
    bookmarks.map(async (b: any) => {
      if (b.resourceType === "MCQ") {
        const question = await prisma.mcqQuestion.findUnique({
          where: { id: b.resourceId },
          select: { question: true, courseId: true, subjectId: true },
        });
        return { ...b, preview: question?.question ?? "(question no longer exists)", courseId: question?.courseId };
      }
      const resource = await prisma.libraryResource.findUnique({
        where: { id: b.resourceId },
        select: { title: true },
      });
      return { ...b, preview: resource?.title ?? "(resource no longer exists)" };
    })
  );

  res.status(200).json({ success: true, data: enriched });
});

// Toggling — bookmark if not already saved, un-bookmark if it is. Keeps the
// student-facing UI to a single "save" button rather than separate add/remove.
router.post("/toggle", async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  const { resourceType, resourceId } = toggleBookmarkSchema.parse(req.body);
  const studentId = req.auth.userId;

  const existing = await prisma.bookmark.findUnique({
    where: { studentId_resourceType_resourceId: { studentId, resourceType, resourceId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return res.status(200).json({ success: true, data: { bookmarked: false } });
  }

  await prisma.bookmark.create({ data: { studentId, resourceType, resourceId } });
  res.status(201).json({ success: true, data: { bookmarked: true } });
});

export default router;
