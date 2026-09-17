import { env } from "../../../config/env";
import { AppError } from "../../../common/errors/AppError";

// Generates a first-draft legal/institutional document from a short
// description -- NOT grounded in precedents like the AI Legal Assistant
// (that's for research/citation; this is for drafting boilerplate).
// The person must still review before using it.
export const aiContentService = {
  async generate(documentType: string, details: string, language: "en" | "ne") {
    if (!env.gemini.apiKey) {
      throw AppError.badRequest("AI content generation is not configured. Contact NyayaOne support.");
    }

    const prompt = `You are a legal/institutional document drafting assistant for a Nepali law firm or educational institution. Draft a "${documentType}" based on these details:

${details}

RULES:
1. Produce a complete, ready-to-edit first draft -- not a template with unfilled placeholders unless a detail was genuinely not given.
2. Use formal, professional language appropriate for ${documentType}.
3. Write in ${language === "ne" ? "Nepali" : "English"}.
4. This is a DRAFT for the user to review and edit -- do not claim it is legally finalized or exhaustive.
5. Do not invent specific facts, names, dates, or figures beyond what's given -- use clear placeholders like [DATE] for anything missing.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${env.gemini.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw AppError.badRequest(`AI content generation failed: ${errText.slice(0, 200)}`);
    }

    const data = (await response.json()) as any;
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No content generated.";
    return { content };
  },
};
