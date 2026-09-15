import { Router } from "express";
import { studentNoteController } from "../controller/student-note.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();
router.use(authenticate);
router.use(authorize("STUDENT"));

router.post("/", studentNoteController.create);
router.get("/", studentNoteController.myNotes);
router.patch("/:id", studentNoteController.update);
router.delete("/:id", studentNoteController.remove);

export default router;
