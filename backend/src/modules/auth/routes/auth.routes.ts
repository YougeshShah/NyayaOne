import { Router } from "express";
import { authController } from "../controller/auth.controller";
import { authenticate } from "../../../common/middleware/authenticate";

const router = Router();

// Public routes
router.post("/register/law-firm", authController.registerLawFirm);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Authenticated
router.patch("/change-password", authenticate, authController.changePassword);

export default router;
