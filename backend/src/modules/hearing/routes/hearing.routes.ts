import { Router } from "express";
import { hearingController } from "../controller/hearing.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate, authorize("LAW_FIRM_ADMIN", "LAWYER", "STAFF"));

router.get("/", hearingController.list);
router.get("/today", hearingController.today);
router.get("/upcoming", hearingController.upcoming);
router.get("/:id", hearingController.getById);
router.post("/", hearingController.create);
router.patch("/:id", hearingController.update);

export default router;
