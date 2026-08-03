import { Router } from "express";
import { subscriptionController } from "../controller/subscription.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate);

// Plans — anyone authenticated can view the list (so a firm admin can see what's available)
router.get("/plans", subscriptionController.listPlans);
router.post("/plans", authorize("COMPANY"), subscriptionController.createPlan);
router.patch("/plans/:id", authorize("COMPANY"), subscriptionController.updatePlan);

// Firm's own subscription (any firm-side account can view their own firm's plan)
router.get("/my-firm", authorize("LAW_FIRM_ADMIN", "LAWYER", "STAFF"), subscriptionController.myFirmSubscription);

// Company manages all firm subscriptions
router.get("/", authorize("COMPANY"), subscriptionController.listSubscriptions);
router.post("/assign", authorize("COMPANY"), subscriptionController.assignPlan);
router.patch("/:lawFirmId/status", authorize("COMPANY"), subscriptionController.updateStatus);

export default router;
