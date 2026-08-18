import { AppError } from "../../../common/errors/AppError";
import { precedentRepository } from "../repository/precedent.repository";
import { CreatePrecedentInput, UpdatePrecedentInput, ListPrecedentsQuery } from "../dto/precedent.dto";
import { detectCategory } from "../category-detector";

export const precedentService = {
  async search(query: ListPrecedentsQuery, lawFirmId?: string | null) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await precedentRepository.search({
      search: query.search,
      category: query.category,
      lawFirmId,
      skip,
      take: query.limit,
    });
    return { items, pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  },

  async getById(id: string) {
    const p = await precedentRepository.findById(id);
    if (!p) throw AppError.notFound("Precedent not found");
    return p;
  },

  async listCategories(lawFirmId?: string | null) {
    return precedentRepository.listCategories(lawFirmId);
  },

  async create(input: CreatePrecedentInput, uploadedBy: string, hostLawFirmId?: string) {
    // Auto-detect category if the uploader didn't set one explicitly --
    // same detection logic the bulk import script uses, so manually-added
    // precedents get consistent categorization too.
    const category = input.category || detectCategory(input.fullContent) || undefined;
    return precedentRepository.create({ ...input, category, uploadedBy, hostLawFirmId } as any);
  },

  // Only Company can edit/delete -- enforced in the controller (which
  // knows the requester's accountType), this just does the actual work
  // once that check has already passed.
  async update(id: string, input: UpdatePrecedentInput) {
    const existing = await precedentRepository.findById(id);
    if (!existing) throw AppError.notFound("Precedent not found");
    const category = input.category || (input.fullContent ? detectCategory(input.fullContent) : undefined) || undefined;
    return precedentRepository.update(id, { ...input, ...(category ? { category } : {}) } as any);
  },

  async remove(id: string) {
    const existing = await precedentRepository.findById(id);
    if (!existing) throw AppError.notFound("Precedent not found");
    await precedentRepository.delete(id);
  },
};
