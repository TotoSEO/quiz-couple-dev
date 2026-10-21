-- ============================================================================
-- Les droits de chaque table du schéma public, écrits noir sur blanc
-- (20 octobre 2026)
-- ============================================================================
-- Supabase accordait d'office l'accès API (select, insert, update, delete
-- pour anon, authenticated et service_role) à toute table créée dans le
-- schéma public. Le 30 octobre 2026 il retire ce réglage de tous les projets
-- (changelog 45329) : les tables qui existent gardent leurs droits, une table
-- créée ensuite sans GRANT répond « permission denied for table » (42501), et
-- un projet neuf, où le nouveau réglage s'applique déjà, recrée toutes nos
-- tables sans aucun droit si l'on rejoue RESTORE.sql et les migrations.
--
-- Cette migration écrit pour chaque table ce qu'elle avait en production le
-- 20 octobre 2026, relevé par l'étape « Les droits de la clé publique et du
-- rôle de service » de supabase-inventaire.yml :
--   - vingt tables que le site écrit ou lit avec la clé publique : select,
--     insert, update, delete pour anon et authenticated, le RLS et ses règles
--     faisant le tri des lignes (les trafic_jour* n'ont aucune règle : la clé
--     publique n'y lit rien, le droit est là sans servir) ;
--   - reviews : pareil, sauf la lecture, accordée colonne par colonne sans
--     ip_address (migration 20261006120000) ;
--   - dix-sept tables fermées à la clé publique, réservées au rôle de service
--     (fonctions serveur, admin, fabrique, pg_cron) ;
--   - les trois séquences, dont celle du journal des réseaux, fermée aussi.
-- En production elle ne change rien. Idempotente ; une table absente est
-- ignorée (quiz_completions et dilemme_votes ont été créées à la main et
-- peuvent manquer sur un projet neuf, voir RECOVERY.md). Son nom la place en
-- dernier dans un rejeu : toute migration écrite après elle qui crée une
-- table porte ses propres GRANT (CLAUDE.md, « Sécurité de la base »).
-- ============================================================================

grant usage on schema public to anon, authenticated, service_role;

do $$
declare
  ouvertes text[] := array[
    'article_lectures', 'custom_quiz_totaux', 'custom_quizzes', 'dilemme_votes',
    'instagram_clics', 'messages', 'oui_non_votes', 'page_views',
    'pour_contre_votes', 'profil_resultats', 'purete_scores', 'quiz_completions',
    'quiz_starts', 'salon_parties', 'source_pref_clics', 'trafic_jour',
    'trafic_jour_entonnoir', 'trafic_jour_pages', 'trafic_jour_profondeur',
    'trafic_jour_sources'
  ];
  fermees text[] := array[
    'abonnes', 'admin_connexions_ratees', 'admin_reglages', 'bilan_compteurs',
    'bilans', 'frein_anon', 'leads', 'quiz_ado_sessions', 'social_bibliotheque',
    'social_comptes', 'social_idees', 'social_jetons', 'social_journal',
    'social_posts', 'social_reglages', 'social_stats', 'social_variantes'
  ];
  t text;
begin
  foreach t in array ouvertes loop
    if to_regclass('public.' || t) is null then continue; end if;
    execute format('grant select, insert, update, delete on table public.%I to anon, authenticated', t);
    execute format('grant all on table public.%I to service_role', t);
  end loop;

  foreach t in array fermees loop
    if to_regclass('public.' || t) is null then continue; end if;
    execute format('revoke all on table public.%I from public, anon, authenticated', t);
    execute format('grant all on table public.%I to service_role', t);
  end loop;

  -- Les avis : toutes les colonnes lisibles sauf l'adresse IP. Un select=*
  -- avec la clé publique est refusé, le site demande ses colonnes une à une.
  if to_regclass('public.reviews') is not null then
    execute 'grant insert, update, delete on table public.reviews to anon, authenticated';
    execute 'revoke select on table public.reviews from anon, authenticated';
    execute 'grant select (id, author_name, rating, comment, is_approved, created_at, quiz_slug) on table public.reviews to anon, authenticated';
    execute 'grant all on table public.reviews to service_role';
  end if;

  -- Les séquences (les tables publiques ont des identifiants uuid : seules
  -- ces trois tables en ont une).
  foreach t in array array['dilemme_votes_id_seq', 'admin_connexions_ratees_id_seq'] loop
    if to_regclass('public.' || t) is null then continue; end if;
    execute format('grant usage, select on sequence public.%I to anon, authenticated, service_role', t);
  end loop;
  if to_regclass('public.social_journal_id_seq') is not null then
    execute 'revoke all on sequence public.social_journal_id_seq from public, anon, authenticated';
    execute 'grant usage, select on sequence public.social_journal_id_seq to service_role';
  end if;
end $$;

-- Le bilan, affiché par le workflow : les droits de chaque table après
-- passage (S, I, U, D = select, insert, update, delete).
select c.relname as table_,
  concat_ws(',', case when has_table_privilege('anon', c.oid, 'SELECT') then 'S' end, case when has_table_privilege('anon', c.oid, 'INSERT') then 'I' end, case when has_table_privilege('anon', c.oid, 'UPDATE') then 'U' end, case when has_table_privilege('anon', c.oid, 'DELETE') then 'D' end) as anon,
  concat_ws(',', case when has_table_privilege('service_role', c.oid, 'SELECT') then 'S' end, case when has_table_privilege('service_role', c.oid, 'INSERT') then 'I' end, case when has_table_privilege('service_role', c.oid, 'UPDATE') then 'U' end, case when has_table_privilege('service_role', c.oid, 'DELETE') then 'D' end) as service_role,
  c.relrowsecurity as rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p')
order by 1;
