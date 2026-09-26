import { prisma } from "../../../database/prisma";
import { Prisma } from "@prisma/client";

// Precedent content is stored with Devanagari (Nepali) numerals, but users
// often type search queries with regular English digits on their keyboard
// (e.g. "9100" instead of "९१००"). Converting English digits to their
// Devanagari equivalent before searching means both work identically.
const ENGLISH_TO_DEVANAGARI_DIGITS: Record<string, string> = {
  "0": "०", "1": "१", "2": "२", "3": "३", "4": "४",
  "5": "५", "6": "६", "7": "७", "8": "८", "9": "९",
};
function convertToDevanagariDigits(text: string): string {
  return text.replace(/[0-9]/g, (d) => ENGLISH_TO_DEVANAGARI_DIGITS[d]);
}

// The AI assistant hands us the user's whole natural-language question
// (often mixed Devanagari + English/Roman-script instruction words, e.g.
// "निर्णय नं. ९१०० yesko full summary दिनुहोस्"), not a clean search term.
// Our precedent text is entirely in Devanagari, so any Roman-script word in
// the question ("summary", "full", "yesko") can never match it -- and
// plainto_tsquery ANDs every token together, so that one non-matching word
// silently zeroes out an otherwise exact match on the decision number.
//
// Fix: drop every token that contains no Devanagari character before
// building the query, and keep the remaining Devanagari tokens AND'ed
// together as before (still via plainto_tsquery, which is what makes a
// selective token like a decision number narrow the match down to the
// right record instead of matching half the table). An earlier attempt
// used an OR query instead, but words like "निर्णय"/"नं" appear in every
// single title, so OR-ing them in matched almost the entire table --
// AND (after removing only the non-Devanagari noise) is the correct fix.
const DEVANAGARI_RANGE = /[ऀ-ॿ]/;
function extractDevanagariQuery(search: string): string {
  const converted = convertToDevanagariDigits(search);
  const words = converted.split(/\s+/).filter((w) => DEVANAGARI_RANGE.test(w));
  return words.join(" ");
}

export const precedentRepository = {
  // Full-text search is done via raw SQL against the generated tsvector
  // column (Prisma's query builder has no native full-text search support).
  // Category filtering and tenant-scoping (studentLawFirmId/forLawFirmId
  // pattern, same as LibraryResource) are applied as plain WHERE clauses
  // in the same query.
  async search(params: {
    search?: string;
    category?: string;
    lawFirmId?: string | null; // caller's own institution -- null/undefined = company-wide only
    skip: number;
    take: number;
  }): Promise<{ items: any[]; total: number }> {
    // Normalize digits so "9100" and "९१००" both match the same content.
    if (params.search) {
      params = { ...params, search: convertToDevanagariDigits(params.search) };
    }
    const visibilityClause = params.lawFirmId
      ? Prisma.sql`AND ("hostLawFirmId" IS NULL OR "hostLawFirmId" = ${params.lawFirmId})`
      : Prisma.sql`AND "hostLawFirmId" IS NULL`;

    const categoryClause = params.category ? Prisma.sql`AND "category" = ${params.category}` : Prisma.empty;

    if (params.search && params.search.trim()) {
      // Fall back to the original raw text if nothing Devanagari survived
      // filtering (e.g. a pure-English question) -- best effort rather than
      // an empty query.
      const devanagariQuery = extractDevanagariQuery(params.search);
      const effectiveQuery = devanagariQuery || params.search;
      const searchClause = Prisma.sql`"searchVector" @@ plainto_tsquery('simple', ${effectiveQuery})`;
      const items = await prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT id, "sourceId", "sourceUrl", title, "caseType", category, court, "benchType",
               judges, "decisionDate", "caseNumber", petitioner, respondent, "hostLawFirmId", "createdAt",
               ts_rank("searchVector", plainto_tsquery('simple', ${effectiveQuery})) AS rank
        FROM "Precedent"
        WHERE ${searchClause} ${categoryClause} ${visibilityClause}
        ORDER BY rank DESC
        LIMIT ${params.take} OFFSET ${params.skip}
      `);
      const totalResult = await prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
        SELECT COUNT(*) as count FROM "Precedent"
        WHERE ${searchClause} ${categoryClause} ${visibilityClause}
      `);
      return { items, total: Number(totalResult[0]?.count ?? 0) };
    }

    // No search term -- plain category/tenant-filtered listing, sorted by
    // decision number (निर्णय नं. / sourceId) ascending so results appear
    // in the same serial order as the source court records, not import
    // order. sourceId is stored as text, so a plain Prisma orderBy would
    // sort lexicographically ("10" before "2") -- CAST to integer via raw
    // SQL gives correct numeric ordering.
    const items = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT id, "sourceId", "sourceUrl", title, "caseType", category, court, "benchType",
             judges, "decisionDate", "caseNumber", petitioner, respondent, "hostLawFirmId", "createdAt"
      FROM "Precedent"
      WHERE 1=1 ${categoryClause} ${visibilityClause}
      ORDER BY CAST(NULLIF(regexp_replace("sourceId", '[^0-9]', '', 'g'), '') AS BIGINT) ASC NULLS LAST
      LIMIT ${params.take} OFFSET ${params.skip}
    `);
    const totalResult = await prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
      SELECT COUNT(*) as count FROM "Precedent" WHERE 1=1 ${categoryClause} ${visibilityClause}
    `);
    return { items, total: Number(totalResult[0]?.count ?? 0) };
  },

  findById(id: string) {
    return prisma.precedent.findUnique({ where: { id } });
  },

  async listCategories(lawFirmId?: string | null) {
    const where: Prisma.PrecedentWhereInput = lawFirmId
      ? { OR: [{ hostLawFirmId: null }, { hostLawFirmId: lawFirmId }] }
      : { hostLawFirmId: null };
    const rows = await prisma.precedent.findMany({ where, select: { category: true }, distinct: ["category"] });
    return rows.map((r) => r.category).filter((c): c is string => !!c).sort();
  },

  create(data: Prisma.PrecedentCreateInput) {
    return prisma.precedent.create({ data });
  },

  update(id: string, data: Prisma.PrecedentUpdateInput) {
    return prisma.precedent.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.precedent.delete({ where: { id } });
  },

  // Idempotent upsert used by the bulk import script, keyed on the
  // original nkp.gov.np id -- re-running the import never creates
  // duplicates, it just refreshes existing rows.
  upsertBySourceId(sourceId: string, data: Prisma.PrecedentCreateInput) {
    return prisma.precedent.upsert({
      where: { sourceId },
      create: { ...data, sourceId },
      update: data,
    });
  },
};
