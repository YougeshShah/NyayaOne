import { Router } from "express";
import { clientController } from "../controller/client.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

// Any firm-side account can view/manage clients within their own firm.
router.use(authenticate, authorize("LAW_FIRM_ADMIN", "LAWYER", "STAFF"));

router.get("/", clientController.list);
router.get("/:id", clientController.getById);
router.post("/", clientController.create);
router.patch("/:id", clientController.update);

export default router;
