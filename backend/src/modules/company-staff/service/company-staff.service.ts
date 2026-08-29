import { AppError } from "../../../common/errors/AppError";
import { hashPassword } from "../../../common/utils/password";
import { companyStaffRepository } from "../repository/company-staff.repository";
import { CreateCompanyStaffInput, ListCompanyStaffQuery } from "../dto/company-staff.dto";
import { prisma } from "../../../database/prisma";

export const companyStaffService = {
  async list(query: ListCompanyStaffQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await companyStaffRepository.findMany({ search: query.search, skip, take: query.limit });
    return {
      items,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async listRoles() {
    return companyStaffRepository.listRoles();
  },

  /**
   * Only an existing COMPANY account can create another — this endpoint is
   * itself restricted to COMPANY at the route level, so there's no bootstrap
   * problem (the first Super Admin comes from the seed script).
   */
  async create(input: CreateCompanyStaffInput) {
    // Company accounts always have lawFirmId: null -- scope the check there
    // so this email being used by a student/lawyer at some organization
    // doesn't block it from also being a Company account.
    const existing = await prisma.user.findFirst({ where: { email: input.email, lawFirmId: null } });
    if (existing) {
      throw AppError.conflict("An account with this email already exists");
    }
    const passwordHash = await hashPassword(input.password);
    return companyStaffRepository.create({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      roleId: input.roleId,
    });
  },

  async updateStatus(id: string, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") {
    return companyStaffRepository.updateStatus(id, status);
  },

  async update(id: string, input: { fullName?: string; phone?: string }) {
    return companyStaffRepository.update(id, input);
  },

  async updateRole(id: string, roleId: string) {
    return companyStaffRepository.updateRole(id, roleId);
  },
};
