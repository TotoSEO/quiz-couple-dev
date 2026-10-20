-- Les statistiques de l'admin ne répondent plus à la clé publique
-- (11 octobre 2026).
--
-- Jusque-là, n'importe qui pouvait appeler get_trafic_*, get_quiz_daily*,
-- get_salon_*, get_source_pref_* et get_instagram_clics avec la clé publique,
-- qui est dans chaque page : le trafic du site, ses pages et ses sources
-- étaient lisibles par tout le monde. L'admin les lit désormais par la
-- fonction serveur admin-stats, qui vérifie le jeton admin puis les appelle
-- avec la clé de service.
--
-- Ordre d'application : seulement une fois le nouvel admin en ligne et
-- admin-stats en état de marche. Avant, l'admin servi par le site lisait ces
-- fonctions directement, et cette migration l'aurait laissé sans chiffres.
-- securite-base.yml attend les deux (admin.js publié qui appelle admin-stats,
-- et admin-stats?sante=1 qui répond) avant de la lancer.
--
-- Les pages publiques gardent les leurs : get_quiz_counts, get_quiz_total et
-- get_quiz_starts_counts (compteurs de parties), les votes, les profils, la
-- pureté, get_article_lectures, get_instagram_recents, avis_deja_depose.
--
-- Toutes les surcharges de chaque nom sont fermées (get_quiz_daily existe
-- avec et sans fuseau). Idempotente. Une migration qui supprime puis recrée
-- l'une de ces fonctions la rouvre (Supabase accorde EXECUTE à anon sur
-- toute fonction créée dans public) : relancer alors securite-base.yml.
-- Un CREATE OR REPLACE, lui, garde les droits.

do $$
declare
  f regprocedure;
begin
  for f in
    select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in (
      'get_bilan_tableau', 'get_instagram_clics',
      'get_quiz_daily', 'get_quiz_daily_par_quiz', 'get_quiz_daily_total',
      'get_quiz_starts_daily_par_quiz', 'get_quiz_starts_total',
      'get_salon_counts', 'get_salon_counts_depuis', 'get_salon_daily', 'get_salon_total',
      'get_source_pref_clics', 'get_source_pref_daily',
      'get_trafic_daily', 'get_trafic_entonnoir', 'get_trafic_pages',
      'get_trafic_profondeur', 'get_trafic_resume', 'get_trafic_sources')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;

-- Le bilan, rendu au workflow : les fonctions encore ouvertes à la clé publique.
select string_agg(p.proname, ', ' order by p.proname) as fonctions_publiques
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prokind = 'f' and p.prorettype <> 'trigger'::regtype
  and has_function_privilege('anon', p.oid, 'execute');
