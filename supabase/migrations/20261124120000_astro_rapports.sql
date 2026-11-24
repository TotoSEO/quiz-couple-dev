-- Le thème astral de couple (supabase/functions/astro, page
-- /theme-astral-couple/) : une commande par couple, et les compteurs de la
-- page et des ventes. Appliquée par .github/workflows/astro-base.yml ;
-- idempotente.
--
-- Ce qu'une commande garde : deux prénoms, deux genres, deux dates et heures
-- de naissance, le fuseau du navigateur, et ce que Stripe renvoie du
-- paiement (l'adresse e-mail sert au seul envoi du lien du rapport). Les
-- jetons qui ouvrent le rapport ne sont gardés qu'en empreinte (SHA-256) :
-- celui de la page (jeton_hash) et celui que le webhook de Stripe tire pour
-- l'e-mail du lien quand l'acheteur ne revient pas sur la page
-- (jeton_mail_hash). Fermée à la clé publique : seules les fonctions astro et
-- bilan-stripe l'écrivent, avec la clé de service.
create table if not exists public.astro_rapports (
  id uuid primary key default gen_random_uuid(),
  cree_le timestamptz not null default now(),
  lang text not null default 'fr',
  jeton_hash text not null,
  jeton_mail_hash text,
  a_prenom text not null,
  a_genre text not null,
  a_date date not null,
  a_heure text,
  a_fuseau text not null default 'Europe/Paris',
  b_prenom text not null,
  b_genre text not null,
  b_date date not null,
  b_heure text,
  b_fuseau text not null default 'Europe/Paris',
  source text not null default 'direct',
  zone text,
  renonciation_le timestamptz,
  paiement_session text,
  paye_le timestamptz,
  paiement_intent text,
  paiement_montant integer,
  paiement_email text,
  lien_envoye_le timestamptz,
  rembourse_le timestamptz
);

alter table public.astro_rapports add column if not exists jeton_mail_hash text;

alter table public.astro_rapports drop constraint if exists astro_rapports_bornes;
alter table public.astro_rapports add constraint astro_rapports_bornes check (
  lang in ('fr', 'en', 'es', 'de', 'it', 'nl')
  and char_length(jeton_hash) = 64
  and (jeton_mail_hash is null or char_length(jeton_mail_hash) = 64)
  and char_length(a_prenom) between 1 and 30 and char_length(b_prenom) between 1 and 30
  and a_genre in ('f', 'm') and b_genre in ('f', 'm')
  and (a_heure is null or a_heure ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
  and (b_heure is null or b_heure ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
  and char_length(a_fuseau) <= 64 and char_length(b_fuseau) <= 64
  and source in ('test', 'date', 'chinois', 'article', 'direct')
  and (zone is null or zone in ('latam'))
  and (paiement_session is null or char_length(paiement_session) <= 255)
  and (paiement_intent is null or char_length(paiement_intent) <= 255)
  and (paiement_email is null or char_length(paiement_email) <= 254)
);

create index if not exists astro_rapports_intent on public.astro_rapports (paiement_intent) where paiement_intent is not null;
create index if not exists astro_rapports_cree on public.astro_rapports (cree_le);
create index if not exists astro_rapports_paye on public.astro_rapports (paye_le) where paye_le is not null;

revoke all on table public.astro_rapports from public, anon, authenticated;
grant all on table public.astro_rapports to service_role;
alter table public.astro_rapports enable row level security;

-- Les compteurs de la page et des ventes, par jour (heure de Paris), sans
-- rien de personnel.
create table if not exists public.astro_compteurs (
  jour date not null,
  etape text not null,
  n integer not null default 0,
  primary key (jour, etape)
);
revoke all on table public.astro_compteurs from public, anon, authenticated;
grant all on table public.astro_compteurs to service_role;
alter table public.astro_compteurs enable row level security;

create or replace function public.astro_compte(p_etape text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.astro_compteurs (jour, etape, n)
  values ((now() at time zone 'Europe/Paris')::date, left(coalesce(p_etape, ''), 40), 1)
  on conflict (jour, etape) do update set n = astro_compteurs.n + 1;
$$;
revoke all on function public.astro_compte(text) from public, anon, authenticated;
grant execute on function public.astro_compte(text) to service_role;

-- Le ménage, chaque nuit : une commande jamais payée part au bout de 30
-- jours, une commande payée six mois après le paiement, comme l'évaluation de
-- couple ; les compteurs au bout de 400 jours.
create or replace function public.astro_menage()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.astro_rapports where paye_le is null and cree_le < now() - interval '30 days';
  delete from public.astro_rapports where paye_le is not null and paye_le < now() - interval '6 months';
  delete from public.astro_compteurs where jour < (now() - interval '400 days')::date;
$$;
revoke all on function public.astro_menage() from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'astro-menage';
    perform cron.schedule('astro-menage', '47 2 * * *', 'select public.astro_menage()');
  end if;
end $$;

-- La lecture de l'admin (onglet Thème astral, par admin-stats et la clé de
-- service) : les compteurs jour par jour, et les ventes, sans prénom ni
-- adresse. Les commandes et les ventes par entrée (source : test, date,
-- chinois, article ou direct, depuis le 24 novembre 2026) : par_source ; par
-- langue de la page (depuis le 24 novembre 2026 au soir) : par_langue.
create or replace function public.get_astro_tableau(p_jours integer default 30)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with bornes as (
    select greatest(1, least(coalesce(p_jours, 30), 400)) as nb,
           (now() at time zone 'Europe/Paris')::date as aujourdhui
  ),
  jours as (
    select generate_series(b.aujourdhui - (b.nb - 1), b.aujourdhui, interval '1 day')::date as jour from bornes b
  ),
  c as (
    select a.jour, a.etape, a.n from public.astro_compteurs a, bornes b where a.jour > b.aujourdhui - b.nb
  ),
  ventes as (
    select (paye_le at time zone 'Europe/Paris')::date as jour, count(*) as n, coalesce(sum(paiement_montant), 0) as montant,
           count(*) filter (where rembourse_le is not null) as rembourses,
           coalesce(sum(paiement_montant) filter (where rembourse_le is not null), 0) as montant_rembourse,
           count(*) filter (where source = 'test') as depuis_test,
           count(*) filter (where zone = 'latam') as latam
    from public.astro_rapports, bornes b
    where paye_le is not null and (paye_le at time zone 'Europe/Paris')::date > b.aujourdhui - b.nb
    group by 1
  ),
  par_source as (
    select r.source,
           count(*) filter (where (r.cree_le at time zone 'Europe/Paris')::date > b.aujourdhui - b.nb) as commandes,
           count(*) filter (where r.paye_le is not null and (r.paye_le at time zone 'Europe/Paris')::date > b.aujourdhui - b.nb) as ventes,
           coalesce(sum(r.paiement_montant) filter (where r.paye_le is not null and (r.paye_le at time zone 'Europe/Paris')::date > b.aujourdhui - b.nb), 0) as montant
    from public.astro_rapports r, bornes b
    group by r.source
  ),
  par_langue as (
    select r.lang,
           count(*) filter (where (r.cree_le at time zone 'Europe/Paris')::date > b.aujourdhui - b.nb) as commandes,
           count(*) filter (where r.paye_le is not null and (r.paye_le at time zone 'Europe/Paris')::date > b.aujourdhui - b.nb) as ventes,
           coalesce(sum(r.paiement_montant) filter (where r.paye_le is not null and (r.paye_le at time zone 'Europe/Paris')::date > b.aujourdhui - b.nb), 0) as montant
    from public.astro_rapports r, bornes b
    group by r.lang
  )
  select jsonb_build_object(
    'jours', (select nb from bornes),
    'totaux', coalesce((select jsonb_object_agg(etape, s) from (select etape, sum(n) as s from c group by etape) t), '{}'::jsonb),
    'ventes', jsonb_build_object(
      'n', coalesce((select sum(n) from ventes), 0),
      'montant', coalesce((select sum(montant) from ventes), 0),
      'rembourses', coalesce((select sum(rembourses) from ventes), 0),
      'montant_rembourse', coalesce((select sum(montant_rembourse) from ventes), 0),
      'depuis_test', coalesce((select sum(depuis_test) from ventes), 0),
      'latam', coalesce((select sum(latam) from ventes), 0)
    ),
    'commandes', (select count(*) from public.astro_rapports r, bornes b where (r.cree_le at time zone 'Europe/Paris')::date > b.aujourdhui - b.nb),
    'par_source', coalesce((select jsonb_object_agg(source, jsonb_build_object('commandes', commandes, 'ventes', ventes, 'montant', montant))
                            from par_source where commandes > 0 or ventes > 0), '{}'::jsonb),
    'par_langue', coalesce((select jsonb_object_agg(lang, jsonb_build_object('commandes', commandes, 'ventes', ventes, 'montant', montant))
                            from par_langue where commandes > 0 or ventes > 0), '{}'::jsonb),
    'serie', coalesce((
      select jsonb_agg(jsonb_build_object(
        'jour', j.jour,
        'vues', coalesce((select sum(n) from c where c.jour = j.jour and left(c.etape, 8) = 'page_vue'), 0),
        'ciel', coalesce((select n from c where c.jour = j.jour and c.etape = 'ciel_vu'), 0),
        'clics', coalesce((select n from c where c.jour = j.jour and c.etape = 'paiement_clic'), 0),
        'ventes', coalesce((select n from ventes v where v.jour = j.jour), 0),
        'montant', coalesce((select montant from ventes v where v.jour = j.jour), 0)
      ) order by j.jour)
      from jours j
    ), '[]'::jsonb)
  );
$$;
revoke all on function public.get_astro_tableau(integer) from public, anon, authenticated;
grant execute on function public.get_astro_tableau(integer) to service_role;
