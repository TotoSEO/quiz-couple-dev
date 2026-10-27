-- La file du soir du parcours e-mail sert d'abord l'anglais, puis le
-- français, l'italien et l'allemand, l'espagnol en dernier (27 octobre 2026,
-- Thomas : « ok vas-y » sur cette proposition). Depuis le lancement de
-- l'évaluation de couple, les trois ventes sont en anglais : sur six
-- évaluations à deux allées au bout dans cette langue, trois ont payé. En
-- espagnol, vingt-deux couples sont allés au bout et aucun n'a payé ; sept
-- visiteurs hispanophones sur dix viennent d'Amérique latine, où 7,92 € pèse
-- lourd, et l'e-mail ne peut pas leur dire le prix réduit de leur région
-- (l'abonné n'a qu'une langue, pas de pays). Les 290 envois du soir au plus
-- (moins pendant la montée en charge) vont donc d'abord là où ils peuvent
-- vendre.
--
-- Dans une même langue, l'ordre reste celui de 20261024190000_emails_ordre.sql :
-- le plus en retard d'abord (échéance : 18 heures après l'adresse pour
-- « e1 », 66 heures après « e1 » pour « e2 »). Un « e2 » anglais passe donc
-- avant un « e1 » espagnol. Rien d'autre ne change : qui reçoit quoi, les
-- colonnes rendues, le plafond.
--
-- Ce que ça veut dire sur l'offre gratuite de Brevo : la porte des résultats
-- laisse environ 225 adresses par jour, dont un bon tiers en espagnol (les
-- campagnes des 25 et 26 octobre), et chaque adresse appelle deux e-mails.
-- Les quatre autres langues remplissent donc presque à elles seules le
-- plafond du soir : l'espagnol ne recevra presque plus rien, et un « e1 »
-- qui attend plus de 60 jours sort de la file sans être parti. C'est voulu
-- tant que l'e-mail ne peut pas dire de prix à l'Amérique latine. Pour
-- remettre l'espagnol dans l'ordre commun, une migration réécrit la
-- fonction sans le CASE.

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
   ORDER BY CASE c.lang WHEN 'en' THEN 1 WHEN 'fr' THEN 2 WHEN 'it' THEN 3 WHEN 'de' THEN 4 ELSE 5 END,
            c.echeance, c.id
   LIMIT GREATEST(0, LEAST(COALESCE(p_limite, 0), 5000));
$$;
REVOKE EXECUTE ON FUNCTION public.emails_du_jour(integer, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emails_du_jour(integer, timestamptz) TO service_role;
