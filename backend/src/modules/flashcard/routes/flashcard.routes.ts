import { Router } from "express";
import { flashcardController } from "../controller/flashcard.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate);

router.get("/", flashcardController.list);
router.post("/", authorize("COMPANY", "LAW_FIRM_ADMIN"), flashcardController.create);
router.patch("/:id", authorize("COMPANY", "LAW_FIRM_ADMIN"), flashcardController.update);
router.delete("/:id", authorize("COMPANY", "LAW_FIRM_ADMIN"), flashcardController.remove);
router.post("/:id/familiarity", authorize("STUDENT"), flashcardController.submitFamiliarity);

export default router;
