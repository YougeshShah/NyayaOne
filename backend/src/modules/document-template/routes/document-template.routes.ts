import { Router } from "express";
import { documentTemplateController } from "../controller/document-template.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate);

router.get("/", documentTemplateController.list);
router.get("/autofill-sources", documentTemplateController.autofillSources);
router.get("/:id", documentTemplateController.getById);

router.post("/", authorize("COMPANY"), documentTemplateController.create);
router.patch("/:id", authorize("COMPANY"), documentTemplateController.update);
router.post("/analyze-sample", authorize("COMPANY"), documentTemplateController.analyzeSample);

router.post("/generate", authorize("LAW_FIRM_ADMIN", "LAWYER", "STAFF"), documentTemplateController.generate);

export default router;
