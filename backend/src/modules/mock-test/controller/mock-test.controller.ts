import { Request, Response } from "express";
import { AppError } from "../../../common/errors/AppError";
import { mockTestService } from "../service/mock-test.service";
import { createMockTestSchema, listMockTestsQuerySchema, mockTestIdParamSchema, submitAttemptSchema } from "../dto/mock-test.dto";

export const mockTestController = {
  async list(req: Request, res: Response) {
    const query = listMockTestsQuerySchema.parse(req.query);
    const result = await mockTestService.list(query);
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    const { id } = mockTestIdParamSchema.parse(req.params);
    const result = await mockTestService.getById(id);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = createMockTestSchema.parse(req.body);
    const result = await mockTestService.create(input, req.auth.userId);
    res.status(201).json({ success: true, data: result });
  },

  async publish(req: Request, res: Response) {
    const { id } = mockTestIdParamSchema.parse(req.params);
    const result = await mockTestService.publish(id);
    res.status(200).json({ success: true, data: result });
  },

  async startAttempt(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { id } = mockTestIdParamSchema.parse(req.params);
    const result = await mockTestService.startAttempt(req.auth.userId, id);
    res.status(201).json({ success: true, data: result });
  },

  async submitAttempt(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { id: attemptId } = mockTestIdParamSchema.parse({ id: req.params.attemptId });
    const input = submitAttemptSchema.parse(req.body);
    const result = await mockTestService.submitAttempt(attemptId, req.auth.userId, input);
    res.status(200).json({ success: true, data: result });
  },

  async myAttempts(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const result = await mockTestService.myAttempts(req.auth.userId);
    res.status(200).json({ success: true, data: result });
  },

  async getAttemptResult(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { id: attemptId } = mockTestIdParamSchema.parse({ id: req.params.attemptId });
    const result = await mockTestService.getAttemptResult(attemptId, req.auth.userId);
    res.status(200).json({ success: true, data: result });
  },
};
