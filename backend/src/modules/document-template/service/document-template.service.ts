import PDFDocument from "pdfkit";
import { AppError } from "../../../common/errors/AppError";
import { documentTemplateRepository } from "../repository/document-template.repository";
import { CreateTemplateInput, UpdateTemplateInput, ListTemplatesQuery, GenerateDocumentInput } from "../dto/document-template.dto";

/**
 * Supported placeholders a Company staff member can use when writing a
 * template body. Example: "I, {{clientName}}, residing at {{clientAddress}},
 * hereby apply for..." — see PLACEHOLDER_HELP for the full list shown in the UI.
 */
export const PLACEHOLDER_HELP = [
  "{{clientName}}", "{{clientAddress}}", "{{clientPhone}}", "{{clientIdType}}", "{{clientIdNo}}",
  "{{caseNumber}}", "{{caseTitle}}", "{{courtName}}", "{{courtType}}", "{{judgeName}}",
  "{{lawyerName}}", "{{opposingParty}}", "{{firmName}}", "{{today}}",
];

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
    return documentTemplateRepository.create({ ...input, createdBy });
  },

  async update(id: string, input: UpdateTemplateInput) {
    await this.getById(id);
    return documentTemplateRepository.update(id, input);
  },

  /**
   * The auto-fill feature: takes a template + a case, pulls the case's real
   * data (client, court, lawyer, firm), and returns a filled PDF — this is
   * what replaces the lawyer manually retyping the same document every time.
   */
  async generate(lawFirmId: string, input: GenerateDocumentInput): Promise<{ buffer: Buffer; fileName: string }> {
    const template = await this.getById(input.templateId);

    const caseRecord = await documentTemplateRepository.findCaseForGeneration(input.caseId, lawFirmId);
    if (!caseRecord) throw AppError.badRequest("Case not found in your firm");

    const client = input.clientId
      ? caseRecord.clients.find((c) => c.clientId === input.clientId)?.client
      : caseRecord.clients[0]?.client;

    if (!client) throw AppError.badRequest("This case has no client to fill the template with");

    const leadLawyer = caseRecord.lawyers[0]?.lawyer;

    const values: Record<string, string> = {
      clientName: client.fullName,
      clientAddress: client.address || "",
      clientPhone: client.phone || "",
      clientIdType: client.identificationType || "",
      clientIdNo: client.identificationNo || "",
      caseNumber: caseRecord.caseNumber,
      caseTitle: caseRecord.caseTitle,
      courtName: caseRecord.court.name,
      courtType: caseRecord.court.type,
      judgeName: caseRecord.judge || "",
      lawyerName: leadLawyer?.fullName || "",
      opposingParty: caseRecord.opposingParty || "",
      firmName: caseRecord.lawFirm.name,
      today: new Date().toLocaleDateString("en-CA"), // YYYY-MM-DD, locale-neutral
    };

    const filledText = fillPlaceholders(template.bodyTemplate, values);

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(14).font("Helvetica-Bold").text(template.title, { align: "center" });
      doc.moveDown(1.5);
      doc.fontSize(11).font("Helvetica").text(filledText, { align: "left", lineGap: 4 });

      doc.end();
    });

    const fileName = `${template.title.replace(/[^a-z0-9]/gi, "_")}-${caseRecord.caseNumber}.pdf`;
    return { buffer, fileName };
  },
};
