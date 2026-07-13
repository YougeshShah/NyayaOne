import { Router } from "express";
import { lawFirmController } from "../controller/lawfirm.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

// All law firm management routes are restricted to COMPANY (TrailBlaze Tech) accounts.
router.use(authenticate, authorize("COMPANY"));

router.get("/", lawFirmController.list);
router.get("/:id", lawFirmController.getById);
router.patch("/:id/approve", lawFirmController.approve);
router.patch("/:id/suspend", lawFirmController.suspend);
router.patch("/:id/activate", lawFirmController.activate);
router.patch("/:id/reject", lawFirmController.reject);

export default router;
