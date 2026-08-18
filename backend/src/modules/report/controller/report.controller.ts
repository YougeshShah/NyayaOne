import { Request, Response } from "express";
import { reportService } from "../service/report.service";
import { AppError } from "../../../common/errors/AppError";
import { CaseStatus } from "@prisma/client";

function requireFirmContext(req: Request): string {
  if (!req.auth || !req.auth.lawFirmId) {
    throw AppError.forbidden("This action requires a law firm account");
  }
  return req.auth.lawFirmId;
}

function sendExcel(res: Response, buffer: Buffer, filename: string) {
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(buffer);
}

function sendPdf(res: Response, buffer: Buffer, filename: string) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(buffer);
}

export const reportController = {
  async casesListJson(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const status = req.query.status as CaseStatus | undefined;
    const items = await reportService.casesList(lawFirmId, status);
    res.status(200).json({ success: true, data: { items } });
  },
  async hearingsListJson(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const items = await reportService.hearingsList(lawFirmId);
    res.status(200).json({ success: true, data: { items } });
  },
  async clientsListJson(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const items = await reportService.clientsList(lawFirmId);
    res.status(200).json({ success: true, data: { items } });
  },

  async cases(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const format = (req.query.format as string) === "pdf" ? "pdf" : "excel";
    const status = req.query.status as CaseStatus | undefined;

    if (format === "pdf") {
      const buffer = await reportService.casesPdf(lawFirmId, status);
      return sendPdf(res, buffer, "cases-report.pdf");
    }
    const buffer = await reportService.casesExcel(lawFirmId, status);
    return sendExcel(res, buffer, "cases-report.xlsx");
  },

  async hearings(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const format = (req.query.format as string) === "pdf" ? "pdf" : "excel";

    if (format === "pdf") {
      const buffer = await reportService.hearingsPdf(lawFirmId);
      return sendPdf(res, buffer, "upcoming-hearings-report.pdf");
    }
    const buffer = await reportService.hearingsExcel(lawFirmId);
    return sendExcel(res, buffer, "upcoming-hearings-report.xlsx");
  },

  async clients(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const buffer = await reportService.clientsExcel(lawFirmId);
    return sendExcel(res, buffer, "clients-report.xlsx");
  },
};
