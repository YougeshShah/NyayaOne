import { Router } from "express";
import authRoutes from "./modules/auth/routes/auth.routes";
import lawFirmRoutes from "./modules/lawfirm/routes/lawfirm.routes";
import courtRoutes from "./modules/court/routes/court.routes";
import userRoutes from "./modules/user/routes/user.routes";
import clientRoutes from "./modules/client/routes/client.routes";
import caseRoutes from "./modules/case/routes/case.routes";
import hearingRoutes from "./modules/hearing/routes/hearing.routes";
import documentRoutes from "./modules/document/routes/document.routes";
import clientPortalRoutes from "./modules/client-portal/routes/client-portal.routes";

const router = Router();

// Health check (no auth required) — useful for Docker/uptime checks later
router.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "NyayaOne API is running", timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/law-firms", lawFirmRoutes);
router.use("/courts", courtRoutes);
router.use("/users", userRoutes);
router.use("/clients", clientRoutes);
router.use("/cases", caseRoutes);
router.use("/hearings", hearingRoutes);
router.use("/documents", documentRoutes);
router.use("/client-portal", clientPortalRoutes);

// Future modules will be mounted here as they are built:
// router.use("/notifications", notificationRoutes);

export default router;
