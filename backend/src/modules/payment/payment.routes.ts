import { Router, Request, Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import axios from "axios";
import { prisma } from "../../database/prisma";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { AppError } from "../../common/errors/AppError";
import { courseService } from "../course/service/course.service";

const router = Router();

// Sandbox by default — swap for production URLs once real merchant
// credentials are approved (see .env.prod.example).
const ESEWA_PAYMENT_URL = process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_STATUS_URL = process.env.ESEWA_STATUS_URL || "https://rc.esewa.com.np/api/epay/transaction/status/";
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || "EPAYTEST"; // EPAYTEST = eSewa's public sandbox code
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;

const KHALTI_INITIATE_URL = process.env.KHALTI_INITIATE_URL || "https://dev.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL = process.env.KHALTI_LOOKUP_URL || "https://dev.khalti.com/api/v2/epayment/lookup/";
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

const FRONTEND_URL = process.env.STUDENT_WEB_URL || "http://localhost:5173";

router.use(authenticate);

// ------------------------------------------------------------
// eSewa — ePay v2. Client POSTs a signed HTML form directly to eSewa;
// this endpoint just prepares the signed fields for that form.
// ------------------------------------------------------------

const initiateSchema = z.object({
  courseId: z.string().uuid(),
  amount: z.number().positive(), // in NPR
});

function esewaSignature(totalAmount: number, transactionUuid: string, productCode: string): string {
  if (!ESEWA_SECRET_KEY) throw AppError.badRequest("eSewa is not configured yet — ESEWA_SECRET_KEY is missing.");
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto.createHmac("sha256", ESEWA_SECRET_KEY).update(message).digest("base64");
}

router.post("/esewa/initiate", authorize("STUDENT"), async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  const input = initiateSchema.parse(req.body);

  const transactionUuid = `nyayaone-${Date.now()}-${req.auth.userId.slice(0, 8)}`;
  const signature = esewaSignature(input.amount, transactionUuid, ESEWA_MERCHANT_ID);

  // Record the pending transaction so the callback can look up which
  // course/student it belongs to (eSewa's callback only echoes back what we
  // send it, so we need our own record to act on afterward).
  await prisma.paymentTransaction.create({
    data: {
      studentId: req.auth.userId,
      courseId: input.courseId,
      gateway: "ESEWA",
      transactionUuid,
      amount: input.amount,
      status: "PENDING",
    },
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
        success_url: `${FRONTEND_URL}/payment/esewa/success`,
        failure_url: `${FRONTEND_URL}/payment/esewa/failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      },
    },
  });
});

// eSewa redirects the browser back with a base64-encoded JSON blob in
// `data` — the frontend forwards it here to verify and grant access.
router.post("/esewa/verify", authorize("STUDENT"), async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  const { data } = z.object({ data: z.string() }).parse(req.body);

  const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
  const { transaction_uuid, total_amount, status } = decoded;

  const transaction = await prisma.paymentTransaction.findUnique({ where: { transactionUuid: transaction_uuid } });
  if (!transaction) throw AppError.notFound("Transaction not found");
  if (transaction.studentId !== req.auth.userId) throw AppError.forbidden("Not your transaction");

  if (status !== "COMPLETE") {
    await prisma.paymentTransaction.update({ where: { id: transaction.id }, data: { status: "FAILED" } });
    throw AppError.badRequest("Payment was not completed");
  }

  // Defense in depth — confirm with eSewa's own status API rather than
  // trusting the redirect payload alone (which a user's browser could tamper with).
  const statusCheck = await axios.get(ESEWA_STATUS_URL, {
    params: { product_code: ESEWA_MERCHANT_ID, total_amount, transaction_uuid },
  });
  if (statusCheck.data?.status !== "COMPLETE") {
    throw AppError.badRequest("Payment could not be verified with eSewa");
  }

  await prisma.paymentTransaction.update({ where: { id: transaction.id }, data: { status: "COMPLETED" } });
  await courseService.grantSubscription(transaction.studentId, transaction.courseId);

  res.status(200).json({ success: true, message: "Payment verified — subscription activated." });
});

// ------------------------------------------------------------
// Khalti — ePayment v2 (KPG v2). Server-initiated, returns a hosted
// payment_url to redirect the student to.
// ------------------------------------------------------------

router.post("/khalti/initiate", authorize("STUDENT"), async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  if (!KHALTI_SECRET_KEY) throw AppError.badRequest("Khalti is not configured yet — KHALTI_SECRET_KEY is missing.");
  const input = initiateSchema.parse(req.body);

  const student = await prisma.user.findUnique({ where: { id: req.auth.userId } });
  const purchaseOrderId = `nyayaone-${Date.now()}-${req.auth.userId.slice(0, 8)}`;

  const khaltiResponse = await axios.post(
    KHALTI_INITIATE_URL,
    {
      return_url: `${FRONTEND_URL}/payment/khalti/callback`,
      website_url: FRONTEND_URL,
      amount: Math.round(input.amount * 100), // Khalti wants paisa
      purchase_order_id: purchaseOrderId,
      purchase_order_name: "NyayaOne Course Subscription",
      customer_info: { name: student?.fullName ?? "Student", email: student?.email },
    },
    { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` } }
  );

  await prisma.paymentTransaction.create({
    data: {
      studentId: req.auth.userId,
      courseId: input.courseId,
      gateway: "KHALTI",
      transactionUuid: purchaseOrderId,
      khaltiPidx: khaltiResponse.data.pidx,
      amount: input.amount,
      status: "PENDING",
    },
  });

  res.status(200).json({ success: true, data: { paymentUrl: khaltiResponse.data.payment_url } });
});

router.post("/khalti/verify", authorize("STUDENT"), async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  if (!KHALTI_SECRET_KEY) throw AppError.badRequest("Khalti is not configured yet.");
  const { pidx } = z.object({ pidx: z.string() }).parse(req.body);

  const transaction = await prisma.paymentTransaction.findFirst({ where: { khaltiPidx: pidx } });
  if (!transaction) throw AppError.notFound("Transaction not found");
  if (transaction.studentId !== req.auth.userId) throw AppError.forbidden("Not your transaction");

  const lookup = await axios.post(
    KHALTI_LOOKUP_URL,
    { pidx },
    { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` } }
  );

  if (lookup.data.status !== "Completed") {
    await prisma.paymentTransaction.update({ where: { id: transaction.id }, data: { status: "FAILED" } });
    throw AppError.badRequest(`Payment not completed (status: ${lookup.data.status})`);
  }

  await prisma.paymentTransaction.update({ where: { id: transaction.id }, data: { status: "COMPLETED" } });
  await courseService.grantSubscription(transaction.studentId, transaction.courseId);

  res.status(200).json({ success: true, message: "Payment verified — subscription activated." });
});

// Company oversight — all transactions across all students/courses.
router.get("/transactions", authorize("COMPANY"), async (req: Request, res: Response) => {
  const { status, gateway, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const where: any = {
    ...(status ? { status } : {}),
    ...(gateway ? { gateway } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.paymentTransaction.findMany({
      where,
      include: { student: { select: { fullName: true, email: true } }, course: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.paymentTransaction.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: { items, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } },
  });
});

export default router;
