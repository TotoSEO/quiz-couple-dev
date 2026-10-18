-- Le bilan de couple (18 octobre 2026) : une ligne par couple, lue et écrite
-- seulement par la fonction serveur `bilan` avec la clé de service.
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
  -- Les deux partenaires : A crée le bilan, B le rejoint par l'invitation.
  -- Les clés ne sont gardées que sous forme d'empreinte SHA-256 (hexa).
  a_prenom          text NOT NULL,
  a_genre           text,
  a_jeton           text NOT NULL,
  a_consent         timestamptz,
  a_reponses        jsonb NOT NULL DEFAULT '{}'::jsonb,
  a_nn              jsonb NOT NULL DEFAULT '[]'::jsonb,
  a_fini            timestamptz,
  b_prenom          text NOT NULL,
  b_genre           text,
  b_jeton           text NOT NULL,
  b_consent         timestamptz,
  b_reponses        jsonb NOT NULL DEFAULT '{}'::jsonb,
  b_nn              jsonb NOT NULL DEFAULT '[]'::jsonb,
  b_fini            timestamptz,
  -- Le paiement (Stripe Checkout) et l'accord donné avant de payer.
  paye_le           timestamptz,
  paiement_session  text,
  paiement_montant  integer,
  renonciation_le   timestamptz,
  -- Empreinte salée de l'adresse IP, pour limiter les créations par heure.
  ip_hash           text
);

ALTER TABLE public.bilans ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.bilans FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.bilans TO service_role;

-- Bornes : la fonction serveur contrôle déjà tout, la base ne fait que
-- garantir qu'aucune ligne ne peut grossir sans limite.
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bilans_bornes') THEN
    ALTER TABLE public.bilans ADD CONSTRAINT bilans_bornes CHECK (
      lang IN ('fr', 'en', 'es', 'de', 'it')
      AND char_length(a_prenom) BETWEEN 1 AND 30
      AND char_length(b_prenom) BETWEEN 1 AND 30
      AND (a_genre IS NULL OR a_genre IN ('f', 'h'))
      AND (b_genre IS NULL OR b_genre IN ('f', 'h'))
      AND char_length(a_jeton) = 64
      AND char_length(b_jeton) = 64
      AND pg_column_size(situation) < 2000
      AND pg_column_size(a_reponses) < 16000
      AND pg_column_size(b_reponses) < 16000
      AND pg_column_size(a_nn) < 4000
      AND pg_column_size(b_nn) < 4000
      AND (paiement_session IS NULL OR char_length(paiement_session) <= 255)
      AND (ip_hash IS NULL OR char_length(ip_hash) = 64)
    );
  END IF;
END
$do$;

CREATE INDEX IF NOT EXISTS bilans_ip_cree ON public.bilans (ip_hash, cree_le);
CREATE INDEX IF NOT EXISTS bilans_maj ON public.bilans (maj_le);
CREATE INDEX IF NOT EXISTS bilans_paye ON public.bilans (paye_le);

-- ── Les compteurs de l'entonnoir ────────────────────────────────────────
-- Comptés au fil de l'eau par un déclencheur, par jour (heure de Paris) :
-- un bilan supprimé ou effacé par le ménage reste compté. Rien de personnel
-- n'y est gardé.

CREATE TABLE IF NOT EXISTS public.bilan_compteurs (
  jour       date NOT NULL,
  evenement  text NOT NULL,
  n          integer NOT NULL DEFAULT 0,
  montant    integer NOT NULL DEFAULT 0,
  PRIMARY KEY (jour, evenement)
);
ALTER TABLE public.bilan_compteurs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.bilan_compteurs FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.bilan_compteurs TO service_role;

CREATE OR REPLACE FUNCTION public.bilan_compte_evenement(p_evenement text, p_montant integer DEFAULT 0)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.bilan_compteurs (jour, evenement, n, montant)
  VALUES ((now() AT TIME ZONE 'Europe/Paris')::date, p_evenement, 1, COALESCE(p_montant, 0))
  ON CONFLICT (jour, evenement)
  DO UPDATE SET n = bilan_compteurs.n + 1, montant = bilan_compteurs.montant + COALESCE(p_montant, 0);
$$;
REVOKE EXECUTE ON FUNCTION public.bilan_compte_evenement(text, integer) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.bilan_compte()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.bilan_compte_evenement('cree');
    RETURN NEW;
  END IF;
  IF OLD.b_consent IS NULL AND NEW.b_consent IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('rejoint');
  END IF;
  IF OLD.a_fini IS NULL AND OLD.b_fini IS NULL AND (NEW.a_fini IS NOT NULL OR NEW.b_fini IS NOT NULL) THEN
    PERFORM public.bilan_compte_evenement('premier_fini');
  END IF;
  IF NOT (OLD.a_fini IS NOT NULL AND OLD.b_fini IS NOT NULL) AND NEW.a_fini IS NOT NULL AND NEW.b_fini IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('deux_finis');
  END IF;
  IF OLD.renonciation_le IS NULL AND NEW.renonciation_le IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('paiement_ouvert');
  END IF;
  IF OLD.paye_le IS NULL AND NEW.paye_le IS NOT NULL THEN
    PERFORM public.bilan_compte_evenement('paye', NEW.paiement_montant);
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
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'bilan-menage';
    PERFORM cron.schedule('bilan-menage', '50 2 * * *', $q$ SELECT public.bilan_menage() $q$);
  END IF;
END
$do$;

-- ── Les chiffres de l'admin ─────────────────────────────────────────────
-- Lus par la fonction admin-stats (jeton admin, clé de service), jamais par
-- la clé publique. Une ligne par jour, jours vides compris.

CREATE OR REPLACE FUNCTION public.get_bilan_stats(p_jours integer DEFAULT 30)
RETURNS TABLE(jour date, crees integer, rejoints integer, premiers_finis integer,
              deux_finis integer, paiements_ouverts integer, payes integer, revenu_centimes integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH jours AS (
    SELECT generate_series(
      (now() AT TIME ZONE 'Europe/Paris')::date - (LEAST(GREATEST(p_jours, 1), 400) - 1),
      (now() AT TIME ZONE 'Europe/Paris')::date,
      interval '1 day')::date AS jour
  )
  SELECT j.jour,
    COALESCE(max(c.n) FILTER (WHERE c.evenement = 'cree'), 0)::integer,
    COALESCE(max(c.n) FILTER (WHERE c.evenement = 'rejoint'), 0)::integer,
    COALESCE(max(c.n) FILTER (WHERE c.evenement = 'premier_fini'), 0)::integer,
    COALESCE(max(c.n) FILTER (WHERE c.evenement = 'deux_finis'), 0)::integer,
    COALESCE(max(c.n) FILTER (WHERE c.evenement = 'paiement_ouvert'), 0)::integer,
    COALESCE(max(c.n) FILTER (WHERE c.evenement = 'paye'), 0)::integer,
    COALESCE(max(c.montant) FILTER (WHERE c.evenement = 'paye'), 0)::integer
  FROM jours j
  LEFT JOIN public.bilan_compteurs c ON c.jour = j.jour
  GROUP BY j.jour
  ORDER BY j.jour;
$$;
REVOKE EXECUTE ON FUNCTION public.get_bilan_stats(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_bilan_stats(integer) TO service_role;

-- Ce que la migration laisse derrière elle, affiché dans le journal du workflow.
SELECT (SELECT count(*) FROM public.bilans) AS bilans,
       (SELECT count(*) FROM public.bilan_compteurs) AS compteurs,
       to_regclass('cron.job') IS NOT NULL AS pg_cron;
