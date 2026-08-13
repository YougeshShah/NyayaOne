import { prisma } from "../../../database/prisma";
import { AccountType, Prisma, UserStatus } from "@prisma/client";

const STAFF_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  status: true,
  createdAt: true,
  role: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

export const companyStaffRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findMany(params: { search?: string; skip: number; take: number }) {
    const where: Prisma.UserWhereInput = {
      accountType: AccountType.COMPANY,
      ...(params.search
        ? {
            OR: [
              { fullName: { contains: params.search, mode: "insensitive" } },
              { email: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        select: STAFF_SELECT,
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  },

  create(data: { fullName: string; email: string; phone?: string; passwordHash: string; roleId: string }) {
    return prisma.user.create({
      data: {
        accountType: AccountType.COMPANY,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        roleId: data.roleId,
        status: "ACTIVE",
      },
      select: STAFF_SELECT,
    });
  },

  updateStatus(id: string, status: UserStatus) {
    return prisma.user.update({ where: { id }, data: { status }, select: STAFF_SELECT });
  },

  update(id: string, data: { fullName?: string; phone?: string }) {
    return prisma.user.update({ where: { id }, data, select: STAFF_SELECT });
  },

  updateRole(id: string, roleId: string) {
    return prisma.user.update({ where: { id }, data: { roleId }, select: STAFF_SELECT });
  },

  listRoles() {
    return prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, description: true, isSystem: true } });
  },
};
