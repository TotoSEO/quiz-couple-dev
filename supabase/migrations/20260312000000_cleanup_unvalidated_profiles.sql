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
  -- Find unpublished profiles not touched in 48 hours
  -- Uses updated_at so rejected profiles get 48h from rejection to fix
  FOR r IN
    SELECT id, user_id
    FROM annuaire_professionals
    WHERE is_published = false
      AND updated_at < now() - interval '48 hours'
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
