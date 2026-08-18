import { prisma } from "../../../database/prisma";
import { AppError } from "../../../common/errors/AppError";
import { SetOverrideInput } from "../dto/user-permission.dto";

export const userPermissionService = {
  // Returns EVERY permission in the system with three pieces of info per
  // row: whether the user's role grants it, whether there's an individual
  // override and what kind, and the final effective result (override wins
  // when present, otherwise falls back to the role) -- everything the UI
  // needs to render a clear "from role" vs "individually changed" matrix.
  async listForUser(userId: string, lawFirmId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
        individualPermissions: { include: { permission: true } },
      },
    });
    if (!user) throw AppError.notFound("User not found");
    if (lawFirmId && user.lawFirmId !== lawFirmId) {
      throw AppError.forbidden("This user does not belong to your firm");
    }

    const allPermissions = await prisma.permission.findMany({ orderBy: [{ module: "asc" }, { key: "asc" }] });
    const roleGrantedKeys = new Set((user.role?.permissions ?? []).map((rp) => rp.permission.key));
    const overrideByKey = new Map(user.individualPermissions.map((up) => [up.permission.key, up]));

    const rows = allPermissions.map((p) => {
      const fromRole = roleGrantedKeys.has(p.key);
      const override = overrideByKey.get(p.key);
      return {
        permissionId: p.id,
        key: p.key,
        description: p.description,
        module: p.module,
        fromRole,
        override: override ? (override.granted ? "GRANT" : "REVOKE") : null,
        overrideReason: override?.reason ?? null,
        effective: override ? override.granted : fromRole,
      };
    });

    return { userId: user.id, userFullName: user.fullName, roleName: user.role?.name ?? null, permissions: rows };
  },

  async setOverride(userId: string, input: SetOverrideInput, grantedBy: string, lawFirmId?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound("User not found");
    if (lawFirmId && user.lawFirmId !== lawFirmId) {
      throw AppError.forbidden("This user does not belong to your firm");
    }

    return prisma.userPermission.upsert({
      where: { userId_permissionId: { userId, permissionId: input.permissionId } },
      create: { userId, permissionId: input.permissionId, granted: input.granted, grantedBy, reason: input.reason },
      update: { granted: input.granted, grantedBy, reason: input.reason },
    });
  },

  async removeOverride(userId: string, permissionId: string, lawFirmId?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound("User not found");
    if (lawFirmId && user.lawFirmId !== lawFirmId) {
      throw AppError.forbidden("This user does not belong to your firm");
    }

    // Idempotent -- removing a non-existent override is a no-op, not an error,
    // since "back to role default" is a valid end state either way.
    await prisma.userPermission
      .delete({ where: { userId_permissionId: { userId, permissionId } } })
      .catch(() => {});
  },
};
