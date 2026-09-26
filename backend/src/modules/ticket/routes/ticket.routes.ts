import { Router } from "express";
import { authenticate } from "../../../common/middleware/authenticate";
import { chatAttachmentUpload, mapMulterError } from "../../../common/middleware/upload";
import { ticketController } from "../controller/ticket.controller";

const router = Router();
router.use(authenticate);

router.post("/", ticketController.create);
router.get("/", ticketController.list);
router.get("/:id", ticketController.getById);
router.post("/:id/comments", ticketController.addComment);
router.patch("/:id/status", ticketController.updateStatus);

router.post(
  "/attachments",
  (req, res, next) => {
    chatAttachmentUpload.single("file")(req, res, (err) => {
      if (err) return next(mapMulterError(err));
      next();
    });
  },
  ticketController.uploadAttachment
);

export default router;
