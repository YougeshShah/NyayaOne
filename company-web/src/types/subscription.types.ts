export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number | null;
  maxLawyers: number | null;
  maxCases: number | null;
  maxStorageMb: number | null;
  isActive: boolean;
  _count?: { subscriptions: number };
}

export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface FirmSubscription {
  id: string;
  lawFirmId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string | null;
  plan: SubscriptionPlan;
  lawFirm: { id: string; name: string; email: string | null };
}
