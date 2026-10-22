-- Chaque étape de l'évaluation comptée, seul(e) à part (21 octobre 2026).
-- Thomas devant l'entonnoir : « Seulement 1 personne sur 3 remplit le
-- formulaire jusqu'au bout pour démarrer l'évaluation [...] comment cette
-- stat prend en compte les gens qui répondent seul ? ». Le même jour, le
-- départ passe à un seul écran (prénoms et les deux cases), la situation est
-- posée comme les premières questions et l'adresse e-mail à la fin de ses
-- propres questions (serveur.mjs, bilan.js).
--
-- bilan_compte() ajoute : `situation` (la situation donnée), `commence_a` et
-- `commence_b` (la première réponse), et pour une évaluation seul(e)
-- `situation_solo`, `commence_a_solo`, `fini_a_solo`, `paiement_ouvert_solo`
-- (`cree_solo` et `paye_solo` existaient). Un événement `_solo` s'ajoute
-- toujours à l'événement de base : à deux = base - solo.
-- get_bilan_tableau() rend en plus, dans la série, ces compteurs et ceux que
-- la page envoie par l'action `vue` (depart, depart_erreur, invitation_vue,
-- situation_vue, email_vue par rôle, offre_vue, attente_vue,
-- case_manquante, cta_solo...), les
-- erreurs du départ par cause, et les arrêts avec leur part seul(e).
-- Idempotente ; appliquée par bilan-base.yml après
-- 20261021120000_bilan_rappels.sql.

CREATE OR REPLACE FUNCTION public.bilan_compte()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s text := COALESCE(NEW.src, 'direct');
  solo boolean := (NEW.mode = 'solo');
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.bilan_compte_evenement('cree', s);
    IF solo THEN PERFORM public.bilan_compte_evenement('cree_solo', s); END IF;
    -- Une page d'avant le 21 octobre 2026 donne la situation à la création.
    IF NEW.situation <> '{}'::jsonb THEN
      PERFORM public.bilan_compte_evenement('situation', s);
      IF solo THEN PERFORM public.bilan_compte_evenement('situation_solo', s); END IF;
    END IF;
    RETURN NEW;
  END IF;
  IF OLD.b_consent IS NULL AND NEW.b_consent IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('rejoint', s);
  END IF;
  -- La situation donnée (les sept premières questions depuis le 21 octobre
  -- 2026), puis la première réponse de chacun.
  IF OLD.situation = '{}'::jsonb AND NEW.situation <> '{}'::jsonb THEN
    PERFORM public.bilan_compte_evenement('situation', s);
    IF solo THEN PERFORM public.bilan_compte_evenement('situation_solo', s); END IF;
  END IF;
  IF OLD.a_reponses = '{}'::jsonb AND NEW.a_reponses <> '{}'::jsonb THEN
    PERFORM public.bilan_compte_evenement('commence_a', s);
    IF solo THEN PERFORM public.bilan_compte_evenement('commence_a_solo', s); END IF;
  END IF;
  IF OLD.b_reponses = '{}'::jsonb AND NEW.b_reponses <> '{}'::jsonb THEN
    PERFORM public.bilan_compte_evenement('commence_b', s);
  END IF;
  IF OLD.a_fini IS NULL AND NEW.a_fini IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('fini_a', s);
    IF solo THEN PERFORM public.bilan_compte_evenement('fini_a_solo', s); END IF;
  END IF;
  IF OLD.b_fini IS NULL AND NEW.b_fini IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('fini_b', s);
  END IF;
  IF OLD.a_fini IS NULL AND OLD.b_fini IS NULL AND (NEW.a_fini IS NOT NULL OR NEW.b_fini IS NOT NULL) THEN
    PERFORM public.bilan_compte_evenement('premier_fini', s);
  END IF;
  IF solo THEN
    IF OLD.a_fini IS NULL AND NEW.a_fini IS NOT NULL THEN
      PERFORM public.bilan_compte_evenement('deux_finis', s);
    END IF;
  ELSIF NOT (OLD.a_fini IS NOT NULL AND OLD.b_fini IS NOT NULL) AND NEW.a_fini IS NOT NULL AND NEW.b_fini IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('deux_finis', s);
  END IF;
  IF OLD.renonciation_le IS NULL AND NEW.renonciation_le IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('paiement_ouvert', s);
    IF solo THEN PERFORM public.bilan_compte_evenement('paiement_ouvert_solo', s); END IF;
  END IF;
  IF OLD.paye_le IS NULL AND NEW.paye_le IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('paye', s, NEW.paiement_montant);
    IF solo THEN PERFORM public.bilan_compte_evenement('paye_solo', s, NEW.paiement_montant); END IF;
  END IF;
  IF OLD.rembourse_le IS NULL AND NEW.rembourse_le IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('rembourse', s, NEW.paiement_montant);
  END IF;
  IF NEW.rapport_statut IS DISTINCT FROM OLD.rapport_statut THEN
    IF NEW.rapport_statut = 'pret' THEN
      PERFORM public.bilan_compte_evenement('rapport_pret');
    ELSIF NEW.rapport_statut = 'erreur' THEN
      PERFORM public.bilan_compte_evenement('rapport_erreur');
    ELSIF NEW.rapport_statut = 'a_faire' THEN
      PERFORM public.bilan_lancer_fabrique();
    END IF;
  END IF;
  RETURN NEW;
