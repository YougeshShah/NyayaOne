import puppeteer, { Browser } from "puppeteer";
import fs from "fs";
import path from "path";
import { AppError } from "../../../common/errors/AppError";
import { documentTemplateRepository } from "../repository/document-template.repository";
import {
  CreateTemplateInput,
  UpdateTemplateInput,
  ListTemplatesQuery,
  GenerateDocumentInput,
  TemplateField,
} from "../dto/document-template.dto";

/**
 * PDF generation uses a headless Chromium (via Puppeteer) rendering an HTML
 * page, NOT PDFKit's direct text-drawing API. This matters because Devanagari
 * (Nepali) script requires complex text shaping — conjuncts (श + ् + र + ी
 * becoming "श्री") and matra reordering (vowel signs that visually appear
 * BEFORE the consonant despite coming after it in Unicode). PDFKit draws
 * glyphs in raw character order with no shaping at all, which garbles every
 * Nepali document ("श्री सर्वोच्च" becomes "शी सवोरचच" — wrong and unreadable).
 * A real browser engine does full OpenType shaping correctly, which is why
 * we render through Chromium instead.
 */

const FONT_REGULAR_PATH = path.join(process.cwd(), "assets", "fonts", "NotoSansDevanagari-Regular.woff");
const FONT_BOLD_PATH = path.join(process.cwd(), "assets", "fonts", "NotoSansDevanagari-Bold.woff");

// Embed the font as a base64 data URI directly in the HTML — this way PDF
// generation doesn't depend on the font being installed on the server's OS.
function loadFontAsBase64(filePath: string): string {
  return fs.readFileSync(filePath).toString("base64");
}

