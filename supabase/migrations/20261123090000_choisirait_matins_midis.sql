-- Réseaux sociaux, 23 novembre 2026 : « What would he/she choose? » sur les
-- matins et les midis de Quiz Couple. Thomas, le 23 novembre 2026 : « faire
-- un max de réels en plus de ceux programmés [...] une personne en couple
-- tombe sur le réel, et le réel montre [...] 3 propositions à chaque fois
-- [...] la fille répond à la place du garçon, puis elle lui partage [...]
-- on spam ça ok ? ». Les matins (sept par semaine) et les midis du lundi au
-- vendredi et du dimanche (six) reçoivent la catégorie `choisirait`, écrite
-- d'avance jusqu'au 31 mars 2027 par reseaux/atelier/choisirait/fabrique.mjs
-- (les posts vivent dans reseaux/atelier/choisirait/posts, sur main). Les
-- soirs et le samedi midi ne changent pas : cinq « Tu préfères », deux
-- « Connais-tu », un bâton. Vingt et un reels par semaine au lieu de huit ;
-- la story du jour passe au reel du matin, le premier créneau ouvert.
--
-- Les mipaps (compte fr) gardent leur grille. Idempotente : appliquée par
-- social-base.yml en DERNIER, après 20261026190000_huit_reels_par_semaine.sql
-- qui écrit la grille précédente. La grille est tenue ici et dans
-- MELANGE_DEFAUT (reseaux/automates/lib/calendrier.mjs).

update public.social_reglages
set valeur = '{"matin": "choisirait", "midi": {"1": "choisirait", "2": "choisirait", "3": "choisirait", "4": "choisirait", "5": "choisirait", "6": "tu-preferes", "7": "choisirait"}, "soir": {"1": "tu-preferes", "2": "connais-tu", "3": "tu-preferes", "4": "tu-preferes", "5": "connais-tu", "6": "baton", "7": "tu-preferes"}}'::jsonb,
    updated_at = now()
where cle = 'melange';

select 'choisirait_matins_midis' as migration, valeur from public.social_reglages where cle = 'melange';
