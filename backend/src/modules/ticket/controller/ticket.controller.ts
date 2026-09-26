import { Request, Response } from "express";
import { AppError } from "../../../common/errors/AppError";
import { ticketService } from "../service/ticket.service";
import {
  createTicketSchema,
  addCommentSchema,
  ticketIdParamSchema,
  updateTicketStatusSchema,
  listTicketsQuerySchema,
} from "../dto/ticket.dto";

export const ticketController = {
  async create(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { subject, description } = createTicketSchema.parse(req.body);
    const result = await ticketService.create(req.auth, subject, description);
    res.status(201).json({ success: true, message: "Ticket opened", data: result });
  },

  async list(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { status, page, limit } = listTicketsQuerySchema.parse(req.query);
    const result = await ticketService.list(req.auth, status, page, limit);
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { id } = ticketIdParamSchema.parse(req.params);
    const result = await ticketService.getById(req.auth, id);
    res.status(200).json({ success: true, data: result });
  },

  async addComment(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { id } = ticketIdParamSchema.parse(req.params);
    const { content } = addCommentSchema.parse(req.body);
    const result = await ticketService.addComment(req.auth, id, content);
    res.status(201).json({ success: true, data: result });
  },

  async updateStatus(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { id } = ticketIdParamSchema.parse(req.params);
    const { status } = updateTicketStatusSchema.parse(req.body);
    const result = await ticketService.updateStatus(req.auth, id, status);
    res.status(200).json({ success: true, data: result });
  },
};