END
$$;
REVOKE EXECUTE ON FUNCTION public.bilan_compte() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_bilan_tableau(p_jours integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n_jours integer := LEAST(GREATEST(COALESCE(p_jours, 30), 1), 400);
  fin date := (now() AT TIME ZONE 'Europe/Paris')::date;
  debut date := (now() AT TIME ZONE 'Europe/Paris')::date - (LEAST(GREATEST(COALESCE(p_jours, 30), 1), 400) - 1);
  depuis timestamptz := (((now() AT TIME ZONE 'Europe/Paris')::date
                          - (LEAST(GREATEST(COALESCE(p_jours, 30), 1), 400) - 1))::timestamp) AT TIME ZONE 'Europe/Paris';
  resultat jsonb;
BEGIN
  WITH jours AS (
    SELECT generate_series(debut, fin, interval '1 day')::date AS jour
  ),
  c AS (
    SELECT * FROM public.bilan_compteurs WHERE jour BETWEEN debut AND fin
  ),
  serie AS (
    SELECT j.jour,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'vue'), 0)::integer AS vues,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'cta'), 0)::integer AS ctas,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'cree'), 0)::integer AS crees,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'cree_solo'), 0)::integer AS crees_solo,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'rejoint'), 0)::integer AS rejoints,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'fini_a'), 0)::integer AS finis_a,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'fini_b'), 0)::integer AS finis_b,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'deux_finis'), 0)::integer AS deux_finis,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'paiement_ouvert'), 0)::integer AS paiements_ouverts,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'paye'), 0)::integer AS payes,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'paye_solo'), 0)::integer AS payes_solo,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'cta_solo'), 0)::integer AS ctas_solo,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'depart'), 0)::integer AS departs,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'depart_solo'), 0)::integer AS departs_solo,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'depart_erreur'), 0)::integer AS departs_erreurs,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'depart_erreur_solo'), 0)::integer AS departs_erreurs_solo,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'invitation_vue'), 0)::integer AS invitations_vues,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'situation_vue'), 0)::integer AS situations_vues,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'situation_vue_solo'), 0)::integer AS situations_vues_solo,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'situation'), 0)::integer AS situations,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'situation_solo'), 0)::integer AS situations_solo,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'commence_a'), 0)::integer AS commences_a,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'commence_a_solo'), 0)::integer AS commences_a_solo,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'commence_b'), 0)::integer AS commences_b,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'email_vue'), 0)::integer AS emails_vus,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'email_vue_solo'), 0)::integer AS emails_vus_solo,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'email_vue' AND c.cle = 'b'), 0)::integer AS emails_vus_b,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'fini_a_solo'), 0)::integer AS finis_a_solo,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'offre_vue'), 0)::integer AS offres_vues,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'offre_vue_solo'), 0)::integer AS offres_vues_solo,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'attente_vue'), 0)::integer AS attentes_vues,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'case_manquante'), 0)::integer AS cases_manquantes,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'case_manquante_solo'), 0)::integer AS cases_manquantes_solo,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'paiement_ouvert_solo'), 0)::integer AS paiements_ouverts_solo,
      COALESCE(sum(c.montant) FILTER (WHERE c.evenement = 'paye'), 0)::integer AS revenu,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'rembourse'), 0)::integer AS rembourses,
      COALESCE(sum(c.montant) FILTER (WHERE c.evenement = 'rembourse'), 0)::integer AS rembourse_montant
    FROM jours j LEFT JOIN c ON c.jour = j.jour
    GROUP BY j.jour
  ),
  sources AS (
    SELECT cle AS src,
      COALESCE(sum(n) FILTER (WHERE evenement = 'vue'), 0)::integer AS vues,
      COALESCE(sum(n) FILTER (WHERE evenement = 'cta'), 0)::integer AS ctas,
      COALESCE(sum(n) FILTER (WHERE evenement = 'cree'), 0)::integer AS crees,
      COALESCE(sum(n) FILTER (WHERE evenement = 'cree_solo'), 0)::integer AS crees_solo,
      COALESCE(sum(n) FILTER (WHERE evenement = 'deux_finis'), 0)::integer AS deux_finis,
      COALESCE(sum(n) FILTER (WHERE evenement = 'paye'), 0)::integer AS payes,
      COALESCE(sum(montant) FILTER (WHERE evenement = 'paye'), 0)::integer AS revenu
    FROM c
    WHERE evenement IN ('vue', 'cta', 'cree', 'cree_solo', 'deux_finis', 'paye')
    GROUP BY cle
  ),
  domaines AS (
    SELECT cle AS domaine,
      COALESCE(sum(n) FILTER (WHERE evenement = 'domaine_entre'), 0)::integer AS entres,
      COALESCE(sum(n) FILTER (WHERE evenement = 'domaine_fini'), 0)::integer AS finis
    FROM c
    WHERE evenement IN ('domaine_entre', 'domaine_fini')
    GROUP BY cle
  ),
  -- Les erreurs du départ, par cause (prénoms manquants, cases pas cochées).
  erreurs_depart AS (
    SELECT cle AS cause,
      COALESCE(sum(n) FILTER (WHERE evenement = 'depart_erreur'), 0)::integer AS n,
      COALESCE(sum(n) FILTER (WHERE evenement = 'depart_erreur_solo'), 0)::integer AS solo
    FROM c
    WHERE evenement IN ('depart_erreur', 'depart_erreur_solo')
    GROUP BY cle
  ),
  b AS (
    SELECT * FROM public.bilans WHERE cree_le >= depuis
  ),
  -- Ceux qui ont commencé, pas fini, et n'ont rien fait depuis 24 heures :
  -- le domaine où ils se sont arrêtés.
  arrets AS (
    SELECT etape, count(*)::integer AS n, count(*) FILTER (WHERE solo)::integer AS solo FROM (
      SELECT a_etape AS etape, mode = 'solo' AS solo FROM b WHERE a_consent IS NOT NULL AND a_fini IS NULL AND maj_le < now() - interval '24 hours'
      UNION ALL
      SELECT b_etape, false FROM b WHERE mode = 'duo' AND b_consent IS NOT NULL AND b_fini IS NULL AND maj_le < now() - interval '24 hours'
    ) x
    GROUP BY etape
  ),
  delais AS (
    SELECT
      percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM (a_fini - a_consent)) / 60)
        FILTER (WHERE a_fini IS NOT NULL) AS minutes_a,
      percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM (b_fini - b_consent)) / 60)
        FILTER (WHERE b_fini IS NOT NULL) AS minutes_b,
      percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM (b_consent - cree_le)) / 3600)
        FILTER (WHERE b_consent IS NOT NULL) AS heures_rejoint,
      percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM (GREATEST(a_fini, b_fini) - cree_le)) / 3600)
        FILTER (WHERE a_fini IS NOT NULL AND b_fini IS NOT NULL) AS heures_deux_finis,
      count(*) FILTER (WHERE paye_le IS NOT NULL AND mode = 'duo' AND (a_fini IS NULL OR b_fini IS NULL))::integer AS payes_avant_fin,
      count(*) FILTER (WHERE paye_le IS NOT NULL)::integer AS payes
    FROM b
  ),
  modes AS (
    SELECT
      count(*) FILTER (WHERE mode = 'solo')::integer AS solo,
      count(*) FILTER (WHERE mode = 'duo')::integer AS duo,
      count(*) FILTER (WHERE mode = 'solo' AND paye_le IS NOT NULL)::integer AS solo_payes,
      count(*) FILTER (WHERE mode = 'duo' AND paye_le IS NOT NULL)::integer AS duo_payes
    FROM b
  ),
  rapports AS (
    SELECT COALESCE(rapport_statut, 'aucun') AS statut, count(*)::integer AS n
    FROM public.bilans WHERE paye_le IS NOT NULL
    GROUP BY 1
  ),
  erreurs AS (
    SELECT left(id::text, 8) AS id, rapport_essais AS essais, rapport_maj AS le, left(rapport_erreur, 300) AS erreur
    FROM public.bilans WHERE rapport_statut = 'erreur'
    ORDER BY rapport_maj DESC NULLS LAST LIMIT 20
  ),
  -- Payés, mais l'un des deux n'a pas fini : à relancer ou à rembourser.
  attente AS (
    SELECT left(id::text, 8) AS id, paye_le, paiement_email AS email, lang,
      COALESCE(a_etape, CASE WHEN a_fini IS NOT NULL THEN 'fini' END) AS etape_a,
      CASE WHEN b_consent IS NULL THEN 'invitation' ELSE COALESCE(b_etape, CASE WHEN b_fini IS NOT NULL THEN 'fini' END) END AS etape_b,
      maj_le
    FROM public.bilans
    WHERE paye_le IS NOT NULL AND rembourse_le IS NULL AND mode = 'duo' AND (a_fini IS NULL OR b_fini IS NULL)
    ORDER BY paye_le LIMIT 50
  )
  SELECT jsonb_build_object(
    'jours', n_jours,
    'serie', (SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.jour), '[]'::jsonb) FROM serie s),
    'sources', (SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.vues DESC, s.crees DESC), '[]'::jsonb) FROM sources s),
    'domaines', (SELECT COALESCE(jsonb_agg(to_jsonb(d)), '[]'::jsonb) FROM domaines d),
    'erreurs_depart', (SELECT COALESCE(jsonb_agg(to_jsonb(e) ORDER BY e.n DESC), '[]'::jsonb) FROM erreurs_depart e),
    'arrets', (SELECT COALESCE(jsonb_agg(to_jsonb(a)), '[]'::jsonb) FROM arrets a),
    'delais', (SELECT to_jsonb(d) FROM delais d),
    'modes', (SELECT to_jsonb(m) FROM modes m),
    'rapports', (SELECT COALESCE(jsonb_object_agg(r.statut, r.n), '{}'::jsonb) FROM rapports r),
    'erreurs', (SELECT COALESCE(jsonb_agg(to_jsonb(e)), '[]'::jsonb) FROM erreurs e),
    'attente', (SELECT COALESCE(jsonb_agg(to_jsonb(a)), '[]'::jsonb) FROM attente a),
    'en_cours', (SELECT count(*)::integer FROM public.bilans WHERE a_fini IS NULL OR (mode = 'duo' AND b_fini IS NULL)),
    'total_payes', (SELECT COALESCE(sum(n), 0)::integer FROM public.bilan_compteurs WHERE evenement = 'paye'),
    'total_revenu', (SELECT COALESCE(sum(montant), 0)::integer FROM public.bilan_compteurs WHERE evenement = 'paye')
  ) INTO resultat;
  RETURN resultat;
END
$$;
REVOKE EXECUTE ON FUNCTION public.get_bilan_tableau(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_bilan_tableau(integer) TO service_role;

SELECT 'bilan_etapes' AS migration, count(*) AS bilans,
       count(*) FILTER (WHERE situation = '{}'::jsonb) AS sans_situation
FROM public.bilans;
