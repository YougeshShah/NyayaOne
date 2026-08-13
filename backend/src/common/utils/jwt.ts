import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";

export interface AccessTokenPayload {
  userId: string;
  accountType: string;
  lawFirmId: string | null;
  roleId: string | null;
  preferredExamType?: string | null;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiry,
  } as SignOptions);
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiry,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, env.jwt.refreshSecret) as { userId: string };
}
