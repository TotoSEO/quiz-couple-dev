-- Le bilan de couple (18 octobre 2026) : une ligne par couple, lue et écrite
-- seulement par la fonction serveur `bilan` avec la clé de service, et par la
-- fabrique du rapport PDF (bilan/fabrique.mjs, workflow bilan-rapport.yml).
-- Conception : docs/bilan/CONCEPTION.md. Appliquée par bilan-base.yml.
-- Idempotente : on peut la rejouer.
--
-- Données sensibles au sens du RGPD (vie intime, convictions) : aucun droit
-- pour la clé publique, RLS active sans aucune règle, et une durée de vie
-- courte (bilan_menage, chaque nuit) : 60 jours sans activité pour un bilan
-- non payé, 6 mois après le paiement pour un bilan payé. Chacun des deux peut
-- supprimer le bilan tout de suite depuis la page.

CREATE TABLE IF NOT EXISTS public.bilans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cree_le           timestamptz NOT NULL DEFAULT now(),
  maj_le            timestamptz NOT NULL DEFAULT now(),
  lang              text NOT NULL DEFAULT 'fr',
  situation         jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- D'où vient le bilan : la page du site qui y a mené (?src= de la page du
  -- bilan), « direct » sinon. Sert aux compteurs par source de l'admin.
  src               text,
  -- Les deux partenaires : A crée le bilan, B le rejoint par l'invitation.
  -- Les clés ne sont gardées que sous forme d'empreinte SHA-256 (hexa).
  a_prenom          text NOT NULL,
  a_genre           text,
  a_jeton           text NOT NULL,
  a_consent         timestamptz,
  a_reponses        jsonb NOT NULL DEFAULT '{}'::jsonb,
  a_nn              jsonb NOT NULL DEFAULT '[]'::jsonb,
  a_fini            timestamptz,
  -- Le domaine où en est la personne (le premier qu'elle n'a pas fini), ou
  -- « fini » : l'admin voit où s'arrêtent ceux qui ne vont pas au bout.
  a_etape           text,
  -- L'adresse où recevoir le rapport en PDF, donnée par la personne.
  a_email           text,
  b_prenom          text NOT NULL,
  b_genre           text,
  b_jeton           text NOT NULL,
  b_consent         timestamptz,
  b_reponses        jsonb NOT NULL DEFAULT '{}'::jsonb,
  b_nn              jsonb NOT NULL DEFAULT '[]'::jsonb,
  b_fini            timestamptz,
  b_etape           text,
  b_email           text,
  -- Le paiement (Stripe Checkout) et l'accord donné avant de payer. Un seul
  -- paiement, par l'un ou l'autre, dès qu'il a fini ses propres réponses.
  paye_le           timestamptz,
  paiement_session  text,
  paiement_intent   text,
  paiement_montant  integer,
  paiement_role     text,
  paiement_email    text,
  renonciation_le   timestamptz,
  rembourse_le      timestamptz,
  -- Le rapport en PDF : à faire dès que le bilan est payé et fini des deux
  -- côtés (déclencheur ci-dessous), fabriqué par bilan-rapport.yml, rangé
  -- dans le stockage privé bilan-rapports, puis envoyé par e-mail.
  rapport_statut    text,
  rapport_maj       timestamptz,
  rapport_chemin    text,
  rapport_essais    integer NOT NULL DEFAULT 0,
  rapport_erreur    text,
  rapport_pages     integer,
  -- Les envois du rapport : [{ email, le, ok }].
  envois            jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Empreinte salée de l'adresse IP, pour limiter les créations par heure.
  ip_hash           text
);

-- Pour une base où une première version de la table existe déjà.
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS src text;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS a_etape text;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS a_email text;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS b_etape text;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS b_email text;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS paiement_intent text;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS paiement_role text;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS paiement_email text;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS rembourse_le timestamptz;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS rapport_statut text;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS rapport_maj timestamptz;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS rapport_chemin text;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS rapport_essais integer NOT NULL DEFAULT 0;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS rapport_erreur text;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS rapport_pages integer;
ALTER TABLE public.bilans ADD COLUMN IF NOT EXISTS envois jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.bilans ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.bilans FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.bilans TO service_role;

