import { Request, Response } from "express";
import { userService } from "../service/user.service";
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  listUsersQuerySchema,
  userIdParamSchema,
} from "../dto/user.dto";
import { AppError } from "../../../common/errors/AppError";

function requireFirmContext(req: Request): string {
  if (!req.auth || !req.auth.lawFirmId) {
    throw AppError.forbidden("This action requires a law firm account");
  }
  return req.auth.lawFirmId;
}

export const userController = {
  async list(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const query = listUsersQuerySchema.parse(req.query);
    const result = await userService.list(lawFirmId, query);
    res.status(200).json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const { id } = userIdParamSchema.parse(req.params);
    const result = await userService.getById(id, lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const input = createUserSchema.parse(req.body);
    const result = await userService.create(lawFirmId, input);
    res.status(201).json({ success: true, message: "User created successfully", data: result });
  },

  async update(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const { id } = userIdParamSchema.parse(req.params);
    const input = updateUserSchema.parse(req.body);
    const result = await userService.update(id, lawFirmId, input);
    res.status(200).json({ success: true, message: "User updated successfully", data: result });
  },

  async updateStatus(req: Request, res: Response) {
    const lawFirmId = requireFirmContext(req);
    const { id } = userIdParamSchema.parse(req.params);
    const { status } = updateUserStatusSchema.parse(req.body);
    const result = await userService.updateStatus(id, lawFirmId, status);
    res.status(200).json({ success: true, message: `User status updated to ${status}`, data: result });
  },
};
