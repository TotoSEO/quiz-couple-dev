-- Les idées de Thomas portent leur catégorie, choisie dans l'admin ou laissée
-- à la routine (null). Depuis le 8 octobre 2026, une idée prend le créneau le
-- plus proche de sa catégorie au lieu du premier créneau encore vide, qui
-- était à des semaines, puis à trois mois une fois la réserve pleine.
-- Idempotente, appliquée par social-base.yml.
alter table public.social_idees add column if not exists categorie text;
-- NOT VALID depuis le 12 octobre 2026 : social-base.yml rejoue cette migration
-- avant celles qui élargissent la liste (20261012180000 en dernier), et une
-- idée d'une catégorie plus récente la faisait échouer, ce qui arrêtait le
-- workflow avant la grille du jour.
alter table public.social_idees drop constraint if exists social_idees_categorie_check;
alter table public.social_idees add constraint social_idees_categorie_check
  check (categorie is null or categorie in ('pov', 'connais-tu', 'tu-preferes', 'statique', 'phrase', 'coquin', 'carrousel', 'bd')) not valid;
