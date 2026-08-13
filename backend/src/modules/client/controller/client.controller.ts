import { Request, Response } from "express";
import { clientService } from "../service/client.service";
import { createClientSchema, updateClientSchema, listClientsQuerySchema, clientIdParamSchema, inviteClientSchema } from "../dto/client.dto";
import { AppError } from "../../../common/errors/AppError";

function requireFirmContext(req: Request): string {
  if (!req.auth || !req.auth.lawFirmId) {
    throw AppError.forbidden("This action requires a law firm account");
  }
  return req.auth.lawFirmId;
}

export const clientController = {
  async list(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const query = listClientsQuerySchema.parse(req.query);
    const result = await clientService.list(lawFirmId, query);
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const { id } = clientIdParamSchema.parse(req.params);
    const result = await clientService.getById(id, lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const input = createClientSchema.parse(req.body);
    const result = await clientService.create(lawFirmId, input);
    res.status(201).json({ success: true, message: "Client created successfully", data: result });
  },

  async update(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const { id } = clientIdParamSchema.parse(req.params);
    const input = updateClientSchema.parse(req.body);
    const result = await clientService.update(id, lawFirmId, input);
    res.status(200).json({ success: true, message: "Client updated successfully", data: result });
  },

  async remove(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const { id } = clientIdParamSchema.parse(req.params);
    await clientService.remove(id, lawFirmId);
    res.status(200).json({ success: true, message: "Client deleted" });
  },

  async invite(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const { id } = clientIdParamSchema.parse(req.params);
    const input = inviteClientSchema.parse(req.body);
    const result = await clientService.invite(id, lawFirmId, input);
    res.status(200).json({ success: true, ...result });
  },
};
