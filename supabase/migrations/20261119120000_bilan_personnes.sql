-- Le nombre de personnes qui ont répondu aux questions de l'évaluation, pour
-- la page de vente (19 novembre 2026, Thomas : « rajoute une section "X
-- personnes ont déjà répondu aux questions !" », puis « Peut être qu'il faut
-- comptabiliser que ceux qui sont allés au bout ? même si ils n'ont pas
-- payé ? C'est peut être plus juste »).
--
-- Une personne compte quand elle est allée au bout de ses propres
-- questions, qu'elle ait payé ou non : le créateur d'une évaluation à deux
-- (fini_a), son ou sa partenaire (fini_b), la personne seule du point ou de
-- l'ancien seul(e) (fini_a ; un seul(e) ne pose jamais b_fini, voir
-- bilan_compte()). La phrase « ont déjà répondu aux questions » est alors
-- vraie à la lettre ; compter tous ceux qui ont vu la première question
-- donnerait environ quatre fois plus, pour des personnes qui, souvent, n'ont
-- répondu qu'à une ou deux.
--
-- Les compteurs (bilan_compteurs) plutôt que les lignes de bilans : une
-- évaluation sans paiement est effacée 60 jours après sa dernière réponse,
-- le compteur reste. La sonde de « Évaluation de couple · santé »
-- (bilan-sante.yml, source « sonde ») n'est pas une personne ; une
-- évaluation de test retirée par bilan-retrait.yml n'est déjà plus comptée.
--
-- Lue par le site à la construction (generate.js, fetchPersonnesBilan) avec
-- la clé publique : elle ne rend qu'un nombre, celui que la page affiche.
-- Idempotente ; appliquée par bilan-base.yml après les autres migrations du
-- bilan.

CREATE OR REPLACE FUNCTION public.get_bilan_personnes()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(sum(n), 0)::integer
  FROM public.bilan_compteurs
  WHERE evenement IN ('fini_a', 'fini_b') AND cle <> 'sonde';
$$;
REVOKE EXECUTE ON FUNCTION public.get_bilan_personnes() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_bilan_personnes() TO anon, authenticated, service_role;

-- PostgREST relit son schéma pour exposer la fonction tout de suite.
NOTIFY pgrst, 'reload schema';

-- Ce que la migration laisse derrière elle, affiché dans le journal du
-- workflow : le nombre que la page affichera.
SELECT public.get_bilan_personnes() AS personnes;
