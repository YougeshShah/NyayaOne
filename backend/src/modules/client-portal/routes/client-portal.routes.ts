import { Router, Request, Response, NextFunction } from "express";
import { clientPortalController } from "../controller/client-portal.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { documentUpload, mapMulterError } from "../../../common/middleware/upload";

const router = Router();

router.use(authenticate, authorize("CLIENT"));

router.get("/cases", clientPortalController.myCases);
router.get("/cases/:id", clientPortalController.myCaseById);
router.get("/hearings", clientPortalController.myHearings);
router.get("/documents", clientPortalController.myDocuments);
router.get("/documents/:id/download", clientPortalController.downloadMyDocument);
router.post("/documents", (req: Request, res: Response, next: NextFunction) => {
  documentUpload.single("file")(req, res, (err) => {
    if (err) return next(mapMulterError(err));
    next();
  });
}, clientPortalController.uploadDocument);

export default router;
