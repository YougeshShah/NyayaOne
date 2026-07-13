import { Router } from "express";
import { courtController } from "../controller/court.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

// Read access: any authenticated user (lawyers/staff need to select a court when creating a case).
router.get("/", authenticate, courtController.list);
router.get("/types", authenticate, courtController.listTypes);
router.get("/provinces", authenticate, courtController.listProvinces);
router.get("/:id", authenticate, courtController.getById);

// Write access: only TrailBlaze Tech (Company) manages the master court list.
router.post("/", authenticate, authorize("COMPANY"), courtController.create);
router.patch("/:id", authenticate, authorize("COMPANY"), courtController.update);
router.patch("/:id/deactivate", authenticate, authorize("COMPANY"), courtController.deactivate);
router.patch("/:id/activate", authenticate, authorize("COMPANY"), courtController.activate);

export default router;
