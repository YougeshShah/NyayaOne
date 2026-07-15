import { AppError } from "../../../common/errors/AppError";
import { libraryRepository } from "../repository/library.repository";
import { CreateLibraryResourceInput, UpdateLibraryResourceInput, ListLibraryResourcesQuery } from "../dto/library.dto";

export const libraryService = {
  async list(query: ListLibraryResourcesQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await libraryRepository.findMany({
      type: query.type,
      category: query.category,
      search: query.search,
      skip,
      take: query.limit,
    });
    return {
      items,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async listCategories() {
    return libraryRepository.listDistinctCategories();
  },

  async getById(id: string) {
    const resource = await libraryRepository.findById(id);
    if (!resource) throw AppError.notFound("Library resource not found");
    return resource;
  },

  async create(input: CreateLibraryResourceInput, publishedBy: string, fileUrl?: string) {
    return libraryRepository.create({ ...input, fileUrl, publishedBy });
  },

  async update(id: string, input: UpdateLibraryResourceInput, fileUrl?: string) {
    await this.getById(id);
    return libraryRepository.update(id, { ...input, ...(fileUrl ? { fileUrl } : {}) });
  },

  async remove(id: string) {
    await this.getById(id);
    await libraryRepository.delete(id);
  },
};
