import { Router } from "express";
import { documentTemplateController } from "../controller/document-template.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate);

// Read access: any authenticated firm-side user can browse templates and see the placeholder guide.
router.get("/", documentTemplateController.list);
router.get("/placeholders", documentTemplateController.placeholders);
router.get("/:id", documentTemplateController.getById);

// Write access: only Company manages the master template library.
router.post("/", authorize("COMPANY"), documentTemplateController.create);
router.patch("/:id", authorize("COMPANY"), documentTemplateController.update);

// Generate: any firm-side account fills a template with their own case's data.
router.post("/generate", authorize("LAW_FIRM_ADMIN", "LAWYER", "STAFF"), documentTemplateController.generate);

export default router;
