import { Router } from "express";
import { userPermissionController } from "../controller/user-permission.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { requirePermission } from "../../../common/middleware/requirePermission";

const router = Router();
router.use(authenticate);

// Company-side — manage individual overrides for any user across any organization.
router.get(
  "/company/:userId",
  authorize("COMPANY"),
  requirePermission("user.manage"),
  userPermissionController.listForUserAsCompany
);
router.put(
  "/company/:userId",
  authorize("COMPANY"),
  requirePermission("user.manage"),
  userPermissionController.setOverrideAsCompany
);
router.delete(
  "/company/:userId/:permissionId",
  authorize("COMPANY"),
  requirePermission("user.manage"),
  userPermissionController.removeOverrideAsCompany
);

// Tenant-side — Law Firm / Institution admin managing their own staff/students.
router.get("/:userId", authorize("LAW_FIRM_ADMIN"), userPermissionController.listForUserAsTenant);
router.put("/:userId", authorize("LAW_FIRM_ADMIN"), userPermissionController.setOverrideAsTenant);
router.delete("/:userId/:permissionId", authorize("LAW_FIRM_ADMIN"), userPermissionController.removeOverrideAsTenant);

export default router;
