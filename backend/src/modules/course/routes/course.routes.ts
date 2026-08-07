import { Router } from "express";
import { courseController } from "../controller/course.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";

const router = Router();

router.use(authenticate);

router.get("/", courseController.list);
router.get("/my-subscriptions", authorize("STUDENT"), courseController.mySubscriptions);
router.get("/students/search", authorize("COMPANY"), courseController.searchStudents);
router.get("/:id", courseController.getById);

router.post("/", authorize("COMPANY"), courseController.create);
router.patch("/:id", authorize("COMPANY"), courseController.update);

// Demo-mode manual grant — until a real payment gateway is wired, Company
// can activate a student's access by hand (e.g. after receiving payment via
// bank transfer/eSewa manually).
router.post("/:id/grant-subscription", authorize("COMPANY"), courseController.grantSubscription);

export default router;
