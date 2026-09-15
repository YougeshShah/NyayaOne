import { Request, Response } from "express";
import path from "path";
import { courseContentService } from "../service/course-content.service";
import { createContentSchema, updateContentSchema } from "../dto/course-content.dto";
import { AppError } from "../../../common/errors/AppError";
import { prisma } from "../../../database/prisma";
import { env } from "../../../config/env";

export const courseContentController = {
  async create(req: Request, res: Response) {
    const input = createContentSchema.parse(req.body);
    const uploadedBy = req.auth!.userId;
    // Company uploads platform-wide content (lawFirmId null); an
    // institution admin uploads content scoped to their own institution.
    const lawFirmId = req.auth!.accountType === "COMPANY" ? null : req.auth!.lawFirmId!;
    const fileUrl = req.file ? `/uploads/course-content/${req.file.filename}` : undefined;
    const result = await courseContentService.create(
      uploadedBy,
      lawFirmId,
      input.courseId,
      input.subjectId,
      input.term,
      input.title,
      input.fileType,
      fileUrl,
      input.textBody
    );
    res.status(201).json({ success: true, data: result });
  },

  async forStudent(req: Request, res: Response) {
    const { courseId } = req.params;
    const studentId = req.auth!.userId;

    // Only students with an active (non-expired) subscription to this
    // course can view its content -- same gate as any other paid feature.
    const subscription = await prisma.courseSubscription.findFirst({
      where: { studentId, courseId, status: { in: ["ACTIVE", "TRIAL"] } },
    });
    if (!subscription) throw AppError.forbidden("Subscribe to this course to view its content");

    const subjectId = req.query.subjectId as string | undefined;
    const term = req.query.term as string | undefined;
    const result = await courseContentService.forStudent(courseId, req.auth!.lawFirmId, subjectId, term);
    res.status(200).json({ success: true, data: result });
  },

  async forAdmin(req: Request, res: Response) {
    const { courseId } = req.params;
    const lawFirmId = req.auth!.accountType === "COMPANY" ? null : req.auth!.lawFirmId!;
    const result = await courseContentService.forAdmin(courseId, lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async viewFile(req: Request, res: Response) {
    const { id } = req.params;
    const studentId = req.auth!.userId;
    const content = await prisma.courseContent.findUnique({ where: { id } });
    if (!content || !content.fileUrl) throw AppError.notFound("Content not found");

    const subscription = await prisma.courseSubscription.findFirst({
      where: { studentId, courseId: content.courseId, status: { in: ["ACTIVE", "TRIAL"] } },
    });
    if (!subscription) throw AppError.forbidden("Subscribe to this course to view its content");

    const fullPath = path.join(process.cwd(), env.storage.localUploadDir, content.fileUrl.replace(/^\/uploads\//, ""));
    res.sendFile(fullPath, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ success: false, message: "File not found on server" });
      }
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const input = updateContentSchema.parse(req.body);
    const lawFirmId = req.auth!.accountType === "COMPANY" ? null : req.auth!.lawFirmId!;
    const result = await courseContentService.update(id, lawFirmId, input);
    res.status(200).json({ success: true, data: result });
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const lawFirmId = req.auth!.accountType === "COMPANY" ? null : req.auth!.lawFirmId!;
    await courseContentService.remove(id, lawFirmId);
    res.status(200).json({ success: true, message: "Content deleted" });
  },
};
