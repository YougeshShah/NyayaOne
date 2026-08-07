import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../database/prisma";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { AppError } from "../../common/errors/AppError";

const router = Router();

// Only Super Admin should be touching this — deliberately NOT gated by
// requirePermission() the way other modules are, since granting a lesser
// role the ability to edit permission *assignments* would let it grant
// itself more access. This restricts role/permission editing to Super
// Admin specifically, matching "highest role, fewest hands" intent.
function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  prisma.user
    .findUnique({ where: { id: req.auth!.userId }, include: { role: true } })
    .then((user: any) => {
      if (!user?.role || user.role.name !== "Super Admin") {
        throw AppError.forbidden("Only Super Admin can manage roles and permissions");
      }
      next();
    })
    .catch(next);
}

router.use(authenticate, authorize("COMPANY"));

// Any company staff can VIEW the matrix (read-only) — useful for them to
// understand their own access; only Super Admin can edit it (below).
router.get("/roles", async (req: Request, res: Response) => {
  const roles = await prisma.role.findMany({
    where: { lawFirmId: null }, // platform-level (Company) roles only — tenant roles are managed separately
    orderBy: { name: "asc" },
    include: { permissions: { include: { permission: true } } },
  });
  const shaped = roles.map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isSystem: r.isSystem,
    permissionKeys: r.permissions.map((rp: any) => rp.permission.key),
  }));
  res.status(200).json({ success: true, data: shaped });
});

router.get("/permissions", async (req: Request, res: Response) => {
  const permissions = await prisma.permission.findMany({ orderBy: [{ module: "asc" }, { key: "asc" }] });
  res.status(200).json({ success: true, data: permissions });
});

const createRoleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  description: z.string().optional(),
});

router.post("/roles", requireSuperAdmin, async (req: Request, res: Response) => {
  const input = createRoleSchema.parse(req.body);
  const existing = await prisma.role.findFirst({ where: { name: input.name, lawFirmId: null } });
  if (existing) throw AppError.conflict("A role with this name already exists");
  const role = await prisma.role.create({ data: { name: input.name, description: input.description } });
  res.status(201).json({ success: true, data: role });
});

const updateRolePermissionsSchema = z.object({
  permissionKeys: z.array(z.string()),
});

// Replaces a role's entire permission set with the given list — simpler and
// less error-prone for a checkbox-grid UI than diffing add/remove one at a
// time.
router.put("/roles/:id/permissions", requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const input = updateRolePermissionsSchema.parse(req.body);

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw AppError.notFound("Role not found");
  if (role.name === "Super Admin") {
    throw AppError.badRequest("Super Admin's permissions cannot be edited — it always has full access by design.");
  }

  const permissions = await prisma.permission.findMany({ where: { key: { in: input.permissionKeys } } });

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: id } }),
    prisma.rolePermission.createMany({
      data: permissions.map((p: any) => ({ roleId: id, permissionId: p.id })),
    }),
  ]);

  res.status(200).json({ success: true, message: "Role permissions updated" });
});

router.delete("/roles/:id", requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw AppError.notFound("Role not found");
  if (role.isSystem) throw AppError.badRequest("Built-in roles cannot be deleted");

  const usersWithRole = await prisma.user.count({ where: { roleId: id } });
  if (usersWithRole > 0) {
    throw AppError.badRequest(`${usersWithRole} staff member(s) still have this role — reassign them first`);
  }

  await prisma.role.delete({ where: { id } });
  res.status(200).json({ success: true, message: "Role deleted" });
});

export default router;
