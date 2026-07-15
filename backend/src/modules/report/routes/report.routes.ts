import { Router } from "express";
import { reportController } from "../controller/report.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate, authorize("LAW_FIRM_ADMIN", "LAWYER", "STAFF"));

// ?format=excel|pdf (default excel). Cases also accepts ?status=OPEN etc.
router.get("/cases", reportController.cases);
router.get("/hearings", reportController.hearings);
router.get("/clients", reportController.clients);

export default router;
