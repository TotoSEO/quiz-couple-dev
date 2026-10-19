-- Retrouver une évaluation par l'adresse e-mail (19 octobre 2026, le lien
-- perdu) : l'action `retrouver` de la fonction bilan cherche l'adresse par
-- égalité stricte dans les trois colonnes d'adresse, et emailPropre écrit
-- désormais toute adresse en minuscules. Idempotente ; appliquée par
-- bilan-base.yml après 20261019120000_evaluation_solo.sql.
CREATE INDEX IF NOT EXISTS bilans_a_email ON public.bilans (a_email) WHERE a_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS bilans_b_email ON public.bilans (b_email) WHERE b_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS bilans_paiement_email ON public.bilans (paiement_email) WHERE paiement_email IS NOT NULL;

-- Les adresses déjà enregistrées passent en minuscules, comme les nouvelles.
UPDATE public.bilans SET a_email = lower(a_email) WHERE a_email IS NOT NULL AND a_email <> lower(a_email);
UPDATE public.bilans SET b_email = lower(b_email) WHERE b_email IS NOT NULL AND b_email <> lower(b_email);
UPDATE public.bilans SET paiement_email = lower(paiement_email) WHERE paiement_email IS NOT NULL AND paiement_email <> lower(paiement_email);

SELECT 'bilan_retrouver' AS migration, count(*) AS bilans,
       count(*) FILTER (WHERE a_email IS NOT NULL OR b_email IS NOT NULL OR paiement_email IS NOT NULL) AS avec_adresse
FROM public.bilans;
