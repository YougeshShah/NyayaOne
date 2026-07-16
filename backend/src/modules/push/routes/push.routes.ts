import { Router } from "express";
import { pushController } from "../controller/push.controller";
import { authenticate } from "../../../common/middleware/authenticate";

const router = Router();

router.post("/register", authenticate, pushController.register);
router.post("/unregister", authenticate, pushController.unregister);
router.post("/test", authenticate, pushController.sendTest); // send a test push to yourself, for verifying setup

export default router;
