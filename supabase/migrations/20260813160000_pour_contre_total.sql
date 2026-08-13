-- ============================================================
-- Compteur public du jeu « pour ou contre ».
--
-- La page affichait le compteur générique, celui qui compte les parties
-- terminées : il faut atteindre l'écran de bilan pour qu'une partie soit
-- enregistrée, et une partie peut valoir trois votes comme soixante. Sur
-- ce jeu-là, c'est le total des votes qui a un sens, exactement comme sur
-- les dilemmes, qui ont leur propre fonction pour la même raison.
--
-- Le total est public, les votes ligne à ligne ne le sont pas : la fonction
-- est en SECURITY DEFINER et ne rend qu'un nombre.
--
-- Déploiement : le workflow « Apply DB migrations » l'applique tout seul si
-- le secret SUPABASE_DB_URL existe. Sinon, coller ce fichier une fois dans
-- Supabase > SQL Editor > New Query.
--
-- Idempotent, réexécutable sans risque.
-- ============================================================

DROP FUNCTION IF EXISTS public.get_pour_contre_total();

CREATE OR REPLACE FUNCTION public.get_pour_contre_total()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::bigint FROM public.pour_contre_votes;
$$;

GRANT EXECUTE ON FUNCTION public.get_pour_contre_total() TO anon, authenticated;
