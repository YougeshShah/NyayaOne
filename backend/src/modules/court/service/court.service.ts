import { AppError } from "../../../common/errors/AppError";
import { courtRepository } from "../repository/court.repository";
import { CreateCourtInput, UpdateCourtInput, ListCourtsQuery } from "../dto/court.dto";

export const courtService = {
  async list(query: ListCourtsQuery) {
    const skip = (query.page - 1) * query.limit;

    const { items, total } = await courtRepository.findMany({
      type: query.type,
      province: query.province,
      search: query.search,
      isActive: query.isActive,
      skip,
      take: query.limit,
    });

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async listTypes() {
    return courtRepository.listDistinctTypes();
  },

  async listProvinces() {
    return courtRepository.listDistinctProvinces();
  },

  async getById(id: string) {
    const court = await courtRepository.findById(id);
    if (!court) {
      throw AppError.notFound("Court not found");
    }
    return court;
  },

  /**
   * Only Technocraftx (Company) can create courts. Court "type" is free text
   * (not a hardcoded enum) so new court categories can be added in the future
   * without a schema migration — satisfies the "allow adding new court types" requirement.
   */
  async create(input: CreateCourtInput) {
    const existing = await courtRepository.findByNameAndType(input.name, input.type);
    if (existing) {
      throw AppError.conflict("A court with this name and type already exists");
    }
    return courtRepository.create(input);
  },

  async update(id: string, input: UpdateCourtInput) {
    await this.getById(id); // throws 404 if not found
    return courtRepository.update(id, input);
  },

  /**
   * Deactivating a court hides it from new-case creation dropdowns but preserves
   * historical data integrity for existing cases already linked to it.
   * Blocked if the court still has open/ongoing cases, to avoid orphaning active work.
   */
  async deactivate(id: string) {
    await this.getById(id);
    const activeCases = await courtRepository.countActiveCasesForCourt(id);
    if (activeCases > 0) {
      throw AppError.badRequest(
        `Cannot deactivate: this court has ${activeCases} active case(s) linked to it`
      );
    }
    return courtRepository.setActive(id, false);
  },

  async activate(id: string) {
    await this.getById(id);
    return courtRepository.setActive(id, true);
  },
};
