import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../../common/middleware/authenticate";
import { AppError } from "../../common/errors/AppError";
import { prisma } from "../../database/prisma";
import { env } from "../../config/env";

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  // Client sends recent history back each turn -- kept small (last ~10 turns)
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
  if (!env.gemini.apiKey) {
    throw AppError.badRequest("Chatbot is not configured yet.");
  }

  const input = chatSchema.parse(req.body);

  let courseContext = "";
  if (input.courseId) {
    const course = await prisma.course.findUnique({ where: { id: input.courseId } });
    if (course) courseContext = ` The student is currently studying for: ${course.name} (${course.category}).`;
  }

  const systemPrompt =
    "You are TechnoOne's assistant. Depending on who is asking, you help students preparing for Law exams " +
    "(LLB, Bar Council, Judicial Service, PSC), IELTS, IOE, medical entrance, Loksewa, and other competitive exams in Nepal, " +
    "or you help law firm clients understand general platform questions and connect them with their lawyer for case-specific matters. " +
    "Be encouraging, clear, and concise. Explain concepts step by step when asked. " +
    "For Law questions, refer to Nepal's legal system generally rather than giving specific legal advice for real cases -- " +
    "recommend the person contact their lawyer or a licensed lawyer for actual legal matters. " +
    "Keep answers focused and relevant." +
    courseContext;

  // Gemini's REST API doesn't use a separate "system" role -- fold it into
  // the first turn instead, then append the recent history and new message.
  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "Understood. I'm ready to help." }] },
    ...(input.history ?? []).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: input.message }] },
  ];

  // Gemini occasionally returns 503 "model is overloaded" during traffic
  // spikes -- retry a couple of times with a short backoff.
  const maxAttempts = 3;
  let response: Response2 | null = null;
  let lastErrText = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    response = (await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${env.gemini.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    )) as unknown as Response2;
    if (response.ok) break;
    lastErrText = await response.text();
    const isOverloaded = response.status === 503 || lastErrText.includes("UNAVAILABLE") || lastErrText.includes("overloaded");
    if (!isOverloaded || attempt === maxAttempts) break;
    await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
  }

  if (!response || !response.ok) {
    throw AppError.badRequest(`Chatbot is temporarily busy. Please try again in a moment. (${lastErrText.slice(0, 150)})`);
  }

  const data = (await response.json()) as any;
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response.";

  res.status(200).json({ success: true, data: { reply } });
});

// Minimal type alias so the fetch Response isn't confused with Express's
// Response import above.
type Response2 = globalThis.Response;

export default router;
