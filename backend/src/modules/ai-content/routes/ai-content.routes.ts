import { Router } from "express";
import { aiContentController } from "../controller/ai-content.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { requireAiAssistantAccess } from "../../ai-assistant/middleware/require-ai-assistant-access";

const router = Router();
router.use(authenticate);
// Shares the same module toggle + Free-tier gate as the AI Legal
// Assistant -- both are "AI" advance features under one Company switch,
// rather than adding a second toggle for a very similar capability.
router.use(requireAiAssistantAccess);

router.post("/generate", aiContentController.generate);

export default router;
