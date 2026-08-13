import { Router } from "express";
import { userController } from "../controller/user.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { requirePermission } from "../../../common/middleware/requirePermission";

const router = Router();

// Company staff can reset ANY user's password — institution staff, law
// firm staff, students — across every organization. Registered before the
// LAW_FIRM_ADMIN-wide gate below since it needs a different authorization.
router.patch(
  "/company/:id/reset-password",
  authenticate,
  authorize("COMPANY"),
  requirePermission("user.manage"),
  userController.resetPasswordAsCompany
);
router.patch(
  "/company/:id/contact",
  authenticate,
  authorize("COMPANY"),
  requirePermission("user.manage"),
  userController.updateContactAsCompany
);
router.get("/company/search", authenticate, authorize("COMPANY"), requirePermission("user.manage"), userController.searchAsCompany);

// Only a Law Firm Admin manages lawyers/staff within their own firm.
router.use(authenticate, authorize("LAW_FIRM_ADMIN"));

router.get("/", userController.list);
router.get("/:id", userController.getById);
router.post("/", userController.create);
router.patch("/:id", userController.update);
router.patch("/:id/status", userController.updateStatus);
router.patch("/:id/reset-password", userController.resetPassword);

export default router;
