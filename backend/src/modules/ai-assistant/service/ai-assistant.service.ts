import { env } from "../../../config/env";
import { AppError } from "../../../common/errors/AppError";
import { precedentService } from "../../precedent/service/precedent.service";

export const aiAssistantService = {
  async ask(question: string, lawFirmId: string | null) {
    if (!env.gemini.apiKey) {
      throw AppError.badRequest("AI assistant is not configured. Contact NyayaOne support.");
    }

    // Retrieval step: pull the most relevant precedents from our own
    // database using the existing full-text search, instead of relying on
    // the model's general knowledge -- keeps answers grounded in actual
    // Nepali case law rather than invented citations.
    const { items } = await precedentService.search(
      { search: question, page: 1, limit: 5 } as any,
      lawFirmId
    );

    const context = items
      .map(
        (p: any, i: number) =>
          `[Najir ${i + 1}] ${p.title}\nCase Type: ${p.caseType ?? "N/A"}\nDecision Date: ${p.decisionDate ?? "N/A"}\nSummary: ${(p.fullText || p.summary || "").slice(0, 1500)}`
      )
      .join("\n\n---\n\n");

    const prompt = `You are a legal research assistant for Nepali lawyers, answering STRICTLY based on the Supreme Court precedents (नजिर) provided below.

CRITICAL RULES:
1. NEVER alter, soften, or reinterpret what the court actually decided -- report the court's finding exactly as stated in the precedent text, even if it seems unusual.
2. For every claim, name the specific precedent (title, case number, decision date) it came from -- never a vague "according to a precedent" without identifying which one.
3. If the precedents provided don't clearly address the question, say so honestly rather than guessing or extrapolating.
4. Do not invent case details, dates, or outcomes that are not present in the precedent text below.

RELEVANT PRECEDENTS:
${context || "(No matching precedents found in the database for this question.)"}

QUESTION: ${question}

Answer in the same language as the question (Nepali or English). For each point, cite the exact precedent title/case number/date it came from.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${env.gemini.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw AppError.badRequest(`AI assistant request failed: ${errText.slice(0, 200)}`);
    }

    const data = (await response.json()) as any;
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No answer generated.";

    return {
      answer,
      sources: items.map((p: any) => ({ id: p.id, title: p.title, caseType: p.caseType, decisionDate: p.decisionDate })),
    };
  },
};
