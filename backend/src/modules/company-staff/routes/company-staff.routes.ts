import { Router } from "express";
import { companyStaffController } from "../controller/company-staff.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { requirePermission } from "../../../common/middleware/requirePermission";

const router = Router();

router.use(authenticate, authorize("COMPANY"));

router.get("/", companyStaffController.list);
router.get("/roles", companyStaffController.listRoles);
router.post("/", requirePermission("user.manage"), companyStaffController.create);
router.patch("/:id/status", requirePermission("user.manage"), companyStaffController.updateStatus);
router.patch("/:id/role", requirePermission("user.manage"), companyStaffController.updateRole);

export default router;
