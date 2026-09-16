import { Router } from "express";
import { ukPrecedentController } from "../controller/uk-precedent.controller";
import { authenticate } from "../../../common/middleware/authenticate";

const router = Router();
router.use(authenticate);

router.get("/search", ukPrecedentController.search);

export default router;
