-- Sécurité : ce que la clé publique peut écrire ou lancer (11 octobre 2026).
--
-- Suite de l'audit du 10 octobre 2026. Rien de ce que cette migration ferme
-- ne sert au site : elle s'applique donc à la fusion, par securite-base.yml,
-- avant même que le site soit republié. Idempotente : la relancer ne change
-- rien, et une table ou une colonne absente est simplement sautée.
--
-- 1. L'ancien quiz ado multijoueur. Le quiz ado passe depuis des mois par
--    des canaux de diffusion Realtime (« ado-<code> », quiz-ado-multiplayer.js),
--    sans aucune table. Mais quiz_ado_sessions gardait ses règles d'origine :
--    n'importe qui pouvait y lire, créer et modifier des parties, avec les
--    prénoms, les réponses et l'adresse IP des joueurs. Même chose pour
--    quiz_sessions (auto_delete_sessions.sql), plus utilisée du tout. Les
--    règles et les droits de anon disparaissent ; les tables restent, la
--    purge pg_cron continue de les vider.
-- 2. leads : la clé publique pouvait y insérer directement, alors que
--    l'e-book passe par la fonction ebook-verify (clé de service). La règle
--    ouverte disparaît. La colonne verification_sent_at note l'heure du
--    dernier e-mail de confirmation : ebook-verify n'en renvoie pas un
--    second à la même adresse avant dix minutes.
-- 3. Bornes de taille sur les colonnes que le site remplit avec la clé
--    publique. Sans elles, un seul envoi pouvait écrire un texte de
--    plusieurs mégaoctets, dans une base limitée à 500 Mo par le plan
--    gratuit (une base pleine passe en lecture seule, automates compris).
--    Chaque borne est loin au-dessus de ce que le site envoie (chemins
--    coupés à 200 signes par audience.js, identifiant de visite de 32,
--    prénom d'avis de 60, commentaire de 200). NOT VALID : seules les
--    nouvelles lignes sont contrôlées, aucune ligne existante n'est relue.
--    Le score de pureté est borné aussi : la moyenne publique se calcule
--    sur le score brut, qu'une seule ligne forgée suffisait à fausser.
-- 4. Fonctions internes que tout le monde pouvait lancer, faute d'un
--    REVOKE sur PUBLIC (le rôle dont anon hérite) : les purges, et le
--    compteur de parties d'un quiz personnalisé. Elles sont réservées à la
--    clé de service ; pg_cron les lance en tant que propriétaire, rien ne
--    change pour lui, et manage-custom-quiz garde increment_quiz_plays.
-- 5. Deux tables fermées pour l'admin : les essais de connexion ratés
--    (verify-admin les compte en base, la limite ne repart plus de zéro à
--    chaque redémarrage de la fonction) et les réglages rangés côté serveur
--    (le jeton Affilae, qui ne dort plus dans le navigateur).
--
-- Les statistiques de l'admin sont fermées à part, par
-- 20261011130000_stats_admin_privees.sql, une fois le nouvel admin en ligne.

set lock_timeout = '10s';

-- ── 1. Tables de l'ancien quiz ado ────────────────────────────────────────
do $$
declare
  t text;
  r record;
begin
  foreach t in array array['quiz_ado_sessions', 'quiz_sessions'] loop
    if to_regclass('public.' || t) is null then continue; end if;
    for r in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', r.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end $$;

-- ── 2. leads ──────────────────────────────────────────────────────────────
do $$
declare
  r record;
begin
  if to_regclass('public.leads') is null then return; end if;
  -- Seules les règles grandes ouvertes partent (« true ») : une règle
  -- réservée à la clé de service, s'il y en a une, reste en place.
  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'leads'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      and coalesce(with_check, qual) = 'true'
  loop
    execute format('drop policy %I on public.leads', r.policyname);
  end loop;
  alter table public.leads enable row level security;
  revoke all on table public.leads from anon, authenticated;
  alter table public.leads add column if not exists verification_sent_at timestamptz;
end $$;

-- ── 3. Bornes de taille ───────────────────────────────────────────────────
do $$
declare
  b record;
  nom text;
begin
  for b in
    select * from (values
      ('page_views',        'visite_id',    64),
      ('page_views',        'path',        300),
      ('page_views',        'route_key',   100),
      ('page_views',        'lang',         16),
      ('page_views',        'source',      200),
      ('source_pref_clics', 'visite_id',    64),
      ('source_pref_clics', 'emplacement',  64),
      ('source_pref_clics', 'lang',         16),
      ('source_pref_clics', 'path',        300),
      ('instagram_clics',   'visite_id',    64),
      ('instagram_clics',   'emplacement',  64),
      ('instagram_clics',   'lang',         16),
      ('instagram_clics',   'path',        300),
      ('article_lectures',  'visite_id',    64),
      ('article_lectures',  'path',        300),
      ('article_lectures',  'lang',         16),
      ('quiz_starts',       'quiz_slug',   100),
      ('quiz_starts',       'lang',         16),
      ('quiz_starts',       'visite_id',    64),
      ('quiz_completions',  'quiz_slug',   100),
      ('quiz_completions',  'lang',         16),
      ('quiz_completions',  'visite_id',    64),
      ('salon_parties',     'quiz_slug',   100),
      ('salon_parties',     'lang',         16),
      ('salon_parties',     'visite_id',    64),
      ('oui_non_votes',     'lang',         16),
      ('oui_non_votes',     'votant',      128),
      ('pour_contre_votes', 'lang',         16),
      ('pour_contre_votes', 'votant',      128),
      ('dilemme_votes',     'choix',        32),
      ('dilemme_votes',     'lang',         16),
      ('dilemme_votes',     'votant',      128),
      ('reviews',           'author_name', 120),
      ('reviews',           'comment',    1000),
      ('reviews',           'quiz_slug',   100),
      ('reviews',           'ip_address',   64)
    ) as v(tab, col, maxi)
  loop
    nom := b.tab || '_' || b.col || '_taille';
    if not exists (
      select from information_schema.columns
      where table_schema = 'public' and table_name = b.tab and column_name = b.col
    ) then continue; end if;
    if exists (select from pg_constraint where conname = nom and conrelid = ('public.' || b.tab)::regclass) then continue; end if;
    execute format('alter table public.%I add constraint %I check (char_length(%I::text) <= %s) not valid',
                   b.tab, nom, b.col, b.maxi);
  end loop;

  if to_regclass('public.purete_scores') is not null
     and not exists (select from pg_constraint where conname = 'purete_scores_bornes' and conrelid = 'public.purete_scores'::regclass) then
    alter table public.purete_scores
      add constraint purete_scores_bornes check (score_max <= 10000 and score <= score_max) not valid;
  end if;
end $$;

-- ── 4. Fonctions internes ─────────────────────────────────────────────────
do $$
declare
  f regprocedure;
begin
  for f in
    select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in (
      'increment_quiz_plays', 'cleanup_expired_custom_quizzes', 'cleanup_expired_sessions',
      'cleanup_old_unapproved_reviews', 'purge_article_lectures', 'purge_source_pref_clics',
      'purge_page_views')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;

-- ── 5. Tables de l'admin ──────────────────────────────────────────────────
create table if not exists public.admin_connexions_ratees (
  id bigint generated always as identity primary key,
  ip text not null,
  le timestamptz not null default now()
);
create index if not exists admin_connexions_ratees_ip_le on public.admin_connexions_ratees (ip, le);
create index if not exists admin_connexions_ratees_le on public.admin_connexions_ratees (le);
alter table public.admin_connexions_ratees enable row level security;
revoke all on table public.admin_connexions_ratees from anon, authenticated;
grant all on table public.admin_connexions_ratees to service_role;

create table if not exists public.admin_reglages (
  cle text primary key,
  valeur text not null,
  maj timestamptz not null default now()
);
alter table public.admin_reglages enable row level security;
revoke all on table public.admin_reglages from anon, authenticated;
grant all on table public.admin_reglages to service_role;

-- Le bilan, rendu au workflow : ce que la clé publique peut encore écrire.
select string_agg(tablename || ' ' || cmd, ', ' order by tablename, cmd) as ecritures_publiques
from pg_policies
where schemaname = 'public' and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  and (roles && array['public', 'anon']::name[])
  and coalesce(with_check, qual, '') not like '%service_role%';
