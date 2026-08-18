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
// JSON list variants for the "View List" preview -- same data, same filters, no file generation.
router.get("/cases/list", reportController.casesListJson);
router.get("/hearings/list", reportController.hearingsListJson);
router.get("/clients/list", reportController.clientsListJson);

export default router;
