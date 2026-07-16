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
import reportRoutes from "./modules/report/routes/report.routes";
import notificationRoutes from "./modules/notification/routes/notification.routes";
import auditLogRoutes from "./modules/audit-log/routes/audit-log.routes";
import libraryRoutes from "./modules/library/routes/library.routes";
import companyStaffRoutes from "./modules/company-staff/routes/company-staff.routes";
import pushRoutes from "./modules/push/routes/push.routes";

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
router.use("/reports", reportRoutes);
router.use("/notifications", notificationRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use("/library", libraryRoutes);
router.use("/company-staff", companyStaffRoutes);
router.use("/push", pushRoutes);

export default router;
