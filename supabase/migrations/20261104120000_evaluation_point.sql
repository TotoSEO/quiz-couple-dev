-- « Le point sur ma relation » : l'évaluation seul(e) refaite (4 novembre
-- 2026, Thomas : « Je crois qu'il est grand temps de faire une refonte de
-- l'évaluation solo », puis « Oui fais ça c'est parfait »). Sur trente jours,
-- 236 évaluations seul(e) créées, 21 personnes au bout, aucune page Stripe
-- ouverte : la personne seule connaissait déjà tout ce que le rapport lui
-- rendait. Le seul(e) devient un autre produit, 50 questions sur ce qu'elle
-- vit, un rapport neuf, 4,90 €. Conception : docs/bilan/CONCEPTION.md,
-- section du 4 novembre 2026.
--
-- bilans.formule : 'point' pour une évaluation du nouveau seul(e), rien pour
-- les autres (à deux, et le seul(e) d'avant, qui se finit comme avant jusqu'à
-- son effacement). Une contrainte à part (bilans_formule) : bilans_bornes est
-- recréée par 20261019120000 à chaque passage de bilan-base.yml.
--
-- bilan_compte() ajoute aux événements du seul(e) ceux du point :
-- cree_point, commence_point, fini_point, paiement_ouvert_point, paye_point.
-- Le reste du compte est celui de 20261021180000, sans changement.
--
-- bilan_celib.source (la page d'où vient la réponse : 'evaluation' pour le
-- départ seul(e), l'identifiant du test pour la carte « bientôt » posée à la
-- fin des tests célibataires) et bilan_celib.situation (jamais en couple,
-- rupture de moins d'un an, histoires qui se répètent, autre), contrainte à
-- part (bilan_celib_bornes est recréée par 20261025140000).
--
-- get_bilan_point(p_jours) : ce que l'onglet Évaluation de l'admin montre du
-- point (par admin-stats) : l'entonnoir jour par jour, les motifs, les
-- priorités, les états, les styles d'attachement, les alertes, les parties
-- entrées et finies, et la carte célibataire par page. Jamais une adresse ni
-- une réponse. get_bilan_celib rend en plus les sources et les situations.
--
-- Idempotente ; appliquée par bilan-base.yml après toutes les autres
-- migrations du bilan.

-- ── La formule ────────────────────────────────────────────────────────────
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS formule text;
ALTER TABLE public.bilans DROP CONSTRAINT IF EXISTS bilans_formule;
ALTER TABLE public.bilans ADD CONSTRAINT bilans_formule CHECK (
  formule IS NULL OR (formule = 'point' AND mode = 'solo')
);

-- ── Les compteurs ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.bilan_compte()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s text := COALESCE(NEW.src, 'direct');
  solo boolean := (NEW.mode = 'solo');
  point boolean := (NEW.formule = 'point');
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.bilan_compte_evenement('cree', s);
    IF solo THEN PERFORM public.bilan_compte_evenement('cree_solo', s); END IF;
    IF point THEN PERFORM public.bilan_compte_evenement('cree_point', s); END IF;
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
    IF point THEN PERFORM public.bilan_compte_evenement('commence_point', s); END IF;
  END IF;
  IF OLD.b_reponses = '{}'::jsonb AND NEW.b_reponses <> '{}'::jsonb THEN
    PERFORM public.bilan_compte_evenement('commence_b', s);
  END IF;
  IF OLD.a_fini IS NULL AND NEW.a_fini IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('fini_a', s);
    IF solo THEN PERFORM public.bilan_compte_evenement('fini_a_solo', s); END IF;
    IF point THEN PERFORM public.bilan_compte_evenement('fini_point', s); END IF;
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
    IF point THEN PERFORM public.bilan_compte_evenement('paiement_ouvert_point', s); END IF;
  END IF;
  IF OLD.paye_le IS NULL AND NEW.paye_le IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('paye', s, NEW.paiement_montant);
    IF solo THEN PERFORM public.bilan_compte_evenement('paye_solo', s, NEW.paiement_montant); END IF;
    IF point THEN PERFORM public.bilan_compte_evenement('paye_point', s, NEW.paiement_montant); END IF;
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

-- ── Les célibataires : d'où vient la réponse, et leur situation ──────────
ALTER TABLE public.bilan_celib ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.bilan_celib ADD COLUMN IF NOT EXISTS situation text;
ALTER TABLE public.bilan_celib DROP CONSTRAINT IF EXISTS bilan_celib_origine;
ALTER TABLE public.bilan_celib ADD CONSTRAINT bilan_celib_origine CHECK (
  (source IS NULL OR source ~ '^[A-Za-z0-9-]{1,40}$')
  AND (situation IS NULL OR situation IN ('jamais', 'rupture', 'repete', 'autre'))
);

CREATE OR REPLACE FUNCTION public.get_bilan_celib(p_jours integer DEFAULT 30)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH borne AS (
    SELECT now() - make_interval(days => GREATEST(1, LEAST(COALESCE(p_jours, 30), 400))) AS depuis,
           ((now() - make_interval(days => GREATEST(1, LEAST(COALESCE(p_jours, 30), 400)))) AT TIME ZONE 'Europe/Paris')::date AS jour0
  ),
  reponses AS (
    SELECT c.* FROM public.bilan_celib c, borne WHERE c.cree_le >= borne.depuis
  )
  SELECT jsonb_build_object(
    'jours', GREATEST(1, LEAST(COALESCE(p_jours, 30), 400)),
    -- « Où en êtes-vous ? » au départ seul(e), compté une fois par visite.
    'statuts', (
      SELECT COALESCE(jsonb_object_agg(s.cle, s.n), '{}'::jsonb)
      FROM (
        SELECT c.cle, sum(c.n)::integer AS n
        FROM public.bilan_compteurs c, borne
        WHERE c.evenement = 'statut_solo' AND c.jour >= borne.jour0
        GROUP BY c.cle
      ) s
    ),
    'reponses', (SELECT count(*) FROM reponses),
    'avec_email', (SELECT count(*) FROM reponses WHERE email IS NOT NULL),
    -- La liste d'attente entière, toutes périodes : les adresses encore là.
    'liste_attente', (SELECT count(*) FROM public.bilan_celib WHERE email IS NOT NULL AND notifie_le IS NULL),
    'interets', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('id', i.id, 'n', i.n) ORDER BY i.n DESC, i.id), '[]'::jsonb)
      FROM (SELECT unnest(r.interets) AS id, count(*)::integer AS n FROM reponses r GROUP BY 1) i
    ),
    'langues', (
      SELECT COALESCE(jsonb_object_agg(l.lang, l.n), '{}'::jsonb)
      FROM (SELECT r.lang, count(*)::integer AS n FROM reponses r GROUP BY r.lang) l
    ),
    -- D'où viennent les réponses : le départ seul(e) de l'évaluation, ou la
    -- carte « bientôt » d'un test célibataire (4 novembre 2026). Une réponse
    -- d'avant ce jour-là n'a pas de source : elle venait de l'évaluation.
    'sources', (
      SELECT COALESCE(jsonb_object_agg(s.source, s.n), '{}'::jsonb)
      FROM (SELECT COALESCE(r.source, 'evaluation') AS source, count(*)::integer AS n FROM reponses r GROUP BY 1) s
    ),
    'situations', (
      SELECT COALESCE(jsonb_object_agg(s.situation, s.n), '{}'::jsonb)
      FROM (SELECT r.situation, count(*)::integer AS n FROM reponses r WHERE r.situation IS NOT NULL GROUP BY 1) s
    ),
    'autres', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('texte', a.autre, 'lang', a.lang, 'le', a.cree_le) ORDER BY a.cree_le DESC), '[]'::jsonb)
      FROM (SELECT r.autre, r.lang, r.cree_le FROM reponses r WHERE r.autre IS NOT NULL ORDER BY r.cree_le DESC LIMIT 30) a
    )
  );
