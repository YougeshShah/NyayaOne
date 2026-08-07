import { Request, Response } from "express";
import { AppError } from "../../../common/errors/AppError";
import { courseService } from "../service/course.service";
import { createCourseSchema, updateCourseSchema, courseIdParamSchema } from "../dto/course.dto";
import { z } from "zod";

const grantSubscriptionSchema = z.object({
  studentId: z.string().uuid(),
  expiresAt: z.string().datetime().optional(),
});

export const courseController = {
  async listPublic(req: Request, res: Response) {
    const result = await courseService.list(true);
    // Strip anything not needed pre-signup — just enough for a picker.
    const minimal = result.map((c: any) => ({ id: c.id, name: c.name, category: c.category }));
    res.status(200).json({ success: true, data: minimal });
  },

  async list(req: Request, res: Response) {
    const activeOnly = req.auth?.accountType !== "COMPANY"; // Company sees inactive courses too, for management
    const result = await courseService.list(activeOnly);
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    const { id } = courseIdParamSchema.parse(req.params);
    const result = await courseService.getById(id);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    const input = createCourseSchema.parse(req.body);
    const result = await courseService.create(input);
    res.status(201).json({ success: true, data: result });
  },

  async update(req: Request, res: Response) {
    const { id } = courseIdParamSchema.parse(req.params);
    const input = updateCourseSchema.parse(req.body);
    const result = await courseService.update(id, input);
    res.status(200).json({ success: true, data: result });
  },

  async mySubscriptions(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const result = await courseService.mySubscriptions(req.auth.userId);
    res.status(200).json({ success: true, data: result });
  },

  async grantSubscription(req: Request, res: Response) {
    const { id: courseId } = courseIdParamSchema.parse(req.params);
    const input = grantSubscriptionSchema.parse(req.body);
    const result = await courseService.grantSubscription(
      input.studentId,
      courseId,
      input.expiresAt ? new Date(input.expiresAt) : undefined
    );
    res.status(201).json({ success: true, message: "Subscription granted (demo mode — no payment gateway yet)", data: result });
  },

  async searchStudents(req: Request, res: Response) {
    const { q } = z.object({ q: z.string().min(2, "Enter at least 2 characters to search") }).parse(req.query);
    const result = await courseService.searchStudents(q);
    res.status(200).json({ success: true, data: result });
  },
};
