import { Router } from "express";
import { liveClassController } from "../controller/live-class.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate);

router.get("/", liveClassController.list);
router.get("/:id", liveClassController.getById);

router.post("/", authorize("COMPANY"), liveClassController.create);
router.post("/:id/host-join", authorize("COMPANY"), liveClassController.joinAsHost);
router.patch("/:id/mark-live", authorize("COMPANY"), liveClassController.markLive);
router.patch("/:id/mark-ended", authorize("COMPANY"), liveClassController.markEnded);
router.patch("/:id/recording", authorize("COMPANY"), liveClassController.uploadRecording);
router.patch("/:id/cancel", authorize("COMPANY"), liveClassController.cancel);

router.post("/:id/join", authorize("STUDENT"), liveClassController.joinAsStudent);

export default router;
