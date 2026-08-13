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

  // File downloads opened via the mobile app's Linking.openURL (which can't
  // set custom headers, unlike a normal fetch/axios call) pass the token as
  // a query param instead — only used for GET download-style routes.
  const queryToken = typeof req.query.token === "string" ? req.query.token : null;

  let token: string;
  if (header && header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  } else if (queryToken) {
    token = queryToken;
  } else {
    throw AppError.unauthorized("Missing or invalid Authorization header");
  }

  try {
    const decoded = verifyAccessToken(token);
    req.auth = decoded;
    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }
}
