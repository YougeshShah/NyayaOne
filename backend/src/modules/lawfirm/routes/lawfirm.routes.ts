import { Router } from "express";
import { lawFirmController } from "../controller/lawfirm.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { requirePermission } from "../../../common/middleware/requirePermission";

const router = Router();

// All law firm management routes are restricted to COMPANY (TrailBlaze Tech) accounts.
router.use(authenticate, authorize("COMPANY"));

router.get("/", lawFirmController.list);
router.post("/", requirePermission("lawfirm.approve"), lawFirmController.create);
router.get("/:id", lawFirmController.getById);
router.patch("/:id/approve", requirePermission("lawfirm.approve"), lawFirmController.approve);
router.patch("/:id/suspend", requirePermission("lawfirm.suspend"), lawFirmController.suspend);
router.patch("/:id/activate", requirePermission("lawfirm.approve"), lawFirmController.activate);
router.patch("/:id/reject", requirePermission("lawfirm.approve"), lawFirmController.reject);

export default router;
