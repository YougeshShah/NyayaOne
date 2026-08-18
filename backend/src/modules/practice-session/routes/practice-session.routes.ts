import { Router } from "express";
import { practiceSessionController } from "../controller/practice-session.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();
router.use(authenticate);

router.post("/start", authorize("STUDENT"), practiceSessionController.start);

export default router;
