import { Router } from "express";
import { usageLimitController } from "../controller/usage-limit.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { requirePermission } from "../../../common/middleware/requirePermission";

const router = Router();
router.use(authenticate);

// Student-facing status (any authenticated account can check their own usage).
router.get("/status/:courseId", usageLimitController.myStatus);

// Company sets the platform-wide default.
router.put("/company", authorize("COMPANY"), requirePermission("usage_limit.manage"), usageLimitController.setAsCompany);
router.get("/company/:courseId", authorize("COMPANY"), usageLimitController.getAsCompany);

// Institution sets their own policy for their own students.
router.put("/institution", authorize("LAW_FIRM_ADMIN"), usageLimitController.setAsInstitution);
router.get("/institution/:courseId", authorize("LAW_FIRM_ADMIN"), usageLimitController.getAsInstitution);

export default router;
