import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../common/errors/AppError";
import { prisma } from "../../../database/prisma";

// Same pattern as requirePrecedentAccess: COMPANY always has access,
// everyone else needs their institution's modulesEnabled to include
// "ai_legal_assistant" -- checked fresh on every request so Company can
// activate/deactivate per firm instantly, no re-login needed.
export async function requireAiAssistantAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.auth) throw AppError.unauthorized();

  if (req.auth.accountType === "COMPANY") return next();

  if (!req.auth.lawFirmId) {
    throw AppError.forbidden("Your account isn't linked to an institution with AI assistant access.");
  }

  const firm = await prisma.lawFirm.findUnique({
    where: { id: req.auth.lawFirmId },
    select: {
      modulesEnabled: true,
      subscription: { select: { plan: { select: { name: true } } } },
    },
  });

  if (!firm || !firm.modulesEnabled.includes("ai_legal_assistant")) {
    throw AppError.forbidden("AI Legal Assistant isn't enabled for your institution. Contact TechnoOne to request access.");
  }

  // Advance feature -- Free tier never has it, regardless of the toggle.
  const planName = firm.subscription?.plan.name;
  if (planName === "Free") {
    throw AppError.forbidden("AI Legal Assistant is available on Professional plans and above. Please upgrade your subscription.");
  }

  next();
}
