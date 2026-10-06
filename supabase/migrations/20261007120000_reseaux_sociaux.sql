-- Réseaux sociaux : planning, recettes, publications et statistiques des
-- comptes Instagram de Quiz Couple (docs/reseaux-sociaux/ARCHITECTURE.md).
--
-- Rien ici n'est lisible ni modifiable avec la clé publique du site : RLS
-- activée sans aucune règle, droits retirés à anon et authenticated. Seuls
-- les automates (GitHub Actions, clé service) et la fonction admin-social
-- y accèdent.
--
-- Idempotente : appliquée par le workflow social-base.yml, ou à la main dans
-- Supabase > SQL Editor.

-- 1. Les comptes, un par langue, et leurs jetons (lus par le serveur seul).
create table if not exists public.social_comptes (
  id uuid primary key default gen_random_uuid(),
  langue text not null unique check (langue in ('en', 'fr', 'es', 'de', 'it')),
  nom text,
  ig_user_id text,
  actif boolean not null default false,
  fuseau text not null default 'Europe/Paris',
  creneaux jsonb not null default '[
    {"cle": "matin", "debut": "06:00", "fin": "08:00"},
    {"cle": "midi",  "debut": "11:00", "fin": "13:00"},
    {"cle": "soir",  "debut": "16:00", "fin": "18:00"}
  ]'::jsonb,
  jeton_expire_le timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_jetons (
  compte_id uuid primary key references public.social_comptes(id) on delete cascade,
  jeton text not null,
  obtenu_le timestamptz not null default now(),
  renouvele_le timestamptz
);

-- 2. Les posts : un créneau du planning et sa recette commune.
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  jour date not null,
  creneau text not null check (creneau in ('matin', 'midi', 'soir')),
  format text not null check (format in ('reel', 'image', 'carrousel')),
  gabarit text not null,
  categorie text,
  theme text,
  charte text not null default '1',
  idee_id uuid,
  statut text not null default 'planifie'
    check (statut in ('planifie', 'brouillon', 'valide', 'suspendu', 'annule')),
  motif text,
  notes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (jour, creneau)
);

-- 3. Les déclinaisons : une par post et par langue. C'est elles qu'on rend
--    et qu'on publie.
create table if not exists public.social_variantes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.social_posts(id) on delete cascade,
  langue text not null check (langue in ('en', 'fr', 'es', 'de', 'it')),
  recette jsonb not null,
  legende text not null default '',
  hashtags text[] not null default '{}',
  publier_a timestamptz,
  statut text not null default 'a_rendre'
    check (statut in ('a_rendre', 'rendu', 'conteneur', 'publication', 'publie', 'echec', 'suspendu')),
  fichiers jsonb not null default '{}'::jsonb,
  vignette text,
  ig_conteneur_id text,
  ig_media_id text,
  permalien text,
  erreur text,
  essais integer not null default 0,
  rendu_le timestamptz,
  publie_le timestamptz,
  fichiers_supprimes_le timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, langue),
  constraint social_hashtags_max check (coalesce(array_length(hashtags, 1), 0) <= 5),
  constraint social_legende_max check (char_length(legende) <= 2200)
);
create index if not exists social_variantes_a_publier on public.social_variantes (statut, publier_a);

-- 4. La bibliothèque (musiques, bruitages, illustrations, poses).
create table if not exists public.social_bibliotheque (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('musique', 'bruitage', 'illustration', 'pose')),
  nom text not null unique,
  fichier text not null,
  ambiance text[] not null default '{}',
  licence text not null,
  source text,
  attribution text,
  duree numeric,
  lufs numeric,
  exclu boolean not null default false,
  motif_exclusion text,
  created_at timestamptz not null default now()
);

