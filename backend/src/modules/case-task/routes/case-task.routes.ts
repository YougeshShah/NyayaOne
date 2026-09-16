import { Router } from "express";
import { caseTaskController } from "../controller/case-task.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();
router.use(authenticate);
router.use(authorize("LAWYER", "STAFF", "LAW_FIRM_ADMIN"));

router.get("/my", caseTaskController.myTasks);
router.post("/case/:caseId", caseTaskController.create);
router.get("/case/:caseId", caseTaskController.list);
router.patch("/:id/status", caseTaskController.updateStatus);
router.delete("/:id", caseTaskController.remove);

export default router;
