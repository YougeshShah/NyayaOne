import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { logger } from "../utils/logger";
import { env } from "../../config/env";

/**
 * Global error handler — must be registered LAST in app.ts (after all routes).
 * Combined with express-async-errors, this catches both sync and async errors
 * from every controller without needing try/catch blocks everywhere.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Known, operational errors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
    }
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Prisma known errors (e.g. unique constraint violation)
  if (typeof err === "object" && err !== null && "code" in err && String((err as any).code).startsWith("P")) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } };
    if (prismaErr.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: `Duplicate value for field: ${prismaErr.meta?.target?.join(", ") || "unknown"}`,
      });
    }
    if (prismaErr.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
  }

  // Unknown / unexpected errors
  logger.error(err instanceof Error ? err.stack || err.message : String(err));

  return res.status(500).json({
    success: false,
    message: env.nodeEnv === "development" ? (err as Error)?.message || "Internal server error" : "Internal server error",
  });
}
