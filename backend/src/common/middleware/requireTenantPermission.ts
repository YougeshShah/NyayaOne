import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { prisma } from "../../database/prisma";

/**
 * The tenant-side counterpart to requirePermission() — checks a tenant
 * staff member's (or student's) role permissions instead of a Company
 * staff member's. Works identically for a Law Firm's "Senior Associate"
 * role, an Institute's "Teacher" role, or a student's role, since all of
 * these are just LawFirm-scoped Roles on a User row.
 *
 * LAW_FIRM_ADMIN always passes (the tenant's own super-admin, mirroring
 * how Company's Super Admin always passes requirePermission()) — same
 * "highest role, fewest hands" principle applied one level down.
 *
 * Individual overrides (UserPermission) are checked FIRST and always win
 * over the role's default — the real-world need this solves: two staff
 * (or two students) sharing the same role, but one of them personally
 * needs one extra permission the role doesn't grant, or needs one taken
 * away, without a whole new role just for that person.
 */
export function requireTenantPermission(permissionKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw AppError.unauthorized();
    }

    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
        individualPermissions: { include: { permission: true } },
      },
    });
    if (!user) {
      throw AppError.unauthorized();
    }

    // Individual override always wins, checked before the LAW_FIRM_ADMIN
    // bypass below too — an explicit revoke is honored even for the
    // tenant's own admin account, since that's a deliberate choice someone
    // made about that specific person.
    const override = user.individualPermissions.find((up) => up.permission.key === permissionKey);
    if (override) {
      if (override.granted) return next();
      throw AppError.forbidden(`This permission ("${permissionKey}") has been individually revoked on your account.`);
    }

    if (req.auth.accountType === "LAW_FIRM_ADMIN") {
      return next();
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
