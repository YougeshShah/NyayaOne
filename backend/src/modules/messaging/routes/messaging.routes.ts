import { Router } from "express";
import { authenticate } from "../../../common/middleware/authenticate";
import { messagingController } from "../controller/messaging.controller";

const router = Router();
router.use(authenticate);

router.get("/contacts", messagingController.listContacts);
router.get("/conversations", messagingController.listConversations);
router.post("/conversations", messagingController.createConversation);
router.get("/conversations/:id/messages", messagingController.listMessages);
router.post("/conversations/:id/messages", messagingController.sendMessage);
router.get("/unread-count", messagingController.unreadCount);

export default router;
