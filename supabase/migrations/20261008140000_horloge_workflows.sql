-- Réseaux sociaux, 7 octobre 2026 : l'horloge des workflows GitHub.
--
-- GitHub n'exécute qu'une petite part des déclenchements programmés
-- (« schedule ») de ce dépôt. Mesuré le 7 octobre 2026 : la publication,
-- programmée toutes les dix minutes, a tourné une fois en neuf heures ; le
-- rendu horaire, une fois en neuf heures ; l'entretien de 7 h 41 est parti à
-- 14 h 44 ; et la reconstruction du site, programmée sept fois par jour
-- depuis mars, saute près d'un tick sur deux. pg_cron, lui, est à l'heure
-- (trafic-entretien tourne chaque nuit à 2 h 20 depuis septembre) : c'est
-- donc lui qui déclenche les trois workflows, par l'API de GitHub
-- (workflow_dispatch), avec un jeton d'accès personnel rangé dans le Vault.
-- Les « schedule » des workflows restent en place, en secours ; un double
-- départ est sans effet, les scripts prennent chaque variante par un
-- changement d'état conditionnel.
--
-- Le jeton n'est pas dans ce fichier. C'est le secret GitHub WORKFLOWS_TOKEN
-- du dépôt (jeton à grain fin : accès au seul dépôt TotoSEO/quiz-couple-dev,
-- permission « Actions : Read and write », rien d'autre). social-base.yml le
-- recopie dans le Vault à chaque passage, sous le nom github_workflows, par
-- social_definir_jeton_github(). Pour le remplacer (expiration, révocation) :
-- changer le secret GitHub, puis relancer social-base.yml (bouton « Run
-- workflow »). Sans jeton dans le Vault, la fonction de déclenchement ne fait
-- rien et les workflows ne partent que sur leur « schedule ».
--
-- Idempotente : appliquée par social-base.yml, ou à la main dans
-- Supabase > SQL Editor.

create extension if not exists pg_net;

-- Range (ou remplace) le jeton GitHub dans le Vault. Le format est contrôlé :
-- un jeton à grain fin commence par github_pat_ et ne contient que des
-- lettres, des chiffres et des soulignés.
create or replace function public.social_definir_jeton_github(p_jeton text)
returns void
language plpgsql
security definer
set search_path = public
as $f$
declare
  v_id uuid;
begin
  if p_jeton is null or p_jeton !~ '^github_pat_[A-Za-z0-9_]{20,}$' then
    raise exception 'jeton GitHub à grain fin attendu (github_pat_...)';
  end if;
  select id into v_id from vault.secrets where name = 'github_workflows' limit 1;
  if v_id is null then
    perform vault.create_secret(p_jeton, 'github_workflows', 'Déclenchement des workflows réseaux (horloge pg_cron)');
  else
    perform vault.update_secret(v_id, p_jeton);
  end if;
end
$f$;

comment on function public.social_definir_jeton_github(text) is
  'Range ou remplace, dans le Vault (github_workflows), le jeton GitHub qui sert à déclencher les workflows réseaux ; appelée par social-base.yml avec le secret WORKFLOWS_TOKEN';

revoke all on function public.social_definir_jeton_github(text) from public, anon, authenticated;

-- Déclenche un workflow (workflow_dispatch sur main). Renvoie l'identifiant
-- de la requête pg_net, ou null sans jeton.
create or replace function public.social_declencher_workflow(p_fichier text)
returns bigint
language plpgsql
security definer
set search_path = public
as $f$
declare
  v_jeton text;
begin
  select decrypted_secret into v_jeton
    from vault.decrypted_secrets
   where name = 'github_workflows'
   limit 1;
  if v_jeton is null or v_jeton = '' then
    return null;
  end if;
  return net.http_post(
    url := 'https://api.github.com/repos/TotoSEO/quiz-couple-dev/actions/workflows/' || p_fichier || '/dispatches',
    body := jsonb_build_object('ref', 'main'),
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_jeton,
      'Accept', 'application/vnd.github+json',
      'X-GitHub-Api-Version', '2022-11-28',
      'User-Agent', 'quiz-couple-pg-cron',
      'Content-Type', 'application/json'),
    timeout_milliseconds := 8000);
end
$f$;

comment on function public.social_declencher_workflow(text) is
  'Déclenche un workflow GitHub (workflow_dispatch sur main) avec le jeton github_workflows du Vault ; renvoie l''identifiant de la requête pg_net, ou null sans jeton';

revoke all on function public.social_declencher_workflow(text) from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job
      where jobname in ('social-publication', 'social-rendu', 'social-entretien');
    perform cron.schedule('social-publication', '*/10 * * * *',
                          $q$ select public.social_declencher_workflow('social-publication.yml') $q$);
    perform cron.schedule('social-rendu', '23 * * * *',
                          $q$ select public.social_declencher_workflow('social-rendu.yml') $q$);
    perform cron.schedule('social-entretien', '41 7 * * *',
                          $q$ select public.social_declencher_workflow('social-entretien.yml') $q$);
  end if;
end
$$;
