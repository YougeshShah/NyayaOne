import { Router, Request, Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import axios from "axios";
import { prisma } from "../../database/prisma";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { AppError } from "../../common/errors/AppError";
import { voucherUpload, mapMulterError } from "../../common/middleware/upload";

const router = Router();

const ESEWA_PAYMENT_URL = process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_STATUS_URL = process.env.ESEWA_STATUS_URL || "https://rc.esewa.com.np/api/epay/transaction/status/";
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;

const KHALTI_INITIATE_URL = process.env.KHALTI_INITIATE_URL || "https://dev.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL = process.env.KHALTI_LOOKUP_URL || "https://dev.khalti.com/api/v2/epayment/lookup/";
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

const FRONTEND_URL = process.env.PORTAL_WEB_URL || "https://portal.technocraftx.com";

router.use(authenticate);

async function activateFirmSubscription(lawFirmId: string, planId: string) {
  await prisma.firmSubscription.upsert({
    where: { lawFirmId },
    create: { lawFirmId, planId, status: "ACTIVE" },
    update: { planId, status: "ACTIVE" },
  });
}

function esewaSignature(totalAmount: number, transactionUuid: string, productCode: string): string {
  if (!ESEWA_SECRET_KEY) throw AppError.badRequest("eSewa is not configured yet.");
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto.createHmac("sha256", ESEWA_SECRET_KEY).update(message).digest("base64");
}

const initiateSchema = z.object({ planId: z.string().uuid(), amount: z.number().positive() });

router.post("/esewa/initiate", authorize("LAW_FIRM_ADMIN"), async (req: Request, res: Response) => {
  const lawFirmId = req.auth!.lawFirmId!;
  const input = initiateSchema.parse(req.body);
  const transactionUuid = `nyayaone-firm-${Date.now()}-${lawFirmId.slice(0, 8)}`;
  const signature = esewaSignature(input.amount, transactionUuid, ESEWA_MERCHANT_ID);

  await prisma.firmPaymentTransaction.create({
    data: { lawFirmId, planId: input.planId, gateway: "ESEWA", transactionUuid, amount: input.amount, status: "PENDING" },
  });

  res.status(200).json({
    success: true,
    data: {
      formUrl: ESEWA_PAYMENT_URL,
      fields: {
        amount: input.amount,
        tax_amount: 0,
        total_amount: input.amount,
        transaction_uuid: transactionUuid,
        product_code: ESEWA_MERCHANT_ID,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${FRONTEND_URL}/subscription/esewa/success`,
        failure_url: `${FRONTEND_URL}/subscription/esewa/failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      },
    },
  });
});

router.post("/esewa/verify", authorize("LAW_FIRM_ADMIN"), async (req: Request, res: Response) => {
  const lawFirmId = req.auth!.lawFirmId!;
  const { data } = z.object({ data: z.string() }).parse(req.body);
  const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
  const { transaction_uuid, total_amount, status } = decoded;

  const transaction = await prisma.firmPaymentTransaction.findUnique({ where: { transactionUuid: transaction_uuid } });
  if (!transaction || transaction.lawFirmId !== lawFirmId) throw AppError.notFound("Transaction not found");
  if (status !== "COMPLETE") {
    await prisma.firmPaymentTransaction.update({ where: { id: transaction.id }, data: { status: "FAILED" } });
    throw AppError.badRequest("Payment was not completed");
  }

  const statusCheck = await axios.get(ESEWA_STATUS_URL, { params: { product_code: ESEWA_MERCHANT_ID, total_amount, transaction_uuid } });
  if (statusCheck.data?.status !== "COMPLETE") throw AppError.badRequest("Payment could not be verified with eSewa");

  await prisma.firmPaymentTransaction.update({ where: { id: transaction.id }, data: { status: "COMPLETED" } });
  await activateFirmSubscription(transaction.lawFirmId, transaction.planId);
  res.status(200).json({ success: true, message: "Payment verified — subscription activated." });
});

router.post("/khalti/initiate", authorize("LAW_FIRM_ADMIN"), async (req: Request, res: Response) => {
  if (!KHALTI_SECRET_KEY) throw AppError.badRequest("Khalti is not configured yet.");
  const lawFirmId = req.auth!.lawFirmId!;
  const input = initiateSchema.parse(req.body);
  const firm = await prisma.lawFirm.findUnique({ where: { id: lawFirmId } });
  const purchaseOrderId = `nyayaone-firm-${Date.now()}-${lawFirmId.slice(0, 8)}`;

  const khaltiResponse = await axios.post(
    KHALTI_INITIATE_URL,
    {
      return_url: `${FRONTEND_URL}/subscription/khalti/callback`,
      website_url: FRONTEND_URL,
      amount: Math.round(input.amount * 100),
      purchase_order_id: purchaseOrderId,
      purchase_order_name: "NyayaOne Firm Subscription",
      customer_info: { name: firm?.name ?? "Firm", email: firm?.email },
    },
    { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` } }
  );

  await prisma.firmPaymentTransaction.create({
    data: { lawFirmId, planId: input.planId, gateway: "KHALTI", transactionUuid: purchaseOrderId, khaltiPidx: khaltiResponse.data.pidx, amount: input.amount, status: "PENDING" },
  });

  res.status(200).json({ success: true, data: { paymentUrl: khaltiResponse.data.payment_url } });
});

router.post("/khalti/verify", authorize("LAW_FIRM_ADMIN"), async (req: Request, res: Response) => {
  if (!KHALTI_SECRET_KEY) throw AppError.badRequest("Khalti is not configured yet.");
  const lawFirmId = req.auth!.lawFirmId!;
  const { pidx } = z.object({ pidx: z.string() }).parse(req.body);

  const transaction = await prisma.firmPaymentTransaction.findFirst({ where: { khaltiPidx: pidx } });
  if (!transaction || transaction.lawFirmId !== lawFirmId) throw AppError.notFound("Transaction not found");

  const lookup = await axios.post(KHALTI_LOOKUP_URL, { pidx }, { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` } });
  if (lookup.data.status !== "Completed") {
    await prisma.firmPaymentTransaction.update({ where: { id: transaction.id }, data: { status: "FAILED" } });
    throw AppError.badRequest(`Payment not completed (status: ${lookup.data.status})`);
  }

  await prisma.firmPaymentTransaction.update({ where: { id: transaction.id }, data: { status: "COMPLETED" } });
  await activateFirmSubscription(transaction.lawFirmId, transaction.planId);
  res.status(200).json({ success: true, message: "Payment verified — subscription activated." });
});

