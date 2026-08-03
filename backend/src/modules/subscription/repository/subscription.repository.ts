import { prisma } from "../../../database/prisma";
import { Prisma, SubscriptionStatus } from "@prisma/client";

export const subscriptionRepository = {
  // ---- Plans ----
  listPlans(activeOnly = false) {
    return prisma.subscriptionPlan.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { priceMonthly: "asc" },
      include: { _count: { select: { subscriptions: true } } },
    });
  },

  findPlanById(id: string) {
    return prisma.subscriptionPlan.findUnique({ where: { id } });
  },

  findPlanByName(name: string) {
    return prisma.subscriptionPlan.findUnique({ where: { name } });
  },

  createPlan(data: Prisma.SubscriptionPlanCreateInput) {
    return prisma.subscriptionPlan.create({ data });
  },

  updatePlan(id: string, data: Prisma.SubscriptionPlanUpdateInput) {
    return prisma.subscriptionPlan.update({ where: { id }, data });
  },

  // ---- Firm Subscriptions ----
  findByLawFirmId(lawFirmId: string) {
    return prisma.firmSubscription.findUnique({
      where: { lawFirmId },
      include: { plan: true, lawFirm: { select: { id: true, name: true } } },
    });
  },

  async listAll(params: { status?: SubscriptionStatus; skip: number; take: number }) {
    const where: Prisma.FirmSubscriptionWhereInput = params.status ? { status: params.status } : {};
    const [items, total] = await Promise.all([
      prisma.firmSubscription.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { plan: true, lawFirm: { select: { id: true, name: true, email: true } } },
      }),
      prisma.firmSubscription.count({ where }),
    ]);
    return { items, total };
  },

  upsertForFirm(lawFirmId: string, data: { planId: string; status: SubscriptionStatus; expiresAt?: Date }) {
    return prisma.firmSubscription.upsert({
      where: { lawFirmId },
      create: { lawFirmId, planId: data.planId, status: data.status, expiresAt: data.expiresAt },
      update: { planId: data.planId, status: data.status, expiresAt: data.expiresAt },
      include: { plan: true },
    });
  },

  updateStatus(lawFirmId: string, data: { status: SubscriptionStatus; expiresAt?: Date }) {
    return prisma.firmSubscription.update({
      where: { lawFirmId },
      data,
      include: { plan: true },
    });
  },

  countFirmLawyers(lawFirmId: string) {
    return prisma.user.count({ where: { lawFirmId, accountType: "LAWYER" } });
  },

  countFirmCases(lawFirmId: string) {
    return prisma.case.count({ where: { lawFirmId } });
  },
};
