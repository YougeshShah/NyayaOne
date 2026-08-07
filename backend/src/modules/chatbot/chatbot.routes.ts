import { Router, Request, Response } from "express";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { authenticate } from "../../common/middleware/authenticate";
import { AppError } from "../../common/errors/AppError";
import { prisma } from "../../database/prisma";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  // Client sends recent history back each turn — kept small (last ~10 turns)
  // since we don't persist full chat threads in DB for this first version.
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .optional(),
  courseId: z.string().uuid().optional(), // lets the bot tailor answers to the student's current course
});

const router = Router();
router.use(authenticate);

router.post("/message", async (req: Request, res: Response) => {
  if (!req.auth) throw AppError.unauthorized();
  if (!process.env.ANTHROPIC_API_KEY) {
    throw AppError.badRequest("Chatbot is not configured yet — ANTHROPIC_API_KEY is missing on the server.");
  }

  const input = chatSchema.parse(req.body);

  let courseContext = "";
  if (input.courseId) {
    const course = await prisma.course.findUnique({ where: { id: input.courseId } });
    if (course) courseContext = ` The student is currently studying for: ${course.name} (${course.category}).`;
  }

  const systemPrompt =
    "You are NyayaOne's study assistant, helping students preparing for Law exams (LLB, Bar Council, Judicial Service, PSC), " +
    "IELTS, IOE, medical entrance, Loksewa, and other competitive exams in Nepal. " +
    "Be encouraging, clear, and concise. Explain concepts step by step when asked. " +
    "For Law questions, refer to Nepal's legal system generally rather than giving specific legal advice for real cases — " +
    "recommend consulting a licensed lawyer for actual legal matters. " +
    "Keep answers focused and exam-relevant." +
    courseContext;

  const messages = [
    ...(input.history ?? []).map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: input.message },
  ];

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "Sorry, I couldn't generate a response.";

    res.status(200).json({ success: true, data: { reply } });
  } catch (error: any) {
    throw AppError.internal(`Chatbot request failed: ${error.message || "unknown error"}`);
  }
});

export default router;
