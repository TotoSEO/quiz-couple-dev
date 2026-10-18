-- Retrait de la page « Activités autour de moi » (17 octobre 2026, Thomas :
-- « ça fonctionne pas et ça sert à rien, supprime vraiment tout de cette
-- page »). La table activity_validations ne recevait que le compteur des
-- recherches de la fonction serveur search-activities, lu par une puce de
-- l'admin ; la page, le script, la fonction et la puce ont disparu du dépôt
-- (deploy-functions.yml supprime la fonction chez Supabase). Plus rien ne lit
-- ni n'écrit cette table : on la retire, avec sa règle et son index.
-- À appliquer dans Supabase > SQL Editor ; idempotente.
DROP POLICY IF EXISTS "Allow read activity_validations" ON public.activity_validations;
DROP INDEX IF EXISTS public.idx_activity_validations_created_at;
DROP TABLE IF EXISTS public.activity_validations;
