import { Router } from "express";
import { hearingController } from "../controller/hearing.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { requireTenantPermission } from "../../../common/middleware/requireTenantPermission";

const router = Router();

router.use(authenticate, authorize("LAW_FIRM_ADMIN", "LAWYER", "STAFF"));

router.get("/", hearingController.list);
router.get("/today", hearingController.today);
router.get("/upcoming", hearingController.upcoming);
router.get("/:id", hearingController.getById);
router.post("/", requireTenantPermission("hearing.manage"), hearingController.create);
router.patch("/:id", requireTenantPermission("hearing.manage"), hearingController.update);

export default router;
