import { Router, Request, Response, NextFunction } from "express";
import { documentController } from "../controller/document.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { documentUpload, mapMulterError } from "../../../common/middleware/upload";
import { requireTenantPermission } from "../../../common/middleware/requireTenantPermission";

const router = Router();

router.use(authenticate, authorize("LAW_FIRM_ADMIN", "LAWYER", "STAFF"));

router.get("/", documentController.list);
router.get("/:id", documentController.getById);
router.get("/:id/download", documentController.download);

// Wrap multer so its errors (file too large, bad type) flow through our
// standard error handler instead of crashing with an unhandled exception.
router.post("/", requireTenantPermission("document.manage"), (req: Request, res: Response, next: NextFunction) => {
  documentUpload.single("file")(req, res, (err) => {
    if (err) return next(mapMulterError(err));
    next();
  });
}, documentController.upload);

router.delete("/:id", requireTenantPermission("document.manage"), documentController.remove);
router.patch("/:id/visibility", requireTenantPermission("document.manage"), documentController.toggleClientVisibility);

export default router;
