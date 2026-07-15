import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { prisma } from "../../../database/prisma";
import { CaseStatus } from "@prisma/client";

const REPORT_ROW_LIMIT = 1000; // sane cap so a report generation never becomes a runaway query

async function fetchCasesForReport(lawFirmId: string, status?: CaseStatus) {
  return prisma.case.findMany({
    where: { lawFirmId, ...(status ? { status } : {}) },
    take: REPORT_ROW_LIMIT,
    orderBy: { createdAt: "desc" },
    include: {
      court: { select: { name: true, type: true } },
      clients: { include: { client: { select: { fullName: true } } } },
      lawyers: { include: { lawyer: { select: { fullName: true } } }, where: { isLead: true } },
      _count: { select: { hearings: true } },
    },
  });
}

async function fetchUpcomingHearingsForReport(lawFirmId: string) {
  return prisma.hearing.findMany({
    where: { case: { lawFirmId }, hearingDate: { gte: new Date() } },
    take: REPORT_ROW_LIMIT,
    orderBy: { hearingDate: "asc" },
    include: { case: { select: { caseNumber: true, caseTitle: true } } },
  });
}

async function fetchClientsForReport(lawFirmId: string) {
  return prisma.client.findMany({
    where: { lawFirmId },
    take: REPORT_ROW_LIMIT,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cases: true } } },
  });
}

export const reportService = {
  async casesExcel(lawFirmId: string, status?: CaseStatus): Promise<Buffer> {
    const cases = await fetchCasesForReport(lawFirmId, status);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "NyayaOne";
    const sheet = workbook.addWorksheet("Cases");

    sheet.columns = [
      { header: "Case Number", key: "caseNumber", width: 18 },
      { header: "Case Title", key: "caseTitle", width: 30 },
      { header: "Court", key: "court", width: 25 },
      { header: "Lead Lawyer", key: "lawyer", width: 20 },
      { header: "Clients", key: "clients", width: 25 },
      { header: "Status", key: "status", width: 12 },
      { header: "Priority", key: "priority", width: 10 },
      { header: "Hearings", key: "hearings", width: 10 },
      { header: "Filed On", key: "createdAt", width: 14 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const c of cases) {
      sheet.addRow({
        caseNumber: c.caseNumber,
        caseTitle: c.caseTitle,
        court: `${c.court.name} (${c.court.type})`,
        lawyer: c.lawyers[0]?.lawyer.fullName || "—",
        clients: c.clients.map((cc) => cc.client.fullName).join(", "),
        status: c.status,
        priority: c.priority,
        hearings: c._count.hearings,
        createdAt: c.createdAt.toISOString().split("T")[0],
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },

  async casesPdf(lawFirmId: string, status?: CaseStatus): Promise<Buffer> {
    const cases = await fetchCasesForReport(lawFirmId, status);
    return buildPdf("Case Report" + (status ? ` — ${status}` : ""), (doc) => {
      for (const c of cases) {
        doc.fontSize(11).font("Helvetica-Bold").text(`${c.caseNumber} — ${c.caseTitle}`);
        doc
          .fontSize(9)
          .font("Helvetica")
          .text(
            `Court: ${c.court.name} (${c.court.type})   |   Status: ${c.status}   |   Priority: ${c.priority}   |   Hearings: ${c._count.hearings}`
          );
        doc.text(`Lead Lawyer: ${c.lawyers[0]?.lawyer.fullName || "—"}   |   Clients: ${c.clients.map((cc) => cc.client.fullName).join(", ") || "—"}`);
        doc.moveDown(0.8);
      }
      if (cases.length === 0) doc.fontSize(11).text("No cases found for this filter.");
    });
  },

  async hearingsExcel(lawFirmId: string): Promise<Buffer> {
    const hearings = await fetchUpcomingHearingsForReport(lawFirmId);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Upcoming Hearings");

    sheet.columns = [
      { header: "Case Number", key: "caseNumber", width: 18 },
      { header: "Case Title", key: "caseTitle", width: 30 },
      { header: "Hearing Date", key: "date", width: 20 },
      { header: "Judge", key: "judge", width: 20 },
      { header: "Status", key: "status", width: 14 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const h of hearings) {
      sheet.addRow({
        caseNumber: h.case.caseNumber,
        caseTitle: h.case.caseTitle,
        date: h.hearingDate.toISOString().replace("T", " ").split(".")[0],
        judge: h.judge || "—",
        status: h.status,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },

  async hearingsPdf(lawFirmId: string): Promise<Buffer> {
    const hearings = await fetchUpcomingHearingsForReport(lawFirmId);
    return buildPdf("Upcoming Hearings Report", (doc) => {
      for (const h of hearings) {
        doc.fontSize(11).font("Helvetica-Bold").text(`${h.case.caseNumber} — ${h.case.caseTitle}`);
        doc
          .fontSize(9)
          .font("Helvetica")
          .text(`Date: ${h.hearingDate.toLocaleString()}   |   Judge: ${h.judge || "—"}   |   Status: ${h.status}`);
        doc.moveDown(0.8);
      }
      if (hearings.length === 0) doc.fontSize(11).text("No upcoming hearings.");
    });
  },

  async clientsExcel(lawFirmId: string): Promise<Buffer> {
    const clients = await fetchClientsForReport(lawFirmId);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Clients");

    sheet.columns = [
      { header: "Full Name", key: "fullName", width: 25 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Email", key: "email", width: 25 },
      { header: "Address", key: "address", width: 30 },
      { header: "Total Cases", key: "cases", width: 12 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const c of clients) {
      sheet.addRow({
        fullName: c.fullName,
        phone: c.phone || "—",
        email: c.email || "—",
        address: c.address || "—",
        cases: c._count.cases,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },
};

function buildPdf(title: string, renderBody: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).font("Helvetica-Bold").text("NyayaOne", { align: "left" });
    doc.fontSize(13).font("Helvetica-Bold").text(title);
    doc.fontSize(9).font("Helvetica").fillColor("#666").text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown(1);
    doc.fillColor("#000");

    renderBody(doc);

    doc.end();
  });
}
