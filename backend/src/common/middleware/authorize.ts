import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

/**
 * Restricts a route to specific account types.
 * Usage: router.get("/", authenticate, authorize("COMPANY"), controller.list)
 *
 * NOTE: This checks coarse-grained account type (COMPANY, LAW_FIRM_ADMIN, LAWYER, STAFF, CLIENT).
 * Fine-grained permission checks (for custom RBAC roles within COMPANY accounts)
 * are handled separately by requirePermission() once the Role/Permission module is wired up.
 */
export function authorize(...allowedAccountTypes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw AppError.unauthorized();
    }

    if (!allowedAccountTypes.includes(req.auth.accountType)) {
      throw AppError.forbidden("You do not have permission to perform this action");
    }

    next();
  };
}
