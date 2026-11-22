-- L'e2 du parcours arrêté (22 novembre 2026, Thomas : « Oui vas-y »).
-- Conception dans docs/emailing/CONCEPTION.md, section « 22 novembre 2026 ».
--
-- Pourquoi : l'e2, l'e-mail de vente trois jours après l'e1, est parti 1 150
-- fois par l'API transactionnelle de Brevo du 3 au 22 novembre 2026, toutes
-- en anglais (la file sert l'anglais d'abord, et 100 e-mails partent par
-- soir) : 10 ouvertures, 3 clics, deux visites de la page de l'évaluation,
-- aucune évaluation commencée. Envoyer des e-mails que personne n'ouvre
-- abîme la réputation du domaine d'envoi chez Gmail, dont l'e1 (ouvert par
-- environ une personne sur cinq) et les e-mails du livre ont besoin.
--
-- Ce qui change : emails/reglages.mjs dit quels e-mails le parcours envoie
-- (REGLAGES.types), et chaque passage du soir (comme l'action « installer »
-- de brevo-reglages.yml) l'écrit sous la clé « parcours » de
-- emails_reglages : { "types": ["e1"] }. La file du soir
-- (20261029120000_emails_immediat.sql) ne prend plus que ces e-mails ; sans
-- la clé, elle prend les deux, comme avant. emails_file, que lisent l'admin
-- et l'action « verif », dit en plus si l'e2 est arrêté.
--
-- Fermée à la clé publique. Idempotente ; appliquée par emails-base.yml après
-- 20261103120000_emails_transactionnel.sql.

CREATE OR REPLACE FUNCTION public.emails_types_parcours()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT r.valeur->'types' FROM public.emails_reglages r
      WHERE r.cle = 'parcours' AND jsonb_typeof(r.valeur->'types') = 'array'),
    '["e1", "e2"]'::jsonb);
$$;
REVOKE EXECUTE ON FUNCTION public.emails_types_parcours() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_types_parcours() TO service_role;

