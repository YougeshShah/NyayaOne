import { Request, Response } from "express";
import { notificationService } from "../service/notification.service";
import {
  sendNotificationSchema,
  listNotificationsQuerySchema,
  notificationIdParamSchema,
} from "../dto/notification.dto";
import { AppError } from "../../../common/errors/AppError";

export const notificationController = {
  async send(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const input = sendNotificationSchema.parse(req.body);
    const result = await notificationService.send(input, req.auth.userId);
    res.status(201).json({
      success: true,
      message: `Notification sent to ${result.recipientCount} recipient(s) — ${result.pushedCount} received a push notification (rest don't have push enabled yet)`,
      data: result.notification,
    });
  },

  async listSent(req: Request, res: Response) {
    const query = listNotificationsQuerySchema.parse(req.query);
    const result = await notificationService.listSent(query);
    res.status(200).json({ success: true, data: result });
  },

  async myNotifications(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const query = listNotificationsQuerySchema.parse(req.query);
    const result = await notificationService.myNotifications(req.auth.userId, query);
    res.status(200).json({ success: true, data: result });
  },

  async markRead(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { id } = notificationIdParamSchema.parse(req.params);
    const result = await notificationService.markRead(id, req.auth.userId);
    res.status(200).json({ success: true, data: result });
  },
  async markAllRead(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const result = await notificationService.markAllRead(req.auth.userId);
    res.status(200).json({ success: true, data: result });
  },
};
