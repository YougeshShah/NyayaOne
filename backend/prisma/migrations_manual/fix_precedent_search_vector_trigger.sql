-- Fix: Precedent.searchVector was never populated (no trigger existed to
-- keep it in sync), so full-text search always returned zero results even
-- though the column and index were correctly defined in the schema.
--
-- This creates a trigger that keeps searchVector automatically up to date
-- on every INSERT/UPDATE, and this file documents the one-time backfill
-- that was run against both local and production databases to fix
-- existing rows.
--
-- Applied manually via docker exec + psql on:
--   - Local:      2026-08-30
--   - Production: 2026-08-30

CREATE OR REPLACE FUNCTION precedent_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW."caseNumber", '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.petitioner, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.respondent, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.judges, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW."fullContent", '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS precedent_search_vector_trigger ON "Precedent";
CREATE TRIGGER precedent_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "Precedent"
  FOR EACH ROW EXECUTE FUNCTION precedent_search_vector_update();

-- One-time backfill for existing rows (re-run is harmless, just slow):
-- UPDATE "Precedent" SET id = id;
