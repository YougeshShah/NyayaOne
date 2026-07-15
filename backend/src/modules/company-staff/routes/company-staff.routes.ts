import { Router } from "express";
import { companyStaffController } from "../controller/company-staff.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate, authorize("COMPANY"));

router.get("/", companyStaffController.list);
router.get("/roles", companyStaffController.listRoles);
router.post("/", companyStaffController.create);
router.patch("/:id/status", companyStaffController.updateStatus);
router.patch("/:id/role", companyStaffController.updateRole);

export default router;
