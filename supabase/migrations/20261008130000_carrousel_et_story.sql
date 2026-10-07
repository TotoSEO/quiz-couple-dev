-- Réseaux sociaux, 7 octobre 2026 : un carrousel par semaine dans la semaine
-- type (le jeudi soir, à la place d'une animation : les carrousels font plus
-- d'enregistrements que les vidéos), et la story du matin (chaque jour, une
-- story reprend le reel du matin, publiée juste après lui).
--
-- Idempotente : appliquée par le workflow social-base.yml, ou à la main dans
-- Supabase > SQL Editor. Le réglage « melange » est réécrit à chaque passage :
-- la grille est tenue ici et dans MELANGE_DEFAUT (lib/calendrier.mjs), pas
-- dans l'admin.

update public.social_reglages
set valeur = '{"matin": "pov", "midi": {"1": "connais-tu", "2": "tu-preferes", "3": "connais-tu", "4": "statique", "5": "connais-tu", "6": "tu-preferes", "7": "statique"}, "soir": {"1": "pov", "2": "pov", "3": "pov", "4": "carrousel", "5": "coquin", "6": "phrase", "7": "phrase"}}'::jsonb,
    updated_at = now()
where cle = 'melange';

-- La story du matin : son état, son conteneur et son média Instagram.
alter table public.social_variantes
  add column if not exists story_statut text,
  add column if not exists story_conteneur_id text,
  add column if not exists story_media_id text,
  add column if not exists story_publie_le timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'social_variantes_story_statut_check') then
    alter table public.social_variantes
      add constraint social_variantes_story_statut_check
      check (story_statut is null or story_statut in ('a_faire', 'conteneur', 'publication', 'publie', 'echec'));
  end if;
end $$;

comment on column public.social_variantes.story_statut is 'Story qui reprend le reel du matin : a_faire dès la publication du reel, conteneur, publication, publie, echec ; null pour les autres créneaux';
