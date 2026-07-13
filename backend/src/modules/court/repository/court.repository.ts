import { prisma } from "../../../database/prisma";
import { Prisma } from "@prisma/client";

export const courtRepository = {
  async findMany(params: {
    type?: string;
    province?: string;
    search?: string;
    isActive?: boolean;
    skip: number;
    take: number;
  }) {
    const where: Prisma.CourtWhereInput = {
      ...(params.type ? { type: params.type } : {}),
      ...(params.province ? { province: params.province } : {}),
      ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { location: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.court.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: [{ province: "asc" }, { type: "asc" }, { name: "asc" }],
      }),
      prisma.court.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string) {
    return prisma.court.findUnique({ where: { id } });
  },

  findByNameAndType(name: string, type: string) {
    return prisma.court.findFirst({ where: { name, type } });
  },

  create(data: { name: string; type: string; location?: string }) {
    return prisma.court.create({ data });
  },

  update(id: string, data: { name?: string; type?: string; location?: string }) {
    return prisma.court.update({ where: { id }, data });
  },

  setActive(id: string, isActive: boolean) {
    return prisma.court.update({ where: { id }, data: { isActive } });
  },

  // Used to prevent deactivating a court that still has open cases attached.
  countActiveCasesForCourt(id: string) {
    return prisma.case.count({
      where: { courtId: id, status: { in: ["OPEN", "ONGOING", "ON_HOLD"] } },
    });
  },

  // Distinct list of court types currently in use — helps the UI build filter dropdowns.
  async listDistinctTypes() {
    const rows = await prisma.court.findMany({
      distinct: ["type"],
      select: { type: true },
      orderBy: { type: "asc" },
    });
    return rows.map((r) => r.type);
  },

  // Distinct list of provinces currently in use — helps the UI build filter dropdowns.
  async listDistinctProvinces() {
    const rows = await prisma.court.findMany({
      distinct: ["province"],
      select: { province: true },
      where: { province: { not: null } },
      orderBy: { province: "asc" },
    });
    return rows.map((r) => r.province).filter((p): p is string => !!p);
  },
};
