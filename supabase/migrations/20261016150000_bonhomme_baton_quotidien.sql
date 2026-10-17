-- Réseaux sociaux, 16 octobre 2026 au soir : le bonhomme bâton (« me in my
-- dreams with u », catégorie « baton ») tous les matins. Thomas, devant la
-- promesse de la lune et les chiens : « on lance ces animations à raison de
-- une par jour, du coup réduis les formats posts classiques ». Le matin
-- l'avait trois fois par semaine depuis le matin même (20261016120000) ; les
-- quatre autres matins étaient des animations des mascottes, qui gardent le
-- lundi et le mercredi soir, et la coquine du vendredi soir. Midi et soir ne
-- changent pas. Le reel du matin repart en story comme avant (moins de 60 s).
--
-- Idempotente : appliquée par le workflow social-base.yml, en DERNIER (les
-- migrations 20261008130000, 20261009090000, 20261012180000 et 20261016120000,
-- rejouées avant elle, écrivent une grille plus ancienne), ou à la main dans
-- Supabase > SQL Editor. La grille est tenue ici et dans MELANGE_DEFAUT
-- (lib/calendrier.mjs), pas dans l'admin.

update public.social_reglages
set valeur = '{"matin": "baton", "midi": {"1": "connais-tu", "2": "tu-preferes", "3": "connais-tu", "4": "statique", "5": "connais-tu", "6": "tu-preferes", "7": "statique"}, "soir": {"1": "pov", "2": "bd", "3": "pov", "4": "carrousel", "5": "coquin", "6": "dix-mais", "7": "phrase"}}'::jsonb,
    updated_at = now()
where cle = 'melange';
