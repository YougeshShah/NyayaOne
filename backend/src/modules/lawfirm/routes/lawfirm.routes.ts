import { Router } from "express";
import { lawFirmController } from "../controller/lawfirm.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { requirePermission } from "../../../common/middleware/requirePermission";

const router = Router();

// Public — no login required. Lets the student registration page show a
// "which institution?" picker before an account even exists. Only
// EDUCATION-type, ACTIVE institutions with a slug set are eligible.
router.get("/public", lawFirmController.listPublic);

// All law firm management routes are restricted to COMPANY (Technocraftx) accounts.
router.use(authenticate, authorize("COMPANY"));

router.get("/", lawFirmController.list);
router.post("/", requirePermission("lawfirm.approve"), lawFirmController.create);
router.get("/:id", lawFirmController.getById);
router.patch("/:id/approve", requirePermission("lawfirm.approve"), lawFirmController.approve);
router.patch("/:id/suspend", requirePermission("lawfirm.suspend"), lawFirmController.suspend);
router.patch("/:id/activate", requirePermission("lawfirm.approve"), lawFirmController.activate);
router.patch("/:id/reject", requirePermission("lawfirm.approve"), lawFirmController.reject);
router.patch("/:id/modules", requirePermission("lawfirm.approve"), lawFirmController.updateModules);
router.delete("/:id", requirePermission("lawfirm.delete"), lawFirmController.remove);

export default router;
