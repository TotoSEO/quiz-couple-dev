-- Avis : le classement de l'admin compte les avis par test, toutes langues
-- confondues (12 octobre 2026).
--
-- Les cinq versions d'une page sont le même test traduit : il est normal
-- qu'elles partagent leurs avis, et l'admin n'affiche plus de langue
-- (Thomas, après une première version du classement rangée par langue, où
-- la moitié des anciens avis restait sans langue faute de commentaire).
--
-- admin_avis_par_test() rend, pour chaque page, le nombre d'avis approuvés
-- et la somme de leurs notes, accueil exclu. Les deux fonctions qui
-- rangeaient les avis par langue disparaissent : admin_avis_par_page, et
-- avis_langue_devinee, qui devinait la langue des anciens avis d'après leur
-- commentaire. La colonne reviews.lang reste : les formulaires continuent
-- d'enregistrer la langue de la page, elle n'est affichée nulle part.
--
-- Appliquée à la fusion par avis-base.yml, juste après 20261012120000, qui
-- recrée les deux anciennes fonctions quand on la rejoue : celle-ci les
-- retire de nouveau. Idempotente.

set lock_timeout = '10s';

create or replace function public.admin_avis_par_test()
returns table (quiz_slug text, nombre bigint, somme bigint)
language sql
stable
set search_path = public
as $$
  select r.quiz_slug, count(*)::bigint, sum(r.rating)::bigint
  from public.reviews r
  where r.is_approved = true and coalesce(r.quiz_slug, '') <> ''
  group by 1;
$$;

-- Supabase donne EXECUTE à anon sur toute fonction créée dans public : la
-- fonction est réservée à la clé de service (admin-reviews).
revoke all on function public.admin_avis_par_test() from public, anon, authenticated;
grant execute on function public.admin_avis_par_test() to service_role;

-- admin_avis_par_page appelait avis_langue_devinee : elle part la première.
drop function if exists public.admin_avis_par_page();
drop function if exists public.avis_langue_devinee(text);

-- Bilan affiché dans le journal du workflow.
select count(*) as avis_approuves_hors_accueil, count(distinct quiz_slug) as pages
from public.reviews
where is_approved and coalesce(quiz_slug, '') <> '';