let cachedBrowser: Browser | null = null;
async function getBrowser(): Promise<Browser> {
  if (cachedBrowser && cachedBrowser.connected) return cachedBrowser;
  cachedBrowser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  return cachedBrowser;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(title: string, bodyText: string): string {
  const regularBase64 = loadFontAsBase64(FONT_REGULAR_PATH);
  const boldBase64 = loadFontAsBase64(FONT_BOLD_PATH);

  // Preserve line breaks from the template (bodyText uses \n) as HTML line breaks,
  // while still escaping any user-entered text to avoid breaking the HTML structure.
  const escapedBody = escapeHtml(bodyText).replace(/\n/g, "<br/>");
  const escapedTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="ne">
<head>
<meta charset="UTF-8" />
<style>
  @font-face {
    font-family: 'NotoDevanagari';
    src: url(data:font/woff;base64,${regularBase64}) format('woff');
    font-weight: normal;
  }
  @font-face {
    font-family: 'NotoDevanagari';
    src: url(data:font/woff;base64,${boldBase64}) format('woff');
    font-weight: bold;
  }
  body {
    font-family: 'NotoDevanagari', sans-serif;
    font-size: 13px;
    line-height: 1.8;
    padding: 20px 10px;
    color: #111;
  }
  h1 {
    font-size: 16px;
    text-align: center;
    font-weight: bold;
    margin-bottom: 24px;
  }
  .body-text {
    text-align: left;
    white-space: pre-wrap;
  }
</style>
</head>
<body>
  <h1>${escapedTitle}</h1>
  <div class="body-text">${escapedBody}</div>
</body>
</html>`;
}

/**
 * Supported autoFillSource paths a Company staff member can attach to a field
 * when building a template — resolved server-side from the case's real data.
 * Any field WITHOUT an autoFillSource is left for the lawyer to type manually
 * in the generate form.
 */
export const AUTOFILL_SOURCES = [
  "client.fullName", "client.address", "client.phone", "client.identificationType", "client.identificationNo",
  "case.caseNumber", "case.caseTitle", "case.opposingParty", "case.category", "case.judge",
  "court.name", "court.type", "lawyer.fullName", "firm.name", "today",
];

function resolveAutoFillValue(source: string, ctx: { caseRecord: any; client: any; lawyer: any }): string {
  const [obj, field] = source.split(".");
  const map: Record<string, any> = {
    client: ctx.client,
    case: ctx.caseRecord,
    court: ctx.caseRecord?.court,
    lawyer: ctx.lawyer,
    firm: ctx.caseRecord?.lawFirm,
  };
  if (source === "today") return new Date().toLocaleDateString("en-CA");
  // Prefer the Devanagari name for documents (which are almost all in Nepali)
  // if the client record has one entered; fall back to the English name.
  if (source === "client.fullName") return ctx.client?.fullNameNepali || ctx.client?.fullName || "";
  return map[obj]?.[field] || "";
}

function fillPlaceholders(template: string, values: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.split(`{{${key}}}`).join(value || "________");
  }
  return result;
}

export const documentTemplateService = {
  async list(query: ListTemplatesQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await documentTemplateRepository.findMany({
      category: query.category,
      search: query.search,
      skip,
      take: query.limit,
    });
    return { items, pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  },

  async getById(id: string) {
    const t = await documentTemplateRepository.findById(id);
    if (!t) throw AppError.notFound("Template not found");
    return t;
  },

  async create(input: CreateTemplateInput, createdBy: string) {
    return documentTemplateRepository.create({ ...input, fields: input.fields, createdBy });
  },

  async update(id: string, input: UpdateTemplateInput) {
    await this.getById(id);
    return documentTemplateRepository.update(id, input as any);
  },

  /**
   * The auto-fill feature: takes a template's field definitions, resolves
   * auto-fillable ones from the case's real data, merges in the lawyer's
   * manually-typed answers for the rest, then renders a filled PDF via
   * headless Chromium (see the module-level comment for why not PDFKit).
   */
  async generate(lawFirmId: string, input: GenerateDocumentInput): Promise<{ buffer: Buffer; fileName: string }> {
    const template = await this.getById(input.templateId);
    const fields = (template.fields as unknown as TemplateField[]) || [];

    const caseRecord = await documentTemplateRepository.findCaseForGeneration(input.caseId, lawFirmId);
    if (!caseRecord) throw AppError.badRequest("Case not found in your firm");

    const client = input.clientId
      ? caseRecord.clients.find((c: any) => c.clientId === input.clientId)?.client
      : caseRecord.clients[0]?.client;
    const lawyer = caseRecord.lawyers[0]?.lawyer;

    const values: Record<string, string> = {};
    for (const field of fields) {
      if (field.autoFillSource) {
        values[field.key] = resolveAutoFillValue(field.autoFillSource, { caseRecord, client, lawyer });
      } else {
        values[field.key] = input.values[field.key] || "";
      }
    }

    const filledText = fillPlaceholders(template.bodyTemplate, values);
    const html = buildHtml(template.title, filledText);

    const browser = await getBrowser();
    const page = await browser.newPage();
    let buffer: Buffer;
    try {
      await page.setContent(html, { waitUntil: "networkidle0" });
      const pdfUint8 = await page.pdf({
        format: "A4",
        margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" },
        printBackground: true,
      });
      buffer = Buffer.from(pdfUint8);
    } finally {
      await page.close();
    }

    const fileName = `${template.title.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, "_")}-${caseRecord.caseNumber}.pdf`;
    return { buffer, fileName };
  },

  /**
   * Heuristic "suggest fields" helper — NOT true AI/document-understanding.
   * It looks for common fill-in-the-blank patterns (runs of dots/underscores)
   * and flags them as candidate variable fields, with a bit of surrounding
   * text as a suggested label. Company staff must review and adjust every
   * suggestion before saving a template — this only saves typing, it doesn't
   * replace judgment about what's actually variable in a given document.
   */
  analyzeSample(text: string) {
    const blankPattern = /[.]{3,}|_{3,}/g;
    const suggestions: { matchIndex: number; suggestedLabel: string; contextBefore: string; contextAfter: string }[] = [];

    let match: RegExpExecArray | null;
    let counter = 0;
    while ((match = blankPattern.exec(text)) !== null && counter < 60) {
      const start = Math.max(0, match.index - 25);
      const end = Math.min(text.length, match.index + match[0].length + 15);
      const contextBefore = text.slice(start, match.index).trim();
      const contextAfter = text.slice(match.index + match[0].length, end).trim();

      const words = contextBefore.split(/\s+/).filter(Boolean);
      const suggestedLabel = words.slice(-4).join(" ") || `Field ${counter + 1}`;

      suggestions.push({ matchIndex: match.index, suggestedLabel, contextBefore: words.slice(-8).join(" "), contextAfter });
      counter++;
    }

    return {
      suggestions,
      note: "Pattern-based suggestions only (detects blank runs like '.....' or '____'). Review and edit every field before saving — this does not understand document meaning.",
    };
  },
};
