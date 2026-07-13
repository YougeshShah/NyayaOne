import { Router } from "express";
import { caseController } from "../controller/case.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate, authorize("LAW_FIRM_ADMIN", "LAWYER", "STAFF"));

router.get("/", caseController.list);
router.get("/status-summary", caseController.statusSummary);
router.get("/:id", caseController.getById);
router.post("/", caseController.create);
router.patch("/:id", caseController.update);

export default router;
