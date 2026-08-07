import { Router } from "express";
import { authController } from "../controller/auth.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { avatarUpload, mapMulterError } from "../../../common/middleware/upload";
import { Request, Response, NextFunction } from "express";

const router = Router();

// Public routes
router.post("/register/law-firm", authController.registerLawFirm);
router.post("/register/student", authController.registerStudent);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Authenticated
router.patch("/change-password", authenticate, authController.changePassword);
router.patch("/me", authenticate, authController.updateMyProfile);

// Institution (Education tenant) admin adds their own students directly.
router.post("/institution-students", authenticate, authorize("LAW_FIRM_ADMIN"), authController.addInstitutionStudent);
router.get("/institution-students", authenticate, authorize("LAW_FIRM_ADMIN"), authController.listInstitutionStudents);

const avatarMiddleware = (req: Request, res: Response, next: NextFunction) => {
  avatarUpload.single("avatar")(req, res, (err) => {
    if (err) return next(mapMulterError(err));
    next();
  });
};
router.post("/me/avatar", authenticate, avatarMiddleware, authController.uploadAvatar);

export default router;
