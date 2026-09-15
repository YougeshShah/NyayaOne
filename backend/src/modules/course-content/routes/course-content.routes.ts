import { Router } from "express";
import { courseContentController } from "../controller/course-content.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { courseContentUpload, mapMulterError } from "../../../common/middleware/upload";

const router = Router();
router.use(authenticate);

router.post(
  "/",
  authorize("COMPANY", "LAW_FIRM_ADMIN"),
  (req, res, next) => {
    courseContentUpload.single("file")(req, res, (err) => {
      if (err) return next(mapMulterError(err));
      next();
    });
  },
  courseContentController.create
);

router.get("/course/:courseId/student", authorize("STUDENT"), courseContentController.forStudent);
router.get("/:id/file", authorize("STUDENT"), courseContentController.viewFile);
router.get("/course/:courseId/admin", authorize("COMPANY", "LAW_FIRM_ADMIN"), courseContentController.forAdmin);
router.patch("/:id", authorize("COMPANY", "LAW_FIRM_ADMIN"), courseContentController.update);
router.delete("/:id", authorize("COMPANY", "LAW_FIRM_ADMIN"), courseContentController.remove);

export default router;
