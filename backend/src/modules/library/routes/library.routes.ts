import { Router, Request, Response, NextFunction } from "express";
import { libraryController } from "../controller/library.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { requirePermission } from "../../../common/middleware/requirePermission";
import { libraryUpload, mapMulterError } from "../../../common/middleware/upload";

const router = Router();

// Read access: any authenticated user — lawyers, staff, and (later) students/clients
// can search and read the library, but never modify it.
router.get("/", authenticate, libraryController.list);
router.get("/categories", authenticate, libraryController.listCategories);
router.get("/:id", authenticate, libraryController.getById);
router.get("/:id/download", authenticate, libraryController.download);

// Write access: only TrailBlaze Tech (Company) manages the legal library.
const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  libraryUpload.single("file")(req, res, (err) => {
    if (err) return next(mapMulterError(err));
    next();
  });
};

router.post("/", authenticate, authorize("COMPANY"), requirePermission("library.manage"), uploadMiddleware, libraryController.create);
router.patch("/:id", authenticate, authorize("COMPANY"), requirePermission("library.manage"), uploadMiddleware, libraryController.update);
router.delete("/:id", authenticate, authorize("COMPANY"), requirePermission("library.manage"), libraryController.remove);

// Institution's own staff — a simpler, text-only path (no PDF upload) so
// an institute can publish their own notes/materials without needing
// TrailBlaze's document-management tooling. Scoped to their own tenant
// automatically (see controller).
router.post(
  "/institution",
  authenticate,
  authorize("LAW_FIRM_ADMIN"),
  uploadMiddleware,
  libraryController.createInstitutionResource
);

export default router;
