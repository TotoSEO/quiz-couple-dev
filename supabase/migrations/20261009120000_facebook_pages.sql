-- Publication sur la Page Facebook reliée (9 octobre 2026). Le partage
-- automatique d'Instagram vers Facebook ne joue pas pour un reel publié par
-- l'API : chaque post part donc aussi sur la Page, par l'API vidéo et photos
-- de la Page, avec le jeton de Page déjà rangé. Interrupteur par compte,
-- identifiant de la Page relevé à la connexion, suivi par déclinaison.
-- Idempotente ; Supabase > SQL Editor, ou social-base.yml.

alter table public.social_comptes add column if not exists page_id text;
alter table public.social_comptes add column if not exists page_nom text;
alter table public.social_comptes add column if not exists facebook boolean not null default true;

alter table public.social_variantes add column if not exists fb_statut text
  check (fb_statut is null or fb_statut in ('a_faire', 'en_cours', 'publie', 'echec'));
alter table public.social_variantes add column if not exists fb_id text;
alter table public.social_variantes add column if not exists fb_lien text;
alter table public.social_variantes add column if not exists fb_story_id text;
alter table public.social_variantes add column if not exists fb_erreur text;
alter table public.social_variantes add column if not exists fb_essais integer not null default 0;
alter table public.social_variantes add column if not exists fb_publie_le timestamptz;

create index if not exists social_variantes_facebook_a_faire
  on public.social_variantes (fb_statut, publie_le)
  where fb_statut in ('a_faire', 'en_cours');
