import { Router } from "express";
import { authController } from "../controller/auth.controller";

const router = Router();

// Public routes
router.post("/register/law-firm", authController.registerLawFirm);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;
