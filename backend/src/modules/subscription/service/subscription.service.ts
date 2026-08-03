import { AppError } from "../../../common/errors/AppError";
import { subscriptionRepository } from "../repository/subscription.repository";
import { CreatePlanInput, UpdatePlanInput, AssignPlanInput, UpdateSubscriptionStatusInput } from "../dto/subscription.dto";

export const subscriptionService = {
  async listPlans(activeOnly = false) {
    return subscriptionRepository.listPlans(activeOnly);
  },

  async createPlan(input: CreatePlanInput) {
    const existing = await subscriptionRepository.findPlanByName(input.name);
    if (existing) throw AppError.conflict("A plan with this name already exists");
    return subscriptionRepository.createPlan(input);
  },

  async updatePlan(id: string, input: UpdatePlanInput) {
    const existing = await subscriptionRepository.findPlanById(id);
    if (!existing) throw AppError.notFound("Plan not found");
    return subscriptionRepository.updatePlan(id, input);
  },

  async listSubscriptions(status?: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED", page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const { items, total } = await subscriptionRepository.listAll({ status, skip, take: limit });
    return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async getForFirm(lawFirmId: string) {
    const sub = await subscriptionRepository.findByLawFirmId(lawFirmId);
    if (!sub) return null;

    const [lawyerCount, caseCount] = await Promise.all([
      subscriptionRepository.countFirmLawyers(lawFirmId),
      subscriptionRepository.countFirmCases(lawFirmId),
    ]);

    return {
      ...sub,
      usage: {
        lawyers: { used: lawyerCount, limit: sub.plan.maxLawyers },
        cases: { used: caseCount, limit: sub.plan.maxCases },
      },
    };
  },

  /**
   * Company assigns/changes a firm's plan. No payment is processed here —
   * this simply records which plan a firm is on. Real payment confirmation
   * (eSewa/Khalti/bank transfer) happens outside the system; Company staff
   * mark the subscription ACTIVE once payment is confirmed manually.
   */
  async assignPlan(input: AssignPlanInput) {
    const plan = await subscriptionRepository.findPlanById(input.planId);
    if (!plan) throw AppError.notFound("Plan not found");
    if (!plan.isActive) throw AppError.badRequest("This plan is not active and cannot be assigned");

    return subscriptionRepository.upsertForFirm(input.lawFirmId, {
      planId: input.planId,
      status: input.status,
      expiresAt: input.expiresAt,
    });
  },

  async updateStatus(lawFirmId: string, input: UpdateSubscriptionStatusInput) {
    const existing = await subscriptionRepository.findByLawFirmId(lawFirmId);
    if (!existing) throw AppError.notFound("This firm has no subscription yet — assign a plan first");
    return subscriptionRepository.updateStatus(lawFirmId, input);
  },

  /**
   * Enforcement helper for other modules (e.g. user.service.ts could call this
   * before creating a new lawyer) — not wired everywhere yet, but the check
   * is centralized here so it's a one-line call to add per limited action.
   */
  async checkLawyerLimit(lawFirmId: string): Promise<void> {
    const sub = await subscriptionRepository.findByLawFirmId(lawFirmId);
    if (!sub || !sub.plan.maxLawyers) return; // no subscription or unlimited plan — no limit enforced
    const count = await subscriptionRepository.countFirmLawyers(lawFirmId);
    if (count >= sub.plan.maxLawyers) {
      throw AppError.forbidden(`Your "${sub.plan.name}" plan allows up to ${sub.plan.maxLawyers} lawyers. Upgrade to add more.`);
    }
  },
};
