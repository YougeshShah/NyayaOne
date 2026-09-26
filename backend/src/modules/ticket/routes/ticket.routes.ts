import { Router } from "express";
import { authenticate } from "../../../common/middleware/authenticate";
import { ticketController } from "../controller/ticket.controller";

const router = Router();
router.use(authenticate);

router.post("/", ticketController.create);
router.get("/", ticketController.list);
router.get("/:id", ticketController.getById);
router.post("/:id/comments", ticketController.addComment);
router.patch("/:id/status", ticketController.updateStatus);

export default router;
