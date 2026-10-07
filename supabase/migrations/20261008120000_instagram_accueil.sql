-- Les dernières publications Instagram sur l'accueil du site, sans le script
-- d'Instagram : au rendu, l'automate dépose une « affiche » (la couverture du
-- reel en 540 px) dans un bucket public, et le site lit les trois derniers
-- posts publiés par une fonction ouverte à la clé publique (lien du post,
-- première ligne de la légende, affiche, son). Les tables social_* restent
-- fermées : seule la fonction est exposée, et elle ne rend que des posts
-- déjà publiés.
--
-- Idempotente : appliquée par le workflow social-base.yml, ou à la main dans
-- Supabase > SQL Editor.

alter table public.social_variantes
  add column if not exists affiche text;
comment on column public.social_variantes.affiche is 'Chemin de l''affiche dans le bucket public social-public (couverture en 540 px), pour les dernières publications sur l''accueil ; jamais effacée par le ménage';

-- Le bucket public : petites images seulement.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('social-public', 'social-public', true, 2097152, array['image/jpeg', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Lecture publique des objets du bucket (le lien /object/public/… marche
-- sans règle, celle-ci couvre les clients qui passent par l'API).
drop policy if exists "social_public_lecture" on storage.objects;
create policy "social_public_lecture" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'social-public');

-- Les derniers posts publiés, du plus récent au plus ancien.
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
    and v.permalien is not null
    and v.affiche is not null
  order by v.publie_le desc
  limit greatest(1, least(coalesce(p_limit, 3), 12));
$$;

revoke all on function public.get_instagram_recents(integer) from public;
grant execute on function public.get_instagram_recents(integer) to anon, authenticated;
