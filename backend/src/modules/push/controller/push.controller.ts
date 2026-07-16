import { Request, Response } from "express";
import { pushService } from "../service/push.service";
import { registerPushTokenSchema } from "../dto/push.dto";
import { AppError } from "../../../common/errors/AppError";

export const pushController = {
  async register(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const { pushToken } = registerPushTokenSchema.parse(req.body);
    const result = await pushService.registerToken(req.auth.userId, pushToken);
    res.status(200).json({ success: true, data: result });
  },

  async unregister(req: Request, res: Response) {
    if (!req.auth) throw AppError.unauthorized();
    const result = await pushService.unregisterToken(req.auth.userId);
    res.status(200).json({ success: true, data: result });
  },

  async sendTest(req: Request, res: Response) {
    const { pushToken } = registerPushTokenSchema.parse(req.body);
    const result = await pushService.sendTestPush(pushToken);
    res.status(200).json({ success: true, data: result });
  },
};
