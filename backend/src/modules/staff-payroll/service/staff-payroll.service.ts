import ExcelJS from "exceljs";
import { prisma } from "../../../database/prisma";
import { AppError } from "../../../common/errors/AppError";
import { SetSalaryInput, RecordPaymentInput } from "../dto/staff-payroll.dto";

export const staffPayrollService = {
  async searchStaff(lawFirmId: string, query: string) {
    return prisma.user.findMany({
      where: {
        accountType: { in: ["LAWYER", "STAFF"] },
        lawFirmId,
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query } },
        ],
      },
      select: { id: true, fullName: true, email: true, phone: true },
      take: 10,
    });
  },

  async setSalary(input: SetSalaryInput, lawFirmId: string, updatedBy: string) {
    const existing = await prisma.staffSalary.findFirst({ where: { staffId: input.staffId, lawFirmId } });
    if (existing) {
      return prisma.staffSalary.update({
        where: { id: existing.id },
        data: { category: input.category, salaryType: input.salaryType, amount: input.amount, updatedBy },
      });
    }
    return prisma.staffSalary.create({
      data: { staffId: input.staffId, lawFirmId, category: input.category, salaryType: input.salaryType, amount: input.amount, updatedBy },
    });
  },

  async listSalaries(lawFirmId: string, category?: string) {
    return prisma.staffSalary.findMany({
      where: { lawFirmId, ...(category ? { category } : {}) },
      include: { staff: { select: { fullName: true, email: true, phone: true } } },
      orderBy: { category: "asc" },
    });
  },

  async recordPayment(input: RecordPaymentInput, lawFirmId: string, recordedBy: string) {
    const salary = await prisma.staffSalary.findFirst({ where: { staffId: input.staffId, lawFirmId } });
    if (!salary) throw AppError.notFound("This staff member has no salary record set up yet.");

    return prisma.staffPayment.create({
      data: {
        staffSalaryId: salary.id,
        amount: input.amount,
        paidForPeriod: input.paidForPeriod,
        paymentMethod: input.paymentMethod,
        receiptNumber: input.receiptNumber,
        recordedBy,
      },
    });
  },

  // search matches staff name, email, or phone -- same real-world need as
  // student payments: quickly find "did we pay this specific person".
  async listPayments(lawFirmId: string, search?: string) {
    const where: any = { staffSalary: { lawFirmId } };
    if (search) {
      where.staffSalary = {
        ...where.staffSalary,
        staff: {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
          ],
        },
      };
    }
    return prisma.staffPayment.findMany({
      where,
      include: {
        staffSalary: {
          include: { staff: { select: { fullName: true, email: true, phone: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
  },

  async exportPaymentsExcel(lawFirmId: string, search?: string): Promise<Buffer> {
    const payments = await this.listPayments(lawFirmId, search);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "NyayaOne";
    const sheet = workbook.addWorksheet("Staff Payments");

    sheet.columns = [
      { header: "Date", key: "date", width: 14 },
      { header: "Staff Name", key: "name", width: 24 },
      { header: "Email", key: "email", width: 26 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Category", key: "category", width: 16 },
      { header: "Amount (NPR)", key: "amount", width: 14 },
      { header: "For Period", key: "period", width: 16 },
      { header: "Method", key: "method", width: 14 },
      { header: "Receipt No.", key: "receipt", width: 16 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const p of payments) {
      const staff = (p as any).staffSalary?.staff;
      sheet.addRow({
        date: p.createdAt.toISOString().slice(0, 10),
        name: staff?.fullName ?? "",
        email: staff?.email ?? "",
        phone: staff?.phone ?? "",
        category: (p as any).staffSalary?.category ?? "",
        amount: p.amount,
        period: p.paidForPeriod ?? "",
        method: p.paymentMethod,
        receipt: p.receiptNumber ?? "",
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },
};
