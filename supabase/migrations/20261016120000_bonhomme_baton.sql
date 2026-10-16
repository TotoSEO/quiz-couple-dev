-- Réseaux sociaux, 16 octobre 2026 : le bonhomme bâton (« me in my dreams
-- with u », gabarit « baton », catégorie « baton ») le lundi, le mercredi et
-- le vendredi matin, à la place de trois des dix animations de la semaine.
-- Thomas, sur le premier reel (le dragon) : « C'EST IN-CROY-ABLE... je veux
-- exactement ce style de post ». Le reel du matin repart en story comme
-- avant (il fait moins de 60 s).
--
-- Idempotente : appliquée par le workflow social-base.yml, en DERNIER (les
-- migrations 20261008130000, 20261009090000 et 20261012180000, rejouées
-- avant elle, écrivent une grille plus ancienne), ou à la main dans
-- Supabase > SQL Editor. La grille est tenue ici et dans MELANGE_DEFAUT
-- (lib/calendrier.mjs), pas dans l'admin.

update public.social_reglages
set valeur = '{"matin": {"1": "baton", "2": "pov", "3": "baton", "4": "pov", "5": "baton", "6": "pov", "7": "pov"}, "midi": {"1": "connais-tu", "2": "tu-preferes", "3": "connais-tu", "4": "statique", "5": "connais-tu", "6": "tu-preferes", "7": "statique"}, "soir": {"1": "pov", "2": "bd", "3": "pov", "4": "carrousel", "5": "coquin", "6": "dix-mais", "7": "phrase"}}'::jsonb,
    updated_at = now()
where cle = 'melange';

-- Une idée de Thomas peut viser la nouvelle catégorie. NOT VALID : la
-- contrainte vaut pour toute idée écrite ou modifiée, et le rejeu ne bute
-- jamais sur une ligne déjà là.
alter table public.social_idees drop constraint if exists social_idees_categorie_check;
alter table public.social_idees add constraint social_idees_categorie_check
  check (categorie is null or categorie in ('pov', 'connais-tu', 'tu-preferes', 'statique', 'phrase', 'coquin', 'carrousel', 'bd', 'dix-mais', 'baton', 'mipaps-anime', 'mipaps-statique', 'mipaps-histoire', 'mipaps-post')) not valid;
