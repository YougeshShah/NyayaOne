import { Router } from "express";
import { paymentVoucherController } from "../controller/payment-voucher.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { voucherUpload, mapMulterError } from "../../../common/middleware/upload";

const router = Router();
router.use(authenticate);

router.post(
  "/",
  authorize("STUDENT"),
  (req, res, next) => {
    voucherUpload.single("file")(req, res, (err) => {
      if (err) return next(mapMulterError(err));
      next();
    });
  },
  paymentVoucherController.upload
);

router.get("/my", authorize("STUDENT"), paymentVoucherController.myVouchers);
router.get("/:id/file", paymentVoucherController.viewFile);
router.get("/pending", authorize("LAW_FIRM_ADMIN"), paymentVoucherController.pending);
router.patch("/:id/review", authorize("LAW_FIRM_ADMIN"), paymentVoucherController.review);

export default router;
