import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../common/errors/AppError";
import { liveClassService } from "../service/live-class.service";
import { createLiveClassSchema, listLiveClassesQuerySchema, liveClassIdParamSchema } from "../dto/live-class.dto";

export const liveClassController = {
  async list(req: Request, res: Response) {
    const query = listLiveClassesQuerySchema.parse(req.query);
    const result = await liveClassService.list(query);
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    const { id } = liveClassIdParamSchema.parse(req.params);
    const studentId = req.auth?.accountType === "STUDENT" ? req.auth.userId : null;
    const result = await liveClassService.getById(id, studentId);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = createLiveClassSchema.parse(req.body);
    const result = await liveClassService.create(input, req.auth.userId);
    res.status(201).json({ success: true, data: result });
  },

  async joinAsStudent(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { id } = liveClassIdParamSchema.parse(req.params);
    const result = await liveClassService.joinAsStudent(id, req.auth.userId);
    res.status(200).json({ success: true, data: result });
  },

  async joinAsHost(req: Request, res: Response) {
    const { id } = liveClassIdParamSchema.parse(req.params);
    const result = await liveClassService.joinAsHost(id);
    res.status(200).json({ success: true, data: result });
  },

  async markLive(req: Request, res: Response) {
    const { id } = liveClassIdParamSchema.parse(req.params);
    const result = await liveClassService.markLive(id);
    res.status(200).json({ success: true, data: result });
  },

  async markEnded(req: Request, res: Response) {
    const { id } = liveClassIdParamSchema.parse(req.params);
    const result = await liveClassService.markEnded(id);
    res.status(200).json({ success: true, data: result });
  },

  async uploadRecording(req: Request, res: Response) {
    const { id } = liveClassIdParamSchema.parse(req.params);
    const { recordingUrl } = z.object({ recordingUrl: z.string().min(5) }).parse(req.body);
    const result = await liveClassService.uploadRecording(id, recordingUrl);
    res.status(200).json({ success: true, data: result });
  },

  async cancel(req: Request, res: Response) {
    const { id } = liveClassIdParamSchema.parse(req.params);
    const result = await liveClassService.cancel(id);
    res.status(200).json({ success: true, data: result });
  },
};
