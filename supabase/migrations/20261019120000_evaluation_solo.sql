-- L'évaluation de couple, version 3 (19 octobre 2026) : la même évaluation
-- peut se faire seul(e) (Thomas : « quand ça va mal dans un couple ou que
-- l'un est fermé à la discussion, ça doit être obligatoire de pouvoir
-- réaliser tout ça seul »). Une seule personne répond deux fois à chaque
-- question : ce qu'elle pense, puis ce que son ou sa partenaire répondrait
-- d'après elle (ou « je ne sais pas », -1). Le rapport compare sa réponse à
-- l'idée qu'elle se fait de l'autre.
--
-- Appliquée par bilan-base.yml après 20261018120000_bilan_couple.sql.
-- Idempotente : on peut la rejouer.

-- ── Les deux colonnes du mode solo ──────────────────────────────────────
-- mode : 'duo' (les deux répondent) ou 'solo' (une seule personne, A).
-- a_percu : en solo, ce que A pense que B répondrait, { id: valeur | -1 }.
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'duo';
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS a_percu jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Les bornes, recréées pour suivre les colonnes (comme dans la migration
-- d'origine : la fonction serveur contrôle tout, la base garantit qu'aucune
-- ligne ne grossit sans limite).
ALTER TABLE public.bilans DROP CONSTRAINT IF EXISTS bilans_bornes;
ALTER TABLE public.bilans ADD CONSTRAINT bilans_bornes CHECK (
  lang IN ('fr', 'en', 'es', 'de', 'it')
  AND mode IN ('duo', 'solo')
  AND (src IS NULL OR src ~ '^[a-z0-9-]{1,40}$')
  AND char_length(a_prenom) BETWEEN 1 AND 30
  AND char_length(b_prenom) BETWEEN 1 AND 30
  AND (a_genre IS NULL OR a_genre IN ('f', 'h'))
  AND (b_genre IS NULL OR b_genre IN ('f', 'h'))
  AND char_length(a_jeton) = 64
  AND char_length(b_jeton) = 64
  AND (a_etape IS NULL OR char_length(a_etape) <= 20)
  AND (b_etape IS NULL OR char_length(b_etape) <= 20)
  AND (a_email IS NULL OR char_length(a_email) <= 254)
  AND (b_email IS NULL OR char_length(b_email) <= 254)
  AND (paiement_email IS NULL OR char_length(paiement_email) <= 254)
  AND (paiement_role IS NULL OR paiement_role IN ('a', 'b'))
  AND pg_column_size(situation) < 2000
  AND pg_column_size(a_reponses) < 16000
  AND pg_column_size(b_reponses) < 16000
  AND pg_column_size(a_percu) < 16000
  AND pg_column_size(a_nn) < 4000
  AND pg_column_size(b_nn) < 4000
  AND pg_column_size(envois) < 8000
  AND (paiement_session IS NULL OR char_length(paiement_session) <= 255)
  AND (paiement_intent IS NULL OR char_length(paiement_intent) <= 255)
  AND (rapport_statut IS NULL OR rapport_statut IN ('a_faire', 'en_cours', 'pret', 'erreur'))
  AND (rapport_chemin IS NULL OR char_length(rapport_chemin) <= 200)
  AND (rapport_erreur IS NULL OR char_length(rapport_erreur) <= 2000)
  AND (ip_hash IS NULL OR char_length(ip_hash) = 64)
);

-- ── Le rapport à faire ──────────────────────────────────────────────────
-- Payé et fini : des deux côtés en duo, de la personne seule en solo.
CREATE OR REPLACE FUNCTION public.bilan_avant_maj()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.paye_le IS NOT NULL AND NEW.a_fini IS NOT NULL
     AND (NEW.mode = 'solo' OR NEW.b_fini IS NOT NULL)
     AND NEW.rapport_statut IS NULL THEN
    NEW.rapport_statut := 'a_faire';
    NEW.rapport_maj := now();
  END IF;
  RETURN NEW;
END
$$;
REVOKE EXECUTE ON FUNCTION public.bilan_avant_maj() FROM PUBLIC, anon, authenticated;

-- ── Les compteurs : une évaluation seul(e) est comptée à part ───────────
-- `cree_solo` s'ajoute à `cree` (clé : la source) ; `deux_finis` compte
-- aussi la personne seule qui a fini (c'est le moment où le rapport peut
-- partir, celui que l'entonnoir de l'admin regarde).
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
    RETURN NEW;
  END IF;
  IF OLD.b_consent IS NULL AND NEW.b_consent IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('rejoint', s);
  END IF;
  IF OLD.a_fini IS NULL AND NEW.a_fini IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('fini_a', s);
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

-- ── Les chiffres de l'admin : seul(e) et à deux ──────────────────────────
-- Même forme qu'avant (admin.js lit les mêmes clés), plus `crees_solo` et
-- `payes_solo` dans la série, `modes` (seul / à deux depuis le début), et
-- les rapports payés en attente du partenaire ne listent que les duos.
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
  b AS (
    SELECT * FROM public.bilans WHERE cree_le >= depuis
  ),
  -- Ceux qui ont commencé, pas fini, et n'ont rien fait depuis 24 heures :
  -- le domaine où ils se sont arrêtés.
  arrets AS (
    SELECT etape, count(*)::integer AS n FROM (
      SELECT a_etape AS etape FROM b WHERE a_consent IS NOT NULL AND a_fini IS NULL AND maj_le < now() - interval '24 hours'
      UNION ALL
      SELECT b_etape FROM b WHERE mode = 'duo' AND b_consent IS NOT NULL AND b_fini IS NULL AND maj_le < now() - interval '24 hours'
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

SELECT (SELECT count(*) FROM public.bilans) AS bilans,
       (SELECT count(*) FROM public.bilans WHERE mode = 'solo') AS solo;
