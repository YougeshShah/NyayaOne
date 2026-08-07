import { Router } from "express";
import { subjectController } from "../controller/subject.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate);

// Any authenticated user (mainly students) can browse subjects.
router.get("/", subjectController.list);

// Only Company manages the subject list.
router.post("/", authorize("COMPANY"), subjectController.create);
router.delete("/:id", authorize("COMPANY"), subjectController.remove);

export default router;
