import { Router } from "express";
import { aiAssistantController } from "../controller/ai-assistant.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { requireAiAssistantAccess } from "../middleware/require-ai-assistant-access";

const router = Router();
router.use(authenticate);
router.use(requireAiAssistantAccess);

router.post("/ask", aiAssistantController.ask);

export default router;
