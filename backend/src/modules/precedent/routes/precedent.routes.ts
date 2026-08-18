import { Router } from "express";
import { precedentController } from "../controller/precedent.controller";
import { authenticate } from "../../../common/middleware/authenticate";
import { authorize } from "../../../common/middleware/authorize";
import { requirePrecedentAccess } from "../middleware/require-precedent-access";
import { requirePermission } from "../../../common/middleware/requirePermission";

const router = Router();

router.use(authenticate);
// COMPANY always passes through; everyone else needs their institution's
// "precedent_search" module enabled (checked fresh against the DB).
router.use(requirePrecedentAccess);

// Any authenticated account (Company, institution staff, lawyer) can
// search/browse -- access to institution-scoped uploads is enforced by
// lawFirmId filtering inside the controller/service, not by role checks,
// since Company/institution/lawyer all need read access, just to
// different visibility scopes.
router.get("/", precedentController.search);
router.get("/categories", precedentController.listCategories);
router.get("/:id", precedentController.getById);

// Only Company and institution admins can add precedents (bulk import
// runs as a script directly against the DB, not through this endpoint --
// this route is for the manual "add one precedent" case).
router.post("/", authorize("COMPANY", "LAW_FIRM_ADMIN"), precedentController.create);

// Edit/delete are Company-only -- Company owns and curates the shared
// precedent database; institutions can add their own but not alter or
// remove entries (including entries other institutions added).
router.patch("/:id", authorize("COMPANY"), requirePermission("precedent.manage"), precedentController.update);
router.delete("/:id", authorize("COMPANY"), requirePermission("precedent.manage"), precedentController.remove);

export default router;
