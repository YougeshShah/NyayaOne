import { Request, Response } from "express";
import { subscriptionService } from "../service/subscription.service";
import {
  createPlanSchema,
  updatePlanSchema,
  assignPlanSchema,
  updateSubscriptionStatusSchema,
  planIdParamSchema,
  lawFirmIdParamSchema,
} from "../dto/subscription.dto";
import { AppError } from "../../../common/errors/AppError";

export const subscriptionController = {
  async listPlans(req: Request, res: Response) {
    const activeOnly = req.query.activeOnly === "true";
    const result = await subscriptionService.listPlans(activeOnly);
    res.status(200).json({ success: true, data: result });
  },

  async createPlan(req: Request, res: Response) {
    const input = createPlanSchema.parse(req.body);
    const result = await subscriptionService.createPlan(input);
    res.status(201).json({ success: true, message: "Plan created", data: result });
  },

  async updatePlan(req: Request, res: Response) {
    const { id } = planIdParamSchema.parse(req.params);
    const input = updatePlanSchema.parse(req.body);
    const result = await subscriptionService.updatePlan(id, input);
    res.status(200).json({ success: true, message: "Plan updated", data: result });
  },

  async listSubscriptions(req: Request, res: Response) {
    const status = req.query.status as "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED" | undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const result = await subscriptionService.listSubscriptions(status, page, limit);
    res.status(200).json({ success: true, data: result });
  },

  async assignPlan(req: Request, res: Response) {
    const input = assignPlanSchema.parse(req.body);
    const result = await subscriptionService.assignPlan(input);
    res.status(200).json({ success: true, message: "Plan assigned to firm", data: result });
  },

  async updateStatus(req: Request, res: Response) {
    const { lawFirmId } = lawFirmIdParamSchema.parse(req.params);
    const input = updateSubscriptionStatusSchema.parse(req.body);
    const result = await subscriptionService.updateStatus(lawFirmId, input);
    res.status(200).json({ success: true, message: "Subscription status updated", data: result });
  },

  async myFirmSubscription(req: Request, res: Response) {
    if (!req.auth || !req.auth.lawFirmId) throw AppError.forbidden("This action requires a law firm account");
    const result = await subscriptionService.getForFirm(req.auth.lawFirmId);
    res.status(200).json({ success: true, data: result });
  },
};