-- Bornes : la fonction serveur contrôle déjà tout, la base ne fait que
-- garantir qu'aucune ligne ne peut grossir sans limite. Recréée à chaque
-- passage pour suivre les colonnes.
ALTER TABLE public.bilans DROP CONSTRAINT IF EXISTS bilans_bornes;
ALTER TABLE public.bilans ADD CONSTRAINT bilans_bornes CHECK (
  lang IN ('fr', 'en', 'es', 'de', 'it')
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

CREATE INDEX IF NOT EXISTS bilans_ip_cree ON public.bilans (ip_hash, cree_le);
CREATE INDEX IF NOT EXISTS bilans_maj ON public.bilans (maj_le);
CREATE INDEX IF NOT EXISTS bilans_paye ON public.bilans (paye_le);
CREATE INDEX IF NOT EXISTS bilans_rapport ON public.bilans (rapport_statut) WHERE rapport_statut IS NOT NULL;
CREATE INDEX IF NOT EXISTS bilans_intent ON public.bilans (paiement_intent) WHERE paiement_intent IS NOT NULL;

-- ── Le stockage des rapports ────────────────────────────────────────────
-- Privé : un rapport ne sort que par une adresse signée de dix minutes
-- (action « pdf » de la fonction) ou en pièce jointe. Le fichier d'un bilan
-- supprimé est effacé tout de suite par la fonction, celui d'un bilan effacé
-- par le ménage au passage suivant de la fabrique.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('bilan-rapports', 'bilan-rapports', false, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ── Les compteurs de l'entonnoir ────────────────────────────────────────
-- Par jour (heure de Paris), par événement et par clé (la source du bilan,
-- ou le domaine pour les étapes du questionnaire) : un bilan supprimé ou
-- effacé par le ménage reste compté. Rien de personnel n'y est gardé.
--
--   vue, cta              la page du bilan vue, le bouton « commencer »
--                         (clé : la source, envoyés par la page)
--   cree, rejoint         A crée le bilan, B accepte l'invitation
--   fini_a, fini_b        chacun a fini ses réponses
--   premier_fini, deux_finis
--   paiement_ouvert       la page de paiement de Stripe a été ouverte
--   paye, rembourse       avec le montant en centimes
--   domaine_entre, domaine_fini   (clé : le domaine) une personne commence
--                         ou finit un domaine, comptés par la fonction
--   rapport_pret, rapport_erreur, envoi_ok, envoi_echec

CREATE TABLE IF NOT EXISTS public.bilan_compteurs (
  jour       date NOT NULL,
  evenement  text NOT NULL,
  cle        text NOT NULL DEFAULT '',
  n          integer NOT NULL DEFAULT 0,
  montant    integer NOT NULL DEFAULT 0
);
ALTER TABLE public.bilan_compteurs ADD COLUMN IF NOT EXISTS cle text NOT NULL DEFAULT '';
ALTER TABLE public.bilan_compteurs DROP CONSTRAINT IF EXISTS bilan_compteurs_pkey;
ALTER TABLE public.bilan_compteurs ADD CONSTRAINT bilan_compteurs_pkey PRIMARY KEY (jour, evenement, cle);
ALTER TABLE public.bilan_compteurs DROP CONSTRAINT IF EXISTS bilan_compteurs_bornes;
ALTER TABLE public.bilan_compteurs ADD CONSTRAINT bilan_compteurs_bornes
  CHECK (char_length(evenement) <= 30 AND char_length(cle) <= 40);
ALTER TABLE public.bilan_compteurs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.bilan_compteurs FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.bilan_compteurs TO service_role;

DROP FUNCTION IF EXISTS public.bilan_compte_evenement(text, integer);
CREATE OR REPLACE FUNCTION public.bilan_compte_evenement(p_evenement text, p_cle text DEFAULT '', p_montant integer DEFAULT 0)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.bilan_compteurs (jour, evenement, cle, n, montant)
  VALUES ((now() AT TIME ZONE 'Europe/Paris')::date, left(p_evenement, 30),
          left(COALESCE(p_cle, ''), 40), 1, COALESCE(p_montant, 0))
  ON CONFLICT (jour, evenement, cle)
  DO UPDATE SET n = bilan_compteurs.n + 1, montant = bilan_compteurs.montant + COALESCE(p_montant, 0);
$$;
REVOKE EXECUTE ON FUNCTION public.bilan_compte_evenement(text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bilan_compte_evenement(text, text, integer) TO service_role;

-- ── Le rapport à faire ──────────────────────────────────────────────────
-- Payé et fini des deux côtés, dans n'importe quel ordre (on peut payer dès
-- qu'on a fini ses propres réponses) : le rapport passe « à faire ».
CREATE OR REPLACE FUNCTION public.bilan_avant_maj()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.paye_le IS NOT NULL AND NEW.a_fini IS NOT NULL AND NEW.b_fini IS NOT NULL
     AND NEW.rapport_statut IS NULL THEN
    NEW.rapport_statut := 'a_faire';
    NEW.rapport_maj := now();
  END IF;
  RETURN NEW;
END
$$;
REVOKE EXECUTE ON FUNCTION public.bilan_avant_maj() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS bilans_avant_maj ON public.bilans;
CREATE TRIGGER bilans_avant_maj
  BEFORE UPDATE ON public.bilans
  FOR EACH ROW EXECUTE FUNCTION public.bilan_avant_maj();

-- Lance la fabrique (workflow bilan-rapport.yml) par l'horloge des réseaux
-- (social_declencher_workflow, jeton github_workflows du Vault). Sans elle ou
-- sans jeton, rien ne part ici et le passage de pg_cron rattrape.
CREATE OR REPLACE FUNCTION public.bilan_lancer_fabrique()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF to_regprocedure('public.social_declencher_workflow(text)') IS NULL THEN
    RETURN false;
  END IF;
  EXECUTE 'SELECT public.social_declencher_workflow($1)' USING 'bilan-rapport.yml';
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END
$$;
REVOKE EXECUTE ON FUNCTION public.bilan_lancer_fabrique() FROM PUBLIC, anon, authenticated;

-- Le passage de pg_cron : relance la fabrique s'il reste un rapport à faire,
-- un rapport resté « en cours » plus de vingt minutes (fabrique tombée), ou
-- un échec de moins de trois essais vieux de trente minutes.
CREATE OR REPLACE FUNCTION public.bilan_rapports_en_attente()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer FROM public.bilans
   WHERE rapport_statut = 'a_faire'
      OR (rapport_statut = 'en_cours' AND rapport_maj < now() - interval '20 minutes')
      OR (rapport_statut = 'erreur' AND rapport_essais < 3 AND rapport_maj < now() - interval '30 minutes');
$$;
REVOKE EXECUTE ON FUNCTION public.bilan_rapports_en_attente() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.bilan_relance_fabrique()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.bilan_rapports_en_attente() = 0 THEN
    RETURN false;
  END IF;
  RETURN public.bilan_lancer_fabrique();
END
$$;
REVOKE EXECUTE ON FUNCTION public.bilan_relance_fabrique() FROM PUBLIC, anon, authenticated;

-- ── Les compteurs tenus par la base ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.bilan_compte()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s text := COALESCE(NEW.src, 'direct');
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.bilan_compte_evenement('cree', s);
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
  IF NOT (OLD.a_fini IS NOT NULL AND OLD.b_fini IS NOT NULL) AND NEW.a_fini IS NOT NULL AND NEW.b_fini IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('deux_finis', s);
  END IF;
  IF OLD.renonciation_le IS NULL AND NEW.renonciation_le IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('paiement_ouvert', s);
  END IF;
  IF OLD.paye_le IS NULL AND NEW.paye_le IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('paye', s, NEW.paiement_montant);
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

DROP TRIGGER IF EXISTS bilans_compte ON public.bilans;
CREATE TRIGGER bilans_compte
  AFTER INSERT OR UPDATE ON public.bilans
  FOR EACH ROW EXECUTE FUNCTION public.bilan_compte();

-- ── Le ménage ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.bilan_menage()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  DELETE FROM public.bilans
   WHERE (paye_le IS NULL AND maj_le < now() - interval '60 days')
      OR (paye_le IS NOT NULL AND paye_le < now() - interval '183 days');
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END
$$;
REVOKE EXECUTE ON FUNCTION public.bilan_menage() FROM PUBLIC, anon, authenticated;

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname IN ('bilan-menage', 'bilan-rapport', 'bilan-rapport-menage');
    PERFORM cron.schedule('bilan-menage', '50 2 * * *', $q$ SELECT public.bilan_menage() $q$);
    -- Le filet de la fabrique : toutes les dix minutes, rien ne part s'il n'y
    -- a rien à faire.
    PERFORM cron.schedule('bilan-rapport', '*/10 * * * *', $q$ SELECT public.bilan_relance_fabrique() $q$);
    -- Une fois par jour, après le ménage de la base : la fabrique efface les
    -- fichiers des bilans qui n'existent plus.
    PERFORM cron.schedule('bilan-rapport-menage', '5 3 * * *', $q$ SELECT public.bilan_lancer_fabrique() $q$);
  END IF;
END
$do$;

-- ── Les chiffres de l'admin ─────────────────────────────────────────────
-- Lus par la fonction admin-stats (jeton admin, clé de service), jamais par
-- la clé publique. Tout l'onglet Bilan en un seul appel.

DROP FUNCTION IF EXISTS public.get_bilan_stats(integer);

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
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'rejoint'), 0)::integer AS rejoints,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'fini_a'), 0)::integer AS finis_a,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'fini_b'), 0)::integer AS finis_b,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'deux_finis'), 0)::integer AS deux_finis,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'paiement_ouvert'), 0)::integer AS paiements_ouverts,
      COALESCE(sum(c.n) FILTER (WHERE c.evenement = 'paye'), 0)::integer AS payes,
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
      COALESCE(sum(n) FILTER (WHERE evenement = 'deux_finis'), 0)::integer AS deux_finis,
      COALESCE(sum(n) FILTER (WHERE evenement = 'paye'), 0)::integer AS payes,
      COALESCE(sum(montant) FILTER (WHERE evenement = 'paye'), 0)::integer AS revenu
    FROM c
    WHERE evenement IN ('vue', 'cta', 'cree', 'deux_finis', 'paye')
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
      SELECT b_etape FROM b WHERE b_consent IS NOT NULL AND b_fini IS NULL AND maj_le < now() - interval '24 hours'
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
      count(*) FILTER (WHERE paye_le IS NOT NULL AND (a_fini IS NULL OR b_fini IS NULL))::integer AS payes_avant_fin,
      count(*) FILTER (WHERE paye_le IS NOT NULL)::integer AS payes
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
    WHERE paye_le IS NOT NULL AND rembourse_le IS NULL AND (a_fini IS NULL OR b_fini IS NULL)
    ORDER BY paye_le LIMIT 50
  )
  SELECT jsonb_build_object(
    'jours', n_jours,
    'serie', (SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.jour), '[]'::jsonb) FROM serie s),
    'sources', (SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.vues DESC, s.crees DESC), '[]'::jsonb) FROM sources s),
    'domaines', (SELECT COALESCE(jsonb_agg(to_jsonb(d)), '[]'::jsonb) FROM domaines d),
    'arrets', (SELECT COALESCE(jsonb_agg(to_jsonb(a)), '[]'::jsonb) FROM arrets a),
    'delais', (SELECT to_jsonb(d) FROM delais d),
    'rapports', (SELECT COALESCE(jsonb_object_agg(r.statut, r.n), '{}'::jsonb) FROM rapports r),
    'erreurs', (SELECT COALESCE(jsonb_agg(to_jsonb(e)), '[]'::jsonb) FROM erreurs e),
    'attente', (SELECT COALESCE(jsonb_agg(to_jsonb(a)), '[]'::jsonb) FROM attente a),
    'en_cours', (SELECT count(*)::integer FROM public.bilans WHERE a_fini IS NULL OR b_fini IS NULL),
    'total_payes', (SELECT COALESCE(sum(n), 0)::integer FROM public.bilan_compteurs WHERE evenement = 'paye'),
    'total_revenu', (SELECT COALESCE(sum(montant), 0)::integer FROM public.bilan_compteurs WHERE evenement = 'paye')
  ) INTO resultat;
  RETURN resultat;
END
$$;
REVOKE EXECUTE ON FUNCTION public.get_bilan_tableau(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_bilan_tableau(integer) TO service_role;

-- Ce que la migration laisse derrière elle, affiché dans le journal du workflow.
SELECT (SELECT count(*) FROM public.bilans) AS bilans,
       (SELECT count(*) FROM public.bilan_compteurs) AS compteurs,
       to_regclass('cron.job') IS NOT NULL AS pg_cron,
       to_regprocedure('public.social_declencher_workflow(text)') IS NOT NULL AS horloge;
