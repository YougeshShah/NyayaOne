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
 * Usage: router.post("/", authenticate, authorize("COMPANY"), requirePermission("lawfirm.approve"), controller.approve)
 */
export function requirePermission(permissionKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw AppError.unauthorized();
    }

    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });

    if (!user) {
      throw AppError.unauthorized();
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