// Manual voucher upload — pending Company approval, same pattern as student payment-vouchers.
router.post(
  "/voucher",
  authorize("LAW_FIRM_ADMIN"),
  (req, res, next) => {
    voucherUpload.single("file")(req, res, (err) => {
      if (err) return next(mapMulterError(err));
      next();
    });
  },
  async (req: Request, res: Response) => {
    const lawFirmId = req.auth!.lawFirmId!;
    const { planId, amount } = z.object({ planId: z.string().uuid(), amount: z.coerce.number().positive() }).parse(req.body);
    if (!req.file) throw AppError.badRequest("Voucher file is required");
    const fileUrl = `/uploads/vouchers/${req.file.filename}`;
    const transactionUuid = `nyayaone-firm-voucher-${Date.now()}-${lawFirmId.slice(0, 8)}`;
    const transaction = await prisma.firmPaymentTransaction.create({
      data: { lawFirmId, planId, gateway: "MANUAL", transactionUuid, amount, status: "PENDING", voucherFileUrl: fileUrl },
    });
    res.status(201).json({ success: true, data: transaction });
  }
);

router.get("/plans", async (req: Request, res: Response) => {
  const lawFirmId = req.auth!.lawFirmId!;
  const firm = await prisma.lawFirm.findUnique({ where: { id: lawFirmId }, select: { tenantType: true } });
  // Plans with tenantType: null are shared/available to everyone; otherwise
  // only show plans built for this org's own type (Law Firm sees Law Firm
  // plans, Institution sees Institution plans, never the other's).
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true, OR: [{ tenantType: null }, { tenantType: firm?.tenantType }] },
    orderBy: { priceMonthly: "asc" },
  });
  res.status(200).json({ success: true, data: plans });
});

router.get("/my-transactions", authorize("LAW_FIRM_ADMIN"), async (req: Request, res: Response) => {
  const lawFirmId = req.auth!.lawFirmId!;
  const transactions = await prisma.firmPaymentTransaction.findMany({
    where: { lawFirmId },
    include: { plan: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ success: true, data: transactions });
});

// Company oversight -- approve/reject a firm's manually-uploaded voucher.
router.get("/pending-vouchers", authorize("COMPANY"), async (req: Request, res: Response) => {
  const transactions = await prisma.firmPaymentTransaction.findMany({
    where: { gateway: "MANUAL", status: "PENDING" },
    include: { lawFirm: { select: { name: true } }, plan: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  res.status(200).json({ success: true, data: transactions });
});

router.patch("/vouchers/:id/review", authorize("COMPANY"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approve } = z.object({ approve: z.boolean() }).parse(req.body);
  const transaction = await prisma.firmPaymentTransaction.findUnique({ where: { id } });
  if (!transaction) throw AppError.notFound("Transaction not found");

  await prisma.firmPaymentTransaction.update({
    where: { id },
    data: { status: approve ? "COMPLETED" : "FAILED", reviewedBy: req.auth!.userId },
  });
  if (approve) await activateFirmSubscription(transaction.lawFirmId, transaction.planId);
  res.status(200).json({ success: true, message: approve ? "Voucher approved — subscription activated." : "Voucher rejected." });
});

export default router;
