-- Sécurité : un frein sur les écritures de la clé publique (20 octobre 2026).
--
-- Audit offensif du 20 octobre 2026 (Thomas : « je veux que le site soit sûr
-- et les utilisateurs en sécurité »). Le site est statique et la clé publique
-- est dans chaque page : n'importe qui peut écrire dans les tables de mesure
-- (page_views, quiz_starts...), les votes, les profils, les scores de pureté
-- et les avis, sans aucune limite de rythme. Les colonnes sont bornées en
-- taille depuis le 11 octobre, pas le nombre de lignes : une boucle curl
-- pouvait écrire des millions de lignes, remplir les 500 Mo du plan gratuit
-- et passer toute la base en lecture seule (évaluations payantes comprises),
-- ou fausser les compteurs publics et noyer la file de modération des avis.
--
-- Ce que fait cette migration, idempotente :
--
-- 1. frein_anon : une table UNLOGGED de compteurs par fenêtre de temps, table
--    et adresse IP, que personne ne lit avec la clé publique.
-- 2. frein_anon_ok(table, max par IP, max global, secondes) : compte la
--    requête dans sa fenêtre et répond faux au-delà des bornes. Ne freine que
--    le rôle anon (les fonctions serveur, l'admin, la fabrique et pg_cron
--    écrivent avec la clé de service, rien ne change pour eux). L'adresse
--    vient des en-têtes que PostgREST expose dans request.headers
--    (cf-connecting-ip, x-real-ip, le premier x-forwarded-for) ; sans
--    adresse, seule la borne globale joue. Les fenêtres closes sont effacées
--    au passage, une requête sur mille.
-- 3. frein_anon_insert : le déclencheur BEFORE INSERT posé sur chaque table
--    ouverte à anon, avec ses bornes en arguments. Au-delà, l'insertion est
--    refusée avec le code SQLSTATE PT429, que PostgREST rend en HTTP 429 :
--    le site ignore déjà les erreurs de mesure, et les formulaires d'avis
--    affichent leur message d'erreur habituel.
-- 4. messages (le formulaire de contact, écrit par la fonction serveur avec
--    la clé de service) : cinq messages par heure et par adresse, cent par
--    jour en tout, comptés en base et non plus seulement en mémoire d'une
--    instance de la fonction.
--
-- Les bornes, par minute et par adresse IP, sont dix à vingt fois au-dessus
-- d'un usage humain, même derrière le NAT d'un opérateur mobile (quelques
-- pages vues par minute et par personne) ; les bornes globales par minute
-- sont loin au-dessus des pointes du site (une centaine de pages vues par
-- minute au plus fort), et ne bornent qu'une attaque répartie sur beaucoup
-- d'adresses. Les avis : cinq par dix minutes et par adresse, soixante en
-- tout.

CREATE UNLOGGED TABLE IF NOT EXISTS public.frein_anon (
  cle text PRIMARY KEY,
  n integer NOT NULL DEFAULT 0,
  fenetre bigint NOT NULL
);
ALTER TABLE public.frein_anon ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.frein_anon FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.frein_anon TO service_role;
COMMENT ON TABLE public.frein_anon IS 'Compteurs du frein des écritures publiques (frein_anon_ok) : une ligne par table, adresse IP et fenêtre de temps, effacée une fois la fenêtre close. Rien de personnel n''y reste plus de quelques minutes.';

-- L'adresse IP du client, telle que PostgREST la reçoit du passage par
-- Cloudflare et Kong. NULL quand aucun en-tête ne la porte.
CREATE OR REPLACE FUNCTION public.frein_ip_client()
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  h json;
  ip text;
BEGIN
  BEGIN
    h := NULLIF(current_setting('request.headers', true), '')::json;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
  IF h IS NULL THEN RETURN NULL; END IF;
  ip := NULLIF(btrim(h->>'cf-connecting-ip'), '');
  IF ip IS NULL THEN ip := NULLIF(btrim(h->>'x-real-ip'), ''); END IF;
  IF ip IS NULL THEN ip := NULLIF(btrim(split_part(COALESCE(h->>'x-forwarded-for', ''), ',', 1)), ''); END IF;
  RETURN left(ip, 64);
END;
$$;

-- Le rôle de la requête : anon pour la clé publique, service_role pour les
-- fonctions serveur, vide hors de PostgREST (pg_cron, SQL Editor).
CREATE OR REPLACE FUNCTION public.frein_role_requete()
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  r text;
BEGIN
  BEGIN
    r := NULLIF(current_setting('request.jwt.claim.role', true), '');
    IF r IS NULL THEN
      r := NULLIF(current_setting('request.jwt.claims', true), '')::json->>'role';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    r := NULL;
  END;
  RETURN COALESCE(r, '');
END;
$$;

CREATE OR REPLACE FUNCTION public.frein_anon_ok(p_table text, p_par_ip integer, p_global integer, p_secondes integer DEFAULT 60)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fen bigint;
  ip text;
  c integer;
