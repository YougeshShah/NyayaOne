import { Router } from "express";
import { mockTestController } from "../controller/mock-test.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate);

router.get("/", mockTestController.list);
router.get("/my-attempts", mockTestController.myAttempts);
router.get("/attempts/:attemptId", mockTestController.getAttemptResult);
router.get("/:id", mockTestController.getById);

router.post("/", authorize("COMPANY", "LAW_FIRM_ADMIN"), mockTestController.create);
router.patch("/:id/publish", authorize("COMPANY", "LAW_FIRM_ADMIN"), mockTestController.publish);
router.post("/:id/questions", authorize("COMPANY", "LAW_FIRM_ADMIN"), mockTestController.addQuestion);
router.delete("/:id/questions/:questionId", authorize("COMPANY", "LAW_FIRM_ADMIN"), mockTestController.removeQuestion);

router.post("/:id/start", authorize("STUDENT"), mockTestController.startAttempt);
router.post("/attempts/:attemptId/submit", authorize("STUDENT"), mockTestController.submitAttempt);

export default router;