-- 5. Les idées, les statistiques, le journal et les réglages.
create table if not exists public.social_idees (
  id uuid primary key default gen_random_uuid(),
  texte text not null,
  source text not null default 'thomas' check (source in ('thomas', 'claude')),
  post_id uuid references public.social_posts(id) on delete set null,
  utilisee_le timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.social_stats (
  id uuid primary key default gen_random_uuid(),
  variante_id uuid not null references public.social_variantes(id) on delete cascade,
  releve text not null check (releve in ('j1', 'j7')),
  vues integer,
  portee integer,
  likes integer,
  commentaires integer,
  partages integer,
  enregistrements integer,
  releve_le timestamptz not null default now(),
  unique (variante_id, releve)
);

create table if not exists public.social_journal (
  id bigserial primary key,
  at timestamptz not null default now(),
  niveau text not null default 'info' check (niveau in ('info', 'alerte', 'erreur')),
  source text not null,
  variante_id uuid references public.social_variantes(id) on delete set null,
  message text not null,
  details jsonb
);
create index if not exists social_journal_at on public.social_journal (at desc);

create table if not exists public.social_reglages (
  cle text primary key,
  valeur jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.social_reglages (cle, valeur) values
  ('pause', 'false'::jsonb),
  ('reserve_cible_jours', '14'::jsonb),
  -- catégorie de chaque créneau, du lundi (1) au dimanche (7) : 12 animations
  -- (dont une coquine), 3 « connais-tu ton partenaire », 2 « tu préfères »,
  -- 2 reels statiques, 2 phrases tendres (reseaux/atelier/LIGNE-EDITORIALE.md)
  ('melange', '{"matin": "pov", "midi": {"1": "connais-tu", "2": "tu-preferes", "3": "connais-tu", "4": "statique", "5": "connais-tu", "6": "tu-preferes", "7": "statique"}, "soir": {"1": "pov", "2": "pov", "3": "pov", "4": "pov", "5": "coquin", "6": "phrase", "7": "phrase"}}'::jsonb)
on conflict (cle) do nothing;

insert into public.social_comptes (langue, actif, fuseau)
values ('en', false, 'Europe/Paris')
on conflict (langue) do nothing;

-- 6. La minute de publication, tirée au sort dans le créneau du compte,
--    entre le début du créneau et 25 minutes avant sa fin (marge pour le
--    retard des tâches programmées de GitHub). Posée à l'insertion d'une
--    déclinaison si elle n'en a pas.
create or replace function public.social_tirer_heure(p_jour date, p_creneau text, p_langue text)
returns timestamptz
language plpgsql
volatile
set search_path = public
as $$
declare
  c record;
  cr jsonb;
  debut time;
  fin time;
  minutes integer;
begin
  select fuseau, creneaux into c from social_comptes where langue = p_langue;
  if not found then
    raise exception 'social_tirer_heure : aucun compte pour la langue %', p_langue;
  end if;
  select x into cr from jsonb_array_elements(c.creneaux) x where x->>'cle' = p_creneau;
  if cr is null then
    raise exception 'social_tirer_heure : créneau % inconnu', p_creneau;
  end if;
  debut := (cr->>'debut')::time;
  fin := (cr->>'fin')::time;
  minutes := greatest(0, (extract(epoch from (fin - debut)) / 60)::integer - 25);
  return ((p_jour + debut + make_interval(mins => floor(random() * (minutes + 1))::integer)) at time zone c.fuseau);
end;
$$;

create or replace function public.social_variante_avant_insert()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  p record;
begin
  if new.publier_a is null then
    select jour, creneau into p from social_posts where id = new.post_id;
    new.publier_a := social_tirer_heure(p.jour, p.creneau, new.langue);
  end if;
  return new;
end;
$$;

drop trigger if exists social_variante_heure on public.social_variantes;
create trigger social_variante_heure
  before insert on public.social_variantes
  for each row execute function public.social_variante_avant_insert();

create or replace function public.social_touche()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists social_posts_touche on public.social_posts;
create trigger social_posts_touche before update on public.social_posts
  for each row execute function public.social_touche();
drop trigger if exists social_variantes_touche on public.social_variantes;
create trigger social_variantes_touche before update on public.social_variantes
  for each row execute function public.social_touche();
drop trigger if exists social_comptes_touche on public.social_comptes;
create trigger social_comptes_touche before update on public.social_comptes
  for each row execute function public.social_touche();

-- 7. Fermeture complète côté public.
do $$
declare t text;
begin
  foreach t in array array['social_comptes', 'social_jetons', 'social_posts', 'social_variantes',
    'social_bibliotheque', 'social_idees', 'social_stats', 'social_journal', 'social_reglages']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end $$;
revoke all on sequence public.social_journal_id_seq from anon, authenticated;
revoke all on function public.social_tirer_heure(date, text, text) from public, anon, authenticated;

-- 8. Le stockage des fichiers en transit : privé, 50 Mo par fichier.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('social-medias', 'social-medias', false, 52428800, array['video/mp4', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;
