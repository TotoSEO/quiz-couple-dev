-- La file du soir du parcours e-mail, le plus en retard d'abord (24 octobre
-- 2026, Thomas, le soir du premier envoi : « La priorité c'est en retard,
-- puis s'ajoutent au quota les nouveaux du jour, jusqu'à ce que tout soit
-- rééquilibré »). Avant, les adresses de moins de 48 heures passaient en
-- tête, puis les « e2 », puis le retard, les plus récentes d'abord : avec
-- 686 « e1 » en attente ce soir-là, environ 120 nouvelles adresses par jour
-- et les 300 envois quotidiens de l'offre gratuite de Brevo, une partie du
-- retard aurait attendu près de quatre semaines son premier e-mail. Rangée
-- par échéance, plus personne n'attend plus de six jours environ, et la file
-- revient à l'équilibre au bout des mêmes trois semaines.
--
-- L'échéance d'un e-mail est le moment où il pouvait partir : 18 heures
-- après l'adresse laissée pour « e1 », 66 heures après « e1 » pour « e2 ».
-- Les règles de qui reçoit quoi ne changent pas (voir
-- 20261024120000_emails_parcours.sql), ni les colonnes rendues : `priorite`
-- garde son sens (1 : « e1 » de moins de 48 heures, 2 : « e2 », 3 : « e1 »
-- plus ancien), que lit `emails_file` pour l'admin, mais ne sert plus à
-- l'ordre. Le plafond du soir (montée en charge, puis 290) compte tout,
-- « e1 » et « e2 » ensemble : jamais plus que les crédits de Brevo moins
-- dix.

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
           ab.consent_at AS depuis,
           ab.consent_at + interval '18 hours' AS echeance
      FROM public.abonnes ab
     WHERE ab.statut = 'actif'
       AND COALESCE(ab.derniere_source, ab.source) <> 'ebook'
       AND ab.consent_at <= p_maintenant - interval '18 hours'
       AND ab.consent_at >= p_maintenant - interval '60 days'
       AND NOT EXISTS (SELECT 1 FROM public.emails_envois ev WHERE ev.abonne_id = ab.id AND ev.type = 'e1')
    UNION ALL
    SELECT ab.id, ab.email, ab.lang, COALESCE(ab.derniere_source, ab.source), ab.prenom,
           'e2'::text, 2, ev1.envoye_le, ev1.envoye_le + interval '66 hours'
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
   ORDER BY c.echeance, c.id
   LIMIT GREATEST(0, LEAST(COALESCE(p_limite, 0), 5000));
$$;
REVOKE EXECUTE ON FUNCTION public.emails_du_jour(integer, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_du_jour(integer, timestamptz) TO service_role;
