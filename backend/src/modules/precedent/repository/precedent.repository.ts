import { prisma } from "../../../database/prisma";
import { Prisma } from "@prisma/client";

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
  }) {
    const visibilityClause = params.lawFirmId
      ? Prisma.sql`AND ("hostLawFirmId" IS NULL OR "hostLawFirmId" = ${params.lawFirmId})`
      : Prisma.sql`AND "hostLawFirmId" IS NULL`;

    const categoryClause = params.category ? Prisma.sql`AND "category" = ${params.category}` : Prisma.empty;

    if (params.search && params.search.trim()) {
      const searchClause = Prisma.sql`"searchVector" @@ plainto_tsquery('simple', ${params.search})`;
      const items = await prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT id, "sourceId", "sourceUrl", title, "caseType", category, court, "benchType",
               judges, "decisionDate", "caseNumber", petitioner, respondent, "hostLawFirmId", "createdAt",
               ts_rank("searchVector", plainto_tsquery('simple', ${params.search})) AS rank
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
