# Quiz Couple - Project Guide

## Architecture

Static site generator (EJS + vanilla JS) deployed to GitHub Pages.
- **Main site**: quiz-couple.com (GitHub Pages)
- **Backend**: Supabase (blog articles, reviews)
- **Languages**: FR (primary), EN, ES, DE, IT — frOnly pages should NOT appear in non-FR navigation

## Build

```bash
cd static-site
npm ci
npm run build          # Main site → dist/
```

## Key Files

- `static-site/build/config.js` — Routes, languages, blog articles, helpers
- `static-site/build/generate.js` — Main site generator
- `static-site/templates/base.ejs` — HTML base template (meta, OG, hreflang, JSON-LD)
- `static-site/templates/pages/quiz-generic.ejs` — Generic quiz page template
- `static-site/templates/partials/related-tests.ejs` — Related tests internal linking
- `static-site/js/quiz-engine-core.js` — Quiz engine (SoloTest, DuoMatch, Coquin, etc.)
- `static-site/js/quiz-loader.js` — Quiz config & initialization
- `static-site/build/moteurs.js` : découpe de quiz-engine-core.js en un paquet par moteur (`moteur-socle.js` + `moteur-<nom>.js`, 190 Ko en moyenne au lieu de 570). Tout moteur nommé dans quiz-loader.js (`engine: '...'`) doit figurer dans `TABLE_MOTEURS` avec son constructeur : sinon le build écrit « table incomplete ... pas de decoupage » et TOUTES les pages reçoivent le fichier entier. C'est arrivé du 5 septembre au 7 octobre 2026, le jeu des phrases à compléter n'y avait pas été déclaré. Un moteur s'écrit `  function NomQuiz(config) {` puis `  NomQuiz.prototype.x = ...`, sans fonction libre entre deux moteurs.
- `static-site/js/salon.js` — Mode à distance (chacun sur son téléphone) : codes de partie, QR code, présence, chargé à la demande ; le moteur commun l'appelle via `QuizEngine.chargerSalon`
- `static-site/css/styles.css` — Main stylesheet
- `static-site/templates/pages/admin.ejs`, `static-site/js/admin.js`, `static-site/css/admin.css` — Tableau de bord d'administration (`/admin/`) : coquille plein écran à barre latérale, tuiles, grands graphiques sur canvas, lectures RPC mises en mémoire de session (bouton « Actualiser »). L'onglet ouvert à la connexion est Trafic, premier du menu : `currentTab` dans admin.js, la classe `active` et le panneau visible dans le gabarit disent la même chose. Ses deux premières tuiles portent l'écart avec la période précédente (hier en vue du jour, les sept jours d'avant en vue à sept jours), calculé sur la série quotidienne déjà chargée pour la courbe ; au-delà elle ne remonte pas assez loin et l'étiquette disparaît. Les identifiants du gabarit sont le contrat du script, on ne les renomme pas ; base.ejs n'y met ni en-tête ni pied de page. Un lien « Retour au site » mène à l'accueil de la langue de la page, sous le bouton de connexion et en bas de la barre latérale (réduit à son icône sous 960 px). Au-dessus de lui, le bouton « Exporter » (`exporterTout`, admin.js, 7 octobre 2026) télécharge un JSON de tout ce que l'admin sait sur trente jours (parties finies et lancements par test, trafic par jour, page et source, blog, mode à distance, clics Instagram), en relisant la mémoire de session : Thomas l'envoie pour analyse, le fichier dit lui-même comment se lire, et une fonction absente y laisse son erreur. Le bouton de déploiement manuel a été retiré le 7 octobre 2026, avec la fonction `trigger-deploy` et les secrets `GITHUB_DEPLOY_TOKEN`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME` (une étape de deploy-functions.yml les efface de Supabase) : le site se publie au push sur main et aux reconstructions programmées (scheduled-rebuild.yml), et le bouton « Run workflow » de GitHub Actions reste là pour relancer un build à la main.
- `static-site/js/audience.js`, `supabase/migrations/20260822120000_page_views.sql`, `supabase/migrations/20260929120000_trafic_agregats.sql` : mesure d'audience maison (une ligne par page vue dans `page_views`, 10 000 par jour fin septembre 2026). Depuis le 29 septembre 2026, les lignes brutes ne sont gardées que 35 jours (`trafic_jours_bruts()`, une seule constante à changer) : une tâche pg_cron (`trafic-entretien`, 2 h 20 UTC, fonction `trafic_entretien()`) condense chaque journée close dans cinq tables `trafic_jour*` (résumé, pages, sources, profondeur, entonnoir, treize mois), puis purge le brut, jamais avant condensation. Les six `get_trafic_*` et `get_blog_articles` lisent les agrégats pour les jours clos et le brut pour la journée en cours, avec les mêmes signatures : admin.js n'a pas changé. Leur paramètre `p_tz` n'est plus lu, les journées sont découpées en Europe/Paris (`trafic_fuseau_agregats()`), et une visite à cheval sur minuit compte dans les deux journées, comme dans la série quotidienne. Le calcul brut vit dans les fonctions `trafic_brut_*` (intervalle `[debut, fin[`), une seule écriture pour la condensation et la lecture. Toutes les bornes de dates comparent `created_at` à un instant calculé une fois : la forme `(created_at AT TIME ZONE tz)::date > jour0` empêche l'index de servir et faisait relire toute la table à chaque appel, jusqu'au dépassement des trois secondes du rôle anon. Les migrations de ce dossier s'appliquent à la main dans Supabase > SQL Editor (le workflow deploy-db.yml n'en applique que quatre anciennes) ; elles sont idempotentes.
- `fr/*.json` — French translations (quizzes.json, common.json, home.json, gd.json, quiz-*.json)
- `static-site/templates/pages/custom-quiz.ejs`, `static-site/js/custom-quiz.js`, `supabase/functions/manage-custom-quiz/index.ts` : création de quiz personnalisés (`/creation-quiz-personnalise/`). Depuis septembre 2026, **privés seulement** : un quiz se partage par son lien et expire au bout d'une semaine. La création de quiz publics a été retirée partout (choix de visibilité, liste de la communauté sur la page et sur l'accueil, action `list_public` de la fonction serveur, qui force aussi `is_public` à false et ne sert plus un quiz encore marqué public). La table garde la colonne `is_public` ; le compteur du hero additionne les deux lignes de `custom_quiz_totaux`, les quiz publics d'autrefois comptent dans l'historique.
- `static-site/js/quiz-engine-core.js` (`PRODUITS`), `public/produits/` — Encarts produits affiliés des écrans de résultat. Chaque produit a une entrée par langue (`fr`, `en`, `es`, `de`, `it`) avec le lien d'affiliation de la place de marché correspondante : un tag français ne rapporte rien sur une vente allemande, et les tags sont par marché (`…de-21`, `…en-20`, `…es-21`, `…it-21`). Une langue absente n'affiche pas de carte, ce qui est le cas des trois partenaires Affilae, français seulement. Les visuels sont copiés chez nous en WebP carré de 600 px (`public/produits/<clé>-<langue>-<n>.webp`, copié par `copyStaticAssets`) plutôt qu'appelés sur le CDN d'Amazon. La note vient de la fiche, arrondie au dixième supérieur et écrite avec le séparateur décimal de la langue ; le nombre d'avis n'est pas affiché (il monte tous les jours) mais sert de garde-fou : sous cinq avis, aucune note ne s'affiche. `PRODUITS_PAR_TEST` dit quels produits vont sur quelle page, `PRODUITS_PAR_TEST_LANG` permet une sélection propre à une langue (l'anglais de `tester-couple`, première page du site, reçoit trois produits choisis au lieu du carrousel de six).
- `static-site/templates/partials/pub.ejs`, `static-site/js/pub.js` — Emplacements de la régie (The Moneytizer, site 142829) : 31 billboard sous le moteur, 2 pavé haut après la première section, 15 interstitiel et 6 footer dans base.ejs. Le grand angle (3, colonne latérale à droite du texte au-delà de 1440 px) a été retiré le 26 septembre 2026 : la régie le servait aussi en « half page » (deux pavés 300x250 empilés dans le 300x600, `renderHalfPage` sur l'unité 26323), pour 0,07 € et un CPM de 0,16 € qui tirait la moyenne du domaine vers le bas ; la grille `.avec-colonne` qui l'accueillait reste, elle tient le texte centré à sa largeur d'avant et porte l'encart de bureau. Jamais deux fois le même format sur une page. Les scripts partent de pub.js au chargement complet de la page (`load`), puis à l'approche de l'écran pour chaque emplacement (`MARGE`, 300 px depuis le 1er octobre 2026 : à 800 px, le billboard posé sous le moteur était demandé dès le chargement sur téléphone, compté, et jamais vu par qui répond au test sans défiler, ce qui tirait la visibilité et les enchères du domaine vers le bas). Les emplacements du flux ne sont classés et observés que 800 ms après `load` (`ATTENTE_MISE_EN_PAGE`) : à `load`, le moteur n'a pas encore dessiné son premier écran, et le billboard qui le suit paraissait à portée puis était repoussé hors de vue, une impression servie pour personne. Aucune publicité dans le premier écran : un emplacement qui tombe au-dessus de la ligne de flottaison, et le footer, attendent le premier geste (`auPremierGeste`) : un défilement, ou un clic dans `<main>`, donc hors en-tête, menu et bandeau de consentement, la première réponse à un test par exemple ; le défilement seul laissait sans footer tous ceux qui jouent sans faire défiler, et PageSpeed, qui ne clique pas, ne voit rien de plus. Le pavé haut (2) des pages du moteur est posé dans le texte après la première section, mais `dispositionResultat` (quiz-engine-core.js) le déplace dans la carte de résultat, zone `qr-zone--pub` juste sous le verdict et avant les produits, s'il n'a pas encore été demandé à la régie : c'est l'écran le plus lu de la visite, et le texte n'est presque jamais atteint ; sans résultat il reste à sa place. Sur téléphone, le script du pavé de la régie ignore notre div : il glisse son conteneur `sas_26300` dans le plus long des `<p>` situés entre 10 % et 20 % de la liste des paragraphes de la page (réglage de leur côté, `2 == 2 && 1 == 1 && deviceType == 0`), soit, mesuré le 6 octobre 2026, 1 500 à 2 400 px sous l'écran au résultat d'un test, pendant que notre encart restait blanc puis se repliait. pub.js (`rapatrie`) pose un MutationObserver avant d'injecter le format et ramène le conteneur dans l'encart avant le rendu (la régie attend une à trois secondes d'enchères puis le retrouve par son identifiant) ; un conteneur qui porte déjà un cadre n'est jamais déplacé. Table `CONTENEURS` (2 → `sas_26300`, 31 → `sas_39287`). À l'arrivée sur le résultat, `defileVersLeVerdict` (quiz-engine-core.js) amène le haut du plan de résultat sous l'en-tête : il attend que la carte soit insérée (un `scrollIntoView` sur un élément détaché ne fait rien), calcule la cible par `offsetTop` (le plan entre avec `quizResultPop`, une échelle de 0,9 à 1 qui faussait `getBoundingClientRect` de 133 px), et `data-arrivee` fait taire `smoothScroll(wrap, 'center')` des moteurs, qui posait le téléphone au milieu du plan, sous le verdict ; le carrousel de la story centre sa vignette par un `scrollBy` horizontal, son `scrollIntoView` faisait aussi descendre la page jusqu'à lui. Depuis le 1er octobre 2026, le hub des jeux (31 sous le plateau, 2 après la première section), les questions de couple (2 entre le tirage et la liste, la colonne de 896 px n'a pas la place d'un billboard) et les articles de blog (2 après la première section, 31 en pleine largeur sous l'article) ont aussi leurs emplacements dans le flux. L'interstitiel (son div est sur toutes les pages publicitaires) ne part que dans deux cas : au résultat, sur le geste de la personne (resultat-url.js), ou à l'arrivée depuis une autre page du site, referrer de même origine (pub.js, `interstitielDeNavigation`), au plus un toutes les dix minutes, la date du dernier affichage étant dans localStorage sous `qc-interstitiel`, clé écrite dans les deux fichiers ; jamais à l'arrivée depuis l'extérieur, ni avec `?resultat` ou `?salon=` dans l'adresse. Un emplacement resté vide huit secondes se replie hors de l'écran (`.pub--vide`), jamais sous les yeux, et sans saut (`sansSaut`) : au-dessus de l'écran, l'ancrage du défilement est coupé le temps du changement, le décalage de l'élément suivant est mesuré et compensé par `scrollBy` ; sans ça, le texte lu sautait de 330 px au repli d'un billboard vide, dans Chrome comme sur iPhone (mesuré le 6 octobre 2026). Aucun encart du format « in text » ne reste sur le site : les seuls encarts qui se replient sont le pavé et le billboard. Le footer est le seul format hors flux : son div (`.pub--6`, hauteur nulle) n'est qu'un point d'ancrage, le script de la régie ajoute en fin de body un conteneur fixe collé en bas (`#sas_iframe_fixed_26328`, 728x90 sur ordinateur, 320x50 ou 320x100 sur téléphone) ou un « slide-in » 300x250 au bord droit (`…-1`). pub.js le surveille : tout élément fixe de ce format qui dépasse 30 % de la hauteur de l'écran (standard Better Ads) reçoit `data-pub-trop-haut` et styles.css le masque, sauf un élément qui couvre presque tout l'écran (`estUnVoile`, 90 % en largeur et en hauteur) : le conteneur de l'interstitiel porte le même préfixe `sas_iframe_fixed_` (unité 26755, plein écran, création centrée avec sa croix), et le masquer laissait la page bloquée derrière l'`overflow:hidden` de la régie, sans rien de visible à fermer ; tant qu'un bandeau est collé en bas, sa hauteur est dans `--pub-footer` sur `<html>` et le body en est dégagé en bas, pour qu'aucun bouton ne reste caché derrière ; la fermeture par la personne retire l'élément et la variable. Trois formats ont été retirés en septembre 2026 faute d'être vus (4 double skyrail, 28 megabanner bas, 19 pavé bas), et avec le skyrail les gouttières `--gouttiere-pub` qui tenaient le hero, les avis, les tests liés, le pied de page et l'article de blog à 152 ou 176 px des bords sur bureau : ces blocs ont retrouvé leur largeur d'avant. Le format « in text » (11, article de blog) a été retiré le 20 septembre 2026 : chez Moneytizer c'est une vidéo outstream (l'enchère part en `formatid=video`, tailles 640x320 et 640x480) que leur script insère après le premier `<p>` de l'élément `article`, remplie à 10 %, 0 € de revenu, et elle tirait le CPM du domaine vers le bas. Les règles `min-width: 0` et `max-width: 100%` des conteneurs du texte, nées de ce format, sont conservées comme garde-fou. Enfin, la régie recharge ses emplacements même hors écran (37 s pour le pavé, 60 s pour le billboard, 45 s pour le footer, contre 18,5, 19,5 et 25 s à l'écran), jusque dans un onglet caché, jusqu'à cinquante fois par page. La parade de septembre 2026, qui posait vide la table `defaultRefreshTimeTableInvisible` de `tmzrToolbox`, n'a jamais eu d'effet : le script de la régie lit la table puis écrase la valeur en dur à la ligne suivante, et pour les enchérisseurs « lents » (`slowBidders` : teads, sharethrough, richaudience...) il prend un délai fixe de 30 à 60 s, visible ou non. Après le passage du pavé dans l'écran de résultat, ces impressions hors de vue ont fait tomber le CPM de 0,30 à 0,20 € du 1er au 4 octobre 2026. Depuis le 5 octobre, pub.js (`brideRafraichissement`) intercepte le seul point de passage commun : la boucle de la régie (toutes les 2 s, sur `window.tmzrLocalToolbox.adUnits`) rafraîchit si `refreshTimer + délai < maintenant`, et `refreshTimer` devient sur chaque unité une propriété calculée qui vaut « maintenant » tant que l'unité est hors de vue (`isVisible`, tenu par leur IntersectionObserver au-delà de 50 %) ou l'onglet caché, puis l'instant du retour sous les yeux : plus aucun rafraîchissement hors de vue, et le premier après un retour attend un délai visible complet. Le registre est relu chaque seconde (unités créées au fil des demandes, ou recréées), les unités `forceVisibility` gardent leur rythme sauf onglet caché. Le footer est lu à part (`footerAffiche`) : la régie mesure sa visibilité sur `sas_26328`, posé dans notre ancre de hauteur nulle et masqué par elle au rendu, donc toujours « hors de vue » ; sa visibilité vient du bandeau fixe `sas_iframe_fixed_26328` (affiché, ni `data-pub-trop-haut`, ni fermé), et il garde le rythme que la régie lui donne de fait, 45 s. Vérifié sur un banc qui fait tourner le vrai code de rafraîchissement extrait de leur script : hors de vue trois minutes, 4 rafraîchissements sans la parade comme avec celle de septembre, 0 avec la nouvelle ; à l'écran, 3 par minute dans les trois cas ; footer affiché, 3 en trois minutes avec ou sans bride, 0 fermé, masqué ou onglet caché. Si la régie change la structure de son script, le pire cas est que la bride n'ait plus d'effet : à revérifier sur leur `formatrequest_refactor_desktop.js` en cas de chute de CPM.

- `reseaux/`, `docs/reseaux-sociaux/ARCHITECTURE.md` : comptes Instagram de Quiz Couple (anglais seul au départ, pour être compris partout et pas pour viser les États-Unis : jamais d'actualité, seules fêtes Noël et Nouvel An ; compte professionnel relié à une Page Facebook (connexion Facebook, `graph.facebook.com`), aucune validation humaine, trois posts par jour à une minute tirée au sort dans 6 h-8 h, 11 h-13 h et 16 h-18 h, heure de Paris). Ligne éditoriale dans `reseaux/atelier/LIGNE-EDITORIALE.md` (deux publics en couple, 13-17 et 18-25 ans ; tout dessiné, aucune photo), semaine type dans le réglage `melange` par catégorie (la même grille dans `MELANGE_DEFAUT`, lib/calendrier.mjs, et dans la migration `20261008130000` qui la réécrit) : 11 animations dont une coquine, 3 « Connais-tu ton partenaire ? », 2 « Tu préfères », 2 reels statiques, 2 phrases tendres, 1 carrousel de questions le jeudi soir (banque `carrousel`, dix pages, « Save this for your next date night », depuis le 7 octobre 2026) ; chaque jour le reel du matin repart en story juste après sa publication (`publierStories` dans publication.mjs, `media_type` STORIES, colonnes `story_*` de `social_variantes`, reel de 60 s au plus, badge « + story » dans l'admin) ; banque de sujets dans `reseaux/atelier/sujets.json` (273 au départ, 307 depuis la revue du 7 octobre 2026 face aux comptes qui marchent : éditions nommées sur l'étiquette des quiz, « Who's more likely? » à pointer (`mode: pointe`), piliers `mini` et `participatif` (phrase à finir en commentaire), échelles de réaction, routines, faux messages, contrastes, retrouvailles ; légende = accroche avec un mot-clé + un seul appel choisi pour le geste voulu, envoyer / commenter / enregistrer, jamais le même trois fois dans la journée ; hashtags par catégorie dans LIGNE-EDITORIALE.md ; références dans `reseaux/atelier/REFERENCES.md`), chaque post porte son `sujet`. Les animations ne renvoient jamais vers le site dans la légende, les jeux oui. La charte est le design system « Quiz Couple Social » (https://claude.ai/artifact/2EQe4VPFYhMazvenJ3fqDX), copiée dans `reseaux/charte/` (`tokens.json`, `qc.css`, `mascottes.js`) : une modification de charte se fait dans les deux. Le studio Remotion (`reseaux/studio/`, `node scripts/rendre.mjs <recette> <sortie>`, `--verifier` pour le seul contrôle, `scripts/planche.mjs` pour relire un reel en vignettes) rend les gabarits pov (moteur d'animation `src/pov/` : scénario plan par plan, vocabulaire de décors, spots, objets, gestes et effets dans `vocabulaire.json`, contrôle du scénario dans `automates/lib/pov.mjs`, dont la richesse depuis le 7 octobre 2026, `controlerRichesse` : description de 100 signes au moins par plan, deux mouvements de caméra par reel et un par plan de plus de 4 s, un changement d'expression par personnage toutes les six secondes et deux au moins, jamais plus de 1,5 s sans événement nouveau dans un plan, premier geste avant 0,5 s ; les quatre modèles d'animation passent ces règles), connais-tu, tu-preferes (accroche : les mascottes en grand et animées dès la première image ; la question reste seule le temps d'être lue avant le chrono), quiz-chrono, citation, image et carrousel (avec scène dessinée possible) et refuse tout texte hors zone utile (220 px en haut, 420 en bas, 120 à gauche et à droite d'un reel), qui déborde, qui finit sur un mot seul ou sous 34 px : on raccourcit le texte, jamais la taille. Règles de Thomas : tout centré sauf les réponses d'un quiz (à gauche) ; jamais de score ; mascottes dans les animations et dans les jeux (elles attendent avec un « ! » puis font « Yay! ») ; assises sur un banc ou un canapé, sous la couette seules la tête et les petites mains dépassent ; animations très simples, comme les mini dessins qui marchent sur Instagram ; citations en Playfair Display italique avec des fleurs au trait à 30 %, humour en Fredoka ; fond texturé pour les quiz, grain de papier léger partout (`is-papier`) ; depuis le 7 octobre 2026 les mascottes et les décors sont « dessinés » (`charte/mascottes.js` : trait d'encre `decor-trait` épais et tremblé par un filtre de déplacement dont la graine change toutes les quatre images : option `tremble` de chaque mascotte en vidéo, et `filter: url(#qc-tremble)` défini par le Canevas sur la scène fixe d'un post ; jamais sur un texte, et jamais plein cadre en vidéo, mesuré le 7 octobre 2026 à 1,3 s par image contre 0,45 sans, le décor reste donc net ; aplats, reflet et joues en dégradés radiaux, pas de flou), la rose porte un nœud (`noeud`, retiré sous un bonnet), les humeurs varient (poses `mignon`, `triste`, `colere`, `gene`, `fatigue`, `supplie`, `rire`, options `sourcils`, `larmes`, yeux `brillants`, bouches `chat` et `grogne`, gestes `pleure`, `fache`, `mignon`) et les mascottes sont sur tous les posts (`Duo` en petit sur les phrases tendres, les posts et chaque page de carrousel) ; la rose est la fille, le violet le garçon (c'est lui qui offre les fleurs) ; textes des minis, statiques et bulles en minuscules façon message (`u`, `ur`, `rn`, `<3`), référence analysée dans `reseaux/atelier/REFERENCES.md` (nub) ; aucun reel sous 10 s ; on anime dès qu'on peut (un câlin commence par les deux qui arrivent chacun de son bord, au lit chaque moment de la journée passe par un écran noir, transition `noir`, la lumière de la pièce change avec `moment`, et ils replongent sous la couette, geste `plonge`). Zone utile symétrique (120 px à gauche comme à droite) : un texte centré l'est sur l'écran. Bruitages CC0 de Kenney, doux (volumes 0,10 à 0,24) et variés (`VARIANTES` dans Son.tsx, tirées de l'instant) ; **pas de musique dans le fichier d'un reel** : la publication lui attache un son tendance de la bibliothèque Instagram par l'Audio API de Meta (`GET /ig_audio?audio_type=music&user_id=…`, réponse sous `audio`, puis `audio_configuration` JSON sur le conteneur REELS : `audio_id`, `audio_volume` 70, `video_volume` 100, `should_loop_audio` si le son est plus court ; seulement avec la connexion Facebook, et seulement les sons « autorisés pour les tiers », le morceau partant toujours du début). `automates/lib/son.mjs` choisit parmi les douze premières tendances un son jamais posé sur le compte dans les soixante dernières déclinaisons, au moins aussi long que le reel (durée relevée au rendu dans `fichiers.duree`), de façon reproductible, et l'écrit dans la recette (`son` : `id`, `titre`, `artiste`, affiché dans l'admin) ; une recette peut demander `"son": {"recherche": "soft piano"}` à la place des tendances ; API en panne ou son refusé : le reel part avec ses bruitages, alerte au journal, jamais un créneau manqué pour une musique. Sans musique dans le fichier, pas de normalisation à -14 LUFS, seulement les crêtes rabattues sous -1 dBTP ; la bibliothèque de 55 morceaux en cinq ambiances (`studio/public/musique/bibliotheque.json`, 6 FreePD dans le dépôt, 49 Mixkit préparées par `scripts/musiques.mjs`, jamais commitées) ne sert qu'à une recette qui porte `ambiance` ou `musique` (choix sans répétition dans `automates/lib/musique.mjs`, et alors pas de son Instagram par-dessus). Jeton : un jeton d'utilisateur Facebook longue durée collé dans l'admin donne le jeton de la Page reliée (`/me/accounts`, sans date d'expiration propre), rangé dans `social_jetons` ; `jeton_expire_le` reçoit la plus proche de `expires_at` et de `data_access_expires_at` (Meta coupe l'accès aux données 90 jours après la dernière connexion, vérifié le 7 octobre 2026), l'entretien le vérifie chaque semaine (`verifierJetons`), alerte dix jours avant la date et s'il est refusé, bouton « Changer le jeton » dans l'admin. Appli Meta « Quiz Couple 2 Son » (cas d'usage « Gérer les messages et le contenu sur Instagram », configuration avec connexion Facebook), Page « Quiz Couple » reliée à @quiz_couple_official (17841425378855459). Le mode « à la main » du 7 octobre 2026 (reels à publier depuis l'appli) a été retiré le jour même : tout est automatique. La routine Claude « atelier » (une fois par jour à 5 h 44, heure de Paris ; consignes dans `reseaux/atelier/CONSIGNES.md`) n'a aucun accès à Supabase : elle pousse des posts JSON sur la branche `reseaux-atelier`, par lots de six, en travaillant dans le dépôt même sur cette branche fusionnée avec `main`, et tient un journal de chaque passage dans `reseaux/atelier/journal/`, poussé dès l'ouverture, seule trace lisible de ce qu'elle a fait ou de ce qui l'a bloquée. Elle ne tourne pas dans une session neuve à chaque passage : six passages des 6 et 7 octobre 2026 se sont arrêtés en trois minutes sans rien laisser, pas même le journal, la session neuve n'arrivant pas à attacher le dépôt elle-même (`add_repo`). Le déclencheur envoie maintenant son message dans une session Claude Code permanente, créée une fois avec le dépôt comme source et `reseaux-atelier` comme branche de sortie (`persistent_session_id` du déclencheur) : le dépôt y est déjà cloné, et le premier journal est parti en vingt secondes. La session n'est qu'un hôte, chaque passage repart de `origin/reseaux-atelier` (`git checkout -B`) ; si elle est archivée ou supprimée, on en recrée une de la même façon et on refait le déclencheur ; les workflows `social-*.yml` font la synchro et le rendu (toutes les heures ; la routine remplit dès aujourd'hui les créneaux qui commencent dans plus de trois heures, `MARGE_MIN` dans entretien.mjs, jusqu'à J+100 et 24 posts par passage depuis le 7 octobre 2026 : la réserve s'écrit d'avance pour que le compte publie même sans routine, le rendu et la publication n'ayant pas besoin de Claude), la publication (toutes les 10 min) et l'entretien (jetons, ménage, statistiques, `etat.json`), avec les secrets Supabase déjà présents. Le workflow de publication récupère tout `reseaux` (pas seulement `automates` : le script lit le vocabulaire du studio et la bibliothèque musicale, et le checkout partiel l'a fait échouer au chargement toute la journée du 7 octobre 2026). L'horloge des trois workflows n'est pas le « schedule » de GitHub, qui saute la plupart des départs sur ce dépôt (mesuré le 7 octobre 2026 : une publication en neuf heures, un rendu en neuf heures, l'entretien de 7 h 41 parti à 14 h 44, et près d'un tick sur deux perdu pour la reconstruction du site depuis mars) : c'est pg_cron, dans Supabase, qui les déclenche par `workflow_dispatch` (migration `20261008140000_horloge_workflows.sql`, fonction `social_declencher_workflow`, jeton GitHub à grain fin dans le Vault sous `github_workflows` ; sans jeton elle ne fait rien). `social-base.yml` applique cette migration et recopie à chaque passage le secret GitHub `WORKFLOWS_TOKEN` du dépôt dans le Vault (`social_definir_jeton_github`, qui contrôle la forme `github_pat_…`) : pour changer le jeton, on change le secret puis on relance le workflow (« Run workflow ») ; les « schedule » restent en secours, et le rendu fabrique les fichiers 48 h à l'avance. Un compte inactif ne fait rien rendre et rien échouer : la publication tourne à blanc. Tables `social_*` fermées au public (migrations `20261007120000` et `20261008120000`, appliquées par `social-base.yml`), onglet Réseaux de l'admin par la fonction `admin-social`. Les clics vers Instagram depuis le site (tout lien vers instagram.com : icône du menu, menu mobile, pied de page, accueil, merci après un avis) sont comptés par `clicInstagram` dans audience.js, table `instagram_clics` (migration `20261008150000`, appliquée par social-base.yml), lus par `get_instagram_clics()` et affichés en un seul total, sept jours et aujourd'hui, dans la quatrième tuile de l'onglet Réseaux : Thomas veut le total, pas le détail par bouton, l'emplacement est quand même enregistré. L'accueil du site montre les trois dernières publications (`#instagram-recents` dans home.ejs, rempli par `home-dynamic.js` via la fonction publique `get_instagram_recents` ; l'affiche de chaque post, couverture en 540 px, est déposée au rendu dans le bucket public `social-public`, colonne `social_variantes.affiche`, jamais effacée par le ménage ; styles dans le gabarit, section masquée sans publication). Les envois vers le stockage passent par le protocole de reprise TUS (morceaux de 6 Mo) au-delà de 6 Mo, avec trois essais sur erreur réseau et la cause dans le journal (un reel de jeu pèse 15 Mo, le premier a échoué d'un bloc le 7 octobre 2026). Tests des automates : `cd reseaux/automates && npm test`.

### Performance : la feuille critique et le moment des scripts tiers

`css/styles.css` pèse 385 Ko minifiés et une page n'en utilise qu'une petite
part. Pour ne plus bloquer le premier affichage dessus, chaque page type a sa
feuille critique dans `static-site/css/critique/<clé>.css` (clé = `routeKey`,
plus `blog-article`) : la part de `styles.css` réellement utilisée au
chargement, relevée dans Chromium par `build/critique.mjs` (couverture CSS sur
quatre passes : mobile et bureau, clair et sombre, menus ouverts, page
parcourue). Le générateur la met en ligne dans le `<head>` et charge
`styles.css` en `preload` + `onload`, donc sans bloquer ; une page sans feuille
critique garde la feuille bloquante.

- Après toute modification de `styles.css` ou d'un gabarit qui change les
  classes présentes au chargement : `npm run build`, servir `dist/` sur
  http://127.0.0.1:8099 (`python3 -m http.server 8099 --directory dist`), puis
  `NODE_PATH=/opt/node22/lib/node_modules npm run critique` (une clé en
  argument pour n'en refaire qu'une), puis `npm run build` de nouveau. Le
  build prévient quand l'empreinte de `styles.css` inscrite en tête des
  fichiers n'est plus la bonne ; une feuille périmée ne casse rien (la feuille
  complète corrige tout dans la seconde), elle peut seulement faire manquer
  une règle récente au premier rendu.
- Les états que la couverture ne voit pas (survol, écrans suivants du moteur)
  arrivent avec la feuille complète : un style indispensable dès le premier
  écran doit correspondre à des éléments présents au chargement.

Les avis d'une page (douze derniers, note moyenne, nombre) sont cuits dans
le HTML à la construction (`avisCuitsPour` dans generate.js, bloc
`#pqx-avis-cuits` dans quiz-reviews.ejs, lu par `initReviews`) depuis le
7 octobre 2026 : chaque page vue demandait à la base la liste et jusqu'à
mille notes, le plus gros poste de sortie de Supabase (1,4 Go en dix jours
sur les 5 Go du plan gratuit). Seul l'envoi d'un avis reste en direct ; un
avis approuvé paraît à la reconstruction suivante, sept par jour. Les avis
se lisent par pages de mille (le plafond de PostgREST), et sans chargement
réussi au build, le bloc manque et la page redemande à la base comme avant.

Le reste de la règle : rien de tiers avant l'affichage. `pub.js` ne demande
les emplacements qu'à l'événement `load`, jamais dans le premier écran avant
un geste (défilement ou clic dans la page), le footer compris, et l'interstitiel seulement au résultat ou à l'arrivée depuis une autre page du site ; le fichier de la plateforme de consentement part après
`DOMContentLoaded` (le talon `__tcfapi` reste en tête) ; GA part au `load`.
Les images de tête ont deux largeurs (`720/` et 1200 px) et les cartes de
l'accueil les déclarent en `srcset`. Sur mobile, les animations qui
repeignent à chaque image (dégradé du titre, halo du bouton pureté) sont
coupées. Toute lecture de géométrie (`getBoundingClientRect`, `clientWidth`,
`scrollY`) après une écriture dans le DOM force une mise en page complète :
lire d'abord, écrire ensuite, comme dans `quiz-slider.js`.
Dans un gabarit de test ou de jeu, l'include `partials/quiz-featured` (l'image
de tête) se place en fin de section hero, après le texte : posé en tête, il
était peint seul pendant que le reste de la section arrivait, puis sautait de
300 px. Sur mobile il s'affiche sous le texte (`order: 99`), sur grand écran
il est en absolu, donc sa place dans le code ne change rien à l'écran. La
classe `quiz-page` du `<body>` vient du gabarit de base (`pageJouable`), pas
seulement de `quiz-extras.js`, pour la même raison.
Aucune animation d'entrée depuis l'opacité 0 sur ce qui est visible au
chargement (hero, titre, image de tête) : Chrome ne retient jamais comme
candidat LCP un élément peint à opacité nulle et ne revient pas dessus quand
le fondu se termine. Un fondu `main > section:first-child` de 0,6 s donnait
un LCP de 14 s sur mobile et « NO_LCP » sur bureau. Même chose pour les
décors en absolu par-dessus le hero (taches floutées, trame en `::after`) :
ils sont des dégradés du fond de `.hero-home`, pas des éléments.
Sous 768 px, les animations infinies qui n'animent ni `transform` ni
`opacity` (reflet des boutons, halo de la carte d'avis, LED du bouton sources
Google, point du compteur) sont coupées dans le bloc `@media (max-width:
767.98px)` de styles.css : elles repeignent à chaque image et PageSpeed les
compte. Pas de `:has()` sur `body` (le moteur pose `quiz-has-result`). L'état
collé de l'en-tête vient d'une sentinelle observée par IntersectionObserver
(mobile-menu.js), jamais d'une lecture de `scrollY` au chargement.
Accessibilité : un petit texte en rose prend `hsl(var(--primary-texte))`
(3,4:1 avec `--primary`, insuffisant sous 18 px), et le pied de page garde
son opacité à 1. Le violet de marque a la même paire, `--secondary-texte`,
claire en thème sombre : `--secondary` tel quel tombait à 2,3:1 sur le fond
sombre.
Le ruban de l'accueil (bande sombre entre le hero et la grille, `.ruban`)
n'anime que des `transform` sur ses deux pistes, sans `backdrop-filter` :
mesuré, il ne coûte rien au score. Son fondu de bord est un `mask-image`
posé sur `.ruban-rangs`, pas sur `.ruban` : sur la bande, il ferait
disparaître le fond aux deux extrémités.

### Familles de navigation

Le menu (`templates/partials/header.ejs`), le pied de page (`footer.ejs`), le
plan du site (`templates/pages/sitemap.ejs`) et l'accueil (`home.ejs`) rangent
les pages en quatre familles, chacune avec sa couleur : Tests de couple
(`--primary`), Tests célibataires (`--celib`, turquoise), Quiz (`--secondary`)
et Jeux. Les tests célibataires sont les pages d'avant le couple : pourquoi je
ne trouve pas l'amour (solo, quinze questions), pourquoi je suis encore
célibataire (diagnostic à huit causes, vingt questions), combien de temps
vais-je rester célibataire (une durée estimée en mois, vingt questions), couple ou célibat
(deux parts qui font cent, vingt questions), suis-je amoureux, amour ou
crush, amour ou amitié, amoureux de mon/ma BFF, m'aime-t-il en secret, mon ex
pense-t-il encore à moi, suis-je prêt(e) pour une nouvelle relation (solo à
barème explicite, vingt questions). Il n'y a pas de page hub pour cette famille, seulement
l'entrée de menu. Les quatre listes, et leur ordre, vivent à un seul endroit :
`FAMILLES_NAV` dans `build/config.js`, lu par le menu (bureau et mobile), les
carrousels de l'accueil, le pied de page et le plan du site. Une page ajoutée
ou déplacée se règle là, une seule fois. Le libellé est `nav.<clé>` de
common.json partout, cartes de l'accueil comprises, et deux pages d'une même
famille n'ont jamais le même libellé. Le menu dessine une icône par clé
(`navIcons` dans header.ejs, une icône générique sinon) et l'accueil une
pastille par carte (`VISUELS` dans home.ejs). Écrites à la main dans chaque
gabarit jusqu'en octobre 2026, les copies avaient dérivé : ordre différent,
pureté et vacances sur l'accueil seulement, quatre tests absents du plan du
site. Le pied de page ajoute les questions de couple aux quiz et le hub aux
jeux ; le menu garde en plus le test de pureté en entrée vedette. Les compteurs du hero de l'accueil
comptent les quatre familles : « tests disponibles » additionne les tests de
couple et les tests célibataires, « quiz & jeux disponibles » les quiz et les
jeux. Ils n'en comptaient que deux et annonçaient 31 et 11 pour un catalogue
de 39 et 23.

## Quiz Engine Types

- `SoloTest` — Single player, points-based (toxic, divorce, mariage, genant, jalousie, attachement, confiance). Points par défaut = rang de la réponse (3, 2, 1, 0) et verdicts en tranches égales ; un test dont les réponses ne se valent pas déclare `ptsExplicites: true` (points dans `gd.json`, clés `prefix.q{N}{lettre}_pts`) et, si besoin, `paliers: [...]` (bornes hautes de chaque verdict sauf le dernier) dans `quiz-loader.js`. Le test du couple gênant fait les deux : ses réponses de rang deux valent 3 ou 2 selon qu'elles gênent vraiment, sur 60 points, avec les paliers 9, 24, 38, 50. Le test « je l'aime encore ? » (prefix `jeLaime`) aussi : les points vont au sentiment encore présent, pour que l'anneau se lise comme « combien il reste » ; chaque question pèse de 3 à 6 selon ce qu'elle dit (penser à partir vaut le double d'un agacement), 89 points, huit paliers (9, 20, 32, 44, 56, 67, 78) plus serrés en bas, où peu de points séparent « plus de l'amour » de « plus rien ». Le test « prêt(e) pour une nouvelle relation ? » (prefix `pretRelation`, 86 points, paliers 25, 45, 62, 75) pèse chaque question de 3 à 6 selon ce qu'elle dit : l'ex et le pourquoi de la relation valent six, les soirées et les projets trois ; ses textes d'écran de départ sont sous `pret-nouvelle-relation` dans quizGames.json, comme `trouver-amour`. Le test « est-ce le bon ou la bonne ? » (prefix `estCeLeBon`, route `testEstCeLeBon`, famille Tests de couple, 96 points, paliers 28, 50, 68, 84) suit la même règle : se sentir apaisé(e), la fin des disputes, pouvoir tout dire et « referiez-vous pareil » valent six, ce qui agace et la comparaison avec les ex valent trois ; les points vont à ce qui dit oui, l'anneau se lit comme « à quel point vos réponses vont dans le même sens ». Ses textes de départ sont sous `est-ce-le-bon` dans quizGames.json.
- `ProfileQuiz` (engine `profile`) : un profil tiré de l'axe dominant, pas un score : attachement, karmique, langages, personnalité amoureuse, portrait de l'âme sœur, et le quiz « quel type de couple êtes-vous ? » (prefix `typeCouple`, typologie `typeCouple` dans `TYPOLOGIES`, quiz-loader.js). Ce dernier se répond à deux sur un seul téléphone : quinze situations, quatre axes (fusion, complices, libres, batisseurs), et le sens des lettres tourne d'une question à l'autre (`carte`, permutations sur `(questionId - 1) % 4`) pour qu'on ne puisse pas répondre « toujours a » sans lire. Le cinquième profil `equilibre` (couple caméléon) sort quand l'axe de tête fait moins de 35 % des questions ou ne devance le second que d'une voix. Les libellés sont dans gd.json : `pf_axis_<id>`, `pf_<id>_t/_d/_a`, `introTitle`, `linkLabel`.
- `DuoMatchQuiz` — 2 players, answer matching (tester-couple, common-points)
- `HealthyQuiz` — 2 players, weighted scoring (couple-sain)
- `DistanceQuiz` — 2 players, alternating turns (distance)
- `quiz-ado-multiplayer.js` — Dedicated engine for the teen quiz: 2 players, same phone or game code, score = identical answers (not part of quiz-loader)
- `CoquinQuiz` — Guess & reveal (coquin)
- `KnowledgeQuiz` — Oral validation with check/cross (knowledge)
- `FunnyQuiz` — Discussion only, no scoring (marrant)
- `MostQuiz` — 2-8 players, vote (most)
- `ParentaliteQuiz` — 2 players, explicit point values (parentalite, emmenager)
- `TruefalseQuiz` — True/false with answer reveal (vrai-faux)
- `DiagnosticQuiz` — Un diagnostic à causes, pas un score (test « pourquoi je suis encore célibataire », prefix `celib`). Chaque réponse pèse sur une ou plusieurs causes via `prefix.q{N}{lettre}_axes` (« occasions:2,social:1 ») ; une question peut dépendre d'une réponse précédente via `prefix.q{N}_si` (« 3:a », « 8:c,d »), la réserve compte donc plus de questions qu'il n'en est posé (22 pour 20) et les questions ne sont jamais mélangées. Résultat = cause la plus chargée en pourcentage de son maximum sur les questions posées, seconde cause si elle pèse au moins 60 % de la première, profil `ouvert` si aucune ne dépasse 30 %. Les causes et leurs couleurs vivent dans `DIAGNOSTIC_AXES` (quiz-loader.js), les libellés (`axe_<id>`) et les fiches (`p_<id>_t/_d/_a/_c`) dans gd.json.
- `BalanceQuiz` — Un résultat en deux parts qui font cent à elles deux, pas un score sur cent (test « couple ou célibat », prefix `balance`). Chaque question porte son propre poids (2 à 8 points selon ce qu'elle dit de la vie à deux) et les points de chaque réponse sont écrits dans gd.json (`prefix.q{N}{lettre}_pts`), comme un test solo à barème explicite. La part « à deux » est le rapport entre les points pris et la somme des maximums, soit 101 points en tout ; la part « seul » est son complément, les deux font donc toujours exactement cent. Les questions ne sont pas mélangées (elles vont du passé vécu au quotidien puis à la projection) : le chargeur relit la réserve dans l'ordre du fichier, comme le diagnostic. Cinq verdicts (`r{N}_cle/_t/_d/_a` dans gd.json) découpés par `paliers: [22, 42, 58, 78]` sur le pourcentage « à deux », dans quiz-loader.js ; la clé du verdict est ce qui part dans `profil_resultats`. L'affichage (`.bal-*` dans styles.css) met les deux chiffres face à face, turquoise du côté seul et rose du côté à deux, avec la barre partagée en dessous.
- `AxesQuiz` — Deux axes mesurés séparément, et un verdict qui sort de la FORME du profil, pas d'une tranche de score (test « amour ou attachement », prefix `attache`). Chaque question porte `prefix.q{N}_axe` (`a` = l'élan vers la personne, `b` = ce qui vous retient) et ses points par réponse dans gd.json comme un test solo à barème explicite ; dix questions et cinquante points par axe, posées en alternance, sans mélange (le chargeur relit la réserve dans l'ordre du fichier). Chaque axe est ramené à son propre maximum, donc les deux pourcentages sont indépendants et ne font PAS cent à eux deux, contrairement à `BalanceQuiz`. Cinq profils, dans cet ordre d'évaluation : les deux sous 40 (`fini`), un écart d'au moins 15 en faveur de b (`attachement`) ou de a (`amour`), les deux au-dessus de 60 (`deux`), sinon `melange`. Les seuils sont réglables par `seuils: { bas, haut, ecart }` dans quiz-loader.js ; les fiches sont `p_<cle>_t/_d/_a` dans gd.json, et la clé du profil est ce qui part dans `profil_resultats`. L'affichage (`.axe-*` dans styles.css) empile deux jauges avec leur étiquette et leur chiffre, rose pour l'axe a et violet pour l'axe b.
- `DureeQuiz` : une durée estimée, pas un score (test « combien de temps vais-je rester célibataire ? », prefix `dureeCelib`, route `testDureeCelibat`, famille Tests célibataires). Vingt questions sans mélange, de la situation (âge, activité, lieu, temps libre) à la vie sociale, aux rencontres puis à ce qu'on ressent. Chaque réponse multiplie la chance de commencer une histoire dans le mois : les multiplicateurs sont dans `facteurs` de la configuration `duree-celibat` (quiz-loader.js), une seule table pour les cinq langues, `m` dans l'ordre des réponses a, b, c... Chance mensuelle p = `base` × exp(`pente` × somme des logarithmes), durée affichée = médiane d'une attente à chance constante, ln 2 / -ln(1 - p), fourchette du 30e au 70e centile, date approximative au mois sous trois ans (à l'année au-delà), « plus de 10 ans » au-dessus de `plafond`. Calage : un profil type (trentaine, un travail, trois sorties par mois, un groupe d'amis) donne 10 mois, le plus sociable 3 mois, une personne sans emploi et sans vie sociale autour de six ans. Le résultat liste les trois réponses qui pèsent le plus dans chaque sens (`q{N}_facteur` dans gd.json pour leur nom) et le levier qui ferait gagner le plus de temps, parmi les questions marquées `levier` (jamais l'âge, le lieu, l'activité ni l'ancienneté du célibat) ; au-dessus du plafond, il cumule jusqu'à quatre changements pour repasser dessous. Cinq verdicts sur la durée (`paliers: [4, 9, 18, 36]` mois, `r{N}_cle/_t/_d/_a`), la clé part dans `profil_resultats`. Les unités sont `moisUn/moisN/anUn/anN` ; l'allemand ajoute `moisNApres/anNApres` (datif après « zwischen », « bei », « statt ») et `versAn` pour l'année seule. Affichage `.dur-*` dans styles.css, turquoise de la famille pour ce qui joue pour, rose pour ce qui freine ; `--celib-texte` est la variante lisible de `--celib` en petit texte, claire en thème sombre.
- `calculatrice-amour.ejs` — Outil autonome, hors quiz-loader et hors moteur : deux prénoms, un pourcentage, aucune question. Le score est la moyenne pondérée de cinq mesures (lettres partagées 22, méthode historique 26, rythme des voyelles 16, numérologie 22, équilibre des longueurs 14), toutes affichées en barres avec leur explication. Il est déterministe et symétrique : les mêmes prénoms donnent toujours le même résultat et A + B vaut B + A (les deux prénoms sont triés avant le pliage de la méthode historique). Étendue mesurée sur 1 128 paires : 36 à 99 %, médiane 67. La méthode historique compte les lettres du mot amour dans la langue de la page (`calcul.mot` : amour, loves, amor, liebe, amore), donc un même couple n'a pas exactement le même score d'une langue à l'autre, ce que la page explique. Vingt-quatre couples célèbres (`couples` dans `{lang}/calculatrice-amour.json`) remplacent le score et le verdict, jamais le détail des barres. La dose du jour (`dose` : 20 conseils, 20 questions, 20 défis) tourne sur le quantième de l'année, sans rien demander au serveur. Le gabarit ne reçoit que la langue courante : `donneesJs` est construit en EJS, pas les cinq langues d'un coup.

- `quiz-signes-chinois.ejs`, `js/signes-chinois.js`, `{lang}/quiz-signes-chinois.json` : compatibilité amoureuse des signes chinois (route `testSignesChinois`, famille Tests de couple, à côté de la date de naissance). Outil autonome hors moteur, bâti sur le gabarit et les classes (`astro-*`, `dn-*`) de la compatibilité par date de naissance : deux dates complètes (l'année chinoise commence entre le 21 janvier et le 20 février, table `NOUVEL_AN` identique à celle de `date-naissance.js`, les deux fichiers doivent rester d'accord), deux animaux avec élément et polarité, la relation traditionnelle (`trine`, `harmonie`, `meme`, `neutre`, `nuisance`, `opposition`, calcul repris de date-naissance.js), le texte propre à la paire (78 paires dans `paires`, chacune avec sa `note` sur 10, la même dans les cinq langues, écrite dans le helper de génération), le portrait de chaque animal en amour (`portraits`), la relation des éléments avec le sens (`{{de}}` nourrit ou contrôle `{{vers}}`), cinq paliers (`fusion` ≥ 85, `belle` ≥ 70, `solide` ≥ 55, `travail` ≥ 42, `contraires`) et un conseil par relation. Score = note de la paire, plus 0,8 si les éléments se nourrissent, plus 0,3 s'ils sont égaux, moins 0,6 s'ils se contrôlent, borné de 15 à 98 %. Les noms d'animaux, d'éléments et les libellés du formulaire sont repris du fichier `quiz-date-naissance.json` de la même langue. La racine `#sc-outil` est déclarée dans `RACINES_MOTEUR` (quiz-extras.js) pour que les lancements soient comptés, et la carte de résultat porte `quiz-result-card` pour les parties terminées. Encart produit `astro`.
- `compteur-couple.ejs`, `js/compteur-couple.js`, `{lang}/compteur-couple.json` : compteur de couple (route `compteurCouple`, famille Tests de couple, déclaré dans `ROUTES_OUTILS` comme la calculatrice). Outil autonome hors moteur, sur le gabarit et les classes (`astro-*`, `dn-*`) des outils par date : une date de début (trois listes, pas de valeur par défaut), deux prénoms facultatifs, et la carte donne les jours ensemble en grand, la durée en années, mois et jours (le mois se compte de quantième à quantième, `decomposer`, le 31 devient le 30 ou le 28), six tuiles (semaines, mois, heures, minutes, Saint-Valentin partagées, dimanches), les quatre prochaines dates à fêter triées par proximité (anniversaire avec le nom des noces de la langue, `noces` dans le JSON ; prochain mois rond ; deux prochains caps de `CAPS`, centaines puis milliers jusqu'à 30 000 jours plus quatre caps insolites en heures et en minutes) et le dernier cap franchi. Le jour d'une de ces dates, la carte l'annonce (`fete`). Tous les écarts se comptent en UTC sur des dates à minuit. La date et les prénoms sont gardés dans localStorage (`qc-compteur`) et dans le lien `?depuis=AAAA-MM-JJ&a=&b=` que copie le bouton dédié : au retour ou à l'ouverture du lien, le compteur s'affiche tout seul, sans adresse de résultat ni défilement (`silencieux`), le lien l'emportant sur la mémoire. La racine `#cc-outil` est dans `RACINES_MOTEUR` (quiz-extras.js) et la carte porte `quiz-result-card`. Les styles propres sont les `.cc-*` en fin de styles.css ; comme le compteur peut être déjà affiché au chargement (retour ou lien), les règles du résultat (`.cc-*`, `.dn-verdict`, `.dn-bloc`) sont ajoutées à la main en fin de `css/critique/compteurCouple.css` après chaque `npm run critique`, la couverture ne les voyant pas. Aucun encart produit (les outils hors moteur n'en affichent pas).
- `quiz-tu-preferes.ejs` — Inline `WYRGame` (not part of quiz-loader): 15 or 30 dilemmas, two modes chosen on the setup screen and kept across replays. « Chacun son tour » (`mode='tour'`, default): both players answer on the same phone, relay banner between them, reveal after each dilemma, agreement rate at the end. « Ensemble » (`mode='ensemble'`): one answer per dilemma decided by the couple, no names, no relay, no reveal, result lists the choices with the letter picked. The setup accroche is « Tu préfères ? » (`UI.accroche`); `UI.or` is only the medallion between the two options.

### Mode à distance (`salon.js`)

Par défaut, un test à deux se joue sur un seul téléphone qu'on se passe. Les
configurations qui déclarent `distance: true` dans `quiz-loader.js` affichent
en plus un interrupteur « Activer le mode à distance » sur l'écran des
prénoms. Aujourd'hui : tester-couple en duo, common-points, compatibilite,
amoureux (`DuoMatchQuiz`), couple sain (`HealthyQuiz`), parentalité court et
complet et emménager (`ParentaliteQuiz`), âme sœur en duo (`PiliersQuiz`),
charge mentale en duo (`ChargeMentaleQuiz`), je n'ai jamais (`JamaisGame`),
qui de nous deux (`DuoVoteGame`, vote secret) et qui pourrait
(`QuiPourraitGame`). Une personne crée la partie (code + QR code + lien
`?salon=CODE`), l'autre rejoint, et les deux avancent question par question :
chacun répond sur son écran, attend l'autre, les deux réponses s'affichent
côte à côte sur la question (pour en parler), puis on ne passe à la suivante
que quand les deux ont appuyé sur « Suivant ». Le résultat se calcule à
l'identique des deux côtés. Quitter (bandeau) ou « Changer de mode » demande
confirmation et annule pour les deux.

- Aucune table en base : un salon est un canal Supabase Realtime (diffusion +
  présence) nommé d'après le code, vivant tant que quelqu'un y est abonné.
- `salon.js`, `supabase-js` (CDN) et `js/vendor/qrcode.js` ne sont chargés
  qu'à l'activation ou à l'arrivée par un lien : la page ordinaire ne change pas.
- Tout message reçu est contrôlé (version, rôle, type, tailles) avant
  d'atteindre un moteur ; les prénoms passent par `esc()` au rendu. Les
  identifiants de questions envoyés au départ doivent être des nombres.
- Le tour par tour est écrit une seule fois, dans `TourParTour`
  (quiz-engine-core.js). Pour ajouter un moteur : poser `distance: true` dans
  sa configuration, faire passer `optionsDistance(cfg, pool)` au constructeur
  (chargeur), appeler `reprendrePartieRejointe(this, config)` dans le
  constructeur, poser `zoneDistancePour(this, { formulaire, bouton, meta })`
  sur l'écran des prénoms, et écrire `demarrerADistance(salon, moi, moiInfo,
  partenaireInfo)` qui construit un `TourParTour` avec `question(idx)` (texte
  et options `{ id, texte }`) et `surFin(a, b)` (ranger les deux séries puis
  afficher le résultat). Un moteur qui tire ses questions autrement fournit
  `idsDepart()` et `appliquerTirage(ids)`. `HealthyQuiz.demarrerADistance` est
  le modèle le plus court.
- Mesure : `salon.js` émet `qc:salon` (`depart`, `fin`) que `quiz-extras.js`
  enregistre dans `salon_parties` (migration `20260906120000`), deux lignes par
  partie comme il y a deux lancés ; l'admin a un onglet À distance
  (`PAGES_DISTANCE` dans admin.js liste les pages) dont toutes les mesures
  partent du 7 septembre 2026 (`DEBUT_DISTANCE`), premier jour du mode, avec
  la courbe quotidienne servie par `get_salon_daily` (migration
  `20260906180000`) ; l'origine des visites compte les arrivées par lien ou QR
  code en « Mode DUO ».
- Les essais sans réseau passent par `window.__QCSalonTransport`, une doublure
  du canal sur `BroadcastChannel` (voir la PR d'origine).

## UI/UX Design Guidelines

### Visual Identity
- **Primary color**: hsl(340, 65%, 65%) — Rose/pink
- **Secondary color**: hsl(270, 40%, 50%) — Purple
- **Font stack**: Inter (body), Poppins (headings)
- **Border radius**: 1rem (--radius)
- **Dark mode**: Supported via `.dark` class + CSS variables

### Design Principles
- Modern, clean, rounded aesthetic
- Cards with subtle borders and hover effects
- Gradient backgrounds for hero sections
- Smooth transitions and subtle animations
- Mobile-first responsive design
- Accessible (ARIA labels, semantic HTML, contrast ratios)

### Component Patterns
- `.btn .btn-cta` — Primary call-to-action button
- `.btn .btn-outline` — Secondary outline button
- `.card` — Standard card container
- `.hero-*` — Homepage hero section
- `.quiz-engine` — Quiz container
- `.blog-*` — Blog article styles
- `.nav-*` — Navigation components

### When Improving UI/UX
1. Always preview in browser before reporting done
2. Test both light and dark modes
3. Verify mobile responsiveness (360px minimum)
4. Maintain consistent spacing (4px grid: 0.25rem, 0.5rem, 1rem, 1.5rem, 2rem)
5. Use existing CSS variables, don't hardcode colors
6. Keep animations subtle (150-300ms transitions)
7. Don't break existing quiz engine functionality

## Tonalité de rédaction : écrire comme un humain

Le contenu éditorial doit sonner comme une personne qui explique le jeu à un
ami, pas comme un rédacteur qui cisèle ses phrases. Le style « bien écrit »
(formules, rythme, chutes) est précisément ce que Google repère comme un
marqueur IA. Le naturel bat le brillant, dans les cinq langues.

### L'exemple de référence, validé par Thomas

Version bannie (marqueurs IA partout) :

> La règle tient en une phrase : une affirmation commence par « Je n'ai
> jamais », et chacun avoue si, en vrai, il l'a déjà fait. Pas de bonne
> réponse, pas de points à marquer. Ce qui fait le jeu, c'est ce que la
> réponse déclenche : la tête de l'autre, la question « attends, quand ça ? »,
> et l'histoire qui arrive derrière.

Version humaine (à imiter) :

> Le « Je n'ai jamais » est un jeu qu'on peut faire entre amis ou en couple.
> C'est un jeu très simple qui consiste à être confronté à des situations, et
> à simplement dire si « j'ai déjà » ou si « je n'ai jamais », justement.
> Par exemple : « Je n'ai jamais été à un mariage ».
>
> Si vous répondez « j'ai », c'est que vous avez déjà été à un mariage, si
> vous répondez « je n'ai jamais », c'est que vous n'y avez jamais été. C'est
> tout simple, mais la plupart du temps ça ouvre au débat, rappelle des
> souvenirs et permet de passer un très bon moment à deux !

### Ce qui fait la différence

- **Commencer par dire ce que c'est, platement :** « X est un jeu qu'on peut
  faire entre amis ou en couple. » Sujet, verbe, complément.
- **Un exemple concret tout de suite :** « Par exemple : ... », puis dérouler
  l'évidence sans peur de la redondance : « Si vous répondez X, c'est que...
  Si vous répondez Y, c'est que... ». On ne laisse rien à déduire au lecteur.
- **Répondre d'abord :** une section « différence » commence par « La
  principale différence réside dans les questions. », pas par un effet de
  style.
- **Les mots de l'oral :** « justement », « d'ailleurs », « du coup », « la
  plupart du temps », « ou encore », « etc. », « ça ». Écrire « ça » plutôt
  que « cela », « on » plutôt que des tournures impersonnelles.
- **Annoncer ce qui vient :** « Voici comment fonctionne notre moteur de jeu
  ci-dessus : ».
- **Des exemples en série, entre guillemets,** reliés par « ou encore » et
  fermés par « etc. » quand la liste pourrait continuer.
- **Une pointe d'enthousiasme simple** est bienvenue : « ...et permet de
  passer un très bon moment à deux ! »
- **De la ponctuation vivante, demandée par Thomas :** un ou deux « ! » en
  fin de phrase par page, là où l'enthousiasme est sincère, et quelques
  « ... » quand une phrase reste en suspens (« Toi, parce que la dernière
  fois au restaurant... »). Ça rend la lecture vivante. À petite dose : une
  page qui en est tapissée redevient un tic. La règle vaut dans les cinq
  langues, avec la typographie de chacune (espace avant le « ! » en
  français, « ¡...! » en espagnol).

### Les mots interdits dans les titres

JAMAIS, dans un title, un H1, un H2 ou un H3 : « vraiment », « concrètement »,
« en bref », « au fait », ni leurs équivalents dans les autres langues (really, actually,
in short ; realmente, de verdad, concretamente, en resumen ; wirklich,
konkret gesagt, kurz gesagt ; davvero, veramente, concretamente, in breve).
Ce sont des chevilles : un titre qui en a besoin est un titre mal posé.
On reformule ou on retire le mot, dans la langue du titre.

### Ce qu'une introduction ne fait jamais

Une introduction entre dans le sujet. Elle ne fait ni l'un ni l'autre de ces
deux détours, qui sont des marqueurs IA immédiats :

- **Taper sur ce qui existe ailleurs :** « le problème des listes qu'on trouve
  partout », « la plupart des articles se contentent de… », « contrairement à
  ce qu'on lit souvent ». Le lecteur n'est pas venu lire une critique de la
  concurrence. On montre qu'on fait mieux en le faisant, pas en le disant.
- **Expliquer comment l'article est construit :** « il y a ici 60 citations :
  13 signées et 47 écrites par nous, rangées selon… », « voici comment lire ce
  qui suit », « la première partie traite de… ». Le plan se voit dans les
  titres. Personne ne lit le mode d'emploi d'un article.

Une bonne introduction dit de quoi on parle, donne le contexte d'usage, puis
annonce le contenu en une phrase simple : « Voici 60 des meilleures citations
sur l'âme sœur, celles qu'on a trouvées et celles qu'on a écrites. » Et on
attaque.

### La fausse modestie et la vertu affichée

Se mettre en scène en train de bien faire est un marqueur IA aussi net que les
autres. Interdit :

> « Elles ne portent pas de nom d'auteur, et c'est volontaire : on préfère ne
> rien signer plutôt que d'inventer une signature. »

> « On a vérifié d'où elles viennent, parce que la moitié du web les attribue
> à côté. »

Le travail bien fait se constate, il ne se commente pas. Si une information
mérite d'être donnée (une source, une nuance), on la donne platement, sans
souligner le mérite qu'on a eu à la chercher.

### Les phrases elliptiques qui ne veulent rien dire

Une phrase courte et rythmée n'est pas une phrase claire. Interdit :

> « L'âme sœur, elle, construit. »

Construit quoi ? Personne ne parle comme ça. Chaque phrase doit pouvoir être
lue à voix haute par quelqu'un qui ne connaît pas le sujet et être comprise du
premier coup. Le verbe a un complément, le pronom a un référent, et l'incise
de style (« elle, », « lui, ») disparaît.

### Les marqueurs IA interdits

- « tient en une phrase », « tient en un mot », « tiennent en quelques
  lignes » et toute la famille, dans toutes les langues.
- Les fragments sans verbe enchaînés : « Pas de bonne réponse, pas de points
  à marquer. »
- Les triades rythmées : « la tête de l'autre, la question..., et l'histoire
  qui arrive derrière ».
- Les renversements d'aphorisme : « Ce qui change, ce ne sont pas les
  règles : ce sont les questions. »
- Les deux-points rhétoriques en cascade et les chutes de paragraphe
  travaillées.

La règle vaut pour tout nouveau contenu et pour toute réécriture, dans les
cinq langues : on transpose le ton, pas seulement les mots.

### Varier les tournures : la réserve de formulations

Un texte se repère comme écrit par une machine autant à ses tics qu'à ses
fautes. Toujours ouvrir par le même connecteur, enchaîner des phrases de même
longueur, conclure chaque paragraphe en reformulant le précédent : c'est ça qui
sonne faux, avant même le vocabulaire.

D'où cette réserve de formulations, à consulter avant et pendant la rédaction.
**Ce n'est pas une liste à cocher.** On n'y pioche que lorsqu'une expression
tombe juste dans la phrase qu'on est en train d'écrire. Reformuler une phrase
correcte pour réussir à y caser un mot de la liste est pire que de ne pas
l'utiliser : ça se voit, et ça abîme le texte.

Elle sert surtout à éviter l'automatisme. Si « Il est important de noter que »
revient dans trois articles, on change, et la liste dit par quoi.

- avantageux, sublime, c'est une manière de, en l'occurrence, par rapport au
  fait que, dans la plupart des cas, quelque chose de
- à vrai dire, à première vue, dans les faits, dans le fond, au passage, à ce
  propos, de ce côté-là, d'un côté comme de l'autre, dans une certaine mesure,
  à bien y réfléchir, en quelque sorte, pour ainsi dire
- à défaut de, faute de, quitte à, histoire de, question de, rien que pour, ne
  serait-ce que, tout simplement, mine de rien, au bout du compte, au final
- entre autres, de loin, de près, à ce niveau-là, sur ce point-là, de ce point
  de vue, dans ce cas précis, dans le cas présent, à ce stade, pour le coup,
  dans la réalité, à l'inverse, à l'opposé, tant qu'à faire
- autant dire que, il faut dire que, il faut bien reconnaître que, on peut
  difficilement nier que, force est de constater que, encore faut-il que,
  reste à savoir si
- tout dépend de, ça dépend surtout de, selon les cas, selon les situations,
  suivant les cas, dans bien des cas, la plupart du temps
- une bonne partie de, une petite partie de, pas mal de, un certain nombre de,
  une poignée de, une multitude de
- pas forcément, pas nécessairement, pas toujours, pas vraiment, plus ou moins,
  plus d'une fois, à plusieurs reprises
- ce qui est intéressant, c'est que… / le problème, c'est que… / le truc, c'est
  que… / ce n'est pas forcément évident au premier abord / on pourrait penser
  que… / à première vue, on aurait tendance à… / en réalité, c'est un peu plus
  compliqué / ça paraît simple, mais… / c'est là que ça devient intéressant
- le plus simple reste de…, pour faire simple…, pour prendre un exemple
  concret…, disons que…, autrement dit…, en clair…, pour le dire autrement…,
  si on regarde les choses autrement…
- ça change pas mal de choses, ça peut faire une vraie différence, ça reste
  quand même…, ce n'est pas rien, ce n'est pas forcément le meilleur choix,
  ça vaut le coup de…, ça peut valoir le détour, à chacun de voir
- c'est surtout une question de…, tout est une question de…, il y a quand même
  un point à garder en tête, il y a un petit détail qui change tout, c'est
  justement là que…, c'est souvent à ce moment-là que…

Et on évite systématiquement la formulation la plus élégante ou la plus
académique quand une tournure simple, voire un peu familière, colle mieux au
ton de la page.

### Varier aussi la construction

Le vocabulaire ne suffit pas. Ce qui trahit une machine, c'est le moule. À
proscrire :

- les suites de phrases de longueur identique ;
- les listes de trois éléments qui reviennent à chaque section ;
- les paragraphes bâtis tous pareil, et les conclusions qui reformulent
  mécaniquement ce qui précède ;
- les oppositions en « ce n'est pas X, c'est Y » utilisées en boucle ;
- les mêmes connecteurs en tête de phrase d'un bout à l'autre.

Une phrase courte a le droit de suivre une phrase longue. Une transition a le
droit d'être directe. Un paragraphe a le droit de commencer sans connecteur.

Ces deux sections valent pour tous les contenus à venir, pas seulement pour
ceux du jour, et dans les cinq langues : on transpose l'intention, on ne
traduit pas la liste mot à mot.

## Maillage interne : les règles

Les ancres contextuelles et descriptives sont les liens les plus puissants du
site. Elles renforcent la sémantique de la page cible et ne sont pas du spam.
Ce ne sont **pas** des ancres du type « notre test sur X », ni le titre exact de
la page cible collé dans une phrase.

### La méthode, dans cet ordre

1. **Le contenu d'abord.** On écrit la page comme si aucun lien n'existait.
2. **Ensuite seulement, on relit** en cherchant les endroits où une formulation
   déjà présente mène naturellement vers une autre page.
3. **Si vraiment aucun endroit ne s'y prête, on reformule** un passage pour
   qu'un lien y ait sa place. Une page créée doit porter **au minimum 2 liens
   internes sortants en plein texte**, en plus du bloc de renvoi et de la
   colonne latérale, qui ne comptent pas.

### L'ancre se trouve dans le texte, elle ne s'invente pas

On relit le paragraphe et on cherche la formulation qui est **déjà écrite** et
qui mène vers la cible. On ne fabrique pas une formule vague à la fin de la
phrase pour y accrocher le lien.

Exemple réel, sur un paragraphe qui se termine par « …ce n'est plus une âme
sœur, c'est de la fusion » :

```
✗  …suffisent à <a>savoir de quel côté penche votre histoire</a>.   (inventé, vague)
✓  …<a>ce n'est plus une âme sœur</a>, c'est de la fusion.          (déjà là, précis)
```

### Ce qui fait une bonne ancre

- Elle est **contextuelle** : la phrase autour du lien parle déjà du sujet de la
  page cible.
- Elle est **descriptive** : elle décrit ce qu'on va trouver, pas le nom du test.
- **Le terme exact de la page cible n'a pas à être employé.** C'est même mieux
  quand il ne l'est pas : le lien reste naturel et apporte du vocabulaire
  nouveau à la cible.
- Elle est **naturelle** : on doit pouvoir lire la phrase à voix haute sans
  deviner qu'un lien y a été posé.

Exemples réels, tous validés :

| Ancre | Cible |
|---|---|
| « Quand un couple se dispute » | test couple toxique |
| « la preuve que rien n'est fini » | test est-ce la fin de mon couple |
| « garder une porte entrouverte » | test m'aime-t-il en secret |
| « dès les premiers mois de vie commune » | test emménager ensemble |
| « deux adultes qui vivent ensemble » | test couple sain |
| « y penser avant que ce soit fait » | test charge mentale |

### À vérifier avant de dire que c'est fait

- Chaque nouvelle page a au moins 2 sortants en plein texte **et** au moins
  1 entrant éditorial venu d'une autre page.
- Le maillage est répercuté **à l'identique dans les cinq langues**, avec une
  ancre écrite dans la langue de la page, jamais traduite mot à mot du français.
- Les liens sont écrits en dur dans les fichiers `{lang}/quiz-*.json`, avec
  l'URL préfixée par la langue hors FR (`/en/…`, `/es/…`, `/de/…`, `/it/…`).
- Aucun lien mort : passer le contrôle sur `dist/` après construction.

## Le frein sur les mauvaises notes

Une note de quatre ou cinq étoiles arrive presque toujours avec un mot. Une
note de trois ou moins arrive presque toujours toute seule : c'est quelqu'un
qui n'a pas eu le score qu'il espérait et qui repart. **À trois étoiles ou
moins, le message devient obligatoire, avec 90 caractères au minimum.**

Le champ passe alors de deux à quatre lignes, son texte d'invite perd le
« (optionnel) », et un décompte s'affiche dessous, rouge tant que la longueur
n'est pas faite, vert une fois atteinte. L'envoi est refusé en dessous.

Les seuils sont `AVIS_MIN_NOTE` et `AVIS_MIN_SIGNES`. Ils sont écrits **deux
fois**, parce que le site a deux formulaires d'avis qui ne se chargent pas
toujours ensemble : celui du bas de page (`initReviews`, quiz-extras.js) et
celui de l'écran de résultat (`pcReviewForm`, quiz-engine-core.js). Une
modification dans l'un en appelle une dans l'autre. Le contrôle est côté
navigateur : il freine, il ne verrouille pas. Les avis partent de toute façon
en `is_approved: false` et passent par la modération.

La clé publique ne lit pas la colonne `ip_address` de `reviews` (migration
`20261006120000_avis_ip_privee.sql`) : le site demande ses colonnes une à
une, jamais `select=*` (refusé), et la question « cette adresse a-t-elle déjà
laissé un avis ? » passe par la fonction `avis_deja_depose(p_ip)`, qui répond
oui ou non. Un dépôt public avec `is_approved: true` est refusé par la règle
d'insertion. L'admin lit tout par la fonction serveur `admin-reviews`.

## Typographie des listes à puces

Une puce qui commence par un intitulé en gras se termine par **deux points**,
jamais par un point. La puce porte déjà la marque de la liste : mettre un point
après l'intitulé donne une phrase coupée en deux, et le lecteur bute dessus.

```
✗  • <strong>Répondre « pareil ».</strong> C'est le seul vrai interdit du jeu.
✓  • <strong>Répondre « pareil » :</strong> C'est le seul vrai interdit du jeu.
```

L'espace avant les deux points suit la langue : `« titre : »` en français,
`"title:"` en anglais, en espagnol, en allemand et en italien.

La règle vaut pour tout intitulé en gras qui annonce ce qui suit, y compris
quand il porte un lien : les deux points se posent **après** la balise de lien,
à l'intérieur du gras.

Elle ne vaut pas pour une phrase entière mise en gras au milieu d'un texte,
qui garde sa ponctuation normale.

## Avant de dire qu'un quiz est vérifié

Simuler le moteur en Node ne suffit pas : le chargeur (`quiz-loader.js`) fait
son propre travail entre les données et le moteur, et c'est là que sont passés
les deux seuls bugs livrés en production sur les nouvelles pages (un écran de
choix de mode sans texte, un test qui ne se chargeait pas).

**Ouvrir chaque nouvelle page dans Chromium et jouer une partie entière**, dans
les cinq langues et dans chaque mode : écran de choix, saisie des prénoms, les
questions, l'écran de résultat. Vérifier au passage qu'aucune erreur ne sort
dans la console et qu'aucun libellé n'est vide.
