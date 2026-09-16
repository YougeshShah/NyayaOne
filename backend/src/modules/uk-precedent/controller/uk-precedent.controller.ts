import { Request, Response } from "express";
import { z } from "zod";
import { ukPrecedentService } from "../service/uk-precedent.service";

const searchSchema = z.object({
  query: z.string().min(1),
  page: z.coerce.number().min(1).default(1),
});

export const ukPrecedentController = {
  async search(req: Request, res: Response) {
    const { query, page } = searchSchema.parse(req.query);
    const result = await ukPrecedentService.search(query, page);
    res.status(200).json({ success: true, data: result });
  },
};
