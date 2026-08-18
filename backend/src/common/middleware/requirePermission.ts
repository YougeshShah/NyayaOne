import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { prisma } from "../../database/prisma";

/**
 * Restricts a route to COMPANY users whose assigned role includes the given
 * permission key. This is the piece that was missing — authorize("COMPANY")
 * alone lets ANY company staff member through regardless of their role, so
 * assigning someone the "Finance" role had zero actual effect on what they
 * could do. This checks the real Role -> RolePermission -> Permission chain.
 *
 * A user with no role assigned (roleId is null) or whose role is "Super
 * Admin" always passes — Super Admin is seeded with every permission, and a
 * missing role shouldn't silently lock someone out if RBAC data is mid-setup.
 *
 * Individual overrides (UserPermission) are checked FIRST and always win
 * over the role's default — an explicit revoke removes a permission the
 * role would otherwise grant, and an explicit grant adds one the role
 * doesn't have, without needing a whole new role for one person.
 *
 * Usage: router.post("/", authenticate, authorize("COMPANY"), requirePermission("lawfirm.approve"), controller.approve)
 */
export function requirePermission(permissionKey: string) {
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

    // Individual override always wins, regardless of role — checked before
    // any role-based logic (including the Super Admin fallback below), so
    // an explicit revoke on a Super Admin's account is still honored.
    const override = user.individualPermissions.find((up) => up.permission.key === permissionKey);
    if (override) {
      if (override.granted) return next();
      throw AppError.forbidden(`This permission ("${permissionKey}") has been individually revoked on your account.`);
    }

    // No role assigned yet, or the built-in Super Admin role — full access.
    if (!user.role || user.role.name === "Super Admin") {
      return next();
    }
    const hasPermission = user.role.permissions.some((rp: { permission: { key: string } }) => rp.permission.key === permissionKey);
    if (!hasPermission) {
      throw AppError.forbidden(`Your role ("${user.role.name}") does not include the "${permissionKey}" permission`);
    }
    next();
  };
}
