import { AppError } from "../../../common/errors/AppError";
import { hashPassword } from "../../../common/utils/password";
import { lawFirmRepository } from "../repository/lawfirm.repository";
import { ListLawFirmsQuery, CreateLawFirmInput } from "../dto/lawfirm.dto";

export const lawFirmService = {
  async listPublicInstitutions() {
    return lawFirmRepository.findPublicInstitutions();
  },
  async create(input: CreateLawFirmInput, createdByUserId: string) {
    const existing = await lawFirmRepository.findUserByEmail(input.adminEmail);
    if (existing) {
      throw AppError.conflict("An account with this admin email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const { lawFirm, admin } = await lawFirmRepository.createWithAdmin({
      lawFirmName: input.lawFirmName,
      lawFirmEmail: input.lawFirmEmail,
      adminFullName: input.adminFullName,
      adminEmail: input.adminEmail,
      adminPhone: input.adminPhone,
      passwordHash,
      tenantType: input.tenantType as any,
      modulesEnabled: input.modulesEnabled,
      allowedCourseIds: input.allowedCourseIds,
      allowedExamTypes: input.allowedExamTypes,
    });

    await lawFirmRepository.createAuditLog({
      userId: createdByUserId,
      action: "LAW_FIRM_CREATED_MANUALLY",
      entityId: lawFirm.id,
      metadata: { lawFirmName: lawFirm.name, adminEmail: admin.email },
    });

    return { lawFirm, admin: { id: admin.id, fullName: admin.fullName, email: admin.email } };
  },

  async list(query: ListLawFirmsQuery) {
    const skip = (query.page - 1) * query.limit;

    const { items, total } = await lawFirmRepository.findMany({
      status: query.status,
      search: query.search,
      skip,
      take: query.limit,
    });

    return {
      items: items.map((firm) => ({
        id: firm.id,
        name: firm.name,
        email: firm.email,
        status: firm.status,
        registrationNo: firm.registrationNo,
        modulesEnabled: firm.modulesEnabled,
        allowedCourseIds: (firm as any).allowedCourseIds,
        allowedExamTypes: (firm as any).allowedExamTypes,
        tenantType: (firm as any).tenantType,
        stats: {
          totalUsers: firm._count.users,
          totalClients: firm._count.clients,
          totalCases: firm._count.cases,
        },
        createdAt: firm.createdAt,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async getById(id: string) {
    const firm = await lawFirmRepository.findById(id);
    if (!firm) {
      throw AppError.notFound("Law firm not found");
    }
    return firm;
  },

  /**
   * Approve a PENDING law firm. Only PENDING firms can be approved.
   * Approval activates the firm — its admin/lawyers can now fully use the platform.
   */
  async approve(id: string, approvedByUserId: string) {
    const firm = await lawFirmRepository.findById(id);
    if (!firm) {
      throw AppError.notFound("Law firm not found");
    }
    if (firm.status !== "PENDING") {
      throw AppError.badRequest(`Only PENDING law firms can be approved. Current status: ${firm.status}`);
    }

    const updated = await lawFirmRepository.updateStatus(id, "ACTIVE", approvedByUserId);

    await lawFirmRepository.createAuditLog({
      userId: approvedByUserId,
      action: "LAW_FIRM_APPROVED",
      entityId: id,
      metadata: { firmName: firm.name },
    });

    return updated;
  },

  /**
   * Suspend an ACTIVE law firm. Suspended firms lose access until reactivated.
   */
  async suspend(id: string, suspendedByUserId: string, reason?: string) {
    const firm = await lawFirmRepository.findById(id);
    if (!firm) {
      throw AppError.notFound("Law firm not found");
    }
    if (firm.status !== "ACTIVE") {
      throw AppError.badRequest(`Only ACTIVE law firms can be suspended. Current status: ${firm.status}`);
    }

    const updated = await lawFirmRepository.updateStatus(id, "SUSPENDED");

    await lawFirmRepository.createAuditLog({
      userId: suspendedByUserId,
      action: "LAW_FIRM_SUSPENDED",
      entityId: id,
      metadata: { firmName: firm.name, reason: reason ?? null },
    });

    return updated;
  },

  /**
   * Reactivate a previously SUSPENDED law firm.
   */
  async activate(id: string, activatedByUserId: string) {
    const firm = await lawFirmRepository.findById(id);
    if (!firm) {
      throw AppError.notFound("Law firm not found");
    }
    if (firm.status !== "SUSPENDED") {
      throw AppError.badRequest(`Only SUSPENDED law firms can be reactivated. Current status: ${firm.status}`);
    }

    const updated = await lawFirmRepository.updateStatus(id, "ACTIVE");

    await lawFirmRepository.createAuditLog({
      userId: activatedByUserId,
      action: "LAW_FIRM_REACTIVATED",
      entityId: id,
      metadata: { firmName: firm.name },
    });

    return updated;
  },

  /**
   * Reject a PENDING law firm registration.
   */
  async reject(id: string, rejectedByUserId: string, reason?: string) {
    const firm = await lawFirmRepository.findById(id);
    if (!firm) {
      throw AppError.notFound("Law firm not found");
    }
    if (firm.status !== "PENDING") {
      throw AppError.badRequest(`Only PENDING law firms can be rejected. Current status: ${firm.status}`);
    }

    const updated = await lawFirmRepository.updateStatus(id, "REJECTED");

    await lawFirmRepository.createAuditLog({
      userId: rejectedByUserId,
      action: "LAW_FIRM_REJECTED",
      entityId: id,
      metadata: { firmName: firm.name, reason: reason ?? null },
    });

    return updated;
  },

  async updateModules(id: string, modulesEnabled: string[], updatedByUserId: string, allowedCourseIds?: string[], allowedExamTypes?: string[]) {
    const firm = await lawFirmRepository.findById(id);
    if (!firm) {
      throw AppError.notFound("Organization not found");
    }

    const updated = await lawFirmRepository.updateModules(id, modulesEnabled, allowedCourseIds, allowedExamTypes);

    await lawFirmRepository.createAuditLog({
      userId: updatedByUserId,
      action: "LAW_FIRM_MODULES_UPDATED",
      entityId: id,
      metadata: { firmName: firm.name, previousModules: firm.modulesEnabled, newModules: modulesEnabled, allowedCourseIds, allowedExamTypes },
    });

    return updated;
  },

  // Permanently removes an organization and everything that belongs
  // exclusively to it — cases, clients, documents, hearings, roles, and
  // any question bank/mock test/library content it created (hostLawFirmId).
  // Staff accounts (Lawyer/Staff/Admin) are deleted along with it, since
  // they only exist as employees of this organization. STUDENT accounts
  // are NOT deleted — they're only unlinked (lawFirmId set to null) so a
  // student's own login, progress, and history survive their institution
  // being removed.
  async remove(id: string) {
    const firm = await lawFirmRepository.findById(id);
    if (!firm) {
      throw AppError.notFound("Organization not found");
    }
    await lawFirmRepository.deleteCascade(id);
  },
};
