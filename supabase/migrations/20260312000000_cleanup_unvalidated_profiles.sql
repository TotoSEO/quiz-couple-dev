-- ============================================================
-- CLEANUP: Auto-delete unvalidated profiles after 48 hours
-- Removes profile + associated auth user if not approved
-- ============================================================

CREATE OR REPLACE FUNCTION public.cleanup_unvalidated_annuaire_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
BEGIN
  -- Find profiles that are not published and older than 48 hours
  FOR r IN
    SELECT id, user_id
    FROM annuaire_professionals
    WHERE is_published = false
      AND created_at < now() - interval '48 hours'
  LOOP
    -- Delete the profile (cascades to views/clicks)
    DELETE FROM annuaire_professionals WHERE id = r.id;

    -- Delete the associated auth user (removes all user data)
    DELETE FROM auth.users WHERE id = r.user_id;
  END LOOP;
END;
$$;

-- Run every hour to check for expired profiles
SELECT cron.schedule(
  'cleanup-unvalidated-annuaire-profiles',
  '0 * * * *',
  'SELECT cleanup_unvalidated_annuaire_profiles()'
);
