import { Router, Request, Response } from "express";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { authenticate } from "../../common/middleware/authenticate";
import { authorize } from "../../common/middleware/authorize";
import { AppError } from "../../common/errors/AppError";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const generateSchema = z.object({
  topic: z.string().min(2).max(300),
  audienceLevel: z.enum(["SCHOOL", "COLLEGE", "PROFESSIONAL"]).default("COLLEGE"),
  sector: z.string().max(100).optional(), // e.g. "Nepal Law", "IELTS", "Construction Safety" — free text, keeps this generic across sectors
  length: z.enum(["SHORT", "MEDIUM", "DETAILED"]).default("MEDIUM"),
});

const router = Router();
router.use(authenticate, authorize("COMPANY"));

router.post("/generate", async (req: Request, res: Response) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw AppError.badRequest("Content generator is not configured yet — ANTHROPIC_API_KEY is missing on the server.");
  }

  const input = generateSchema.parse(req.body);

  const lengthGuide =
    input.length === "SHORT" ? "Keep it to 2-3 short paragraphs." : input.length === "DETAILED" ? "Write a thorough, detailed explanation with examples and sub-sections." : "Write a clear, moderate-length explanation (4-6 paragraphs).";

  const audienceGuide =
    input.audienceLevel === "SCHOOL"
      ? "Explain as if teaching a school student — simple words, relatable examples, no unexplained jargon."
      : input.audienceLevel === "PROFESSIONAL"
      ? "Write for a working professional preparing for a certification/exam — precise, technical where needed."
      : "Write for a college-level exam-prep student — clear but not oversimplified.";

  const sectorLine = input.sector ? ` The topic is within the field of: ${input.sector}.` : "";

  const systemPrompt =
    "You write original educational study notes for an exam-prep platform used across multiple sectors " +
    "(school subjects, Nepal law, IELTS, construction safety, medical, and more). " +
    "Always write completely original content in your own words — never reproduce text from any copyrighted textbook, " +
    "official exam body, or publisher. " +
    `${audienceGuide} ${lengthGuide}` +
    " Structure the output with a short heading and clear paragraphs. Do not include a generic intro like 'Sure, here is...' — start directly with the content.";

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: `Write study notes explaining: ${input.topic}.${sectorLine}` }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const content = textBlock && "text" in textBlock ? textBlock.text : "";

    res.status(200).json({ success: true, data: { content } });
  } catch (error: any) {
    throw AppError.internal(`Content generation failed: ${error.message || "unknown error"}`);
  }
});

export default router;
