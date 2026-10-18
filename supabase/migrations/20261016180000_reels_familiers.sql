-- Réseaux sociaux, 16 octobre 2026 au soir, seconde décision du jour : les
-- animations des mascottes sortent de la grille. Thomas, devant les chiffres
-- des dix premiers jours du compte : « les vidéos d'animations avec les deux
-- mascottes ne fonctionnent pas du tout. Ça sert à rien de continuer, sur les
-- dizaines qui sont sorties y'en a pas une qui a fonctionné. Le seul qui a
-- fait 30 000 vues est le reel dilemmes version date night. Je pense qu'il va
-- falloir plutôt se concentrer sur ces reels-là, ceux qui sont familiers. »
--
-- Les dilemmes « Tu préfères » (une édition par reel, comme « Date night
-- edition ») prennent les deux midis des reels statiques (jeudi, dimanche) et
-- les trois soirs des animations (lundi, mercredi, vendredi) : sept par
-- semaine. Les trois « Connais-tu ton partenaire ? » de midi, la BD du mardi
-- soir, le carrousel du jeudi soir, le « He's a 10 but... » du samedi soir, la
-- phrase tendre du dimanche soir et le bonhomme bâton de tous les matins ne
-- changent pas. Les posts d'animation déjà écrits reviennent à la routine par
-- `hors_grille` et la synchro les retient (lib/calendrier.mjs,
-- CATEGORIES_RETIREES) : aucun ne part plus.
--
-- Idempotente : appliquée par le workflow social-base.yml, en DERNIER (les
-- migrations 20261008130000, 20261009090000, 20261012180000, 20261016120000 et
-- 20261016150000, rejouées avant elle, écrivent une grille plus ancienne), ou à
-- la main dans Supabase > SQL Editor. La grille est tenue ici et dans
-- MELANGE_DEFAUT (lib/calendrier.mjs), pas dans l'admin.

update public.social_reglages
set valeur = '{"matin": "baton", "midi": {"1": "connais-tu", "2": "tu-preferes", "3": "connais-tu", "4": "tu-preferes", "5": "connais-tu", "6": "tu-preferes", "7": "tu-preferes"}, "soir": {"1": "tu-preferes", "2": "bd", "3": "tu-preferes", "4": "carrousel", "5": "tu-preferes", "6": "dix-mais", "7": "phrase"}}'::jsonb,
    updated_at = now()
where cle = 'melange';
