-- ============================================================
-- Custom user-created quizzes ("Création de quiz personnalisé")
-- Paste this in Supabase Dashboard > SQL Editor > New Query.
--
-- Security model: this table is LOCKED (RLS enabled, no anon policies).
-- All reads/writes go through the `manage-custom-quiz` edge function,
-- which uses the service-role key and enforces validation, limits,
-- rate-limiting and the profanity filter. The anon/public key can NOT
-- read or enumerate quizzes directly.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE TABLE IF NOT EXISTS public.custom_quizzes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Secret share token used in the shareable link. Unguessable.
  share_id     TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  -- Chosen quiz pattern
  quiz_type    TEXT NOT NULL CHECK (quiz_type IN ('points', 'truefalse', 'fun', 'wyr')),
  lang         TEXT NOT NULL DEFAULT 'fr' CHECK (lang IN ('fr', 'en', 'es', 'de', 'it')),
  -- Full question set, validated server-side before insert
  questions    JSONB NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 0,
  -- Private by default; public quizzes are listed on the page
  is_public    BOOLEAN NOT NULL DEFAULT false,
  plays        INTEGER NOT NULL DEFAULT 0,
  ip_address   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Private quizzes expire after 1 week; public quizzes are kept (NULL)
  expires_at   TIMESTAMPTZ
);

ALTER TABLE public.custom_quizzes ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: only the service-role edge function may access rows.

CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_quizzes_share_id ON public.custom_quizzes (share_id);
CREATE INDEX IF NOT EXISTS idx_custom_quizzes_public   ON public.custom_quizzes (is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_quizzes_expires  ON public.custom_quizzes (expires_at);
CREATE INDEX IF NOT EXISTS idx_custom_quizzes_ip_date  ON public.custom_quizzes (ip_address, created_at);

-- ── Atomic play counter (called by the edge function) ────────────────
CREATE OR REPLACE FUNCTION public.increment_quiz_plays(p_share_id TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.custom_quizzes SET plays = plays + 1 WHERE share_id = p_share_id;
$$;

-- ── Auto-cleanup of expired (private) quizzes ────────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_expired_custom_quizzes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.custom_quizzes
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$;

-- Run every hour. Unschedule-then-schedule so re-running this whole script
-- (e.g. on every deploy) never duplicates or errors on the cron job.
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-expired-custom-quizzes');
EXCEPTION WHEN OTHERS THEN
  NULL; -- job did not exist yet
END $$;

SELECT cron.schedule(
  'cleanup-expired-custom-quizzes',
  '0 * * * *',
  $$ SELECT public.cleanup_expired_custom_quizzes(); $$
);
