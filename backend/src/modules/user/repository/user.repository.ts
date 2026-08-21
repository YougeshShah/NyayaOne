import { prisma } from "../../../database/prisma";
import { AccountType, Prisma, UserStatus } from "@prisma/client";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email } });
  },

  /**
   * Every query here is scoped by lawFirmId — this is the multi-tenant
   * boundary. A firm admin/staff query MUST always pass their own lawFirmId
   * so they can never see or modify another firm's users.
   */
  async findMany(params: {
    lawFirmId: string;
    accountType?: AccountType;
    status?: UserStatus;
    search?: string;
    skip: number;
    take: number;
  }) {
    const where: Prisma.UserWhereInput = {
      lawFirmId: params.lawFirmId,
      accountType: { in: [AccountType.LAWYER, AccountType.STAFF] },
      ...(params.accountType ? { accountType: params.accountType } : {}),
      ...(params.status ? { status: params.status } : {}),
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
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          accountType: true,
          status: true,
          barRegistrationNo: true,
          specialization: true,
          createdAt: true,
          roleId: true,
          role: { select: { id: true, name: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  },

  findByIdScoped(id: string, lawFirmId: string) {
    return prisma.user.findFirst({
      where: { id, lawFirmId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        accountType: true,
        status: true,
        barRegistrationNo: true,
        specialization: true,
        createdAt: true,
      },
    });
  },

  create(data: {
    lawFirmId: string;
    fullName: string;
    email: string;
    phone?: string;
    passwordHash: string;
    accountType: AccountType;
    barRegistrationNo?: string;
    specialization?: string;
    roleId?: string;
  }) {
    return prisma.user.create({
      data: {
        lawFirmId: data.lawFirmId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        accountType: data.accountType,
        status: "ACTIVE",
        emailVerified: true, // created directly by firm admin -- trusted, no self-registration verification needed
        barRegistrationNo: data.accountType === "LAWYER" ? data.barRegistrationNo : undefined,
        specialization: data.accountType === "LAWYER" ? data.specialization : undefined,
        roleId: data.roleId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        accountType: true,
        status: true,
        barRegistrationNo: true,
        specialization: true,
        createdAt: true,
      },
    });
  },

  updateScoped(
    id: string,
    lawFirmId: string,
    data: { fullName?: string; phone?: string; barRegistrationNo?: string; specialization?: string; roleId?: string | null }
  ) {
    return prisma.user.updateMany({
      where: { id, lawFirmId },
      data,
    });
  },

  updateStatusScoped(id: string, lawFirmId: string, status: UserStatus) {
    return prisma.user.updateMany({
      where: { id, lawFirmId },
      data: { status },
    });
  },

  resetPasswordScoped(id: string, lawFirmId: string, passwordHash: string) {
    return prisma.user.updateMany({
      where: { id, lawFirmId },
      data: { passwordHash },
    });
  },

  // Company staff can reset ANY user's password (institution, law firm,
  // student) — no lawFirmId scoping, since Company operates across tenants.
  resetPasswordUnscoped(id: string, passwordHash: string) {
    return prisma.user.updateMany({
      where: { id },
      data: { passwordHash },
    });
  },

  updateContactUnscoped(id: string, data: { fullName?: string; email?: string; phone?: string }) {
    return prisma.user.updateMany({ where: { id }, data });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true, phone: true, accountType: true, status: true, lawFirmId: true },
    });
  },

  findUserByEmail(email: string) {
    return prisma.user.findFirst({ where: { email }, select: { id: true } });
  },

  // Company-only — search across ALL organizations, not scoped to one
  // lawFirmId. Used for cross-tenant admin actions like password reset.
  searchAcrossAllTenants(search: string) {
    return prisma.user.findMany({
      where: {
        accountType: { not: "COMPANY" },
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        accountType: true,
        status: true,
        lawFirm: { select: { name: true, tenantType: true } },
      },
      take: 20,
    });
  },
};
