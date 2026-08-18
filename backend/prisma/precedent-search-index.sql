-- Run this AFTER `npx prisma migrate dev` has created the Precedent table
-- (Prisma's schema DSL can't express a generated tsvector column directly,
-- so this is applied as a follow-up raw SQL step).
--
-- 'simple' text search config is used deliberately instead of 'english' --
-- PostgreSQL ships no Nepali/Devanagari config, and 'simple' just does
-- whitespace/punctuation tokenization without English-specific stemming
-- that would be meaningless (and potentially harmful) applied to
-- Devanagari text. This still gives real "every word is searchable"
-- full-text search, just without language-aware stemming.

ALTER TABLE "Precedent"
  ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("fullContent", ''))
  ) STORED;

CREATE INDEX "precedent_search_idx" ON "Precedent" USING GIN ("searchVector");
