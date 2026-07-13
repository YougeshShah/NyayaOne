import { Router } from "express";
import { userController } from "../controller/user.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

// Only a Law Firm Admin manages lawyers/staff within their own firm.
router.use(authenticate, authorize("LAW_FIRM_ADMIN"));

router.get("/", userController.list);
router.get("/:id", userController.getById);
router.post("/", userController.create);
router.patch("/:id", userController.update);
router.patch("/:id/status", userController.updateStatus);

export default router;
