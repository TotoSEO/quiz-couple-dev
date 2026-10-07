-- Réseaux sociaux : le mode de publication d'un compte.
--
-- « auto » : l'automate publie par l'API Instagram à l'heure tirée au sort.
-- « manuel » : les reels s'arrêtent à l'état « rendu » et attendent dans la
-- liste « À publier » de l'admin ; Thomas enregistre la vidéo sur son
-- téléphone, colle la légende, choisit un son tendance dans l'appli
-- Instagram et publie, puis appuie sur « Publié ». Les images et les
-- carrousels, qui n'ont pas de musique, partent toujours tout seuls.
-- L'entretien retrouve ensuite le post publié (légende et heure) pour les
-- statistiques. Idempotent, à appliquer dans Supabase > SQL Editor ou par
-- le workflow social-base.yml.

alter table public.social_comptes
  add column if not exists mode text not null default 'auto';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'social_comptes_mode_check') then
    alter table public.social_comptes
      add constraint social_comptes_mode_check check (mode in ('auto', 'manuel'));
  end if;
end $$;

-- publié à la main depuis l'appli : l'identifiant Instagram arrive après,
-- quand l'entretien a retrouvé le post
alter table public.social_variantes
  add column if not exists publie_main boolean not null default false;

comment on column public.social_comptes.mode is 'auto : publication par l''API ; manuel : les reels attendent dans l''admin que Thomas les publie depuis l''appli (son tendance choisi à la main)';
comment on column public.social_variantes.publie_main is 'Publié depuis l''appli Instagram par Thomas ; ig_media_id et permalien sont retrouvés par l''entretien';
