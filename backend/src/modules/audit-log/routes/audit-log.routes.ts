import { Router } from "express";
import { auditLogController } from "../controller/audit-log.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { requirePermission } from "../../../common/middleware/requirePermission";

const router = Router();

router.use(authenticate, authorize("COMPANY"), requirePermission("auditlog.view"));

router.get("/", auditLogController.list);
router.get("/entity-types", auditLogController.listEntityTypes);

export default router;
