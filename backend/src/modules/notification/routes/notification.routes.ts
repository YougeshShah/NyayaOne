import { Router } from "express";
import { notificationController } from "../controller/notification.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { requirePermission } from "../../../common/middleware/requirePermission";

const router = Router();

router.use(authenticate);

// Any authenticated user (company, firm staff, lawyer, client) reads their own inbox.
router.get("/my", notificationController.myNotifications);
router.patch("/my/:id/read", notificationController.markRead);
router.patch("/my/mark-all-read", notificationController.markAllRead);

// Only Company (Technocraftx) can broadcast notifications and view the sent log.
router.post("/", authorize("COMPANY"), requirePermission("notification.broadcast"), notificationController.send);
router.get("/", authorize("COMPANY"), notificationController.listSent);

export default router;
