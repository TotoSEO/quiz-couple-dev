-- Réseaux sociaux, 9 novembre 2026 : la publication ne part que quand il y a
-- quelque chose à publier.
--
-- Thomas : « je viens de voir que y'avait une action réseaux sociaux qui
-- tournait super souvent ». pg_cron lançait « Réseaux · publication » toutes
-- les dix minutes, quoi qu'il arrive (migration 20261008140000) : 149
-- départs du 8 au 9 novembre 2026, quinze secondes chacun, pour seize posts
-- par semaine sur les deux comptes (huit chacun depuis le 26 octobre 2026),
-- soit environ soixante-cinq départs par post, presque tous pour rien.
--
-- pg_cron passe toujours toutes les dix minutes, mais ne déclenche le
-- workflow que si social_publication_a_faire() trouve le travail que
-- publication.mjs prend à ce moment-là :
--   - une déclinaison rendue dont l'heure tombe dans l'heure qui vient : le
--     conteneur Instagram se crée une heure avant (AVANCE_REEL_MIN) ;
--   - une déclinaison en conteneur dont l'heure est passée : la publication,
--     ou l'attente d'un conteneur qu'Instagram n'a pas fini de traiter ;
--   - une story ou une publication Facebook en attente sur un post publié
--     dans les dernières 24 heures (publierStories, publierFacebook).
-- Les deux premières ne comptent que jusqu'à cent minutes après l'heure : à
-- quatre-vingt-dix (RETARD_MAX_MIN), publication.mjs passe la déclinaison en
-- échec ; sans cette borne, la déclinaison d'un compte inactif, qui reste
-- « rendu », relancerait le workflow toutes les dix minutes pour toujours.
-- Seuls les posts validés comptent (le script saute les autres sans rien
-- changer), et rien ne compte pendant la pause générale.
--
-- Un post coûte ainsi trois ou quatre départs au lieu de soixante-cinq : le
-- conteneur une heure avant, la publication au premier passage après
-- l'heure (comme avant, dix minutes au plus de décalage), puis la story et
-- Facebook. Le « schedule » du workflow reste en secours, une fois par
-- heure.
--
-- Une condition de plus dans publication.mjs (un nouvel état, une autre
-- avance) se recopie ici, sinon le workflow ne partirait pas pour elle.
--
-- Idempotente : appliquée par social-base.yml après 20261008140000, qui
-- reprogramme le déclenchement sans condition ; ou à la main dans
-- Supabase > SQL Editor.

create or replace function public.social_publication_a_faire()
returns boolean
language sql
stable
security definer
set search_path = public
as $f$
  select coalesce((select valeur from public.social_reglages where cle = 'pause'), 'false'::jsonb) <> 'true'::jsonb
     and (
       exists (
         select 1
           from public.social_variantes v
           join public.social_posts p on p.id = v.post_id and p.statut = 'valide'
          where v.publier_a > now() - interval '100 minutes'
            and (   (v.statut = 'rendu'     and v.publier_a <= now() + interval '60 minutes')
                 or (v.statut = 'conteneur' and v.publier_a <= now()))
       )
       or exists (
         select 1
           from public.social_variantes v
          where v.publie_le >= now() - interval '24 hours'
            and (v.story_statut in ('a_faire', 'conteneur') or v.fb_statut = 'a_faire')
       )
     )
$f$;

comment on function public.social_publication_a_faire() is
  'Vrai quand publication.mjs a quelque chose à faire (conteneur à créer dans l''heure, publication due, story ou Facebook en attente) : pg_cron ne déclenche le workflow de publication que dans ce cas';

revoke all on function public.social_publication_a_faire() from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'social-publication';
    perform cron.schedule('social-publication', '*/10 * * * *',
                          $q$ select public.social_declencher_workflow('social-publication.yml') where public.social_publication_a_faire() $q$);
  end if;
end
$$;
