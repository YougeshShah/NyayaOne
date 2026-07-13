import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { verifyAccessToken, AccessTokenPayload } from "../utils/jwt";

// Extend Express Request to carry authenticated user context.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload;
    }
  }
}

/**
 * Verifies the Bearer access token and attaches the decoded payload to req.auth.
 * This is the foundation of multi-tenant isolation: every downstream repository
 * query MUST scope by req.auth.lawFirmId (except for COMPANY accounts).
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw AppError.unauthorized("Missing or invalid Authorization header");
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.auth = decoded;
    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }
}
