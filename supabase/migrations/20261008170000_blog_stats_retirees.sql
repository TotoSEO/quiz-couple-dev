-- ============================================================
-- Le classement « Les articles les plus lus » quitte l'admin (7 octobre
-- 2026, demande de Thomas : il n'en avait pas l'usage). Avec lui, l'onglet
-- Blog disparaît ; la courbe des clics « source préférée » Google a rejoint
-- l'onglet Trafic.
--
-- Côté base, on retire ce qui ne servait qu'à ce classement :
--   • get_blog_articles(p_days, p_tz), la lecture du classement ;
--   • est_article_blog(path) et langue_du_chemin(path), ses deux aides.
-- On garde article_lectures, get_article_lectures et purge_article_lectures :
-- le compteur de lectures affiché sous le titre d'un article (blog-lectures.js)
-- s'en sert toujours. On garde aussi source_pref_clics et ses fonctions,
-- lues par la courbe déplacée dans Trafic.
--
-- À coller dans Supabase > SQL Editor. Idempotent.
-- ============================================================

DROP FUNCTION IF EXISTS public.get_blog_articles(integer, text);
DROP FUNCTION IF EXISTS public.est_article_blog(text);
DROP FUNCTION IF EXISTS public.langue_du_chemin(text);
