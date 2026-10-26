-- Réseaux sociaux, 26 octobre 2026 : huit reels par semaine sur chaque
-- compte, sans routine Claude derrière. Thomas : « Je ne vais sans doute plus
-- reprendre l'abonnement Claude Max, ce qui veut dire qu'il faut préparer une
-- grande quantité de posts insta [...] publier un peu moins pour préparer une
-- mise en ligne automatisée sans plus aucune intervention de Claude pendant
-- plus de 5 mois, à raison de 8 posts par semaine. » Aux vues à sept jours du
-- 7 au 19 octobre, seuls les reels sont distribués : dilemmes « Tu préfères »
-- 1 462 vues médianes (52 186 pour « Date night edition »), « Connais-tu » 357
-- (2 694 le 19 octobre), bâton 1 221 ; phrase tendre 192, « He's a 10 but »
-- 170, carrousel 126, BD 64. Chez les mipaps (« un flop total »), reels animés
-- 283, posts image et carrousels-histoires 2 vues.
--
-- Quiz Couple : cinq « Tu préfères » (lundi, mercredi, jeudi et dimanche
-- soir, samedi midi), deux « Connais-tu » (mardi et vendredi soir), un bâton
-- (samedi soir). Les mipaps : un reel animé tous les matins et le samedi
-- soir. Un créneau à `null` est fermé : la synchro y retient tout post
-- (MOTIF_FERME, lib/calendrier.mjs), l'entretien ne le compte ni à remplir ni
-- dans la réserve, et la story du jour reprend le premier reel ouvert.
--
-- Idempotente : appliquée par le workflow social-base.yml, en DERNIER (les
-- migrations plus anciennes, rejouées avant elle, écrivent une grille plus
-- ancienne), ou à la main dans Supabase > SQL Editor. La grille est tenue ici
-- et dans MELANGE_DEFAUT / MELANGE_MIPAPS (lib/calendrier.mjs), pas dans
-- l'admin.

update public.social_reglages
set valeur = '{"matin": null, "midi": {"1": null, "2": null, "3": null, "4": null, "5": null, "6": "tu-preferes", "7": null}, "soir": {"1": "tu-preferes", "2": "connais-tu", "3": "tu-preferes", "4": "tu-preferes", "5": "connais-tu", "6": "baton", "7": "tu-preferes"}}'::jsonb,
    updated_at = now()
where cle = 'melange';

update public.social_comptes
set melange = '{"matin": "mipaps-anime", "midi": {"1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null}, "soir": {"1": null, "2": null, "3": null, "4": null, "5": null, "6": "mipaps-anime", "7": null}}'::jsonb,
    updated_at = now()
where langue = 'fr';