$$;
REVOKE EXECUTE ON FUNCTION public.get_bilan_celib(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_bilan_celib(integer) TO service_role;

-- ── Le tableau du point ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_bilan_point(p_jours integer DEFAULT 30)
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
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'depart_point'), 0)::integer AS departs,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'cree_point'), 0)::integer AS crees,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'commence_point'), 0)::integer AS commences,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'fini_point'), 0)::integer AS finis,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'offre_vue_point'), 0)::integer AS offres_vues,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'paiement_ouvert_point'), 0)::integer AS paiements_ouverts,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'paye_point'), 0)::integer AS payes,
      COALESCE(sum(c.montant) FILTER (WHERE c.evenement = 'paye_point'), 0)::integer AS revenu
    FROM jours j LEFT JOIN c ON c.jour = j.jour
    GROUP BY j.jour
  ),
  -- Les comptes par clé d'un événement, sur la période.
  par_cle AS (
    SELECT c.evenement, c.cle, sum(c.n)::integer AS n
    FROM c
    WHERE c.evenement IN ('point_motif', 'point_priorite', 'point_duree', 'point_etat', 'point_attachement',
                          'point_engagement', 'point_securite', 'point_partie_entree', 'point_partie_finie',
                          'depart_erreur_point', 'celib_carte_vue', 'celib_carte_clic')
    GROUP BY c.evenement, c.cle
  ),
  celib AS (
    SELECT * FROM public.bilan_celib WHERE cree_le >= depuis
  )
  SELECT jsonb_build_object(
    'jours', n_jours,
    'serie', (SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.jour), '[]'::jsonb) FROM serie s),
    'cles', (
      SELECT COALESCE(jsonb_object_agg(e.evenement, e.cles), '{}'::jsonb)
      FROM (
        SELECT p.evenement, jsonb_object_agg(p.cle, p.n) AS cles
        FROM par_cle p GROUP BY p.evenement
      ) e
    ),
    -- La carte « bientôt » des tests célibataires, page par page : vues,
    -- clics, réponses et adresses laissées.
    'carte_celib', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('page', p.page, 'vues', p.vues, 'clics', p.clics,
                                                   'reponses', p.reponses, 'emails', p.emails)
                                ORDER BY p.vues DESC, p.page), '[]'::jsonb)
      FROM (
        SELECT pages.page,
          COALESCE((SELECT sum(n) FROM par_cle WHERE evenement = 'celib_carte_vue' AND cle = pages.page), 0)::integer AS vues,
          COALESCE((SELECT sum(n) FROM par_cle WHERE evenement = 'celib_carte_clic' AND cle = pages.page), 0)::integer AS clics,
          (SELECT count(*) FROM celib WHERE celib.source = pages.page)::integer AS reponses,
          (SELECT count(*) FROM celib WHERE celib.source = pages.page AND celib.email IS NOT NULL)::integer AS emails
        FROM (
          SELECT DISTINCT cle AS page FROM par_cle WHERE evenement IN ('celib_carte_vue', 'celib_carte_clic') AND cle <> ''
          UNION
          SELECT DISTINCT source FROM celib WHERE source IS NOT NULL AND source <> 'evaluation'
        ) pages
      ) p
    ),
    'total_payes', (SELECT COALESCE(sum(n), 0)::integer FROM public.bilan_compteurs WHERE evenement = 'paye_point'),
    'total_revenu', (SELECT COALESCE(sum(montant), 0)::integer FROM public.bilan_compteurs WHERE evenement = 'paye_point')
  ) INTO resultat;
  RETURN resultat;
END
$$;
REVOKE EXECUTE ON FUNCTION public.get_bilan_point(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_bilan_point(integer) TO service_role;

-- Le bilan, rendu au workflow.
SELECT 'evaluation_point' AS migration,
       (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bilans' AND column_name = 'formule') AS colonne_formule,
       (SELECT count(*) FROM public.bilans WHERE formule = 'point') AS points,
       (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bilan_celib' AND column_name IN ('source', 'situation')) AS colonnes_celib,
       has_function_privilege('anon', 'public.get_bilan_point(integer)', 'execute') AS anon_execute_point;
