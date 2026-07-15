import { Router } from "express";
import { notificationController } from "../controller/notification.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate);

// Any authenticated user (company, firm staff, lawyer, client) reads their own inbox.
router.get("/my", notificationController.myNotifications);
router.patch("/my/:id/read", notificationController.markRead);

// Only Company (TrailBlaze Tech) can broadcast notifications and view the sent log.
router.post("/", authorize("COMPANY"), notificationController.send);
router.get("/", authorize("COMPANY"), notificationController.listSent);

export default router;