-- La file du soir, comme dans 20261029120000_emails_immediat.sql, avec les
-- seuls e-mails que le parcours envoie encore.
--   1 : e1 de moins de 48 heures ; 2 : e2 ; 3 : e1 plus ancien ;
--   4 : e1 d'une langue sans envoi immédiat.
CREATE OR REPLACE FUNCTION public.emails_du_jour(p_limite integer DEFAULT 300, p_maintenant timestamptz DEFAULT now())
RETURNS TABLE (abonne_id uuid, email text, lang text, source text, prenom text, type text, priorite integer, depuis timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH reglage AS (
    SELECT COALESCE(
      (SELECT CASE WHEN COALESCE(r.valeur->>'actif', 'false') = 'true' AND jsonb_typeof(r.valeur->'langues') = 'array'
                   THEN r.valeur->'langues' END
         FROM public.emails_reglages r WHERE r.cle = 'immediat'),
      '["fr", "en", "es", "de", "it", "nl"]'::jsonb) AS langues,
      public.emails_types_parcours() AS types
  ),
  evaluations AS (
    SELECT lower(x.e) AS email FROM (
      SELECT a_email AS e FROM public.bilans WHERE a_email IS NOT NULL
      UNION SELECT b_email FROM public.bilans WHERE b_email IS NOT NULL
      UNION SELECT paiement_email FROM public.bilans WHERE paiement_email IS NOT NULL
    ) x
  ),
  candidats AS (
    SELECT ab.id, ab.email, ab.lang, COALESCE(ab.derniere_source, ab.source) AS source, ab.prenom,
           'e1'::text AS type,
           CASE WHEN NOT ((SELECT langues FROM reglage) ? ab.lang) THEN 4
                WHEN ab.consent_at >= p_maintenant - interval '48 hours' THEN 1
                ELSE 3 END AS priorite,
           ab.consent_at AS depuis
      FROM public.abonnes ab
     WHERE (SELECT types FROM reglage) ? 'e1'
       AND ab.statut = 'actif'
       AND COALESCE(ab.derniere_source, ab.source) <> 'ebook'
       AND ab.consent_at <= p_maintenant - interval '18 hours'
       AND ab.consent_at >= p_maintenant - interval '7 days'
       AND NOT EXISTS (SELECT 1 FROM public.emails_envois ev WHERE ev.abonne_id = ab.id AND ev.type = 'e1')
    UNION ALL
    SELECT ab.id, ab.email, ab.lang, COALESCE(ab.derniere_source, ab.source), ab.prenom,
           'e2'::text, 2, ev1.envoye_le
      FROM public.abonnes ab
      JOIN public.emails_envois ev1 ON ev1.abonne_id = ab.id AND ev1.type = 'e1'
     WHERE (SELECT types FROM reglage) ? 'e2'
       AND ab.statut = 'actif'
       AND COALESCE(ab.derniere_source, ab.source) <> 'ebook'
       AND ev1.statut = 'envoye'
       AND ev1.remis_le IS NOT NULL
       AND ev1.rebond_doux_le IS NULL AND ev1.plainte_le IS NULL AND ev1.desinscrit_le IS NULL
       AND ev1.envoye_le <= p_maintenant - interval '66 hours'
       AND ev1.envoye_le >= p_maintenant - interval '30 days'
       AND NOT EXISTS (SELECT 1 FROM public.emails_envois ev WHERE ev.abonne_id = ab.id AND ev.type = 'e2')
  )
  SELECT c.id, c.email, c.lang, c.source, c.prenom, c.type, c.priorite, c.depuis
    FROM candidats c
   WHERE NOT EXISTS (SELECT 1 FROM evaluations v WHERE v.email = c.email)
     AND NOT EXISTS (SELECT 1 FROM public.emails_envois ev
                      WHERE ev.abonne_id = c.id
                        AND COALESCE(ev.envoye_le, ev.cree_le) > p_maintenant - interval '44 hours')
   ORDER BY c.priorite,
            -- le néerlandais (31 octobre 2026) avant l'espagnol, qui reste le dernier
            CASE c.lang WHEN 'en' THEN 1 WHEN 'fr' THEN 2 WHEN 'it' THEN 3 WHEN 'de' THEN 4 WHEN 'nl' THEN 5 ELSE 6 END,
            c.depuis DESC, c.id
   LIMIT GREATEST(0, LEAST(COALESCE(p_limite, 0), 5000));
$$;
REVOKE EXECUTE ON FUNCTION public.emails_du_jour(integer, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_du_jour(integer, timestamptz) TO service_role;

-- La file que l'admin et verif affichent, et si l'e2 est arrêté.
CREATE OR REPLACE FUNCTION public.emails_file(p_maintenant timestamptz DEFAULT now())
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'e1', count(*) FILTER (WHERE type = 'e1'),
    'e1_recents', count(*) FILTER (WHERE type = 'e1' AND depuis >= p_maintenant - interval '48 hours'),
    'e2', count(*) FILTER (WHERE type = 'e2'),
    'e2_arrete', NOT (public.emails_types_parcours() ? 'e2'))
  FROM public.emails_du_jour(5000, p_maintenant);
$$;
REVOKE EXECUTE ON FUNCTION public.emails_file(timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_file(timestamptz) TO service_role;

-- La clé « parcours » tout de suite, pour que la file du soir ne reprenne
-- plus d'e2 même avant le prochain passage (qui la réécrit depuis
-- emails/reglages.mjs).
INSERT INTO public.emails_reglages (cle, valeur, maj_le)
VALUES ('parcours', '{"types": ["e1"]}'::jsonb, now())
ON CONFLICT (cle) DO NOTHING;

SELECT 'emails_sans_e2' AS migration, public.emails_types_parcours() AS types, public.emails_file(now()) AS file;
