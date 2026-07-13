import { AppError } from "../../../common/errors/AppError";
import { hashPassword } from "../../../common/utils/password";
import { userRepository } from "../repository/user.repository";
import { CreateUserInput, UpdateUserInput, ListUsersQuery } from "../dto/user.dto";

export const userService = {
  async list(lawFirmId: string, query: ListUsersQuery) {
    const skip = (query.page - 1) * query.limit;

    const { items, total } = await userRepository.findMany({
      lawFirmId,
      accountType: query.accountType,
      status: query.status,
      search: query.search,
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

  async getById(id: string, lawFirmId: string) {
    const user = await userRepository.findByIdScoped(id, lawFirmId);
    if (!user) {
      throw AppError.notFound("User not found in your firm");
    }
    return user;
  },

  /**
   * Firm Admin creates a Lawyer or Staff account within their own firm.
   * lawFirmId is taken from the authenticated admin's token (req.auth.lawFirmId),
   * never from the request body — this is what enforces multi-tenant isolation.
   */
  async create(lawFirmId: string, input: CreateUserInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict("An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await userRepository.create({
      lawFirmId,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      accountType: input.accountType,
      barRegistrationNo: input.barRegistrationNo,
      specialization: input.specialization,
    });

    return user;
  },

  async update(id: string, lawFirmId: string, input: UpdateUserInput) {
    await this.getById(id, lawFirmId); // throws 404 if not found / not in this firm
    const result = await userRepository.updateScoped(id, lawFirmId, input);
    if (result.count === 0) {
      throw AppError.notFound("User not found in your firm");
    }
    return this.getById(id, lawFirmId);
  },

  async updateStatus(id: string, lawFirmId: string, status: "ACTIVE" | "INACTIVE" | "SUSPENDED") {
    await this.getById(id, lawFirmId);
    const result = await userRepository.updateStatusScoped(id, lawFirmId, status);
    if (result.count === 0) {
      throw AppError.notFound("User not found in your firm");
    }
    return this.getById(id, lawFirmId);
  },
};
