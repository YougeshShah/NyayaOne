-- New permissions for features built this session that previously had no
-- granular permission check -- only hardcoded authorize("COMPANY"), which
-- meant "Content Manager A gets this feature, B doesn't" was impossible.

INSERT INTO "Permission" (id, key, description, module, "createdAt") VALUES
  ('0c145fff-2727-4410-a145-f596a957fdd3', 'precedent.manage', 'Add, edit, and delete precedent (नजिर) database entries', 'Precedent', now()),
  ('cf33e3fe-9ce0-42d1-9296-261f6085eecf', 'speaking.manage', 'Create and edit IELTS Speaking test prompts', 'Speaking', now()),
  ('49b0e7d6-3ce0-41ca-b6e2-12d437666b4d', 'usage_limit.manage', 'Set Practice/Mock Test/Speaking usage limits', 'UsageLimit', now()),
  ('a0330ae7-90e3-4cf2-a886-ac77c93b8f87', 'course.manage', 'Create and edit courses', 'Course', now()),
  ('b2471974-19cc-43f0-9fd0-09faa0c92c07', 'flashcard.manage', 'Create and edit flashcards', 'Flashcard', now()),
  ('98a057fd-bf7a-4c39-9d9b-8ff00993ea24', 'mock_test.manage', 'Create and edit mock tests', 'MockTest', now())
ON CONFLICT (key) DO NOTHING;
