import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { prisma } from "../../database/prisma";

/**
 * The tenant-side counterpart to requirePermission() — checks a tenant
 * staff member's role permissions instead of a Company staff member's.
 * Works identically for a Law Firm's "Senior Associate" role or an
 * Institute's "Teacher" role, since both are just LawFirm-scoped Roles.
 *
 * LAW_FIRM_ADMIN always passes (the tenant's own super-admin, mirroring
 * how Company's Super Admin always passes requirePermission()) — same
 * "highest role, fewest hands" principle applied one level down.
 */
export function requireTenantPermission(permissionKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw AppError.unauthorized();
    }

    if (req.auth.accountType === "LAW_FIRM_ADMIN") {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });

    if (!user) {
      throw AppError.unauthorized();
    }

    // No custom role assigned yet — fail closed (unlike Company's Super
    // Admin fallback) since a tenant staff member without an assigned role
    // shouldn't get free access to tenant-gated actions.
    if (!user.role) {
      throw AppError.forbidden("Your account has no role assigned yet — ask your admin to assign one.");
    }

    const hasPermission = user.role.permissions.some(
      (rp: { permission: { key: string } }) => rp.permission.key === permissionKey
    );
    if (!hasPermission) {
      throw AppError.forbidden(`Your role ("${user.role.name}") does not include the "${permissionKey}" permission`);
    }

    next();
  };
}
