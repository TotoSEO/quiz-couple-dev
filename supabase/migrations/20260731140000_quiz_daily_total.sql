-- ============================================================
-- Total quiz/test completions per day (for the admin "Évolution
-- quotidienne" curve). Aggregates the existing quiz_completions
-- table — nothing new is stored, every completion is already
-- recorded with its timestamp.
--
-- Paste this ONCE in Supabase Dashboard > SQL Editor > New Query
-- (same as the two custom_quizzes files). Idempotent & safe to re-run.
--
-- NOTE: the admin page also works WITHOUT this function — it falls
-- back to summing each quiz's daily curve client-side. This RPC just
-- makes the total curve load in a single, efficient query.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_quiz_daily_total(p_days integer DEFAULT 30)
RETURNS TABLE(day date, total bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT created_at::date AS day, count(*)::bigint AS total
  FROM public.quiz_completions
  WHERE created_at >= (now() - make_interval(days => GREATEST(p_days, 1)))
  GROUP BY created_at::date
  ORDER BY created_at::date;
$$;

-- The admin dashboard calls this with the public anon key (like the
-- other get_quiz_* stat functions), so expose it to anon.
GRANT EXECUTE ON FUNCTION public.get_quiz_daily_total(integer) TO anon, authenticated;
