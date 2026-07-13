import { prisma } from "../../../database/prisma";
import { AppError } from "../../../common/errors/AppError";
import { caseRepository } from "../repository/case.repository";
import { CreateCaseInput, UpdateCaseInput, ListCasesQuery } from "../dto/case.dto";

export const caseService = {
  async list(lawFirmId: string, query: ListCasesQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await caseRepository.findMany({
      lawFirmId,
      status: query.status,
      priority: query.priority,
      lawyerId: query.lawyerId,
      clientId: query.clientId,
      search: query.search,
      skip,
      take: query.limit,
    });
    return {
      items,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async getById(id: string, lawFirmId: string) {
    const caseRecord = await caseRepository.findByIdScoped(id, lawFirmId);
    if (!caseRecord) throw AppError.notFound("Case not found in your firm");
    return caseRecord;
  },

  /**
   * Validates that the court exists, and that every client/lawyer referenced
   * actually belongs to this law firm — prevents cross-tenant data leakage
   * where a firm could accidentally (or maliciously) link another firm's people.
   */
  async create(lawFirmId: string, input: CreateCaseInput) {
    const court = await prisma.court.findUnique({ where: { id: input.courtId } });
    if (!court || !court.isActive) {
      throw AppError.badRequest("Selected court does not exist or is inactive");
    }

    const duplicateCaseNumber = await caseRepository.existsByCaseNumber(lawFirmId, input.caseNumber);
    if (duplicateCaseNumber) {
      throw AppError.conflict("A case with this case number already exists in your firm");
    }

    const clientsCount = await prisma.client.count({ where: { id: { in: input.clientIds }, lawFirmId } });
    if (clientsCount !== input.clientIds.length) {
      throw AppError.badRequest("One or more selected clients do not belong to your firm");
    }

    const lawyersCount = await prisma.user.count({
      where: { id: { in: input.lawyerIds }, lawFirmId, accountType: "LAWYER" },
    });
    if (lawyersCount !== input.lawyerIds.length) {
      throw AppError.badRequest("One or more selected lawyers do not belong to your firm");
    }

    if (input.leadLawyerId && !input.lawyerIds.includes(input.leadLawyerId)) {
      throw AppError.badRequest("Lead lawyer must be one of the assigned lawyers");
    }

    return caseRepository.create({
      lawFirmId,
      caseNumber: input.caseNumber,
      caseTitle: input.caseTitle,
      courtId: input.courtId,
      clientIds: input.clientIds,
      lawyerIds: input.lawyerIds,
      leadLawyerId: input.leadLawyerId,
      opposingParty: input.opposingParty,
      opposingLawyer: input.opposingLawyer,
      courtSubject: input.courtSubject,
      category: input.category,
      filingDate: input.filingDate,
      judge: input.judge,
      priority: input.priority,
      remarks: input.remarks,
    });
  },

  async update(id: string, lawFirmId: string, input: UpdateCaseInput) {
    await this.getById(id, lawFirmId);
    const result = await caseRepository.updateScoped(id, lawFirmId, input);
    if (result.count === 0) throw AppError.notFound("Case not found in your firm");
    return this.getById(id, lawFirmId);
  },

  async statusSummary(lawFirmId: string) {
    return caseRepository.countByStatusForFirm(lawFirmId);
  },
};
