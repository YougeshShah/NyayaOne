import { Request, Response } from "express";
import fs from "fs";
import { AppError } from "../../../common/errors/AppError";
import { speakingService } from "../service/speaking.service";
import {
  createPromptSchema,
  updatePromptSchema,
  listPromptsQuerySchema,
  submitRecordingSchema,
  idParamSchema,
} from "../dto/speaking.dto";

export const speakingController = {
  async createPrompt(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = createPromptSchema.parse(req.body);
    const result = await speakingService.createPrompt(input, req.auth.userId);
    res.status(201).json({ success: true, message: "Speaking prompt created", data: result });
  },

  async updatePrompt(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params);
    const input = updatePromptSchema.parse(req.body);
    const result = await speakingService.updatePrompt(id, input);
    res.status(200).json({ success: true, message: "Prompt updated", data: result });
  },

  async deletePrompt(req: Request, res: Response) {
    const { id } = idParamSchema.parse(req.params);
    await speakingService.deletePrompt(id);
    res.status(200).json({ success: true, message: "Prompt deleted" });
  },

  async listPrompts(req: Request, res: Response) {
    const query = listPromptsQuerySchema.parse(req.query);
    const result = await speakingService.listPrompts(query.courseId, query.part);
    res.status(200).json({ success: true, data: result });
  },

  async submitRecording(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    if (!req.file) throw AppError.badRequest("No recording file was uploaded");
    const input = submitRecordingSchema.parse(req.body);
    const result = await speakingService.createSubmission(req.auth.userId, input, req.file, req.auth.lawFirmId ?? null);
    res.status(201).json({ success: true, message: "Recording submitted", data: result });
  },

  async listMySubmissions(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const promptId = req.query.promptId as string | undefined;
    const result = await speakingService.listMySubmissions(req.auth.userId, promptId);
    res.status(200).json({ success: true, data: result });
  },

  async streamRecording(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { id } = idParamSchema.parse(req.params);
    const { absolutePath, recordingType } = await speakingService.getSubmissionFileForStreaming(id, req.auth.userId);

    if (!fs.existsSync(absolutePath)) {
      throw AppError.notFound("Recording file not found on disk");
    }
    res.setHeader("Content-Type", recordingType === "video" ? "video/webm" : "audio/mpeg");
    fs.createReadStream(absolutePath).pipe(res);
  },
};
