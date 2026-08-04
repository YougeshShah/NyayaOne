import { prisma } from "../../../database/prisma";
import { LibraryResourceType, Prisma } from "@prisma/client";

export const libraryRepository = {
  async findMany(params: {
    type?: LibraryResourceType;
    category?: string;
    isRepealed?: boolean;
    search?: string;
    skip: number;
    take: number;
  }) {
    const where: Prisma.LibraryResourceWhereInput = {
      ...(params.type ? { type: params.type } : {}),
      ...(params.category ? { category: params.category } : {}),
      ...(params.isRepealed !== undefined ? { isRepealed: params.isRepealed } : {}),
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search, mode: "insensitive" } },
              { actName: { contains: params.search, mode: "insensitive" } },
              { keywords: { has: params.search } },
              // Searches the extracted text of the document itself, not just
              // its title/metadata — finds a word buried anywhere inside a PDF.
              { content: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.libraryResource.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.libraryResource.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string) {
    return prisma.libraryResource.findUnique({ where: { id } });
  },

  create(data: Prisma.LibraryResourceCreateInput) {
    return prisma.libraryResource.create({ data });
  },

  update(id: string, data: Prisma.LibraryResourceUpdateInput) {
    return prisma.libraryResource.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.libraryResource.delete({ where: { id } });
  },

  async listDistinctCategories() {
    const rows = await prisma.libraryResource.findMany({
      distinct: ["category"],
      select: { category: true },
      where: { category: { not: null } },
      orderBy: { category: "asc" },
    });
    return rows.map((r) => r.category).filter((c): c is string => !!c);
  },
};
