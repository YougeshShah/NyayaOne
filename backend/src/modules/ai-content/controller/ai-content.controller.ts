import { Request, Response } from "express";
import { z } from "zod";
import { aiContentService } from "../service/ai-content.service";

const generateSchema = z.object({
  documentType: z.string().min(2),
  details: z.string().min(5),
  language: z.enum(["en", "ne"]).default("en"),
});

export const aiContentController = {
  async generate(req: Request, res: Response) {
    const input = generateSchema.parse(req.body);
    const result = await aiContentService.generate(input.documentType, input.details, input.language);
    res.status(200).json({ success: true, data: result });
  },
};
