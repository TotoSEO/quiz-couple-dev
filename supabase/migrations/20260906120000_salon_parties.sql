-- ============================================================
-- Parties jouées à distance (chacun sur son téléphone).
--
-- Le mode à distance ne crée aucune table pour ses salons : un salon est un
-- canal Realtime qui vit tant que quelqu'un y est abonné et disparaît tout
-- seul. Cette table ne sert qu'à la mesure : savoir quelle part des
-- lancements se joue à distance, page par page, pour voir ce qui intéresse.
--
-- Deux lignes par téléphone et par partie : « depart » quand les deux sont
-- connectés et que la première question s'affiche, « fin » quand le résultat
-- s'affiche. Une partie à deux téléphones fait donc deux départs et deux fins,
-- exactement comme elle fait deux lancements dans quiz_starts et deux
-- complétions dans quiz_completions : les trois tables se rapprochent sans
-- coefficient.
--
-- Rien de nominatif : un identifiant de page, une langue, un rôle (a créé la
-- partie ou l'a rejointe), une étape, une date. Ni prénom, ni code de salon,
-- ni réponse.
--
-- Déploiement : le workflow « Apply DB migrations » applique ce fichier tout
-- seul si le secret SUPABASE_DB_URL existe. Sinon, coller ce fichier une
-- fois dans Supabase > SQL Editor > New Query.
--
-- Idempotent, réexécutable sans risque.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.salon_parties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_slug text NOT NULL,
  lang text,
  role text,
  etape text NOT NULL,
  visite_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS salon_parties_slug_idx ON public.salon_parties (quiz_slug);
CREATE INDEX IF NOT EXISTS salon_parties_created_idx ON public.salon_parties (created_at);

ALTER TABLE public.salon_parties ENABLE ROW LEVEL SECURITY;

-- N'importe qui peut signaler un départ ou une fin, personne ne lit la table
-- ligne à ligne : les chiffres passent par les fonctions ci-dessous. Les
-- valeurs admises sont bornées pour qu'aucune ligne farfelue n'entre.
DROP POLICY IF EXISTS "salon_parties_insert_anon" ON public.salon_parties;
CREATE POLICY "salon_parties_insert_anon" ON public.salon_parties
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    etape IN ('depart', 'fin')
    AND (role IS NULL OR role IN ('c', 'j'))
    AND char_length(quiz_slug) <= 80
    AND (lang IS NULL OR char_length(lang) <= 8)
  );

-- ── Total des lancés à distance, toutes pages confondues ────────────────
CREATE OR REPLACE FUNCTION public.get_salon_total()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::bigint FROM public.salon_parties WHERE etape = 'depart';
$$;

-- ── Par page : lancés et finis à distance ───────────────────────────────
CREATE OR REPLACE FUNCTION public.get_salon_counts()
RETURNS TABLE(quiz_slug text, departs bigint, fins bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.quiz_slug,
         count(*) FILTER (WHERE s.etape = 'depart')::bigint AS departs,
         count(*) FILTER (WHERE s.etape = 'fin')::bigint    AS fins
  FROM public.salon_parties s
  GROUP BY s.quiz_slug
  ORDER BY 2 DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_salon_total() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_salon_counts() TO anon, authenticated;
