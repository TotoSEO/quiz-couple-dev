-- ============================================================
-- Add the 'wyr' ("Tu préfères…" / would-you-rather) quiz type
-- to the custom_quizzes CHECK constraint.
-- Idempotent: safe to run multiple times. Paste in the Supabase
-- SQL editor (or let the deploy-db workflow apply it).
-- ============================================================

ALTER TABLE public.custom_quizzes
  DROP CONSTRAINT IF EXISTS custom_quizzes_quiz_type_check;

ALTER TABLE public.custom_quizzes
  ADD CONSTRAINT custom_quizzes_quiz_type_check
  CHECK (quiz_type IN ('points', 'truefalse', 'fun', 'wyr'));
