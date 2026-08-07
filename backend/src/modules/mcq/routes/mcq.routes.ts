import { Router } from "express";
import { mcqController } from "../controller/mcq.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate);

// Students (and anyone) can browse the question bank — answer fields are
// stripped server-side for STUDENT accounts (see mcq.service.ts).
router.get("/", mcqController.list);
router.get("/:id", mcqController.getById);
router.post("/:id/check-answer", mcqController.checkAnswer);

// Only Company manages the question bank content.
router.post("/", authorize("COMPANY"), mcqController.create);
router.patch("/:id", authorize("COMPANY"), mcqController.update);
router.delete("/:id", authorize("COMPANY"), mcqController.remove);

// Institution's own staff — write their own questions, visible only to
// their own students.
router.post("/institution", authorize("LAW_FIRM_ADMIN"), mcqController.createInstitution);

export default router;
