-- Horloge pg_cron, suite (7 octobre 2026) : la reconstruction du site, un
-- contrôle de l'horloge, et l'entretien avant la routine.
--
-- 1. La reconstruction programmée du site (scheduled-rebuild.yml, sept
--    départs par jour) souffre du même « schedule » GitHub que les workflows
--    réseaux : relevé du 1er au 7 octobre 2026, trois départs par jour sur
--    sept, et jusqu'à quatre heures de retard (le départ de 16 h UTC du
--    7 octobre est parti à 19 h 48). Depuis le 7 octobre, les avis sont
--    cuits dans les pages à la construction : un avis approuvé attend la
--    reconstruction suivante, les sitemaps aussi. pg_cron la déclenche donc
--    aux mêmes sept heures, par social_declencher_workflow ; le « schedule »
--    du workflow reste en secours, un double départ ne fait qu'un second
--    build identique.
--
-- 2. Sans jeton valide, social_declencher_workflow ne fait rien et rien ne
--    le dit : un jeton expiré ou révoqué arrêterait l'horloge en silence,
--    seuls les « schedule » de GitHub continueraient, au compte-gouttes.
--    social_horloge_controle() relit chaque heure les réponses de pg_net
--    (net._http_response, gardées six heures) : GitHub répond 204 à un
--    déclenchement ; toute autre réponse (401 jeton refusé, 404 workflow
--    renommé, délai dépassé) devient une alerte dans social_journal, donc
--    une pastille dans l'onglet Réseaux de l'admin, au plus une par six
--    heures. Un Vault sans jeton est signalé de la même façon.
--
-- 3. L'entretien écrit etat.json (créneaux à remplir, posts à corriger,
--    réserve) que la routine Claude lit à 5 h 44, heure de Paris. Programmé
--    à 7 h 41 UTC, il passait après elle : la routine lisait un état de la
--    veille (le 7 octobre 2026 à 16 h 08 UTC, « réserve de 0 jours, 294
--    créneaux à remplir » alors que la réserve venait d'être écrite). Il
--    passe désormais à 3 h 11 UTC (5 h 11 à Paris), une demi-heure avant.
--
-- Idempotente : appliquée par social-base.yml, ou à la main dans
-- Supabase > SQL Editor.

create or replace function public.social_horloge_controle()
returns void
language plpgsql
security definer
set search_path = public
as $f$
declare
  v_jeton   text;
  v_echecs  integer;
  v_exemple text;
begin
  -- une alerte par six heures suffit : la pastille reste tant que Thomas
  -- n'a pas regardé, et le journal ne se remplit pas d'une ligne par heure
  if exists (
    select 1 from public.social_journal
     where source = 'horloge' and niveau = 'alerte' and at > now() - interval '6 hours'
  ) then
    return;
  end if;

  select decrypted_secret into v_jeton
    from vault.decrypted_secrets
   where name = 'github_workflows'
   limit 1;
  if v_jeton is null or v_jeton = '' then
    insert into public.social_journal (niveau, source, message)
    values ('alerte', 'horloge',
            'aucun jeton GitHub dans le Vault : les workflows ne partent plus que sur leur « schedule ». Relancer social-base.yml (Run workflow) avec le secret WORKFLOWS_TOKEN à jour');
    return;
  end if;

  -- les réponses de la dernière heure qui ne sont pas un 204 (GitHub n'a
  -- rien d'autre à répondre à un workflow_dispatch réussi)
  select count(*),
         max(coalesce(r.error_msg, r.status_code::text || ' ' || left(coalesce(r.content, ''), 160)))
    into v_echecs, v_exemple
    from net._http_response r
   where r.created > now() - interval '1 hour'
     and (r.status_code is distinct from 204 or r.timed_out or r.error_msg is not null);
  if coalesce(v_echecs, 0) > 0 then
    insert into public.social_journal (niveau, source, message, details)
    values ('alerte', 'horloge',
            format('%s déclenchement(s) de workflow refusé(s) ou perdu(s) dans la dernière heure : %s. Jeton WORKFLOWS_TOKEN expiré ou révoqué ? Changer le secret GitHub puis relancer social-base.yml', v_echecs, v_exemple),
            jsonb_build_object('echecs', v_echecs, 'exemple', v_exemple));
  end if;
end
$f$;

comment on function public.social_horloge_controle() is
  'Relit les réponses pg_net de la dernière heure : un déclenchement de workflow qui n''a pas reçu 204, ou un Vault sans jeton, devient une alerte « horloge » dans social_journal (au plus une par six heures)';

revoke all on function public.social_horloge_controle() from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job
      where jobname in ('site-reconstruction', 'social-horloge-controle', 'social-entretien');
    -- les sept heures du « schedule » de scheduled-rebuild.yml (UTC)
    perform cron.schedule('site-reconstruction', '0 2,6,8,10,12,14,16 * * *',
                          $q$ select public.social_declencher_workflow('scheduled-rebuild.yml') $q$);
    perform cron.schedule('social-horloge-controle', '50 * * * *',
                          $q$ select public.social_horloge_controle() $q$);
    -- avant la routine de 5 h 44 (Paris), pas après
    perform cron.schedule('social-entretien', '11 3 * * *',
                          $q$ select public.social_declencher_workflow('social-entretien.yml') $q$);
  end if;
end
$$;
