import { Router, Request, Response, NextFunction } from "express";
import { libraryController } from "../controller/library.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
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

router.post("/", authenticate, authorize("COMPANY"), uploadMiddleware, libraryController.create);
router.patch("/:id", authenticate, authorize("COMPANY"), uploadMiddleware, libraryController.update);
router.delete("/:id", authenticate, authorize("COMPANY"), libraryController.remove);

export default router;
