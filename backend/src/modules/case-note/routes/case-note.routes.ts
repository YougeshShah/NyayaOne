import { Router } from "express";
import { caseNoteController } from "../controller/case-note.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();
router.use(authenticate);
// Internal to the firm's own team -- LAWYER/STAFF/LAW_FIRM_ADMIN only,
// CLIENT is never authorized here even though clients can view the same
// case's documents elsewhere.
router.use(authorize("LAWYER", "STAFF", "LAW_FIRM_ADMIN"));

router.post("/case/:caseId", caseNoteController.create);
router.get("/case/:caseId", caseNoteController.list);
router.delete("/:id", caseNoteController.remove);

export default router;
