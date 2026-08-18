import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../database/prisma";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { AppError } from "../../common/errors/AppError";

const router = Router();

router.use(authenticate, authorize("LAW_FIRM_ADMIN", "LAWYER", "STAFF"));

// Only the tenant's own LAW_FIRM_ADMIN edits roles — mirrors Company's
// "only Super Admin edits" rule, one level down.
function requireTenantAdmin(req: Request, res: Response, next: () => void) {
  if (req.auth?.accountType !== "LAW_FIRM_ADMIN") {
    throw AppError.forbidden("Only your organization's admin can manage roles");
  }
  next();
}

// Returns the CURRENT user's own effective permission keys -- LAW_FIRM_ADMIN
// gets every permission (matches requireTenantPermission's always-pass
// rule), other staff get whatever their assigned Role grants. Used by the
// frontend to show/hide nav items like Accounting for the right people,
// without needing a failed request first.
router.get("/my-permissions", async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();

  if (req.auth.accountType === "LAW_FIRM_ADMIN") {
    const allPermissions = await prisma.permission.findMany({ select: { key: true } });
    return res.status(200).json({ success: true, data: allPermissions.map((p) => p.key) });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });
  const keys = user?.role?.permissions.map((rp) => rp.permission.key) ?? [];
  res.status(200).json({ success: true, data: keys });
});

// Any tenant staff can view their own tenant's roles/permission matrix.
router.get("/roles", async (req: Request, res: Response) => {
  if (!req.auth?.lawFirmId) throw AppError.forbidden("No organization associated with this account");
  const roles = await prisma.role.findMany({
    where: { lawFirmId: req.auth.lawFirmId },
    orderBy: { name: "asc" },
    include: { permissions: { include: { permission: true } } },
  });
  const shaped = roles.map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    permissionKeys: r.permissions.map((rp: any) => rp.permission.key),
  }));
  res.status(200).json({ success: true, data: shaped });
});

// Only permissions relevant to this tenant's type are shown — a Law Firm
// doesn't need to see "student.manage", an Institute doesn't need
// "case.manage". Falls back to showing everything if tenantType is
// somehow missing rather than hiding the page entirely.
router.get("/permissions", async (req: Request, res: Response) => {
  if (!req.auth?.lawFirmId) throw AppError.forbidden("No organization associated with this account");
  const lawFirm = await prisma.lawFirm.findUnique({ where: { id: req.auth.lawFirmId } });

  const lawModules = ["Case", "Hearing", "Client", "Document", "Report", "TenantStaff"];
  const eduModules = ["Student", "Mcq", "LiveClass", "StudyProgress", "TenantStaff"];
  const relevantModules = lawFirm?.tenantType === "EDUCATION" ? eduModules : lawModules;

  const permissions = await prisma.permission.findMany({
    where: { module: { in: relevantModules } },
    orderBy: [{ module: "asc" }, { key: "asc" }],
  });
  res.status(200).json({ success: true, data: permissions });
});

const createTenantRoleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  description: z.string().optional(),
});

router.post("/roles", requireTenantAdmin, async (req: Request, res: Response) => {
  if (!req.auth?.lawFirmId) throw AppError.forbidden("No organization associated with this account");
  const input = createTenantRoleSchema.parse(req.body);

  const existing = await prisma.role.findFirst({ where: { name: input.name, lawFirmId: req.auth.lawFirmId } });
  if (existing) throw AppError.conflict("A role with this name already exists in your organization");

  const role = await prisma.role.create({
    data: { name: input.name, description: input.description, lawFirmId: req.auth.lawFirmId },
  });
  res.status(201).json({ success: true, data: role });
});

const updateRolePermissionsSchema = z.object({
  permissionKeys: z.array(z.string()),
});

router.put("/roles/:id/permissions", requireTenantAdmin, async (req: Request, res: Response) => {
  if (!req.auth?.lawFirmId) throw AppError.forbidden("No organization associated with this account");
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const input = updateRolePermissionsSchema.parse(req.body);

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role || role.lawFirmId !== req.auth.lawFirmId) {
    throw AppError.notFound("Role not found in your organization");
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

router.delete("/roles/:id", requireTenantAdmin, async (req: Request, res: Response) => {
  if (!req.auth?.lawFirmId) throw AppError.forbidden("No organization associated with this account");
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role || role.lawFirmId !== req.auth.lawFirmId) {
    throw AppError.notFound("Role not found in your organization");
  }

  const usersWithRole = await prisma.user.count({ where: { roleId: id } });
  if (usersWithRole > 0) {
    throw AppError.badRequest(`${usersWithRole} staff member(s) still have this role — reassign them first`);
  }

  await prisma.role.delete({ where: { id } });
  res.status(200).json({ success: true, message: "Role deleted" });
});

export default router;
