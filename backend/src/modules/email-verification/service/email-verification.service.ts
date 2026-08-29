import { prisma } from "../../../database/prisma";
import { AppError } from "../../../common/errors/AppError";
import { emailService } from "../../../common/services/email.service";
import { hashPassword } from "../../../common/utils/password";

const CODE_EXPIRY_MINUTES = 10;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

export const emailVerificationService = {
  async sendCode(email: string, purpose: "REGISTRATION" | "PASSWORD_RESET") {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    await prisma.emailVerificationCode.create({
      data: { email: email.toLowerCase().trim(), code, purpose, expiresAt },
    });

    await emailService.sendVerificationCode(email, code, purpose);
  },

  // Checks a code is valid (matches, unused, not expired) without
  // consuming it -- used internally by verifyEmail / resetPasswordWithCode
  // rather than exposed directly, so both flows share one source of truth.
  async findValidCode(email: string, code: string, purpose: "REGISTRATION" | "PASSWORD_RESET") {
    const record = await prisma.emailVerificationCode.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        code,
        purpose,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!record) throw AppError.badRequest("Invalid or expired code. Please request a new one.");
    return record;
  },

  async verifyEmail(email: string, code: string) {
    const record = await this.findValidCode(email, code, "REGISTRATION");
    await prisma.emailVerificationCode.update({ where: { id: record.id }, data: { usedAt: new Date() } });
    await prisma.user.updateMany({ where: { email: email.toLowerCase().trim() }, data: { emailVerified: true } });
  },

  async resetPasswordWithCode(email: string, code: string, newPassword: string, institutionSlug?: string) {
    const record = await this.findValidCode(email, code, "PASSWORD_RESET");
    const passwordHash = await hashPassword(newPassword);
    await prisma.emailVerificationCode.update({ where: { id: record.id }, data: { usedAt: new Date() } });

    const normalizedEmail = email.toLowerCase().trim();
    let result;
    if (institutionSlug) {
      const firm = await prisma.lawFirm.findFirst({ where: { slug: institutionSlug } });
      if (!firm) throw AppError.notFound("No account found with this email.");
      result = await prisma.user.updateMany({ where: { email: normalizedEmail, lawFirmId: firm.id }, data: { passwordHash } });
    } else {
      result = await prisma.user.updateMany({ where: { email: normalizedEmail, lawFirmId: null }, data: { passwordHash } });
      if (result.count === 0) {
        // Fall back for accounts that predate multi-org scoping, or when
        // the email only exists under one organization -- same pattern as login.
        const matches = await prisma.user.findMany({ where: { email: normalizedEmail } });
        if (matches.length > 1) {
          throw AppError.badRequest("This email is registered with more than one organization. Please reset your password from that organization's page.");
        }
        result = await prisma.user.updateMany({ where: { email: normalizedEmail }, data: { passwordHash } });
      }
    }
    if (result.count === 0) throw AppError.notFound("No account found with this email.");
  },
};
