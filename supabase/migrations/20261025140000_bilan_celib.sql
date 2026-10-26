-- Les célibataires qui choisissent l'évaluation seul(e) (25 octobre 2026,
-- Thomas : « les gens qui font le test seul, c'est qui ces gens ? », puis
-- « on mesure la part de célibataires pour voir si ça vaut le coup de créer un
-- test payant pour les célibataires »). Au départ seul(e), la page demande
-- « Où en êtes-vous ? » (en couple, c'est compliqué, célibataire) et compte
-- la réponse dans bilan_compteurs (`statut_solo`, clé couple, complique ou
-- celib). Un célibataire ne crée pas d'évaluation : il coche ce qui
-- l'intéresserait dans une évaluation pour célibataires, ajoute une idée s'il
-- en a une, et laisse, s'il le veut, l'adresse où le prévenir le jour où elle
-- sortira (action `celib` de la fonction bilan).
--
-- bilan_celib : une ligne par réponse, une seule par adresse (la dernière
-- réponse la remplace). Fermée à la clé publique : seule la fonction bilan,
-- avec la clé de service, y écrit. L'adresse n'a qu'un usage, l'e-mail du
-- jour où l'évaluation pour célibataires sort (notifie_le) ; rgpd_menage()
-- l'efface 30 jours après cet envoi, ou au bout d'un an s'il n'a jamais eu
-- lieu, et efface les réponses d'un an.
--
-- get_bilan_celib(p_jours) : ce que l'onglet Évaluation de l'admin en montre
-- (par admin-stats), sans aucune adresse.
-- Idempotente ; appliquée par bilan-base.yml après les autres migrations du
-- bilan.

CREATE TABLE IF NOT EXISTS public.bilan_celib (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cree_le     timestamptz NOT NULL DEFAULT now(),
  maj_le      timestamptz NOT NULL DEFAULT now(),
  lang        text NOT NULL,
  interets    text[] NOT NULL DEFAULT '{}',
  autre       text,
  email       text UNIQUE,
  consent_at  timestamptz,
  notifie_le  timestamptz
);
ALTER TABLE public.bilan_celib DROP CONSTRAINT IF EXISTS bilan_celib_bornes;
ALTER TABLE public.bilan_celib ADD CONSTRAINT bilan_celib_bornes CHECK (
  lang IN ('fr', 'en', 'es', 'de', 'it')
  AND cardinality(interets) BETWEEN 1 AND 12
  AND (autre IS NULL OR char_length(autre) <= 300)
  AND (email IS NULL OR (char_length(email) <= 254 AND consent_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS bilan_celib_cree_le ON public.bilan_celib (cree_le);

REVOKE ALL ON TABLE public.bilan_celib FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.bilan_celib TO service_role;
ALTER TABLE public.bilan_celib ENABLE ROW LEVEL SECURITY;

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
    'autres', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('texte', a.autre, 'lang', a.lang, 'le', a.cree_le) ORDER BY a.cree_le DESC), '[]'::jsonb)
      FROM (SELECT r.autre, r.lang, r.cree_le FROM reponses r WHERE r.autre IS NOT NULL ORDER BY r.cree_le DESC LIMIT 30) a
    )
  );
$$;
REVOKE EXECUTE ON FUNCTION public.get_bilan_celib(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_bilan_celib(integer) TO service_role;

-- Le bilan, rendu au workflow.
SELECT 'bilan_celib' AS migration,
       (SELECT count(*) FROM public.bilan_celib) AS reponses,
       has_table_privilege('anon', 'public.bilan_celib', 'select') AS anon_lit,
       has_function_privilege('anon', 'public.get_bilan_celib(integer)', 'execute') AS anon_execute;
