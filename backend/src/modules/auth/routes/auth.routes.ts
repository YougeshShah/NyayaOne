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
router.get("/me", authenticate, authController.getMe);
router.patch("/me", authenticate, authController.updateMyProfile);

// Institution (Education tenant) admin adds their own students directly.
router.post("/institution-students", authenticate, authorize("LAW_FIRM_ADMIN"), authController.addInstitutionStudent);
router.get("/institution-students", authenticate, authorize("LAW_FIRM_ADMIN"), authController.listInstitutionStudents);
router.get("/institution-analytics", authenticate, authorize("LAW_FIRM_ADMIN"), authController.institutionAnalytics);
router.patch("/institution-students/:id", authenticate, authorize("LAW_FIRM_ADMIN"), authController.updateInstitutionStudent);
router.delete("/institution-students/:id", authenticate, authorize("LAW_FIRM_ADMIN"), authController.removeInstitutionStudent);

// Public — no login required, since the whole point is the person can't
// log in. No email service is configured yet, so this just queues a
// request an admin can see and act on manually (see resolvePasswordResetRequest).
router.post("/request-password-reset", authController.requestPasswordReset);

// Admin-facing — Company sees every request; institution/law firm admins
// see only requests matching an email in their own organization.
router.get("/password-reset-requests", authenticate, authorize("COMPANY", "LAW_FIRM_ADMIN"), authController.listPasswordResetRequests);
router.patch("/password-reset-requests/:id/resolve", authenticate, authorize("COMPANY", "LAW_FIRM_ADMIN"), authController.resolvePasswordResetRequest);

const avatarMiddleware = (req: Request, res: Response, next: NextFunction) => {
  avatarUpload.single("avatar")(req, res, (err) => {
    if (err) return next(mapMulterError(err));
    next();
  });
};
router.post("/me/avatar", authenticate, avatarMiddleware, authController.uploadAvatar);
router.delete("/me", authenticate, authController.deleteMyAccount);
router.patch("/me/notifications", authenticate, authController.toggleNotifications);

export default router;
