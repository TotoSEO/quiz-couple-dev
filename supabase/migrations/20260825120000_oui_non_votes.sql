-- ============================================================
-- Votes du jeu « Oui ou non » spécial couple.
--
-- Après chaque situation, la page affiche combien de personnes ont voté OUI
-- et combien ont voté NON. Il faut donc stocker les votes un par un, comme
-- pour les dilemmes et le pour ou contre : quiz_completions ne retient que
-- le slug et la langue.
--
-- On ne stocke rien de nominatif. « votant » est un haché : le navigateur
-- combine un jeton local et l'adresse IP vue par le serveur, et n'envoie que
-- l'empreinte. Le sel est propre à ce jeu, donc le même visiteur ne porte
-- pas le même identifiant ici que sur les dilemmes ou le pour ou contre :
-- les paquets de votes ne peuvent pas être recoupés.
--
-- Tant que ce fichier n'est pas appliqué, la page reste jouable : le moteur
-- compte le vote localement, affiche « vous êtes les premiers à voter sur
-- cette situation », et l'envoi échoue en silence.
--
-- Déploiement : le workflow « Apply DB migrations » l'applique tout seul si
-- le secret SUPABASE_DB_URL existe. Sinon, coller ce fichier une fois dans
-- Supabase > SQL Editor > New Query.
--
-- Idempotent, réexécutable sans risque.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.oui_non_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Rang de la situation dans la liste des cent vingt, de 1 à 120. La borne
  -- monte à 200 pour qu'un futur ajout de situations ne demande pas de
  -- migration.
  question_id smallint NOT NULL CHECK (question_id BETWEEN 1 AND 200),
  choix text NOT NULL CHECK (choix IN ('oui', 'non')),
  lang text NOT NULL DEFAULT 'fr',
  votant text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Un vote par situation et par votant. C'est cette contrainte qui fait foi,
-- pas le localStorage du navigateur : sans elle, vider son stockage
-- suffirait à voter cent fois sur la même situation.
CREATE UNIQUE INDEX IF NOT EXISTS oui_non_votes_unique_idx
  ON public.oui_non_votes (question_id, votant);

CREATE INDEX IF NOT EXISTS oui_non_votes_question_idx
  ON public.oui_non_votes (question_id);

ALTER TABLE public.oui_non_votes ENABLE ROW LEVEL SECURITY;

-- N'importe qui peut déposer son vote, personne ne peut lire la table ligne
-- à ligne : les chiffres publics passent par la fonction ci-dessous, qui ne
-- rend que des totaux.
DROP POLICY IF EXISTS "oui_non_votes_insert_anon" ON public.oui_non_votes;
CREATE POLICY "oui_non_votes_insert_anon" ON public.oui_non_votes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── Totaux publics ──────────────────────────────────────────────────────
-- Un seul aller-retour au démarrage de la partie donne les deux camps de
-- toutes les situations. Les demander après chaque vote coûterait cent
-- vingt requêtes par partie pour la même information.
DROP FUNCTION IF EXISTS public.get_oui_non_counts();

CREATE OR REPLACE FUNCTION public.get_oui_non_counts()
RETURNS TABLE(question_id smallint, oui bigint, non bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.question_id,
         count(*) FILTER (WHERE v.choix = 'oui')::bigint,
         count(*) FILTER (WHERE v.choix = 'non')::bigint
  FROM public.oui_non_votes v
  GROUP BY v.question_id
  ORDER BY v.question_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_oui_non_counts() TO anon, authenticated;
