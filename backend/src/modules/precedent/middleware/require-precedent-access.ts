import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../common/errors/AppError";
import { prisma } from "../../../database/prisma";

// COMPANY always has full access (per explicit product decision — Company
// staff aren't gated by any institution's module toggles). Everyone else
// (institution admin, lawyer, student) needs their own institution's
// modulesEnabled to include "precedent_search" — checked fresh against
// the DB on every request rather than baked into the JWT, so a Company
// admin toggling the module off takes effect immediately without
// requiring every affected user to log out and back in.
export async function requirePrecedentAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.auth) throw AppError.unauthorized();

  if (req.auth.accountType === "COMPANY") return next();

  if (!req.auth.lawFirmId) {
    throw AppError.forbidden("Your account isn't linked to an institution with precedent search access.");
  }

  const firm = await prisma.lawFirm.findUnique({
    where: { id: req.auth.lawFirmId },
    select: { modulesEnabled: true },
  });

  if (!firm || !firm.modulesEnabled.includes("precedent_search")) {
    throw AppError.forbidden("Precedent search isn't enabled for your institution. Contact your administrator.");
  }

  next();
}
