import { Router } from "express";
import { auditLogController } from "../controller/audit-log.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate, authorize("COMPANY"));

router.get("/", auditLogController.list);
router.get("/entity-types", auditLogController.listEntityTypes);

export default router;
