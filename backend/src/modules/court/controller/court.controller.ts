import { Request, Response } from "express";
import { courtService } from "../service/court.service";
import { createCourtSchema, updateCourtSchema, listCourtsQuerySchema, courtIdParamSchema } from "../dto/court.dto";

export const courtController = {
  async list(req: Request, res: Response) {
    const query = listCourtsQuerySchema.parse(req.query);
    const result = await courtService.list(query);
    res.status(200).json({ success: true, data: result });
  },

  async listTypes(req: Request, res: Response) {
    const result = await courtService.listTypes();
    res.status(200).json({ success: true, data: result });
  },

  async listProvinces(req: Request, res: Response) {
    const result = await courtService.listProvinces();
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    const { id } = courtIdParamSchema.parse(req.params);
    const result = await courtService.getById(id);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    const input = createCourtSchema.parse(req.body);
    const result = await courtService.create(input);
    res.status(201).json({ success: true, message: "Court created successfully", data: result });
  },

  async update(req: Request, res: Response) {
    const { id } = courtIdParamSchema.parse(req.params);
    const input = updateCourtSchema.parse(req.body);
    const result = await courtService.update(id, input);
    res.status(200).json({ success: true, message: "Court updated successfully", data: result });
  },

  async deactivate(req: Request, res: Response) {
    const { id } = courtIdParamSchema.parse(req.params);
    const result = await courtService.deactivate(id);
    res.status(200).json({ success: true, message: "Court deactivated", data: result });
  },

  async activate(req: Request, res: Response) {
    const { id } = courtIdParamSchema.parse(req.params);
    const result = await courtService.activate(id);
    res.status(200).json({ success: true, message: "Court activated", data: result });
  },
};
