-- Le rappel du lendemain et la reprise de l'évaluation arrêtés (22 novembre
-- 2026, Thomas : « Oui vas-y »). Conception dans docs/bilan/CONCEPTION.md,
-- section « 22 novembre 2026 ».
--
-- Pourquoi : sur les évaluations créées en trente jours, 174 rappels « votre
-- rapport vous attend » n'avaient été suivis d'aucun paiement, et 181
-- reprises (« vos questions vous attendent », « l'autre n'a pas fini »)
-- d'aucun paiement et d'un seul partenaire revenu finir. Le « prêt », le lien
-- du rapport et les liens qu'on demande partent toujours.
--
-- La fonction bilan n'envoie plus ni l'un ni l'autre (RELANCES_ACTIVES et
-- REPRISES_ACTIVES de serveur.mjs). Ici, bilan_relances_dues() ne compte
-- plus rien : la tâche pg_cron « bilan-relance » (bilan_lancer_relance) ne
-- lance donc plus le workflow bilan-relance.yml, et l'onglet Évaluation de
-- l'admin (`envois_dus` de get_bilan_tableau) ne montre plus d'envois dus qui
-- ne partiront pas. Pour les rouvrir : remettre les deux valeurs de
-- serveur.mjs à vrai, et le corps de 20261024140000_bilan_reprise.sql dans
-- une nouvelle migration.
--
-- Fermée à la clé publique. Idempotente ; appliquée par bilan-base.yml en
-- dernier, après 20261024140000_bilan_reprise.sql, qui écrit le corps
-- d'origine à chaque passage.

CREATE OR REPLACE FUNCTION public.bilan_relances_dues()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 0;
$$;
REVOKE EXECUTE ON FUNCTION public.bilan_relances_dues() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bilan_relances_dues() TO service_role;

SELECT 'bilan_sans_rappel' AS migration, public.bilan_relances_dues() AS relances_dues;
