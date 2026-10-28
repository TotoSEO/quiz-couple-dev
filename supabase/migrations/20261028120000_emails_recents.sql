-- La file du soir du parcours e-mail sert d'abord les adresses laissées
-- dans les 48 dernières heures, puis les « e2 », puis les autres « e1 », les
-- plus récents d'abord dans chacun des trois groupes, et dans un même groupe
-- l'anglais, le français, l'italien, l'allemand, puis l'espagnol (28 octobre
-- 2026, Thomas : « vasy »).
--
-- Pourquoi : presque personne n'ouvrait plus. Hors Apple Mail (qui charge
-- d'office chaque e-mail reçu), environ une personne sur dix avait ouvert le
-- premier soir (24 octobre), puis 3 sur 421 e-mails remis du 25 au 27, et
-- aucune sur 144 le 27. Huit adresses sur dix sont chez Gmail, qui juge un
-- domaine d'envoi neuf sur ses premiers envois : il range très
-- probablement nos e-mails dans les spams. Gmail regarde surtout si les
-- gens ouvrent, et ceux qui ouvrent sont ceux qui viennent de faire un test
-- et se souviennent du site. Rangée par échéance (20261024190000_emails_ordre.sql),
-- la file servait les plus anciens d'abord : avec plus de mille « e1 » en
-- attente, une adresse laissée le jour même attendait des jours, puis
-- recevait un e-mail d'un site qu'elle avait oublié.
--
-- C'est l'ordre du premier jour (20261024120000_emails_parcours.sql :
-- `priorite`, puis les plus récents), avec la langue en second, comme
-- l'avait voulue 20261027120000_emails_langues.sql : l'anglais vend, et
-- l'e-mail ne peut pas dire à l'Amérique latine son prix réduit. Pendant la
-- retenue (REGLAGES.retenue, 100 par soir), les adresses de moins de
-- 48 heures remplissent à peu près le soir à elles seules : les « e2 » et
-- le retard attendent que le plafond remonte, et un « e1 » de plus de
-- 60 jours sort de la file sans être parti, comme avant.
--
-- `priorite` garde son sens (1 : « e1 » de moins de 48 heures, 2 : « e2 »,
-- 3 : « e1 » plus ancien), lu par `emails_file` pour l'admin ; `depuis` est
-- l'heure de l'adresse pour un « e1 », celle de l'« e1 » pour un « e2 ».
-- Rien d'autre ne change : qui reçoit quoi, les colonnes rendues, le
-- plafond.

CREATE OR REPLACE FUNCTION public.emails_du_jour(p_limite integer DEFAULT 300, p_maintenant timestamptz DEFAULT now())
RETURNS TABLE (abonne_id uuid, email text, lang text, source text, prenom text, type text, priorite integer, depuis timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH evaluations AS (
    SELECT lower(x.e) AS email FROM (
      SELECT a_email AS e FROM public.bilans WHERE a_email IS NOT NULL
      UNION SELECT b_email FROM public.bilans WHERE b_email IS NOT NULL
      UNION SELECT paiement_email FROM public.bilans WHERE paiement_email IS NOT NULL
    ) x
  ),
  candidats AS (
    SELECT ab.id, ab.email, ab.lang, COALESCE(ab.derniere_source, ab.source) AS source, ab.prenom,
           'e1'::text AS type,
           CASE WHEN ab.consent_at >= p_maintenant - interval '48 hours' THEN 1 ELSE 3 END AS priorite,
           ab.consent_at AS depuis
      FROM public.abonnes ab
     WHERE ab.statut = 'actif'
       AND COALESCE(ab.derniere_source, ab.source) <> 'ebook'
       AND ab.consent_at <= p_maintenant - interval '18 hours'
       AND ab.consent_at >= p_maintenant - interval '60 days'
       AND NOT EXISTS (SELECT 1 FROM public.emails_envois ev WHERE ev.abonne_id = ab.id AND ev.type = 'e1')
    UNION ALL
    SELECT ab.id, ab.email, ab.lang, COALESCE(ab.derniere_source, ab.source), ab.prenom,
           'e2'::text, 2, ev1.envoye_le
      FROM public.abonnes ab
      JOIN public.emails_envois ev1 ON ev1.abonne_id = ab.id AND ev1.type = 'e1'
     WHERE ab.statut = 'actif'
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
            CASE c.lang WHEN 'en' THEN 1 WHEN 'fr' THEN 2 WHEN 'it' THEN 3 WHEN 'de' THEN 4 ELSE 5 END,
            c.depuis DESC, c.id
   LIMIT GREATEST(0, LEAST(COALESCE(p_limite, 0), 5000));
$$;
REVOKE EXECUTE ON FUNCTION public.emails_du_jour(integer, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_du_jour(integer, timestamptz) TO service_role;
