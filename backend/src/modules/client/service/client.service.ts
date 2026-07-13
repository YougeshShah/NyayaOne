import { AppError } from "../../../common/errors/AppError";
import { clientRepository } from "../repository/client.repository";
import { CreateClientInput, UpdateClientInput, ListClientsQuery } from "../dto/client.dto";

export const clientService = {
  async list(lawFirmId: string, query: ListClientsQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await clientRepository.findMany({
      lawFirmId,
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
    const client = await clientRepository.findByIdScoped(id, lawFirmId);
    if (!client) throw AppError.notFound("Client not found in your firm");
    return client;
  },

  async create(lawFirmId: string, input: CreateClientInput) {
    return clientRepository.create(lawFirmId, input);
  },

  async update(id: string, lawFirmId: string, input: UpdateClientInput) {
    await this.getById(id, lawFirmId);
    const result = await clientRepository.updateScoped(id, lawFirmId, input);
    if (result.count === 0) throw AppError.notFound("Client not found in your firm");
    return this.getById(id, lawFirmId);
  },
};
