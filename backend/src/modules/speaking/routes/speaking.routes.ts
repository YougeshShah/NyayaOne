import { Router } from "express";
import { speakingController } from "../controller/speaking.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { speakingUpload, mapMulterError } from "../../../common/middleware/upload";
import { requirePermission } from "../../../common/middleware/requirePermission";

const router = Router();
router.use(authenticate);

// Prompts -- Company and Institution admins manage the question bank.
router.post("/prompts", authorize("COMPANY", "LAW_FIRM_ADMIN"), requirePermission("speaking.manage"), speakingController.createPrompt);
router.patch("/prompts/:id", authorize("COMPANY", "LAW_FIRM_ADMIN"), requirePermission("speaking.manage"), speakingController.updatePrompt);
router.delete("/prompts/:id", authorize("COMPANY", "LAW_FIRM_ADMIN"), requirePermission("speaking.manage"), speakingController.deletePrompt);
router.get("/prompts", speakingController.listPrompts); // any authenticated account can browse published prompts for a course

// Submissions -- students record and upload their own responses.
router.post(
  "/submissions",
  authorize("STUDENT"),
  (req, res, next) => {
    speakingUpload.single("recording")(req, res, (err) => {
      if (err) return next(mapMulterError(err));
      next();
    });
  },
  speakingController.submitRecording
);
router.get("/submissions/my", authorize("STUDENT"), speakingController.listMySubmissions);
router.get("/submissions/:id/recording", speakingController.streamRecording); // ownership checked in the service

export default router;
