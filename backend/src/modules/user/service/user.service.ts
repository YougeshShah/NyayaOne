import { AppError } from "../../../common/errors/AppError";
import { hashPassword } from "../../../common/utils/password";
import { userRepository } from "../repository/user.repository";
import { CreateUserInput, UpdateUserInput, ListUsersQuery } from "../dto/user.dto";
import { prisma } from "../../../database/prisma";

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
      roleId: input.roleId,
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

  // Generates a fresh temporary password, hashes it, and returns the PLAIN
  // text once — there is no email service configured yet, so the admin
  // resetting the password is responsible for relaying it to the user
  // through whatever channel they normally use (phone call, in person, etc).
  // The plain password is never stored or logged anywhere.
  async resetPassword(id: string, lawFirmId: string) {
    await this.getById(id, lawFirmId); // throws 404 if not found / not in this firm
    const newPassword = generateTempPassword();
    const passwordHash = await hashPassword(newPassword);
    const result = await userRepository.resetPasswordScoped(id, lawFirmId, passwordHash);
    if (result.count === 0) {
      throw AppError.notFound("User not found in your firm");
    }
    return { newPassword };
  },

  // Company-only — resets any user's password regardless of which
  // organization they belong to.
  async resetPasswordAsCompany(id: string) {
    const newPassword = generateTempPassword();
    const passwordHash = await hashPassword(newPassword);
    const result = await userRepository.resetPasswordUnscoped(id, passwordHash);
    if (result.count === 0) {
      throw AppError.notFound("User not found");
    }
    return { newPassword };
  },

  // Lets Company update ANY user's own contact details (email, phone, name) —
  // e.g. when someone's Gmail was compromised/changed, or their phone number
  // changed, and they need their account's login email or contact info
  // corrected. Company must verify the person's identity themselves before
  // doing this (support conversation, ID check, etc.) — the platform can't
  // verify that automatically.
  async updateContactAsCompany(id: string, input: { fullName?: string; email?: string; phone?: string }) {
    if (input.email) {
      // Scope the duplicate check to the target user's own organization --
      // the same email existing under a different org is fine.
      const target = await userRepository.findUserById(id);
      const existing = await prisma.user.findFirst({ where: { email: input.email, lawFirmId: target?.lawFirmId ?? null } });
      if (existing && existing.id !== id) {
        throw AppError.badRequest("That email is already used by another account at this organization.");
      }
    }
    const result = await userRepository.updateContactUnscoped(id, input);
    if (result.count === 0) {
      throw AppError.notFound("User not found");
    }
    return userRepository.findUserById(id);
  },

  async searchAsCompany(search: string) {
    if (!search || search.length < 2) return [];
    return userRepository.searchAcrossAllTenants(search);
  },
};

function generateTempPassword(): string {
  // Readable-ish random password — avoids ambiguous characters (0/O, 1/l).
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}
