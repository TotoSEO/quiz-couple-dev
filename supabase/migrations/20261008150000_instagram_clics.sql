-- Clics vers Instagram depuis le site (Thomas, 7 octobre 2026) : un seul
-- total, tous boutons confondus (icône du menu, lien du menu mobile, pied de
-- page, « Suivre » et vignettes des dernières publications sur l'accueil,
-- « Suivez-nous sur Instagram » après un avis). L'emplacement est tout de
-- même enregistré, pour le jour où on voudra savoir lequel travaille ; l'admin
-- n'affiche que le total, sept jours et aujourd'hui, dans l'onglet Réseaux.
-- Même modèle que source_pref_clics : écriture ouverte à la clé publique,
-- lecture par une fonction qui ne rend que des comptes.
--
-- Idempotente : appliquée par social-base.yml, ou à la main dans
-- Supabase > SQL Editor.

CREATE TABLE IF NOT EXISTS public.instagram_clics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- le numéro de passage de page_views : tiré au hasard, mort après trente
  -- minutes ; il sert à compter les visites distinctes qui ont cliqué
  visite_id text,
  emplacement text NOT NULL,
  lang text,
  path text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS instagram_clics_created_idx ON public.instagram_clics (created_at);

ALTER TABLE public.instagram_clics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "instagram_clics_insert_anon" ON public.instagram_clics;
CREATE POLICY "instagram_clics_insert_anon" ON public.instagram_clics
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- total      : depuis toujours.
-- jours7     : les sept derniers jours, aujourd'hui compris, heure de Paris.
-- aujourdhui : depuis minuit, heure de Paris.
-- visites7   : visites distinctes ayant cliqué sur sept jours.
-- Les bornes sont des instants calculés une fois, pour que l'index serve.
CREATE OR REPLACE FUNCTION public.get_instagram_clics()
RETURNS TABLE(total bigint, jours7 bigint, aujourdhui bigint, visites7 bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH b AS (
    SELECT (date_trunc('day', now() AT TIME ZONE 'Europe/Paris') AT TIME ZONE 'Europe/Paris') AS debut_jour,
           ((date_trunc('day', now() AT TIME ZONE 'Europe/Paris') - interval '6 days') AT TIME ZONE 'Europe/Paris') AS debut_7
  )
  SELECT (SELECT count(*) FROM public.instagram_clics)::bigint,
         (SELECT count(*) FROM public.instagram_clics c, b WHERE c.created_at >= b.debut_7)::bigint,
         (SELECT count(*) FROM public.instagram_clics c, b WHERE c.created_at >= b.debut_jour)::bigint,
         (SELECT count(DISTINCT c.visite_id) FROM public.instagram_clics c, b WHERE c.created_at >= b.debut_7)::bigint;
$$;

GRANT EXECUTE ON FUNCTION public.get_instagram_clics() TO anon, authenticated;
