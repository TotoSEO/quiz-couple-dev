-- Les mipaps, le second compte Instagram (reseaux/mipaps) : français, fond
-- blanc, le Gribouillou et la Gribouillette. Il vit dans les mêmes tables
-- que Quiz Couple, dont le seul compte est la langue en : le compte fr est
-- le sien, avec sa propre semaine type.
--
-- Idempotente : appliquée par le workflow social-base.yml, ou à la main dans
-- Supabase > SQL Editor.

-- 1. Le compte, inactif tant que Thomas n'a pas collé son jeton dans l'admin
--    (le nom devient le pseudo Instagram à la connexion).
insert into public.social_comptes (langue, nom, actif, fuseau)
values ('fr', 'Les mipaps', false, 'Europe/Paris')
on conflict (langue) do update set nom = coalesce(public.social_comptes.nom, excluded.nom);

-- 2. La semaine type de chaque compte : null = le réglage global « melange »
--    (celui de Quiz Couple). Les mipaps : trois posts par jour, un reel
--    animé le matin, un post à midi, le soir un carrousel-histoire ou un
--    reel statique en alternance (la même grille dans MELANGE_MIPAPS,
--    reseaux/automates/lib/calendrier.mjs).
alter table public.social_comptes add column if not exists melange jsonb;
comment on column public.social_comptes.melange is 'Semaine type du compte (catégorie par créneau, du lundi 1 au dimanche 7) ; null = le réglage global melange';
update public.social_comptes
set melange = '{"matin": "mipaps-anime", "midi": "mipaps-post", "soir": {"1": "mipaps-histoire", "2": "mipaps-statique", "3": "mipaps-histoire", "4": "mipaps-statique", "5": "mipaps-histoire", "6": "mipaps-statique", "7": "mipaps-histoire"}}'::jsonb
where langue = 'fr';

-- 3. Les posts et les idées portent leur compte (la langue) : deux comptes
--    publient le même jour au même créneau.
alter table public.social_posts add column if not exists langue text not null default 'en';
alter table public.social_posts drop constraint if exists social_posts_langue_check;
alter table public.social_posts add constraint social_posts_langue_check check (langue in ('en', 'fr', 'es', 'de', 'it'));
alter table public.social_posts drop constraint if exists social_posts_jour_creneau_key;
create unique index if not exists social_posts_langue_jour_creneau on public.social_posts (langue, jour, creneau);

alter table public.social_idees add column if not exists langue text not null default 'en';
alter table public.social_idees drop constraint if exists social_idees_categorie_check;
alter table public.social_idees add constraint social_idees_categorie_check
  check (categorie is null or categorie in ('pov', 'connais-tu', 'tu-preferes', 'statique', 'phrase', 'coquin', 'carrousel', 'bd', 'mipaps-anime', 'mipaps-statique', 'mipaps-histoire', 'mipaps-post'));

-- 4. L'accueil de quiz-couple.com ne montre que les publications de Quiz
--    Couple (la langue en), jamais celles des mipaps.
create or replace function public.get_instagram_recents(p_limit integer default 3)
returns table (
  permalien text,
  legende text,
  affiche text,
  publie_le timestamptz,
  son_titre text,
  son_artiste text,
  format text
)
language sql
stable
security definer
set search_path = public
as $$
  select v.permalien,
         split_part(v.legende, E'\n', 1) as legende,
         v.affiche,
         v.publie_le,
         v.recette->'son'->>'titre' as son_titre,
         v.recette->'son'->>'artiste' as son_artiste,
         p.format
  from social_variantes v
  join social_posts p on p.id = v.post_id
  where v.statut = 'publie'
    and v.langue = 'en'
    and v.permalien is not null
    and v.affiche is not null
  order by v.publie_le desc
  limit greatest(1, least(coalesce(p_limit, 3), 12));
$$;
