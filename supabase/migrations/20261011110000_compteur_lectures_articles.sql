-- Le compteur de lectures sous le titre d'un article de blog (11 octobre 2026).
--
-- 20261008170000_blog_stats_retirees.sql a retiré est_article_blog(path) avec
-- le classement « Les articles les plus lus », en la croyant réservée à lui.
-- Or get_article_lectures, le compteur public lu par blog-lectures.js sur
-- chaque article, l'appelait aussi. Une fonction SQL n'enregistre pas les
-- fonctions qu'elle appelle comme des dépendances : le DROP est passé sans
-- erreur, et chaque appel du compteur répondait depuis « function
-- public.est_article_blog(text) does not exist ». Le navigateur prenait
-- l'erreur pour zéro lecture et laissait le compteur masqué, sans rien dire.
-- Les lectures, elles, ont continué d'être enregistrées dans article_lectures :
-- rien n'est perdu.
--
-- Le test « est-ce un article ? » est désormais écrit dans la fonction
-- même : /blog/<slug>/ en français, /<langue>/blog/<slug>/ ailleurs, la page
-- de listing /blog/ exclue. Même signature, mêmes droits (la page publique
-- l'appelle avec la clé publique). Idempotente ; appliquée à la fusion par
-- securite-base.yml. Le néerlandais (nl) y est depuis le 31 octobre 2026 : sans
-- lui, les articles /nl/blog/ restaient à zéro lecture.

create or replace function public.get_article_lectures(p_path text)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.article_lectures al
  where al.path = lower(p_path)
    and lower(p_path) ~ '^(/(en|es|de|it|nl))?/blog/[^/]+/$';
$$;

grant execute on function public.get_article_lectures(text) to anon, authenticated;
