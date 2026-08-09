-- Votes du jeu « dilemmes de couple ».
--
-- À exécuter une seule fois dans l'éditeur SQL de Supabase. Le site est
-- entièrement statique : il n'a que la clé anon, il ne peut donc ni créer
-- cette table ni poser ces règles lui-même.
--
-- Deux principes :
--   1. personne ne peut lire les votes un par un, seulement leur total. Un
--      visiteur qui aurait la clé anon ne doit pas pouvoir savoir qui a voté
--      quoi, ni recompter les votes à sa façon ;
--   2. un vote par dilemme et par foyer. La colonne « votant » ne contient pas
--      d'adresse IP mais son empreinte SHA-256, calculée dans le navigateur.

create table if not exists public.dilemme_votes (
  id          bigint generated always as identity primary key,
  dilemme_id  smallint    not null check (dilemme_id between 1 and 500),
  choix       text        not null check (choix in ('ok', 'pasok')),
  lang        text        not null default 'fr' check (char_length(lang) <= 5),
  votant      text        not null check (char_length(votant) between 8 and 64),
  created_at  timestamptz not null default now(),

  -- C'est cette contrainte qui tient les pourcentages debout : le second vote
  -- du même foyer sur le même dilemme est rejeté par la base, pas par le
  -- navigateur. Recharger la page ou vider son localStorage ne sert à rien.
  constraint dilemme_votes_un_seul_par_foyer unique (dilemme_id, votant)
);

create index if not exists dilemme_votes_par_dilemme on public.dilemme_votes (dilemme_id);

alter table public.dilemme_votes enable row level security;

-- Le site peut déposer un vote, et rien d'autre. Pas de select, pas d'update,
-- pas de delete : le doublon est refusé par la contrainte ci-dessus.
drop policy if exists "anon depose un vote" on public.dilemme_votes;
create policy "anon depose un vote"
  on public.dilemme_votes for insert
  to anon
  with check (true);

-- La seule lecture possible passe par cette fonction, qui ne rend que des
-- totaux. « security definer » lui permet de compter malgré la RLS.
create or replace function public.get_dilemme_counts()
returns table (dilemme_id smallint, ok bigint, pasok bigint)
language sql
security definer
set search_path = public
stable
as $$
  select v.dilemme_id,
         count(*) filter (where v.choix = 'ok')    as ok,
         count(*) filter (where v.choix = 'pasok') as pasok
  from public.dilemme_votes v
  group by v.dilemme_id
$$;

revoke all on function public.get_dilemme_counts() from public;
grant execute on function public.get_dilemme_counts() to anon, authenticated;

-- Total général, pour la pastille en haut de page : le nombre de votes
-- déposés, pas le nombre de parties jouées.
create or replace function public.get_dilemme_total()
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*) from public.dilemme_votes
$$;

revoke all on function public.get_dilemme_total() from public;
grant execute on function public.get_dilemme_total() to anon, authenticated;
