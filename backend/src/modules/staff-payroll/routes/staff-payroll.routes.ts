import { Router } from "express";
import { staffPayrollController } from "../controller/staff-payroll.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { requireTenantPermission } from "../../../common/middleware/requireTenantPermission";

const router = Router();
router.use(authenticate, authorize("LAW_FIRM_ADMIN", "LAWYER", "STAFF"), requireTenantPermission("accounting.manage"));

router.get("/search-staff", staffPayrollController.searchStaff);
router.put("/salary", staffPayrollController.setSalary);
router.get("/salary", staffPayrollController.listSalaries);
router.post("/payment", staffPayrollController.recordPayment);
router.get("/payments", staffPayrollController.listPayments);
router.get("/payments/export", staffPayrollController.exportPayments);

export default router;
