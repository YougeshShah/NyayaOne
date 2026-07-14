import { AppError } from "../../../common/errors/AppError";
import { hashPassword } from "../../../common/utils/password";
import { clientRepository } from "../repository/client.repository";
import { CreateClientInput, UpdateClientInput, ListClientsQuery, InviteClientInput } from "../dto/client.dto";

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

  /**
   * Grants a client login access to the Client Mobile App. Creates a User
   * account (accountType CLIENT) and links it to the existing Client record.
   * The client's email must be set first (required for login).
   */
  async invite(id: string, lawFirmId: string, input: InviteClientInput) {
    const client = await this.getById(id, lawFirmId);

    if (client.userId) {
      throw AppError.conflict("This client already has portal access");
    }
    if (!client.email) {
      throw AppError.badRequest("Client must have an email address before granting portal access");
    }

    const existingUser = await clientRepository.findUserByEmail(client.email);
    if (existingUser) {
      throw AppError.conflict("An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await clientRepository.createPortalUser({
      lawFirmId,
      fullName: client.fullName,
      email: client.email,
      phone: client.phone || undefined,
      passwordHash,
    });

    await clientRepository.linkUserToClient(id, user.id);

    return { message: "Portal access granted. Share the email and password with the client securely." };
  },
};
