-- Réseaux sociaux, 12 octobre 2026 : un carrousel « He's a 10 but... » (ou
-- « She's a 10 but... ») chaque samedi soir, à la place d'une des deux
-- phrases tendres de la semaine (idée de Thomas, d'après son jeu « C'est un
-- 10 mais... » du site). Gabarit « carrousel », catégorie « dix-mais » :
-- une couverture, huit cartes « but he... » de la petite manie au vrai
-- drapeau rouge, une page finale ; banque « dix-mais » de
-- reseaux/atelier/sujets.json.
--
-- Idempotente : appliquée par le workflow social-base.yml, en DERNIER (les
-- migrations 20261008130000 et 20261009090000, rejouées avant elle, écrivent
-- une grille plus ancienne), ou à la main dans Supabase > SQL Editor. La
-- grille est tenue ici et dans MELANGE_DEFAUT (lib/calendrier.mjs), pas dans
-- l'admin.

update public.social_reglages
set valeur = '{"matin": "pov", "midi": {"1": "connais-tu", "2": "tu-preferes", "3": "connais-tu", "4": "statique", "5": "connais-tu", "6": "tu-preferes", "7": "statique"}, "soir": {"1": "pov", "2": "bd", "3": "pov", "4": "carrousel", "5": "coquin", "6": "dix-mais", "7": "phrase"}}'::jsonb,
    updated_at = now()
where cle = 'melange';

-- Une idée de Thomas peut viser la nouvelle catégorie. NOT VALID : la
-- contrainte vaut pour toute idée écrite ou modifiée, et le rejeu ne bute
-- jamais sur une ligne déjà là (les migrations 20261009100000 et
-- 20261009110000, rejouées avant celle-ci, posent des listes plus courtes,
-- elles aussi en NOT VALID depuis ce jour).
alter table public.social_idees drop constraint if exists social_idees_categorie_check;
alter table public.social_idees add constraint social_idees_categorie_check
  check (categorie is null or categorie in ('pov', 'connais-tu', 'tu-preferes', 'statique', 'phrase', 'coquin', 'carrousel', 'bd', 'dix-mais', 'mipaps-anime', 'mipaps-statique', 'mipaps-histoire', 'mipaps-post')) not valid;
