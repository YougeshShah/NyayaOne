import { Router } from "express";
import { caseDeadlineController } from "../controller/case-deadline.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();
router.use(authenticate);
router.use(authorize("LAWYER", "STAFF", "LAW_FIRM_ADMIN"));

router.post("/case/:caseId", caseDeadlineController.create);
router.get("/case/:caseId", caseDeadlineController.list);
router.delete("/:id", caseDeadlineController.remove);

export default router;
