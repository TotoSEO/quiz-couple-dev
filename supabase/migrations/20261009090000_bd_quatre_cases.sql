-- Réseaux sociaux, 8 octobre 2026 : une bande dessinée en quatre cases par
-- semaine dans la semaine type, le mardi soir, à la place d'une animation.
-- Les planches à quatre cases avec deux personnages (une situation, une
-- chute dans la dernière case) sont un format qui marche sur Instagram, et
-- le studio les dessine avec le même vocabulaire que les animations
-- (gabarit « bd », catégorie « bd », format image ou carrousel).
--
-- Idempotente : appliquée par le workflow social-base.yml, ou à la main dans
-- Supabase > SQL Editor. Le réglage « melange » est réécrit à chaque passage :
-- la grille est tenue ici et dans MELANGE_DEFAUT (lib/calendrier.mjs), pas
-- dans l'admin.

update public.social_reglages
set valeur = '{"matin": "pov", "midi": {"1": "connais-tu", "2": "tu-preferes", "3": "connais-tu", "4": "statique", "5": "connais-tu", "6": "tu-preferes", "7": "statique"}, "soir": {"1": "pov", "2": "bd", "3": "pov", "4": "carrousel", "5": "coquin", "6": "phrase", "7": "phrase"}}'::jsonb,
    updated_at = now()
where cle = 'melange';
