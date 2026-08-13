-- ============================================================
-- Votes du jeu « pour ou contre ».
--
-- La page annonce, après chaque proposition, le pourcentage de couples qui
-- ont répondu POUR et celui qui a répondu CONTRE. Il faut donc stocker les
-- votes un par un : quiz_completions ne retient que le slug et la langue,
-- elle sait combien de parties ont eu lieu, pas ce qui a été voté.
--
-- On ne stocke rien de nominatif. « votant » est un haché : le navigateur
-- combine un jeton local et l'adresse IP vue par le serveur, et n'envoie que
-- l'empreinte. Le sel est propre à ce jeu, donc le même visiteur ne porte
-- pas le même identifiant ici et sur les dilemmes : les deux paquets de
-- votes ne peuvent pas être recoupés.
--
-- Tant que ce fichier n'est pas appliqué, la page reste jouable : le moteur
-- compte le vote localement, affiche « vous êtes le premier couple à
-- trancher cette proposition », et l'envoi échoue en silence.
--
-- Déploiement : le workflow « Apply DB migrations » l'applique tout seul si
-- le secret SUPABASE_DB_URL existe. Sinon, coller ce fichier une fois dans
-- Supabase > SQL Editor > New Query.
--
-- Idempotent, réexécutable sans risque.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pour_contre_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Rang de la proposition dans la liste des soixante, de 1 à 60. C'est le
  -- moteur qui le calcule, à partir de l'ordre des familles.
  question_id smallint NOT NULL CHECK (question_id BETWEEN 1 AND 200),
  choix text NOT NULL CHECK (choix IN ('pour', 'contre')),
  lang text NOT NULL DEFAULT 'fr',
  votant text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Un vote par proposition et par votant. C'est cette contrainte qui fait
-- foi, pas le localStorage du navigateur : sans elle, vider son stockage
-- suffirait à voter cent fois sur la même proposition.
CREATE UNIQUE INDEX IF NOT EXISTS pour_contre_votes_unique_idx
  ON public.pour_contre_votes (question_id, votant);

CREATE INDEX IF NOT EXISTS pour_contre_votes_question_idx
  ON public.pour_contre_votes (question_id);

ALTER TABLE public.pour_contre_votes ENABLE ROW LEVEL SECURITY;

-- N'importe qui peut déposer son vote, personne ne peut lire la table ligne
-- à ligne : les chiffres publics passent par la fonction ci-dessous, qui ne
-- rend que des totaux.
DROP POLICY IF EXISTS "pour_contre_votes_insert_anon" ON public.pour_contre_votes;
CREATE POLICY "pour_contre_votes_insert_anon" ON public.pour_contre_votes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── Totaux publics ──────────────────────────────────────────────────────
-- Un seul aller-retour au démarrage de la partie donne les deux camps de
-- toutes les propositions. Les afficher après chaque vote coûterait soixante
-- requêtes par partie pour la même information.
DROP FUNCTION IF EXISTS public.get_pour_contre_counts();

CREATE OR REPLACE FUNCTION public.get_pour_contre_counts()
RETURNS TABLE(question_id smallint, pour bigint, contre bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.question_id,
         count(*) FILTER (WHERE v.choix = 'pour')::bigint,
         count(*) FILTER (WHERE v.choix = 'contre')::bigint
  FROM public.pour_contre_votes v
  GROUP BY v.question_id
  ORDER BY v.question_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_pour_contre_counts() TO anon, authenticated;