BEGIN
  IF public.frein_role_requete() <> 'anon' THEN RETURN true; END IF;
  fen := floor(extract(epoch FROM clock_timestamp()) / GREATEST(COALESCE(p_secondes, 60), 1))::bigint;
  -- La borne globale de la table.
  INSERT INTO public.frein_anon (cle, n, fenetre) VALUES (p_table || '|*|' || fen, 1, fen)
    ON CONFLICT (cle) DO UPDATE SET n = frein_anon.n + 1
    RETURNING n INTO c;
  IF c > p_global THEN RETURN false; END IF;
  -- La borne par adresse.
  ip := public.frein_ip_client();
  IF ip IS NOT NULL THEN
    INSERT INTO public.frein_anon (cle, n, fenetre) VALUES (p_table || '|' || ip || '|' || fen, 1, fen)
      ON CONFLICT (cle) DO UPDATE SET n = frein_anon.n + 1
      RETURNING n INTO c;
    IF c > p_par_ip THEN RETURN false; END IF;
  END IF;
  -- Ménage des fenêtres closes, une requête sur mille.
  IF random() < 0.001 THEN
    DELETE FROM public.frein_anon WHERE fenetre < fen - 1;
  END IF;
  RETURN true;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.frein_anon_ok(text, integer, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.frein_anon_ok(text, integer, integer, integer) TO service_role;

-- Le déclencheur. Arguments : max par IP, max global, secondes de la fenêtre.
CREATE OR REPLACE FUNCTION public.frein_anon_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  par_ip integer := COALESCE(NULLIF(TG_ARGV[0], ''), '60')::integer;
  glob integer := COALESCE(NULLIF(TG_ARGV[1], ''), '1000')::integer;
  sec integer := COALESCE(NULLIF(TG_ARGV[2], ''), '60')::integer;
BEGIN
  IF NOT public.frein_anon_ok(TG_TABLE_NAME::text, par_ip, glob, sec) THEN
    RAISE SQLSTATE 'PT429' USING
      MESSAGE = 'Trop de requêtes : réessayez dans une minute.',
      HINT = 'frein_anon';
  END IF;
  RETURN NEW;
END;
$$;

-- Un déclencheur par table ouverte à la clé publique. Les tables qui
-- n'existent qu'en production (quiz_completions, dilemme_votes, créées à la
-- main) sont couvertes quand elles existent, sautées sinon.
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT * FROM (VALUES
      ('page_views',        120, 2000,  60),
      ('quiz_starts',        60,  900,  60),
      ('quiz_completions',   60,  900,  60),
      ('salon_parties',      30,  400,  60),
      ('article_lectures',   60,  900,  60),
      ('source_pref_clics',  30,  400,  60),
      ('instagram_clics',    30,  400,  60),
      ('oui_non_votes',      90, 1200,  60),
      ('pour_contre_votes',  90, 1200,  60),
      ('dilemme_votes',      90, 1200,  60),
      ('profil_resultats',   30,  400,  60),
      ('purete_scores',      30,  400,  60),
      ('reviews',             5,   60, 600)
    ) AS v(nom, par_ip, glob, sec)
  LOOP
    IF to_regclass('public.' || t.nom) IS NULL THEN
      RAISE NOTICE 'frein : table % absente, sautée', t.nom;
      CONTINUE;
    END IF;
    EXECUTE format('DROP TRIGGER IF EXISTS frein_anon ON public.%I', t.nom);
    EXECUTE format(
      'CREATE TRIGGER frein_anon BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.frein_anon_insert(%L, %L, %L)',
      t.nom, t.par_ip, t.glob, t.sec);
  END LOOP;
END $$;

-- Le formulaire de contact : écrit par la fonction contact-message avec la
-- clé de service, donc hors du frein anon ; sa limite vivait en mémoire de
-- la fonction et repartait de zéro à chaque redémarrage. Ici, en base.
CREATE OR REPLACE FUNCTION public.messages_frein()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  IF NEW.ip IS NOT NULL AND NEW.ip <> '' AND NEW.ip <> 'unknown' THEN
    SELECT count(*) INTO n FROM public.messages
     WHERE ip = NEW.ip AND created_at > now() - interval '1 hour';
    IF n >= 5 THEN
      RAISE SQLSTATE 'PT429' USING MESSAGE = 'Trop de messages depuis cette adresse, réessayez plus tard.', HINT = 'messages_frein';
    END IF;
  END IF;
  SELECT count(*) INTO n FROM public.messages WHERE created_at > now() - interval '24 hours';
  IF n >= 100 THEN
    RAISE SQLSTATE 'PT429' USING MESSAGE = 'Trop de messages aujourd''hui, réessayez demain.', HINT = 'messages_frein';
  END IF;
  RETURN NEW;
END;
$$;
DO $$
BEGIN
  IF to_regclass('public.messages') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS messages_frein ON public.messages;
    CREATE TRIGGER messages_frein BEFORE INSERT ON public.messages
      FOR EACH ROW EXECUTE FUNCTION public.messages_frein();
  END IF;
END $$;

-- Bilan, affiché dans le journal du workflow.
SELECT 'frein_ecritures_publiques' AS migration,
       (SELECT count(*) FROM pg_trigger WHERE tgname = 'frein_anon' AND NOT tgisinternal) AS tables_freinees,
       (SELECT count(*) FROM pg_trigger WHERE tgname = 'messages_frein' AND NOT tgisinternal) AS messages_freine;
