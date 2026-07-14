import { Router } from "express";
import { clientPortalController } from "../controller/client-portal.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate, authorize("CLIENT"));

router.get("/cases", clientPortalController.myCases);
router.get("/cases/:id", clientPortalController.myCaseById);
router.get("/hearings", clientPortalController.myHearings);
router.get("/documents", clientPortalController.myDocuments);
router.get("/documents/:id/download", clientPortalController.downloadMyDocument);

export default router;
