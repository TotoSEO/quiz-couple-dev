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
- `static-site/templates/partials/related-tests.ejs` — Related tests internal linking. Depuis le 12 octobre 2026 (Thomas : « c'est moche, très moche »), deux rangées de cartes à image de même hauteur, sous l'en-tête des sections de l'accueil (`.bloc-entete`) : les pages à faire ensuite (`.suite-*` : image de tête, pastille emoji, famille en couleur et en étiquette d'après `FAMILLES_NAV`, libellé `nav.<clé>`, phrase de carte de l'accueil, bouton Faire le test / Faire le quiz / Jouer / Essayer ; le sous-titre dit « ces tests », « ces quiz », « ces jeux » ou « d'autres idées » selon ce qui est proposé) puis les articles liés (`.lire-*` : image à la une, titre de l'article, temps de lecture et « Lu N fois », bouton « Lire l'article » ; données par `carteArticle` dans generate.js). Quatre colonnes au-dessus de 1024 px, deux au-dessous ; sur téléphone deux cartes de pages par rangée sans description, et les articles en bande qui défile de côté (78 % de largeur). Les `sizes` des images sont relevés dans Chromium, à refaire si la grille change. La section garde la classe `related-tests-section`, masquée à l'écran de résultat.
- `static-site/js/quiz-engine-core.js` — Quiz engine (SoloTest, DuoMatch, Coquin, etc.)
- `static-site/js/quiz-loader.js` — Quiz config & initialization
- `static-site/build/moteurs.js` : découpe de quiz-engine-core.js en un paquet par moteur (`moteur-socle.js` + `moteur-<nom>.js`, 190 Ko en moyenne au lieu de 570). Tout moteur nommé dans quiz-loader.js (`engine: '...'`) doit figurer dans `TABLE_MOTEURS` avec son constructeur : sinon le build écrit « table incomplete ... pas de decoupage » et TOUTES les pages reçoivent le fichier entier. C'est arrivé du 5 septembre au 7 octobre 2026, le jeu des phrases à compléter n'y avait pas été déclaré. Un moteur s'écrit `  function NomQuiz(config) {` puis `  NomQuiz.prototype.x = ...`, sans fonction libre entre deux moteurs.
- `reseaux/charte/mascottes.js`, servi en `/js/mascottes.js` : **les mascottes dans les moteurs** (8 octobre 2026). Le build copie le fichier de la charte tel quel (`generate.js`, avant la minification) et pose sa balise juste avant celle du moteur sur toute page qui charge `quiz-engine-core.js` (`ajouteLesMascottes`) : 4 Ko compressés, trouvés au premier rendu puisque les scripts différés s'exécutent dans l'ordre. Dans quiz-engine-core.js, la couche `mascottesDispo`, `mascotteDe`, `mascotteSvg`, `badgeDepart`, `feteAutour`, `mascottesSurLaBarre` vit dans le socle, avant `relaisJoueur` ; sans le module, chaque écran garde sa forme d'avant. Règle du personnage, demandée par Thomas : femme → rose, homme → violet partout où le genre est demandé (tests à deux, mode à distance via `persosDe(moteur.players)` dans `TourParTour`), sinon joueur 1 rose et joueur 2 violet (`mascotteDe`), et la rose seule pour un test solo. Écran de départ : le duo (rose `salut`, violet `mignon`, les deux `amoureux` sur le quiz coquin) remplace le badge à emoji (`badgeDepart` ; les tailles sont écrites dans la balise SVG pour être justes avant même la feuille de style). Barre de progression : une voie de 40 px au-dessus de la barre, sous les pastilles ; le perso de celui qui joue y marche jusqu'à sa progression (deux dessins de jambes qui alternent en chemin, glissement sur `left` d'une question à l'autre grâce à la position gardée dans `_marcheurPct`), l'autre attend au bout (`persosBarre`). Résultat : les deux persos de part et d'autre du grand anneau (`renderScoreRing` passe par `feteAutour`, jamais le petit anneau), cinq sauts puis immobiles, tailles en `clamp()` pour tenir dans la carte dès 320 px. Relais « À X de répondre ! » : le perso surgit au coin bas droit de la carte (`opts.perso`). Tout bouge en transform et opacity, et `prefers-reduced-motion` coupe tout.
- Plateau (`BoardGame`, revu le 8 octobre 2026) : les pions sont les deux mascottes en figurine sur un socle (`figurine` ; le genre est demandé, sans obligation, sur l'écran des prénoms par `cartesDeuxJoueurs(id, { genre: true })`), elles avancent ou reculent case par case (`animerFigurine`, un pas de 210 ms, pose `profil` tournée dans le sens de la marche, `affiche` rattrape `pos`), sur un chemin tracé sous les cases, désormais opaques (`placerPions` mesure tout puis écrit tout, polyline comprise). Règles : la case chance ne fait plus jamais reculer ni échanger les pions (`PLATEAU_CHANCES` : une, deux ou trois cases, rejouer, rattraper l'autre quand on est derrière, sinon deux cases) ; un avis à une étoile venait d'un échange de pions qui renvoyait six cases en arrière. Plus aucun gage imposé : les quatre cases gage sont devenues `choix` (« Action ou vérité » : le joueur choisit vérité ou défi, puis relevé j'avance, je passe je recule), et à l'arrivée le perdant choisit sa dernière carte au lieu de tirer un gage. Textes : `plateau.*` de gd.json (`type_choix`, `chance_avance1`, `chance_rattrape`), de quizGames.json (`choixTitre`, `choixDesc`, `finChoix`, `finChoixDesc`), `{lang}/jeu-plateau.json` (cases, règles, FAQ) ; le chargeur ne demande plus `gageRoue`.
- `static-site/js/salon.js` — Mode à distance (chacun sur son téléphone) : codes de partie, QR code, présence, chargé à la demande ; le moteur commun l'appelle via `QuizEngine.chargerSalon`
- `reseaux/studio/src/baton/` : **le bonhomme bâton**, format « me in my dreams with u » (idée de Thomas, 15 octobre 2026 : un seul reel avait percé, « la stratégie c'est de poster un maximum... mais si on peut maximiser cette statistique c'est mieux »). Un héros au corps de traits et à la tête ronde, bandana violet, qui bouge comme un ninja (mouvements fluides, parcours, ralentis quand c'est épique), des mini-aventures de 10 à 20 s en noir et blanc où seuls les éléments importants sont en couleur ; rien à voir avec la DA des mascottes, et le programme de publication n'a pas été touché. Gabarit `baton` : `rig.ts` (squelette articulé en degrés, 27 poses, fondu entre poses, course procédurale, 15 expressions, épée électrique, bouquet), `temps.ts` (étapes interpolées, actions procédurales, ralentis par remap du temps de récit, caméra avec cible tête/corps/pieds et secousses), `decors.ts` (six paysages, travelling à parallaxe, obstacles posés par l'instant où ils passent sous le héros), `creatures.ts` (le dragon, qui emporte un personnage et explose), `effets.ts`, `Scene.tsx` (rémanences, traînée de lame), `gabarits/Baton.tsx` (flash, voile de ralenti, lignes de vitesse, titre Shantell Sans), `plan.ts` (durées à l'écran, bruitages déduits). Bruitages synthétisés sans bibliothèque ni voix (`scripts/synthese-sons.mjs`, `public/sons/sy-*.mp3` commités, manifeste `synthese.json` lu par Son.tsx). Le premier reel, le dragon, est `recettes/exemples/baton-dragon.json` et son découpage technique `baton-dragon.md` : c'est le niveau de détail attendu d'un brief (cadrages, caméra, gestes à la seconde, sons). Contrôle `automates/lib/baton.mjs` (vocabulaire `src/baton/vocabulaire.json`, description de 120 signes au moins par plan, 10 à 22 s à l'écran, ralentis bornés, deux mouvements de caméra par reel). Pas encore de catégorie dans la grille ni de banque de sujets : la production attend le feu vert de Thomas sur ce premier reel.
- `reseaux/mipaps/` : le second compte Instagram, « Les mipaps » (français, fond blanc, aucun lien avec le site), en place depuis le 8 octobre 2026. `charte/gribouillou.mjs` dessine les deux personnages (le Gribouillou bleu, la Gribouillette rose à fleur ; Eli et Toh dans le lore seulement) en SVG : un rig paramétrique (86 expressions, 25 poses, 30 positions de mains, 80 objets, angle de rotation continu de face à de dos, chaque trait placé en trois dimensions sur le corps, cycle de marche par `foulee`, bras de course sur les poses qui courent, visage qui reste lisible de profil), `charte/scenes.mjs` les scènes à deux et les meubles en perspective, `charte/planches.mjs` le canevas de design (https://claude.ai/artifact/DYX3xFtQBrV4jDUerw8LDH). Règles de DA dans `charte/README.md`, analyse de story.sketchers, nub et bom.seeat et banque d'idées dans `REFERENCES.md`. **Quatre formats, pas de BD** (Thomas) : le studio les rend dans `reseaux/studio/src/mipaps/` (`mipaps-reel` animé par étapes interpolées, où l'angle tient jusqu'à l'étape qui précède son écriture et où un perso ne se tourne jamais en courant : fin de course, arrêt de 0,2 s, puis un petit saut pour se tourner, `rotation` dans `mouvement.ts` ; `mipaps-statique`, `mipaps-carrousel` l'histoire page par page, `mipaps-post` mini, déclaration ou schéma de bureau ; Shantell Sans, cadre automatique sur ce qui est dessiné, bruitages sans aucune voix : rires, pleurs et cris retirés à la demande de Thomas). Le contrôle des recettes est `reseaux/automates/lib/mipaps.mjs` (chaque nom vérifié contre le rig). Le compte est la langue `fr` des tables `social_*` (migration `20261009110000` : posts et idées portent leur langue, unicité (langue, jour, créneau), colonne `melange` par compte, l'accueil du site ne lit que `en`) ; semaine type `MELANGE_MIPAPS` (matin reel animé, midi post, soir histoire ou statique en alternance). L'atelier est `reseaux/mipaps/atelier/` (LIGNE-EDITORIALE, CONSIGNES, `sujets.json`, `exemple-post.json`) ; ses posts vivent sur la branche `mipaps-atelier` (`reseaux/mipaps/atelier/posts/`), lue par social-rendu.yml à côté de `reseaux-atelier`, l'entretien y dépose `etat.json` (`--etat-fr`), et la routine Claude « atelier mipaps » tourne à 6 h 12 (heure de Paris) dans sa propre session permanente. L'onglet Réseaux de l'admin a une barre de comptes (Quiz Couple, Les mipaps) et deux vues (planning en grille serrée, dix jours sans défiler ; publiés à part, lus à la demande), avec mémoire de session par compte. `controler.mjs` reconnaît un post des mipaps à son chemin (`/mipaps/`) et lui applique le même contrôle de style que Quiz Couple (`lib/style.mjs`, appels et fins en français).
- `static-site/css/styles.css` — Main stylesheet
- `static-site/templates/pages/admin.ejs`, `static-site/js/admin.js`, `static-site/css/admin.css` — Tableau de bord d'administration (`/admin/`) : coquille plein écran à barre latérale, tuiles, grands graphiques sur canvas, lectures RPC mises en mémoire de session (bouton « Actualiser »), par la fonction serveur `admin-stats` depuis le 11 octobre 2026 (voir « Sécurité de la base »). L'onglet ouvert à la connexion est Trafic, premier du menu : `currentTab` dans admin.js, la classe `active` et le panneau visible dans le gabarit disent la même chose. Ses deux premières tuiles portent l'écart avec la période précédente (hier en vue du jour, les sept jours d'avant en vue à sept jours), calculé sur la série quotidienne déjà chargée pour la courbe ; au-delà elle ne remonte pas assez loin et l'étiquette disparaît. La courbe montre au moins quatorze jours : « · 14 j » s'écrit dans la légende, dont les sommes couvrent toute la courbe (`suffixeCourbe`), jamais dans la bulle d'un jour, qui l'affichait devant le chiffre d'une seule journée jusqu'au 12 octobre 2026. Les identifiants du gabarit sont le contrat du script, on ne les renomme pas ; base.ejs n'y met ni en-tête ni pied de page. Un lien « Retour au site » mène à l'accueil de la langue de la page, sous le bouton de connexion et en bas de la barre latérale (réduit à son icône sous 960 px). Au-dessus de lui, le bouton « Exporter » (`exporterTout`, admin.js, 7 octobre 2026) télécharge un JSON de tout ce que l'admin sait sur trente jours (parties finies et lancements par test, trafic par jour, page et source, blog, mode à distance, clics Instagram), en relisant la mémoire de session : Thomas l'envoie pour analyse, le fichier dit lui-même comment se lire, et une fonction absente y laisse son erreur. Le bouton de déploiement manuel a été retiré le 7 octobre 2026, avec la fonction `trigger-deploy` et les secrets `GITHUB_DEPLOY_TOKEN`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME` (une étape de deploy-functions.yml les efface de Supabase) : le site se publie au push sur main et aux reconstructions programmées (scheduled-rebuild.yml), et le bouton « Run workflow » de GitHub Actions reste là pour relancer un build à la main. Le même jour, l'onglet Blog a disparu (Thomas n'avait pas l'usage du classement « Les articles les plus lus ») : la courbe des clics « source préférée » Google a rejoint la fin de l'onglet Trafic, suit sa période et se charge avec ses six agrégats (ids `blog-sourcepref-*` gardés, le script en dépend) ; la fonction `get_blog_articles` et ses deux aides sont retirées de la base par la migration `20261008170000`, le compteur de lectures sous le titre d'un article (`blog-lectures.js`, table `article_lectures`) reste. L'ancien éditeur d'articles de l'admin (fonctions `admin-blog` et `blog-og`, `SEED_ARTICLES` injecté au build) n'avait plus aucun écran dans le gabarit depuis que le blog vit dans le dépôt : son code a été retiré, et deploy-functions.yml supprime les deux fonctions chez Supabase. Mesure : les onglets sont Trafic, Parties et À distance ; l'onglet À distance lit les comptes par page par `chargeSalonParPage`, qui se replie sur `get_salon_counts()` (sans borne de date, la table n'existant que depuis la mise en service du mode) quand `get_salon_counts_depuis` ne répond pas : le 7 octobre 2026 elle dépassait les trois secondes du rôle anon (erreur 57014) et l'onglet restait vide ; la migration `20261008160000_salon_rapide.sql` la rend rapide (borne indexable, et `trafic_fuseau` valide le fuseau en tentant la conversion au lieu de parcourir `pg_timezone_names`, pour toutes les fonctions de trafic).
- Onglet Avis de l'admin (12 octobre 2026, demandes de Thomas) : la liste se lit par pages de dix (`AVIS_PAR_PAGE`, bouton « Charger plus d'avis », page suivante = avis plus anciens que le dernier affiché), le filtre se fait côté serveur et les chiffres du haut (total, en attente, approuvés, note moyenne des approuvés) viennent de `resume`, sept comptages qui ne lisent aucun avis ; avant, chaque connexion et chaque action relisaient tous les avis, IP et commentaires compris. `admin-reviews` sans `limite` rend toujours tout (un admin resté ouvert sur l'ancienne version), et admin.js découpe lui-même la réponse de l'ancienne fonction (`pageLocale`). Supprimer se confirme d'un second clic sur le même bouton, dans la carte (« Confirmer la suppression » pendant cinq secondes ; un second clic à moins de 0,4 s, un double clic, ne compte pas) : `confirm()` pouvait ne rien afficher (boîtes de dialogue bloquées après plusieurs à la suite, navigateur intégré d'une application) et répondait alors non sans rien dire, et une réponse refusée par le serveur était ignorée, d'où des suppressions qui ne marchaient « qu'une fois sur deux ». Chaque action désactive les boutons de sa carte, est retentée une fois sur erreur réseau ou serveur, puis écrit son échec dans la carte (`adm-carte-msg`) ; la messagerie suit la même règle, sans `confirm()` ni `alert()`. Sous la liste, « Pages les plus notées » : les vingt pages qui ont le plus d'avis approuvés, hors accueil, toutes langues confondues, « N avis » et « N,N/5 ⭐ » (`admin_avis_par_test`, migration `20261012160000_avis_par_test.sql`, appliquée à la fusion par `avis-base.yml` après `20261012120000`, réservée à la clé de service ; l'ancien identifiant d'une page est replié sur le nouveau par `canon`). Une première version le rangeait par langue, avec un drapeau par ligne : la langue n'était pas enregistrée avant le 12 octobre 2026, et sur les vrais avis près d'un sur deux n'a ni commentaire ni autre indice pour la deviner, si bien que « Test de couple 🌐 99 avis » arrivait en tête. Thomas a tranché le jour même : les cinq versions d'une page sont le même test traduit, elles partagent leurs avis, et l'admin n'affiche plus aucune langue (ni drapeau sur les cartes, ni classement par langue). La colonne `reviews.lang` reste, remplie par les formulaires, sans être affichée.
- `static-site/js/audience.js`, `supabase/migrations/20260822120000_page_views.sql`, `supabase/migrations/20260929120000_trafic_agregats.sql` : mesure d'audience maison (une ligne par page vue dans `page_views`, 10 000 par jour fin septembre 2026). **Ce que les chiffres veulent dire** (relu le 7 octobre 2026 à la demande de Thomas) : une visite est un numéro tiré au hasard dans le navigateur, partagé entre les onglets par localStorage, renouvelé après trente minutes sans page vue ou six heures au total, jamais reconduit : « 5 600 visites le 6 octobre » = 5 600 numéros distincts ayant au moins une page vue ce jour-là, heure de Paris ; c'est une visite, pas une personne (trois passages dans la semaine font trois visites, deux téléphones en mode à distance font deux visites), et une visite à cheval sur minuit compte dans les deux journées. Ne sont pas comptés : les robots (`ROBOTS` sur le user agent, `navigator.webdriver`, donc aussi nos propres passages Playwright), les pages dans une iframe (régie, aperçus), `/admin/`, le propriétaire sur les navigateurs où le drapeau `qc-no-track` est posé (automatique à la connexion à l'admin, `?qc-notrack=1` ailleurs), les préchargements de Chrome, et depuis le 7 octobre 2026 toute page chargée dans un onglet caché tant qu'il n'est pas passé au premier plan (préchargement de Safari, onglet d'arrière-plan jamais lu). « Pages vues » compte aussi l'écran de résultat d'un test, enregistré sous `/<page>/resultat/` par resultat-url.js : les pages par visite et la part « une seule page » s'en ressentent, pas les visites. Ce qui manque plutôt que de gonfler : les navigateurs sans JavaScript ou sans stockage (alors chaque page devient une visite), et les envois perdus. Depuis le 29 septembre 2026, les lignes brutes ne sont gardées que 35 jours (`trafic_jours_bruts()`, une seule constante à changer) : une tâche pg_cron (`trafic-entretien`, 2 h 20 UTC, fonction `trafic_entretien()`) condense chaque journée close dans cinq tables `trafic_jour*` (résumé, pages, sources, profondeur, entonnoir, treize mois), puis purge le brut, jamais avant condensation. Les six `get_trafic_*` et `get_blog_articles` lisent les agrégats pour les jours clos et le brut pour la journée en cours, avec les mêmes signatures : admin.js n'a pas changé. Leur paramètre `p_tz` n'est plus lu, les journées sont découpées en Europe/Paris (`trafic_fuseau_agregats()`), et une visite à cheval sur minuit compte dans les deux journées, comme dans la série quotidienne. Le calcul brut vit dans les fonctions `trafic_brut_*` (intervalle `[debut, fin[`), une seule écriture pour la condensation et la lecture. Toutes les bornes de dates comparent `created_at` à un instant calculé une fois : la forme `(created_at AT TIME ZONE tz)::date > jour0` empêche l'index de servir et faisait relire toute la table à chaque appel, jusqu'au dépassement des trois secondes du rôle anon. Les migrations de ce dossier s'appliquent à la main dans Supabase > SQL Editor (le workflow deploy-db.yml n'en applique que quatre anciennes) ; elles sont idempotentes.
- `fr/*.json` — French translations (quizzes.json, common.json, home.json, gd.json, quiz-*.json)
- `static-site/templates/pages/custom-quiz.ejs`, `static-site/js/custom-quiz.js`, `supabase/functions/manage-custom-quiz/index.ts` : création de quiz personnalisés (`/creation-quiz-personnalise/`). Depuis septembre 2026, **privés seulement** : un quiz se partage par son lien et expire au bout d'une semaine. La création de quiz publics a été retirée partout (choix de visibilité, liste de la communauté sur la page et sur l'accueil, action `list_public` de la fonction serveur, qui force aussi `is_public` à false et ne sert plus un quiz encore marqué public). La table garde la colonne `is_public` ; le compteur du hero additionne les deux lignes de `custom_quiz_totaux`, les quiz publics d'autrefois comptent dans l'historique.
- `static-site/js/quiz-engine-core.js` (`PRODUITS`), `public/produits/` — Encarts produits affiliés des écrans de résultat. Chaque produit a une entrée par langue (`fr`, `en`, `es`, `de`, `it`) avec le lien d'affiliation de la place de marché correspondante : un tag français ne rapporte rien sur une vente allemande, et les tags sont par marché (`…de-21`, `…en-20`, `…es-21`, `…it-21`). Une langue absente n'affiche pas de carte, ce qui est le cas des trois partenaires Affilae, français seulement. Les visuels sont copiés chez nous en WebP carré de 600 px (`public/produits/<clé>-<langue>-<n>.webp`, copié par `copyStaticAssets`) plutôt qu'appelés sur le CDN d'Amazon. La note vient de la fiche, arrondie au dixième supérieur et écrite avec le séparateur décimal de la langue ; le nombre d'avis n'est pas affiché (il monte tous les jours) mais sert de garde-fou : sous cinq avis, aucune note ne s'affiche. `PRODUITS_PAR_TEST` dit quels produits vont sur quelle page, `PRODUITS_PAR_TEST_LANG` permet une sélection propre à une langue (l'anglais de `tester-couple`, première page du site, reçoit trois produits choisis au lieu du carrousel de six).
- `static-site/templates/partials/pub.ejs`, `static-site/js/pub.js` — Emplacements de la régie (The Moneytizer, site 142829) : 31 billboard sous le moteur, 2 pavé haut dans le texte après la première section, 15 interstitiel et 6 footer dans base.ejs, sur les pages de moteur seulement (`pagePublicitaire`). Jamais deux fois le même format sur une page. **État du 29 septembre 2026, rétabli le 7 octobre** : les scripts partent de pub.js au chargement complet de la page (`load`), chaque emplacement du flux est demandé à l'approche de l'écran (`MARGE`, une hauteur d'écran, 800 px) ; ceux qui tombent dans le premier écran, et le footer, attendent le premier défilement ; l'interstitiel ne part qu'au résultat, sur le geste de la personne (resultat-url.js), ou à l'arrivée depuis une autre page du site (referrer de même origine, `interstitielDeNavigation`), au plus un toutes les dix minutes (date du dernier dans localStorage sous `qc-interstitiel`, clé écrite dans les deux fichiers), jamais à l'arrivée depuis l'extérieur ni avec `?resultat` ou `?salon=` dans l'adresse ; un emplacement resté vide huit secondes se replie hors de l'écran (`.pub--vide`), jamais sous les yeux ; le footer est le seul format hors flux : son div (`.pub--6`, hauteur nulle) n'est qu'une ancre, la régie ajoute en fin de body un conteneur fixe collé en bas (`#sas_iframe_fixed_26328`, 728x90 sur ordinateur, 320x50 ou 320x100 sur téléphone) ou un slide-in 300x250 au bord droit (`…-1`) ; tout élément fixe de ce format qui dépasse 30 % de la hauteur de l'écran (standard Better Ads) reçoit `data-pub-trop-haut` et styles.css le masque, sauf un voile quasi plein écran (`estUnVoile` : le conteneur de l'interstitiel, unité 26755, porte le même préfixe et le masquer bloquait la page) ; tant qu'un bandeau est affiché, sa hauteur est dans `--pub-footer` sur `<html>` et le body en est dégagé en bas. La table `defaultRefreshTimeTableInvisible` posée vide avant le premier script (`coupeRafraichissementInvisible`) n'a aucun effet, la régie écrase la valeur en dur à la ligne suivante ; elle reste là, inoffensive. Avec cette configuration, le CPM est monté sans interruption de 0,30 à 0,35 € entre le 1er et le 29 septembre 2026. **L'épisode du 1er au 7 octobre 2026** : deux déploiements publicitaires (le 1er octobre : footer et premier écran servis au premier geste, clic dans `<main>` compris, donc à tous ceux qui jouent sans faire défiler ; pavé remonté dans la carte de résultat par `dispositionResultat`, donc demandé à chaque résultat ; marge d'approche à 300 px ; emplacements ajoutés sur le hub des jeux, les questions de couple et les articles de blog. Le 5 octobre : bride des rafraîchissements hors de vue en réécrivant `refreshTimer` sur les unités de `window.tmzrLocalToolbox.adUnits` ; rapatriement du conteneur `sas_26300` que le script de la régie glisse, sur téléphone, dans un paragraphe à 10-20 % de la page ; repli des encarts vides sans saut) ont coïncidé avec une chute du CPM : 0,31 le 30 septembre, 0,25 le 1er octobre, 0,21 le 4, 0,20 le 5, 0,13 le 6. Le 7 octobre, tout a été remis à l'état du 29 septembre (pub.js du 26 septembre, pavé dans le texte, les trois gabarits sans emplacement), sans savoir lequel des changements pesait le plus. Hypothèses, par ordre de probabilité : le pavé servi dans le résultat de chaque test puis déplacé hors de vue par la régie sur téléphone et rafraîchi là toutes les 37 s (des impressions comptées, jamais vues, qui tirent la visibilité et les enchères du domaine) ; le footer, format bon marché, servi dès le premier clic à bien plus de visites, donc plus lourd dans la moyenne ; l'inventaire ajouté sur des pages moins engagées ; et les deux interventions dans le script même de la régie. **Règle désormais : un seul changement publicitaire à la fois, trois jours d'observation avec les chiffres par format de la régie (impressions, revenu, CPM, visibilité) avant le suivant ; le CPM seul ne dit rien, il se lit avec le revenu et les impressions.** Formats retirés : en septembre 2026, faute d'être vus, 4 double skyrail, 28 megabanner bas et 19 pavé bas (et avec le skyrail les gouttières `--gouttiere-pub`) ; le 20 septembre le « in text » (11, vidéo outstream remplie à 10 %, 0 €) ; le 26 septembre le grand angle (3, servi en half page à 0,16 € de CPM), dont la grille `.avec-colonne` reste pour tenir la largeur du texte. Les règles `min-width: 0` et `max-width: 100%` des conteneurs du texte et les styles `.qr-zone--pub` restent, inoffensifs. À l'arrivée sur un résultat, `defileVersLeVerdict` (quiz-engine-core.js, 5 octobre) amène le haut du plan sous l'en-tête (il attend que la carte soit insérée, calcule par `offsetTop` à cause de l'animation d'échelle `quizResultPop`) et `data-arrivee` fait taire `smoothScroll(wrap, 'center')` ; le carrousel de la story se centre par un `scrollBy` horizontal. Ce n'est pas de la publicité, c'est gardé.
- **La mégabannière au-dessus de la question** (format 1, `bandeauDuTest` dans pub.js, essai 1 du 15 octobre 2026). Mesuré dans Chromium en jouant des parties entières : le billboard sous le moteur n'était vu (la moitié de ses pixels à l'écran) sur aucun écran de question du test de couple, ni sur téléphone ni sur un portable, et dépassait au mieux d'un tiers de sa hauteur sur les autres tests ; sur les quatorze jours d'avant, il faisait 21,44 € pour 134 700 impressions (CPM 0,16 €). Sur téléphone, la question et ses réponses remplissent l'écran : un bloc de 250 px en dessous ne peut pas être vu sans faire défiler les réponses. Le bandeau est posé juste avant `#quiz-engine`, jamais dedans (le moteur redessine sa boîte à chaque question, une annonce dedans serait redemandée à chaque réponse), à la première question (`.quiz-progress-wrapper`) et après un geste dans le moteur, avec le mot « Publicité » au-dessus (cinq langues). Hauteur réservée : 50 px sur téléphone, 90 au-dessus de 768 px ; une annonce plus haute (320x100) ne l'agrandit qu'au changement de question suivant, un emplacement encore vide après 8 s ne se replie qu'à ce moment-là, et il ne rétrécit jamais : une réponse qui glisse sous le pouce, c'est un clic accidentel. Il est retiré à l'écran de résultat (la régie le rafraîchirait sinon hors de vue pendant la lecture), un seul par page vue, et il n'est pas posé du tout s'il ne tient pas à l'écran avec la carte de la première question (portable de 768 px de haut, petit téléphone sur le test de couple). Le recadrage de quiz-extras.js (`recadrer`) cadre bandeau et carte ensemble et compte la partie visible de l'en-tête collé (56 px sur ordinateur, son premier niveau glisse hors de l'écran) : centrer la carte seule glissait le bandeau sous l'en-tête. Il reste environ 220 px entre le bandeau et la première réponse. Google demande au moins 150 px entre une annonce et un jeu, et une pub posée juste au-dessus des boutons suivant ou précédent est exactement ce qu'il sanctionne (clics confirmés, enchères en baisse sur le domaine, compte suspendu). Seuls les moteurs qui montent dans `#quiz-engine` l'ont (pas le tu préfères, la pureté ni les outils). Essai suivant, après trois jours de chiffres par format : le mégaskyscraper (format 20, 160x600) collé sur le côté du moteur sur ordinateur, là où le bandeau ne tient pas.

- `reseaux/`, `docs/reseaux-sociaux/ARCHITECTURE.md` : comptes Instagram de Quiz Couple (anglais seul au départ, pour être compris partout et pas pour viser les États-Unis : jamais d'actualité, seules fêtes Noël et Nouvel An ; compte professionnel relié à une Page Facebook (connexion Facebook, `graph.facebook.com`), aucune validation humaine, trois posts par jour à une minute tirée au sort dans 6 h-8 h, 11 h-13 h et 16 h-18 h, heure de Paris). Ligne éditoriale dans `reseaux/atelier/LIGNE-EDITORIALE.md` (deux publics en couple, 13-17 et 18-25 ans ; tout dessiné, aucune photo), semaine type dans le réglage `melange` par catégorie (la même grille dans `MELANGE_DEFAUT`, lib/calendrier.mjs, et dans la dernière migration qui la réécrit, `20261012180000`, rejouée en dernier par social-base.yml puisqu'il rejoue aussi les plus anciennes) : 10 animations dont une coquine, 3 « Connais-tu ton partenaire ? », 2 « Tu préfères », 2 reels statiques, 1 phrase tendre le dimanche soir, 1 BD le mardi soir, 1 carrousel de questions le jeudi soir (banque `carrousel`, dix pages, « Save this for your next date night », depuis le 7 octobre 2026) et 1 carrousel « He's a 10 but... » le samedi soir (12 octobre 2026, idée de Thomas d'après le jeu « C'est un 10 mais... » du site : catégorie `dix-mais` au gabarit `carrousel`, banque `dix-mais` de seize éditions, he et she en alternance, huit cartes « but he... » de la petite manie au vrai drapeau rouge, modèles `dix-mais` et `dix-mais-elle` ; les effets au-dessus de la tête ne vont qu'à la rose, plus petite, sinon ils mordent sur le texte ; légende = règle du jeu + « Comment your number » ; les sujets datés suivent la grille, ce que vérifie `test/sujets.test.mjs`, et les contraintes de catégorie des idées sont en NOT VALID pour que le rejeu des anciennes migrations ne bute pas sur une idée d'une catégorie plus récente) ; chaque jour le reel du matin repart en story juste après sa publication (`publierStories` dans publication.mjs, `media_type` STORIES, colonnes `story_*` de `social_variantes`, reel de 60 s au plus, badge « + story » dans l'admin) ; **depuis le 9 octobre 2026, tout ce qui part sur Instagram part aussi sur la Page Facebook reliée** (`publierFacebook`, `lib/facebook.mjs` : le partage automatique d'Instagram vers Facebook ne joue pas pour l'API, remarque de Thomas ; reel en reel Facebook par l'API vidéo en deux temps, `video_reels` start puis `file_url` au serveur rupload puis finish avec la légende ; image en photo ; carrousel en publication à plusieurs photos ; story du matin en story de la Page ; même jeton de Page, qui doit porter `pages_manage_posts` avec `pages_read_engagement` et `pages_show_list` (pas `publish_video` : absent du cas d'usage « Gérez des Pages » et non requis par la documentation des reels) ; interrupteur par compte `social_comptes.facebook`, `page_id` relevé par `connecter` donc jeton à recoller pour un compte connecté avant ; colonnes `fb_*` de `social_variantes`, migration `20261009120000`, trois essais, jamais au détriment d'Instagram déjà publié ; badge « + Facebook » et lien dans l'admin) ; banque de sujets dans `reseaux/atelier/sujets.json` (273 au départ, 307 depuis la revue du 7 octobre 2026 face aux comptes qui marchent : éditions nommées sur l'étiquette des quiz, « Who's more likely? » à pointer (`mode: pointe`), piliers `mini` et `participatif` (phrase à finir en commentaire), échelles de réaction, routines, faux messages, contrastes, retrouvailles ; légende = accroche avec un mot-clé + un seul appel choisi pour le geste voulu, envoyer / commenter / enregistrer, jamais le même trois fois dans la journée ; hashtags par catégorie dans LIGNE-EDITORIALE.md ; références dans `reseaux/atelier/REFERENCES.md`), chaque post porte son `sujet`. **Le style des textes (9 octobre 2026, Thomas : « les chutes sont vraiment nulles, c'est de l'humour à l'IA, pas humain »)** : `automates/lib/style.mjs`, passé par `controler.mjs` (la porte de l'atelier, jamais la synchro) pour les deux comptes ; refusés : la fin qui commente la scène (« c'est tout », « je note », « that's love », « he knew better »...), la légende qui répète ou résume l'image, l'appel hors de la liste `APPELS` ou inventé avec « qui / who », plus d'un « <3 » par post ou un « <3 » en fin de texte de reel, un texte entier entre parenthèses, trois phrases courtes à la suite. La règle de fond (la chute dans l'image, légende = détail vrai ou appel seul, test de l'oral et test de l'ami) est dans les deux LIGNE-EDITORIALE (« La chute, et ce qui sonne machine ») et les deux CONSIGNES, avec une banque de vraies répliques de couples (tweets relevés par HuffPost et Yahoo, tops Topito, transposés) dans les deux REFERENCES.md ; les 28 phrases tendres de la banque sont devenues des phrases concrètes qu'une personne écrirait vraiment ; les 30 posts des mipaps du 10 au 19 octobre et les 12 de Quiz Couple du 10 au 13 ont été réécrits ce jour-là, et chaque routine revoit le reste de sa réserve, six posts par passage, du créneau le plus proche au plus lointain. Les idées de Thomas (onglet Réseaux de l'admin, table `social_idees`, catégorie au choix ou laissée à la routine, migration `20261009100000`) prennent depuis le 8 octobre 2026 le créneau le plus proche de leur catégorie (`automates/lib/idees.mjs`, règle recopiée en TypeScript dans `admin-social` pour afficher la date visée dès la saisie) : le post prévu à cette place, pas encore parti, est remplacé par la routine et son sujet retourne dans la banque ; `etat.json` porte `creneau_vise` par idée et `prochain_creneau` par catégorie, le post porte `idee_id` et un sujet `idee-<début de l'id>` que `controler.mjs` accepte hors banque ; auparavant une idée attendait le premier créneau vide, à trois semaines ce jour-là et à trois mois une fois la réserve pleine. Les animations ne renvoient jamais vers le site dans la légende, les jeux oui. La charte est le design system « Quiz Couple Social » (https://claude.ai/artifact/2EQe4VPFYhMazvenJ3fqDX), copiée dans `reseaux/charte/` (`tokens.json`, `qc.css`, `mascottes.js`) : une modification de charte se fait dans les deux. Le studio Remotion (`reseaux/studio/`, `node scripts/rendre.mjs <recette> <sortie>`, `--verifier` pour le seul contrôle, `scripts/planche.mjs` pour relire un reel en vignettes) rend les gabarits pov (moteur d'animation `src/pov/` : scénario plan par plan, vocabulaire de décors (quinze depuis le 7 octobre 2026 : papier, trait, mur, chambre, cuisine, salon, table, dehors, Noël, forêt, rue, café, plage, voiture, cinéma, dessinés dans `decors.ts`, chacun avec ses spots et son ambiance sonore), spots, objets, gestes et effets dans `vocabulaire.json`, contrôle du scénario dans `automates/lib/pov.mjs`, dont la richesse depuis le 7 octobre 2026, `controlerRichesse` : description de 100 signes au moins par plan, deux mouvements de caméra par reel et un par plan de plus de 4 s, un changement d'expression par personnage toutes les six secondes et deux au moins, jamais plus de 1,5 s sans événement nouveau dans un plan, premier geste avant 0,5 s ; les quatre modèles d'animation passent ces règles), connais-tu, tu-preferes (accroche : les mascottes en grand et animées dès la première image ; la question reste seule le temps d'être lue avant le chrono), quiz-chrono, citation, image, carrousel (avec scène dessinée possible) et, depuis le 8 octobre 2026, `bd` (bande dessinée en quatre cases : une scène figée par case avec le vocabulaire des animations, bordée d'un trait d'encre, au plus deux répliques de 40 signes en haut de chaque case du côté de celui qui parle, cinq sur la planche, chute dans la dernière case ; post 4:5 en grille 2 x 2 par défaut ou une case par page avec `sortie: carrousel` ; objet `compresse` porté sur le front comme le bonnet, `pose` d'un Dessin ; catégorie `bd` le mardi soir de la semaine type, migration `20261009090000`, banque `bd` de quatorze planches ; contrôle `controlerBd` sans les règles de richesse d'un reel) et refuse tout texte hors zone utile (220 px en haut, 420 en bas, 120 à gauche et à droite d'un reel), qui déborde, qui finit sur un mot seul ou sous 34 px : on raccourcit le texte, jamais la taille. Règles de Thomas : tout centré sauf les réponses d'un quiz (à gauche) ; jamais de score ; mascottes dans les animations et dans les jeux (elles attendent avec un « ! » puis font « Yay! ») ; assises sur un banc ou un canapé, sous la couette seules la tête et les petites mains dépassent (depuis le 7 octobre 2026 au soir, les bras de base de la mascotte ne sont plus dessinés au lit : le corps est enfoncé jusqu'à la bouche mais les épaules restent au-dessus du bord de la couette, et les deux bras dépassaient à côté des deux petites mains, quatre bras en tout, remarque de Thomas ; option `brasVisibles` de `mascottes.js`, posée dans `etatPerso` : seuls les bras levés à 60° ou plus ou occupés (`devant`) sortent de la couette, et la petite main du même côté s'efface dans `MainsSurLaCouette`) ; animations très simples, comme les mini dessins qui marchent sur Instagram ; citations en Playfair Display italique avec des fleurs au trait à 30 %, humour en Fredoka ; fond texturé pour les quiz, grain de papier léger partout (`is-papier`) ; depuis le 7 octobre 2026 les mascottes et les décors sont « dessinés » (`charte/mascottes.js` : trait d'encre `decor-trait` épais et tremblé par un filtre de déplacement dont la graine change toutes les quatre images : option `tremble` de chaque mascotte en vidéo, et `filter: url(#qc-tremble)` défini par le Canevas sur la scène fixe d'un post ; jamais sur un texte, et jamais plein cadre en vidéo, mesuré le 7 octobre 2026 à 1,3 s par image contre 0,45 sans, le décor reste donc net ; aplats, reflet et joues en dégradés radiaux, pas de flou), la rose porte un nœud (`noeud`, retiré sous un bonnet), les humeurs varient (poses `mignon`, `triste`, `colere`, `gene`, `fatigue`, `supplie`, `rire`, options `sourcils`, `larmes`, yeux `brillants`, bouches `chat` et `grogne`, gestes `pleure`, `fache`, `mignon`) et les mascottes sont sur tous les posts (`Duo` en petit sur les phrases tendres, les posts et chaque page de carrousel) ; la rose est la fille, le violet le garçon (c'est lui qui offre les fleurs) ; textes des minis, statiques et bulles en minuscules façon message (`u`, `ur`, `rn`, `<3`), référence analysée dans `reseaux/atelier/REFERENCES.md` (nub) ; aucun reel sous 10 s ; on anime dès qu'on peut (un câlin commence par les deux qui arrivent chacun de son bord, au lit chaque moment de la journée passe par un écran noir, transition `noir`, la lumière de la pièce change avec `moment`, et ils replongent sous la couette, geste `plonge`). Zone utile symétrique (120 px à gauche comme à droite) : un texte centré l'est sur l'écran. Bruitages CC0 de Kenney pour l'interface et les gestes, et depuis le 7 octobre 2026 Mixkit pour les réactions des mascottes (pleurs, rires, cri, ronflement, soupir, grognement...) et les ambiances des décors (oiseaux, grillons, circulation, vagues, brouhaha, moteur, projecteur) : `public/sons/bibliotheque.json`, 78 fichiers `mx-*.mp3` préparés par `scripts/sons.mjs` (jamais commités, en cache dans social-rendu.yml, rendu refusé s'il en manque un ; le ffmpeg de Remotion n'a que neuf filtres audio et n'encode pas le Vorbis), déduits des gestes dans `plan.ts` ou posés dans `sons`, lit sonore par décor (`ambiance` de vocabulaire.json, qu'un plan remplace ou coupe) ; doux (volumes 0,10 à 0,24, ambiances à -23 LUFS) et variés (`VARIANTES` dans Son.tsx, tirées de l'instant) ; **pas de musique dans le fichier d'un reel** : la publication lui attache un son tendance de la bibliothèque Instagram par l'Audio API de Meta (`GET /ig_audio?audio_type=music&user_id=…`, réponse sous `audio`, puis `audio_configuration` JSON sur le conteneur REELS : `audio_id`, `audio_volume` 70, `video_volume` 100, `should_loop_audio` si le son est plus court ; seulement avec la connexion Facebook, et seulement les sons « autorisés pour les tiers », le morceau partant toujours du début). `automates/lib/son.mjs` choisit un son qui va avec l'image (depuis le 7 octobre 2026, Thomas : « CATastrophe » de Hilary Duff sur un POV « we need to talk » ne collait pas) : la recette porte `"son": {"ambiance": "..."}` parmi `drole`, `tendre`, `triste`, `coquin`, `jeu`, `noel`, `nouvel-an`, `tendance` (sinon la catégorie du post décide, `AMBIANCE_PAR_CATEGORIE` : POV drôle, statique et phrase tendres, coquin, jeux rythmés, catégorie inconnue → tendances), chaque ambiance a deux à quatre recherches anglaises (`AMBIANCES_SON`, essayées contre l'API le 7 octobre : six à dix sons chacune, des morceaux de catalogue, piano, acoustique, R&B, rythmes de jeu) tirées à tour de rôle par variante (`requetePour`), et la publication cherche dans la bibliothèque Instagram avec ces mots (`search_query`), tendances à la place si la recherche ne rend rien ; `"son": {"recherche": "..."}` écrit en toutes lettres l'emporte. Puis, parmi les douze premiers résultats, un son jamais posé sur le compte dans les soixante dernières déclinaisons, au moins aussi long que le reel (durée relevée au rendu dans `fichiers.duree`), de façon reproductible, écrit dans la recette (`son` : `id`, `titre`, `artiste`, `ambiance`, `recherche`, affiché dans l'admin) ; la synchro compare les recettes sans leur `son` et pose une demande de son qui change sans refaire le rendu (le fichier ne contient pas la musique). API en panne ou son refusé : le reel part avec ses bruitages, alerte au journal, jamais un créneau manqué pour une musique. Sans musique dans le fichier, pas de normalisation à -14 LUFS, seulement les crêtes rabattues sous -1 dBTP ; la bibliothèque de 55 morceaux en cinq ambiances (`studio/public/musique/bibliotheque.json`, 6 FreePD dans le dépôt, 49 Mixkit préparées par `scripts/musiques.mjs`, jamais commitées) ne sert qu'à une recette qui porte `ambiance` ou `musique` (choix sans répétition dans `automates/lib/musique.mjs`, et alors pas de son Instagram par-dessus). Jeton : un jeton d'utilisateur Facebook longue durée collé dans l'admin donne le jeton de la Page reliée (`/me/accounts`, sans date d'expiration propre), rangé dans `social_jetons` ; `jeton_expire_le` reçoit la plus proche de `expires_at` et de `data_access_expires_at` (Meta coupe l'accès aux données 90 jours après la dernière connexion, vérifié le 7 octobre 2026), l'entretien le vérifie chaque semaine (`verifierJetons`), alerte dix jours avant la date et s'il est refusé, bouton « Changer le jeton » dans l'admin. Appli Meta « Quiz Couple 2 Son » (cas d'usage « Gérer les messages et le contenu sur Instagram », configuration avec connexion Facebook), Page « Quiz Couple » reliée à @quiz_couple_official (17841425378855459). Le mode « à la main » du 7 octobre 2026 (reels à publier depuis l'appli) a été retiré le jour même : tout est automatique. La routine Claude « atelier » (une fois par jour à 5 h 44, heure de Paris ; consignes dans `reseaux/atelier/CONSIGNES.md`) n'a aucun accès à Supabase : elle pousse des posts JSON sur la branche `reseaux-atelier`, par lots de six, en travaillant dans le dépôt même sur cette branche fusionnée avec `main`, et tient un journal de chaque passage dans `reseaux/atelier/journal/`, poussé dès l'ouverture, seule trace lisible de ce qu'elle a fait ou de ce qui l'a bloquée. Elle ne tourne pas dans une session neuve à chaque passage : six passages des 6 et 7 octobre 2026 se sont arrêtés en trois minutes sans rien laisser, pas même le journal, la session neuve n'arrivant pas à attacher le dépôt elle-même (`add_repo`). Le déclencheur envoie maintenant son message dans une session Claude Code permanente, créée une fois avec le dépôt comme source et `reseaux-atelier` comme branche de sortie (`persistent_session_id` du déclencheur) : le dépôt y est déjà cloné, et le premier journal est parti en vingt secondes. La session n'est qu'un hôte, chaque passage repart de `origin/reseaux-atelier` (`git checkout -B`) ; si elle est archivée ou supprimée, on en recrée une de la même façon et on refait le déclencheur ; les workflows `social-*.yml` font la synchro et le rendu (toutes les heures ; la synchro ne touche pas une déclinaison dont le fichier n'a pas changé, à l'ordre des clés du jsonb près et sans compter le son choisi par la publication : jusqu'au 7 octobre 2026 elle remettait tout en `a_rendre` à chaque passage et le rendu refaisait chaque heure tous les posts des 48 h à venir, une heure de machine par heure et une déclinaison qui pouvait repasser en rendu juste avant sa publication ; depuis le 8 octobre 2026 la synchro accepte, avec une alerte, un post dont la catégorie ne suit plus la grille (réglage `melange` changé après l'écriture : le mardi soir devenu BD alors que deux POV étaient déjà écrits pour les 13 et 20 octobre), et un fichier refusé (fautes écrites dans le message du journal) ne fait plus échouer le workflow, parce que le code de sortie 1 empêchait l'étape de rendu de tourner et plus rien n'était rendu pour personne ; l'entretien remet ces deux listes à la routine dans `etat.json` (`hors_grille`, `refuses`), seuls fichiers existants qu'elle a le droit de réécrire ; un rendu en échec est retenté trois fois (`ESSAIS_RENDU_MAX`) puis laissé à l'atelier dans `a_corriger`, qui ne liste que les posts dont le créneau peut encore partir (un créneau passé ne sera plus publié, la routine ne doit pas le retravailler chaque matin) ; l'heure de publication est tirée au sort dans le créneau par le déclencheur `social_variante_heure` à l'insertion, sauf si le post porte `publier_a`, date ISO avec fuseau que la synchro écrit telle quelle, pour un post que Thomas veut voir partir à une heure précise, comme le soir du 7 octobre 2026 où le créneau était déjà passé ; la routine remplit dès aujourd'hui les créneaux qui commencent dans plus de trois heures, `MARGE_MIN` dans entretien.mjs, jusqu'à J+100 et 24 posts par passage depuis le 7 octobre 2026 : la réserve s'écrit d'avance pour que le compte publie même sans routine, le rendu et la publication n'ayant pas besoin de Claude), la publication (toutes les 10 min) et l'entretien (jetons, ménage, statistiques, `etat.json`), avec les secrets Supabase déjà présents. Le workflow de publication récupère tout `reseaux` (pas seulement `automates` : le script lit le vocabulaire du studio et la bibliothèque musicale, et le checkout partiel l'a fait échouer au chargement toute la journée du 7 octobre 2026). L'horloge des trois workflows n'est pas le « schedule » de GitHub, qui saute la plupart des départs sur ce dépôt (mesuré le 7 octobre 2026 : une publication en neuf heures, un rendu en neuf heures, l'entretien de 7 h 41 parti à 14 h 44, et près d'un tick sur deux perdu pour la reconstruction du site depuis mars) : c'est pg_cron, dans Supabase, qui les déclenche par `workflow_dispatch` (migration `20261008140000_horloge_workflows.sql`, fonction `social_declencher_workflow`, jeton GitHub à grain fin dans le Vault sous `github_workflows` ; sans jeton elle ne fait rien). La migration `20261008180000_horloge_site_et_controle.sql` étend l'horloge : la reconstruction du site (`scheduled-rebuild.yml`, sept départs par jour, trois seulement arrivaient par le « schedule », jusqu'à quatre heures en retard ; les avis cuits en dépendent), l'entretien à 3 h 11 UTC pour que la routine de 5 h 44 à Paris lise un `etat.json` frais (à 7 h 41 UTC il passait après elle), et `social_horloge_controle()` chaque heure : toute réponse de pg_net autre qu'un 204, ou un Vault sans jeton, devient une alerte « horloge » dans `social_journal` (pastille de l'onglet Réseaux), au plus une par six heures, parce qu'un jeton expiré arrêterait l'horloge en silence. `social-base.yml` applique cette migration et recopie à chaque passage le secret GitHub `WORKFLOWS_TOKEN` du dépôt dans le Vault (`social_definir_jeton_github`, qui contrôle la forme `github_pat_…`) : pour changer le jeton, on change le secret puis on relance le workflow (« Run workflow ») ; les « schedule » restent en secours, et le rendu fabrique les fichiers 48 h à l'avance. Un compte inactif ne fait rien rendre et rien échouer : la publication tourne à blanc. Tables `social_*` fermées au public (migrations `20261007120000` et `20261008120000`, appliquées par `social-base.yml`), onglet Réseaux de l'admin par la fonction `admin-social`. Les clics vers Instagram depuis le site (tout lien vers instagram.com : icône du menu, menu mobile, pied de page, accueil, merci après un avis) sont comptés par `clicInstagram` dans audience.js, table `instagram_clics` (migration `20261008150000`, appliquée par social-base.yml), lus par `get_instagram_clics()` et affichés en un seul total, sept jours et aujourd'hui, dans la quatrième tuile de l'onglet Réseaux : Thomas veut le total, pas le détail par bouton, l'emplacement est quand même enregistré. L'accueil du site montre les trois dernières publications (`#instagram-recents` dans home.ejs, rempli par `home-dynamic.js` via la fonction publique `get_instagram_recents` ; l'affiche de chaque post, couverture en 540 px, est déposée au rendu dans le bucket public `social-public`, colonne `social_variantes.affiche`, jamais effacée par le ménage ; styles dans le gabarit, section masquée sans publication). Les envois vers le stockage passent par le protocole de reprise TUS (morceaux de 6 Mo) au-delà de 6 Mo, avec trois essais sur erreur réseau et la cause dans le journal (un reel de jeu pèse 15 Mo, le premier a échoué d'un bloc le 7 octobre 2026) ; l'en-tête `x-upsert` part sur chaque requête du protocole, pas seulement la création : Supabase le relit sur le dernier morceau, et sans lui un reel rendu une seconde fois au même chemin finissait en « 409 The resource already exists » (le reel de midi du 7 octobre 2026, re-rendu par l'ancienne synchro après que son créneau fut passé sans publication, la publication étant alors en panne). Tests des automates : `cd reseaux/automates && npm test`.

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
  une règle récente au premier rendu. Sauf dans un cas : une règle retirée de
  `styles.css` qui portait `!important` reste dans la feuille critique,
  écrite dans la page, et l'emporte sur la nouvelle règle pour de bon (le
  11 octobre 2026, les cartes de prénoms gardaient leur cadre à l'encre). Après
  avoir retiré des `!important`, on régénère avant de publier.
- On ne régénère que sur un `dist/` construit avec les données de Supabase
  (avis cuits, compteurs) : le build n'y arrive pas toujours depuis une
  session de travail (« [reviews] Could not fetch », proxy qui refuse la
  connexion), et la couverture ne voit alors ni les avis ni leurs règles.
  Le 14 octobre 2026, une régénération complète faite ainsi a retiré les
  règles `.pqx-*` de 78 feuilles ; elles ont été rétablies depuis main. Sans
  accès à la base, on ne régénère que la page qui a changé, après avoir
  recopié dans sa page de `dist/` le bloc `#pqx-avis-cuits` de la page
  publiée ; les autres feuilles gardent leur contenu, avec la nouvelle
  empreinte, quand la règle ajoutée à `styles.css` ne sert pas au chargement.
- Les états que la couverture ne voit pas (survol, écrans suivants du moteur)
  arrivent avec la feuille complète : un style indispensable dès le premier
  écran doit correspondre à des éléments présents au chargement.
- Le style de la barre de défilement de la page (`::-webkit-scrollbar*`) est
  toujours gardé (`TOUJOURS`, critique.mjs) : Chromium sans écran masque les
  barres, la couverture ne voyait pas ces règles, et les feuilles relevées
  depuis une session de travail les perdaient (blog et test à distance,
  rétablies le 15 octobre 2026).

Les avis d'une page (douze derniers, note moyenne, nombre) sont cuits dans
le HTML à la construction (`avisCuitsPour` dans generate.js, bloc
`#pqx-avis-cuits` dans quiz-reviews.ejs, lu par `initReviews`) depuis le
7 octobre 2026 : chaque page vue demandait à la base la liste et jusqu'à
mille notes, le plus gros poste de sortie de Supabase (1,4 Go en dix jours
sur les 5 Go du plan gratuit). Seul l'envoi d'un avis reste en direct ; un
avis approuvé paraît à la reconstruction suivante, sept par jour. Les avis
se lisent par pages de mille (le plafond de PostgREST), et sans chargement
réussi au build, le bloc manque et la page redemande à la base comme avant.

Les compteurs suivent la même règle depuis le 12 octobre 2026 : le nombre de
parties de chaque page jouable (le plus grand des lancements et des parties
finies ; les votes sur les dilemmes, le pour ou contre et le oui-non) et les
lectures de chaque article sont lus une fois par construction
(`fetchCompteursParties`, `fetchLecturesArticles`, huit lectures à la fois
après une sonde) et écrits dans le HTML. Avant, chaque page vue demandait à
la base deux listes de toutes les pages pour la bulle « joué N fois », qui
apparaissait après coup en poussant le texte, et chaque article ses lectures.
La bulle est remplacée par un bandeau (`partials/preuve-sociale.ejs`) :
parties, note « 4,8/5 » et nombre d'avis, la note menant aux avis du bas de
page. Il est posé par `pointDuBandeau` (generate.js) sous le dernier
paragraphe du bloc du fil d'Ariane, la place de l'ancienne bulle, sur toutes
les pages jouables qui ont un fil d'Ariane (le test de pureté n'en a pas) ;
comme il est dans le premier écran, ses règles sont gardées dans la feuille
critique de toutes les pages jouables (`GARDER_JOUABLES`, critique.mjs). Sans
chiffres au build, quiz-extras.js (`data-a-lire`) et blog-lectures.js
(`data-cuit` absent) les redemandent comme avant. Le compteur de lectures
d'un article (« Cet article a été lu N fois » dans la ligne de signature,
« Lu N fois » sur les cartes) ne s'affiche qu'à partir de 10 lectures
(`SEUIL_LECTURES`, une seule constante) : à 50, jusqu'au 12 octobre 2026, il
restait caché sur la plupart des articles, et Thomas ne le voyait nulle part.
Le build écrit au journal la médiane et le maximum des lectures. Les notes
s'écrivent sur cinq avec la virgule de la langue (« 4,8/5 », « 4.8/5 » en
anglais) : bandeau, avis du bas des pages, hero et section avis de l'accueil.

Le reste de la règle : rien de tiers avant l'affichage. `pub.js` ne demande
les emplacements qu'à l'événement `load`, jamais dans le premier écran avant
le premier défilement, le footer compris, et l'interstitiel seulement au résultat ou à l'arrivée depuis une autre page du site ; le fichier de la plateforme de consentement part après
`DOMContentLoaded` (le talon `__tcfapi` reste en tête) ; GA part au `load`.
Les images ont des variantes réduites versionnées à côté de l'original :
480, 720 et 880 px pour les images de tête (`public/quiz/featured/`,
originaux de 1200 px), 480, 720 et 1080 px pour les couvertures du blog
(`public/blog/`, jusqu'à 1536 px et 132 Ko en moyenne). La 480 date du
12 octobre 2026 : les cartes du bas des pages de test s'affichent en 171 à
263 px, et un ordinateur ou un téléphone x2 tirait la 720 ; elle a divisé
par deux les images des cartes sur ordinateur, et allégé l'accueil (519 à
267 Ko d'images au chargement sur un écran x1) et la liste du blog
(338 à 185 Ko). `srcsetImage` (generate.js) écrit le
`srcset` avec les seules variantes présentes et la vraie largeur de
l'original, lue dans l'en-tête WebP ; il sert les cartes et les derniers
articles de l'accueil, l'image de tête des tests (et son préchargement dans
base.ejs, qui doit garder les mêmes candidats), la liste du blog, la tête
d'article (l'image du LCP), les images écrites dans le corps des articles
(`srcsetImagesArticle`, passée sur le rendu de chaque article), les
vignettes du plan du site, les cartes du hub des jeux et la figure du test
de pureté. Cette dernière n'est pas dans le hero mais base.ejs la précharge :
elle reprend exactement le `srcset` et les `sizes` du préchargement, sinon
le téléphone téléchargeait la variante préchargée puis l'original. Une nouvelle
image reçoit ses variantes par `build/variantes-images.cjs` (sharp installé
hors du dépôt, mode d'emploi en tête du fichier) ; sans elles, elle n'a
qu'un fichier et pèse simplement plus lourd. Le `sizes` de chaque image
donne sa largeur affichée relevée dans Chromium : jusqu'au 11 octobre 2026,
les cartes de l'accueil annonçaient 82vw (320 px sur un écran de 390) pour
259 px réels, et un téléphone x3 tirait les originaux, 1,8 Mo d'images pour
la page parcourue contre 700 Ko depuis. Toute lecture de géométrie (`getBoundingClientRect`, `clientWidth`,
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
Pas de hauteur en `vh` sans plafond sur une section qui centre son contenu :
pour sa capture, le moteur de rendu de Google agrandit la fenêtre à toute la
hauteur de la page (16 500 px sur l'accueil). Le hero de l'accueil
(`min-height: 100svh`, contenu centré) prenait alors toute cette hauteur, son
contenu tombait à 7 800 px du haut, et jusqu'au 15 octobre 2026 la Search
Console ne montrait de l'accueil que le menu et le fond, dans les cinq
langues. Il est plafonné à `min(100svh, 75rem)`, ce qui ne change rien
jusqu'aux fenêtres de 1 200 px de haut (sur téléphone le hero dépasse déjà
l'écran). Pour vérifier une page : l'ouvrir dans Chromium, agrandir la fenêtre
à `document.documentElement.scrollHeight` et regarder où tombe le contenu.
La minification ne garde que la dernière déclaration d'une même propriété :
un repli en `vh` écrit au-dessus d'une ligne en `svh` ne part pas en
production.
La colonne droite du hero (`.hero-visual`, home.ejs) est la scène des
mascottes depuis le 8 octobre 2026 : la rose et le violet, en grand, jouent
une partie à deux en boucle (une question de test où ils répondent la même
chose, un « tu préfères » où ils ne sont pas d'accord, le résultat à 87 %),
à la place de l'ancienne carte « même réponse » (hero-duel.js, supprimé).
Tout est en CSS, sans script : une boucle de 14 s qui n'anime que
`transform` et `opacity` (`.scene-*` dans styles.css, les repères de la
boucle en tête du bloc). Les quatre poses de chaque mascotte sont dessinées
à la construction par `mascotteSvg` (generate.js, qui charge
`reseaux/charte/mascottes.js` en CommonJS) et empilées : on ne change que
leur opacité. L'anneau du résultat (trait, non composé) est le seul autre
réglage animé, posé directement à sa valeur sous 768 px. Les tailles sont en
em et l'em suit la largeur de la colonne (`100cqw`, repli sur `100vw`) :
sous 1200 px la carte est au-dessus des mascottes (téléphone compris, la
scène s'affiche sous le texte), au-dessus elles sont de part et d'autre.
Sans animation (`prefers-reduced-motion`), l'écran de résultat reste
affiché avec les deux mascottes contentes : c'est l'état de base de chaque
règle. Les textes sont `heroScene` dans `{lang}/home.json` ; les SVG en
ligne ne sont pas candidats au LCP, et la scène n'a aucun fondu depuis
l'opacité 0 au chargement (le premier écran apparaît en 0,4 s).
Sous 768 px, les animations infinies qui n'animent ni `transform` ni
`opacity` (dégradé du titre, reflet des boutons, anneaux néon du bouton
pureté et du bouton sources Google, fond de la carte finale de l'accueil,
anneau de la scène du hero, halo de la carte d'avis et vague des étoiles,
point du compteur) sont coupées par le bloc `@media (max-width: 767.98px)`
qui **ferme styles.css et doit rester le dernier du fichier** : à
spécificité égale, la dernière règle gagne. Écrit plus haut, sous le titre
du hero, il ne coupait que le dégradé du titre, et jusqu'au 11 octobre 2026
tout le reste tournait : au repos, l'accueil occupait le fil principal d'un
téléphone moyen 9,7 s sur 10 (390 px, processeur ralenti 4x), 13 ms une
fois le bloc déplacé. Une animation infinie ajoutée qui n'anime ni
`transform` ni `opacity` y reçoit sa ligne. Au bureau, ces animations
tournent toujours et coûtent un tiers d'un cœur au repos (2,9 s sur 10
dès le 5 octobre, 3,3 s depuis la scène du hero) : tant qu'une seule tourne,
le navigateur refait toute l'image à chaque trame, en couper une ne change
rien, il faudrait les arrêter ou les recomposer toutes, l'anneau néon du
menu collé en haut compris. Pas de `:has()` sur `body` (le moteur pose `quiz-has-result`). L'état
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

- `SoloTest` — Single player, points-based (toxic, divorce, mariage, genant, jalousie, attachement, confiance). Un test tire `totalQ` questions dans `pool` (quiz-loader.js) ; le texte de la page doit dire le même nombre (`{lang}/quiz-*.json`, `quizzes.json`). Depuis le 7 octobre 2026, le mariage tire 20 questions parmi 30 (sans reprise locale : un tirage différent à chaque visite ne se reprend pas) et la distance 15 parmi 100 : à 30 et 20, un tiers seulement des parties lancées allait au bout (export de l'admin, septembre 2026), alors que le crush en fait 35 avec 71 % de parties finies, la longueur n'explique donc pas tout, c'est la motivation de départ qui pèse. Points par défaut = rang de la réponse (3, 2, 1, 0) et verdicts en tranches égales ; un test dont les réponses ne se valent pas déclare `ptsExplicites: true` (points dans `gd.json`, clés `prefix.q{N}{lettre}_pts`) et, si besoin, `paliers: [...]` (bornes hautes de chaque verdict sauf le dernier) dans `quiz-loader.js`. Le test du couple gênant fait les deux : ses réponses de rang deux valent 3 ou 2 selon qu'elles gênent vraiment, sur 60 points, avec les paliers 9, 24, 38, 50. Le test « je l'aime encore ? » (prefix `jeLaime`) aussi : les points vont au sentiment encore présent, pour que l'anneau se lise comme « combien il reste » ; chaque question pèse de 3 à 6 selon ce qu'elle dit (penser à partir vaut le double d'un agacement), 89 points, huit paliers (9, 20, 32, 44, 56, 67, 78) plus serrés en bas, où peu de points séparent « plus de l'amour » de « plus rien ». Le test « prêt(e) pour une nouvelle relation ? » (prefix `pretRelation`, 86 points, paliers 25, 45, 62, 75) pèse chaque question de 3 à 6 selon ce qu'elle dit : l'ex et le pourquoi de la relation valent six, les soirées et les projets trois ; ses textes d'écran de départ sont sous `pret-nouvelle-relation` dans quizGames.json, comme `trouver-amour`. Le test « est-ce le bon ou la bonne ? » (prefix `estCeLeBon`, route `testEstCeLeBon`, famille Tests de couple, 96 points, paliers 28, 50, 68, 84) suit la même règle : se sentir apaisé(e), la fin des disputes, pouvoir tout dire et « referiez-vous pareil » valent six, ce qui agace et la comparaison avec les ex valent trois ; les points vont à ce qui dit oui, l'anneau se lit comme « à quel point vos réponses vont dans le même sens ». Ses textes de départ sont sous `est-ce-le-bon` dans quizGames.json.
- `ProfileQuiz` (engine `profile`) : un profil tiré de l'axe dominant, pas un score : attachement, karmique, langages, personnalité amoureuse, portrait de l'âme sœur, et le quiz « quel type de couple êtes-vous ? » (prefix `typeCouple`, typologie `typeCouple` dans `TYPOLOGIES`, quiz-loader.js). Ce dernier se répond à deux sur un seul téléphone : quinze situations, quatre axes (fusion, complices, libres, batisseurs), et le sens des lettres tourne d'une question à l'autre (`carte`, permutations sur `(questionId - 1) % 4`) pour qu'on ne puisse pas répondre « toujours a » sans lire. Le cinquième profil `equilibre` (couple caméléon) sort quand l'axe de tête fait moins de 35 % des questions ou ne devance le second que d'une voix. Les libellés sont dans gd.json : `pf_axis_<id>`, `pf_<id>_t/_d/_a`, `introTitle`, `linkLabel`.
- `DuoMatchQuiz` — 2 players, answer matching (tester-couple, common-points). Le test du couple (`tester-couple`, première page du site, 37 000 visites par mois dont 18 000 entrées Google en anglais) a deux modes : « Seul(e) ou à deux » (une seule série de réponses, un score, `modeSolo`) et « Chacun son tour » (deux scores et leur moyenne, à distance possible). Jusqu'au 7 octobre 2026 le premier s'appelait « SOLO : vous répondez à deux » : quelqu'un qui arrivait seul n'avait aucune option qui lui parle, et 60 % des parties lancées n'allaient pas au bout, contre 35 % sur les points communs avec le même moteur et la même longueur (export de l'admin, septembre 2026). Les libellés sont `testerC.mode*` dans gd.json, cinq langues.
- `HealthyQuiz` — 2 players, weighted scoring (couple-sain)
- Test de relation à distance (`distance`, route `testDistance`) : deux modes depuis le 14 octobre 2026, à la demande de Thomas, sur le modèle du test de couple. « Évaluer sa relation à distance seul(e) » est le test d'avant, inchangé (`SoloTest`, 15 questions tirées parmi 100, barème pondéré `SOLO_BAREME.distance`, tirage par dimension). « Répondre à deux » passe par `DuoMatchQuiz`, avec l'écran des prénoms et le mode à distance du test de couple : chacun peut répondre sur son téléphone, ce qui est justement la situation d'un couple à distance. Sur un seul téléphone, c'est le tour par tour du test de couple, un relais entre chaque réponse ; l'ancien moteur `DistanceQuiz`, qui ne proposait que ça (dix-huit parties lancées, aucune finie), n'existe plus. À deux, `initDuoMatchQuiz` (quiz-loader.js) garde le barème et le tirage du solo et pose aussi les points sur le réservoir, où celui qui rejoint une partie relit les questions du créateur ; `verdictsDuTest` remplace les paliers du test de couple (`coupleLevel`) par les quatre verdicts de la page (`distance.r{N}_t/_d/_a`, découpés en quarts du pourcentage comme le solo le fait sur les points), avec le conseil sous le verdict et une étiquette courte `r{N}_tag` sur la carte de chacun. Libellés : `distance.mode*` et `distance.duoTitre` dans gd.json, cinq langues.
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
- `EchelleQuiz` (engine `echelle`, prefix `compatSex`) : test de compatibilité sexuelle (route `testCompatSexuelle`, famille Tests de couple, octobre 2026). Deux joueurs, vingt questions à quatre réponses rangées d'un bout à l'autre d'une échelle, posées dans l'ordre du fichier (du plus doux au plus intime) ; le genre est demandé pour les mascottes. Chacun répond à toute la série de son côté, le téléphone ne change de main qu'une fois (`relaisSuite`) et rien ne s'affiche avant le résultat ; à distance, le tour par tour commun montre les deux réponses après chaque question. Proximité d'une question = 1 - écart / 3 (même réponse 1, une case d'écart deux tiers) ; `compatSex.q{N}_miroir` lit la réponse de l'autre à l'envers (la question 12, « qui fait le premier pas » : « moi » et « l'autre », c'est d'accord ; « moi » des deux côtés, c'est l'écart). Score = moyenne des vingt, cinq dimensions de quatre questions (`q{N}_axe` : `envie`, `tendresse`, `parole`, `audace`, `rythme`, une question sur cinq chacune), cinq verdicts `r1`..`r5` par `paliers: [55, 70, 80, 90]` (des réponses tirées au hasard donnent environ 58 %). Le résultat : anneau, une jauge par dimension, la dimension la plus accordée (`axe_<id>_fort`) et la moins accordée avec une idée pour en parler (`axe_<id>_parler`), les plus grands écarts (proximité sous 0,6) et toutes les réponses côte à côte dans un bloc replié, le prénom de chacun à la couleur de son personnage. Affichage `.ech-*` dans styles.css ; textes de la page dans `{lang}/quiz-compatibilite-sexuelle.json` (gabarit quiz-generic) ; liens entrants depuis le pilier « intimité » du test de compatibilité amoureuse et le quiz coquin. Le lien vers l'article des cinq langages de l'amour (section 2) reste masqué tant que l'article est programmé (12 décembre 2026), `stripFutureLinks` le retire seul.
- `DixMaisGame` (engine `dix-mais`, prefix `dixMais`) : le jeu « C'est un 10 mais... » (route `jeuDixMais`, famille Jeux, octobre 2026). Soixante cartes écrites une seule fois pour les deux genres, la variante entre accolades (« {il|elle} est {jaloux|jalouse} », `forme`) ; l'espagnol et l'italien n'ont presque pas d'accolades (sujet sous-entendu), c'est l'accroche qui porte le genre (« Él es un 10, pero... »). Écran de départ : qui est le 10 (un homme, une femme, au hasard : une carte sur deux, compté sur les cartes jouées, 8 et 7 sur une partie de 15), 15, 30 ou toutes les cartes, et la façon de jouer : en secret (relais, celui qui note en premier change à chaque carte, les deux notes révélées ensemble) ou face à face (une rangée de notes chacun sur le même écran). À distance, le tour par tour commun en grille de notes, la forme de chaque carte voyageant dans l'identifiant (id × 10 + forme : 0 il, 1 elle). Résultat : accord à un point près en anneau, les deux moyennes et qui note le plus sévèrement, les trois plus gros écarts (3 points et plus), ce qui est rédhibitoire pour les deux (2 et moins) et ce qui ne dérange personne (8 et plus). Textes `dixMais.*` de gd.json ; la page (`jeu-dix-mais.ejs`, `{lang}/jeu-dix-mais.json`) liste les soixante cartes par thème (`section3.groupes`, `{ titre, de, a }`), une sur deux au féminin. La grille `.notes-*` (pastilles à un sixième de la largeur sur téléphone, six puis cinq) sert aussi au tour par tour ; le reste est en `.dixm-*`. Lien entrant depuis la FAQ du test « Suis-je amoureux ? ».
- `calculatrice-amour.ejs` — Outil autonome, hors quiz-loader et hors moteur : deux prénoms, un pourcentage, aucune question. Le score est la moyenne pondérée de cinq mesures (lettres partagées 22, méthode historique 26, rythme des voyelles 16, numérologie 22, équilibre des longueurs 14), toutes affichées en barres avec leur explication. Il est déterministe et symétrique : les mêmes prénoms donnent toujours le même résultat et A + B vaut B + A (les deux prénoms sont triés avant le pliage de la méthode historique). Étendue mesurée sur 1 128 paires : 36 à 99 %, médiane 67. La méthode historique compte les lettres du mot amour dans la langue de la page (`calcul.mot` : amour, loves, amor, liebe, amore), donc un même couple n'a pas exactement le même score d'une langue à l'autre, ce que la page explique. Vingt-quatre couples célèbres (`couples` dans `{lang}/calculatrice-amour.json`) remplacent le score et le verdict, jamais le détail des barres. La dose du jour (`dose` : 20 conseils, 20 questions, 20 défis) tourne sur le quantième de l'année, sans rien demander au serveur. Le gabarit ne reçoit que la langue courante : `donneesJs` est construit en EJS, pas les cinq langues d'un coup.

- `quiz-signes-chinois.ejs`, `js/signes-chinois.js`, `{lang}/quiz-signes-chinois.json` : compatibilité amoureuse des signes chinois (route `testSignesChinois`, famille Tests de couple, à côté de la date de naissance). Outil autonome hors moteur, bâti sur le gabarit et les classes (`astro-*`, `dn-*`) de la compatibilité par date de naissance : deux dates complètes (l'année chinoise commence entre le 21 janvier et le 20 février, table `NOUVEL_AN` identique à celle de `date-naissance.js`, les deux fichiers doivent rester d'accord), deux animaux avec élément et polarité, la relation traditionnelle (`trine`, `harmonie`, `meme`, `neutre`, `nuisance`, `opposition`, calcul repris de date-naissance.js), le texte propre à la paire (78 paires dans `paires`, chacune avec sa `note` sur 10, la même dans les cinq langues, écrite dans le helper de génération), le portrait de chaque animal en amour (`portraits`), la relation des éléments avec le sens (`{{de}}` nourrit ou contrôle `{{vers}}`), cinq paliers (`fusion` ≥ 85, `belle` ≥ 70, `solide` ≥ 55, `travail` ≥ 42, `contraires`) et un conseil par relation. Score = note de la paire, plus 0,8 si les éléments se nourrissent, plus 0,3 s'ils sont égaux, moins 0,6 s'ils se contrôlent, borné de 15 à 98 %. Les noms d'animaux, d'éléments et les libellés du formulaire sont repris du fichier `quiz-date-naissance.json` de la même langue. La racine `#sc-outil` est déclarée dans `RACINES_MOTEUR` (quiz-extras.js) pour que les lancements soient comptés, et la carte de résultat porte `quiz-result-card` pour les parties terminées. Encart produit `astro`.
- `compteur-couple.ejs`, `js/compteur-couple.js`, `{lang}/compteur-couple.json` : compteur de durée en couple (« Compteur de couple » jusqu'au 11 octobre 2026, Thomas : « compteur de couple ne veut rien dire » ; le nom est le même dans le H1, le title, la meta, le JSON-LD, le fil d'Ariane, le menu et les deux premiers titres de la page : Relationship duration counter, Contador de tiempo en pareja, Beziehungsdauer-Zähler, Contatore della durata di coppia ; les adresses n'ont pas changé ; le H1 allemand porte une césure conditionnelle, `Beziehungs\u00addauer`, sans quoi un écran de 320 px coupait avant le trait d'union) (route `compteurCouple`, famille Tests de couple, déclaré dans `ROUTES_OUTILS` comme la calculatrice). Outil autonome hors moteur, sur le gabarit et les classes (`astro-*`, `dn-*`) des outils par date : une date de début (trois listes, pas de valeur par défaut), deux prénoms facultatifs, et la carte donne les jours ensemble en grand, la durée en années, mois et jours (le mois se compte de quantième à quantième, `decomposer`, le 31 devient le 30 ou le 28), six tuiles (semaines, mois, heures, minutes, Saint-Valentin partagées, dimanches), les quatre prochaines dates à fêter triées par proximité (anniversaire avec le nom des noces de la langue, `noces` dans le JSON ; prochain mois rond ; deux prochains caps de `CAPS`, centaines puis milliers jusqu'à 30 000 jours plus quatre caps insolites en heures et en minutes) et le dernier cap franchi. Le jour d'une de ces dates, la carte l'annonce (`fete`). Tous les écarts se comptent en UTC sur des dates à minuit. La date et les prénoms sont gardés dans localStorage (`qc-compteur`) et dans le lien `?depuis=AAAA-MM-JJ&a=&b=` que copie le bouton dédié : au retour ou à l'ouverture du lien, le compteur s'affiche tout seul, sans adresse de résultat ni défilement (`silencieux`), le lien l'emportant sur la mémoire. La racine `#cc-outil` est dans `RACINES_MOTEUR` (quiz-extras.js) et la carte porte `quiz-result-card`. Les styles propres sont les `.cc-*` en fin de styles.css ; comme le compteur peut être déjà affiché au chargement (retour ou lien), les règles du résultat (`.cc-*`, `.dn-verdict`, `.dn-bloc`) sont gardées par `npm run critique` lui-même (`GARDER_PAR_CLE` dans `build/critique.mjs`), la couverture ne les voyant pas : recopiées à la main jusqu'au 11 octobre 2026, elles avaient été oubliées dans une régénération du 8 octobre. Aucun encart produit (les outils hors moteur n'en affichent pas).
- `quiz-tu-preferes.ejs` — Inline `WYRGame` (not part of quiz-loader): 15 or 30 dilemmas, two modes chosen on the setup screen and kept across replays. « Chacun son tour » (`mode='tour'`, default): both players answer on the same phone, relay banner between them, reveal after each dilemma, agreement rate at the end. « Ensemble » (`mode='ensemble'`): one answer per dilemma decided by the couple, no names, no relay, no reveal, result lists the choices with the letter picked. The setup accroche is « Tu préfères ? » (`UI.accroche`); `UI.or` is only the medallion between the two options.

### L'écran de départ des tests et des jeux à deux

Revu le 11 octobre 2026 après la remarque de Thomas sur la compatibilité
sexuelle : « c'est de la superposition constante, les marges externes sont
mal gérées et trop courtes », valable pour tous les écrans de prénoms.
Chaque niveau portait un cadre à l'encre et une ombre portée (l'écran, la
carte du joueur, la pastille du numéro, le champ, les boutons de genre, la
pastille du nombre de questions), les cartes étaient inclinées, et sous
480 px la grille sortait du rembourrage du moteur par des marges négatives
pour ne garder que 4 px contre son bord.

- **Une seule carte de prénom :** `cartePrenom(o)` (quiz-engine-core.js), en
  tête la pastille du numéro et le libellé, dessous le champ et, à côté,
  les deux boutons de genre (`aria-pressed`). Elle sert `cartesDeuxJoueurs`,
  la carte « moi » du mode à distance (`carteMoi`), DuoMatch, couple sain,
  parentalité et emménager, coquin, connaissance, et âme sœur et charge
  mentale à deux ; le quiz ado écrit la même structure en HTML
  (`carteJoueur`, quiz-ado-multiplayer.js), et « Qui est le plus » ses
  lignes `.most-joueur` dans le même aplat. Une nouvelle page à deux passe
  par là, jamais par des cartes écrites à la main.
- **L'encre reste au cadre :** le contour épais et l'ombre portée sont pour
  le moteur et le bouton de départ. Dedans, tout est à plat : cartes
  teintées (rose pour le joueur 1, violet pour le joueur 2, comme les deux
  personnages), pastille du nombre de questions en aplat rose, encart de
  mise en garde et interrupteur à distance en aplat neutre. Le champ et les
  boutons de genre gardent seuls un contour, et le bouton de genre non
  retenu s'efface quand l'autre est choisi.
- **Le même ordre partout :** personnages, titre, description, pastille
  « N questions • M min », mise en garde ou ligne d'aide éventuelle, cartes,
  options (longueur, façon de jouer), interrupteur à distance, bouton.
  `ecranDepart` pose la pastille sous la description ; un moteur qui ajoute
  l'interrupteur l'insère avant `ecran.bouton`, pas avant la pastille.
  Allumer le mode à distance ne masque plus la pastille.
- **Les marges :** une colonne sous 720 px, dans le rembourrage du moteur
  (1,25 rem sous 640 px), deux colonnes au-delà. Plus aucune marge négative.
- **Les champs :** texte en 16 px (en dessous, Safari sur iPhone zoome la
  page à la saisie). La règle est écrite `.quiz-engine input.quiz-player-champ`
  pour l'emporter sur `.quiz-engine input[type="text"]`, qui impose sinon le
  trait à l'encre et l'ombre au focus.
- **La ponctuation :** `insecables()` colle « ? ! : ; » à leur mot dans le
  titre et la description de l'écran de départ (le site écrit une espace
  ordinaire, et le « ? » d'un titre passait seul à la ligne à 360 px).
- Styles : section « Écran de départ à deux » en fin de styles.css, juste
  avant le bloc des animations sur téléphone, qui reste le dernier.

### Mode à distance (`salon.js`)

Par défaut, un test à deux se joue sur un seul téléphone qu'on se passe. Les
configurations qui déclarent `distance: true` dans `quiz-loader.js` affichent
en plus un interrupteur « Activer le mode à distance » sur l'écran des
prénoms. Aujourd'hui : tester-couple en duo, common-points, compatibilite,
amoureux (`DuoMatchQuiz`), couple sain (`HealthyQuiz`), parentalité court et
complet et emménager (`ParentaliteQuiz`), âme sœur en duo (`PiliersQuiz`),
charge mentale en duo (`ChargeMentaleQuiz`), je n'ai jamais (`JamaisGame`),
qui de nous deux (`DuoVoteGame`, vote secret) et qui pourrait
(`QuiPourraitGame`), et depuis octobre 2026 c'est un 10 mais (`DixMaisGame`), la
compatibilité sexuelle (`EchelleQuiz`) et le test de relation à distance en mode à deux
(`DuoMatchQuiz`). Une personne crée la partie (code + QR code + lien
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
  sur l'écran des prénoms (inséré avant le bouton de départ), et écrire `demarrerADistance(salon, moi, moiInfo,
  partenaireInfo)` qui construit un `TourParTour` avec `question(idx)` (texte
  et options `{ id, texte }`) et `surFin(a, b)` (ranger les deux séries puis
  afficher le résultat). Un moteur qui tire ses questions autrement fournit
  `idsDepart()` et `appliquerTirage(ids)`. `HealthyQuiz.demarrerADistance` est
  le modèle le plus court. Deux options du tour par tour (octobre 2026) :
  `verdict(maRep, saRep, rang)` rend `{ texte, accord }`, la phrase sous les
  deux réponses et sa couleur (une question lue à l'envers a la même lettre
  des deux côtés sans être un accord) ; une question qui porte `grille: true`
  et `bornes: [gauche, droite]` s'affiche en pastilles sans lettre (les notes
  de 0 à 10 du « c'est un 10 mais »), les deux notes écrites dessous.
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

## Sécurité de la base (11 octobre 2026)

Suite de l'audit du 10 octobre 2026. Le site est statique et la clé publique
(anon) est dans chaque page : tout ce qu'elle peut faire, n'importe qui peut
le faire. Ce qu'elle peut faire aujourd'hui, et rien d'autre :

- **Écrire** dans les tables de mesure (`page_views`, `quiz_starts`,
  `quiz_completions`, `salon_parties`, `article_lectures`, `source_pref_clics`,
  `instagram_clics`), les votes (`oui_non_votes`, `pour_contre_votes`,
  `dilemme_votes`), `profil_resultats`, `purete_scores` et `reviews` (jamais
  approuvé d'office). Chaque colonne texte a une borne de taille (contraintes
  `<table>_<colonne>_taille`, NOT VALID : seules les nouvelles lignes sont
  contrôlées), loin au-dessus de ce que le site envoie, et le score de pureté
  est borné (`purete_scores_bornes`). Un nouveau champ écrit par le site
  reçoit sa borne dans une migration, sinon un seul envoi peut écrire des
  mégaoctets (plan gratuit : 500 Mo, base pleine = lecture seule).
- **Lire** les fonctions des pages publiques : `get_quiz_counts`,
  `get_quiz_total`, `get_quiz_starts_counts`, `get_dilemme_*`,
  `get_oui_non_counts`, `get_pour_contre_*`, `get_profil_stats`,
  `get_purete_stats`, `get_custom_quiz_totaux`, `get_article_lectures`,
  `get_instagram_recents`, `avis_deja_depose`.

Les **statistiques de l'admin** (`get_trafic_*`, `get_quiz_daily*`,
`get_quiz_starts_total`, `get_quiz_starts_daily_par_quiz`, `get_salon_*`,
`get_source_pref_*`, `get_instagram_clics`) ne répondent plus à la clé
publique (migration `20261011130000_stats_admin_privees.sql`) : l'admin les lit
par la fonction serveur `admin-stats`, qui vérifie le jeton admin et relaie
l'appel à PostgREST avec la clé de service, réponse comprise telle quelle
(corps, code, `Content-Range`). Côté navigateur, `appelStats` (admin.js) et
`chargerClics` (admin-reseaux.js) retombent sur l'appel direct d'avant quand
`admin-stats` ne répond pas (réponse sans l'en-tête `x-admin-stats`, ou 401).
Ajouter une statistique à l'admin : l'inscrire dans `FONCTIONS` de
`admin-stats/index.ts`, ne pas la donner à anon (Supabase accorde EXECUTE à
anon sur toute fonction créée dans `public` : `REVOKE ... FROM PUBLIC, anon,
authenticated` dans sa migration) et l'ajouter à la liste de
`20261011130000`. Une migration qui supprime puis recrée l'une de ces
fonctions la rouvre (un CREATE OR REPLACE garde les droits) : relancer
`securite-base.yml`. `20261008150000_instagram_clics.sql`, rejouée par
social-base.yml à chaque nouvelle migration des réseaux, ne donne plus
`get_instagram_clics` à anon.

**Application** : `securite-base.yml` applique à la fusion, par l'API de
gestion de Supabase comme social-base.yml, `20261011110000` et
`20261011120000` tout de suite, puis `20261011130000` seulement quand le site
publié sert le nouvel `admin.js` (celui qui appelle `admin-stats`) et que
`admin-stats?sante=1` répond `ok` (il fabrique un jeton comme verify-admin, le
vérifie, puis relaie un vrai appel). Sans ces deux signaux en 45 minutes, le
job échoue sans rien fermer ; le relancer (« Run workflow ») est toujours sans
risque.

Le reste de ce qui a changé ce jour-là :

- `quiz_ado_sessions` et `quiz_sessions` n'ont plus de règle ni de droit pour
  anon (lecture, création et modification des parties de l'ancien quiz ado,
  prénoms, réponses et adresses IP compris) : le quiz ado passe par des canaux
  Realtime `ado-<code>`, sans table. La fonction `manage-ado-session` est
  retirée du dépôt et supprimée chez Supabase par deploy-functions.yml.
- `leads` : plus d'insertion par la clé publique, tout passe par
  `ebook-verify`, qui contrôle le prénom (60 signes) et l'adresse, limite à dix
  demandes par heure et par adresse IP, n'envoie pas de second e-mail à la
  même adresse avant dix minutes (`leads.verification_sent_at`) et garde le
  même lien d'un e-mail à l'autre (un double clic rendait le premier lien
  inutilisable).
- `verify-admin` compte les essais ratés en base (`admin_connexions_ratees` :
  cinq par adresse en quinze minutes, cent en tout), en plus de la limite en
  mémoire, qui repartait de zéro à chaque redémarrage. Sans la table, la
  limite en mémoire reste seule. Le vrai rempart reste un mot de passe long et
  tiré au hasard (secret `ADMIN_PASSWORD` de Supabase).
- Le jeton Affilae de l'onglet Affiliation est rangé côté serveur
  (`admin_reglages`, fonction `admin-reglages`) et non plus dans le
  `localStorage` du domaine, que lisent les scripts de la régie et de la mesure
  sur les pages publiques. L'admin ne le garde qu'en mémoire ; un jeton resté
  dans un navigateur part au serveur à la première ouverture de l'onglet.
- Les purges (`cleanup_*`, `purge_*`) et `increment_quiz_plays` sont fermées à
  la clé publique. Un `REVOKE ... FROM anon, authenticated` sans `PUBLIC` ne
  ferme rien : anon hérite de PUBLIC.
- `get_article_lectures` (le compteur sous le titre d'un article) répondait
  une erreur depuis `20261008170000`, qui avait supprimé `est_article_blog`,
  qu'elle appelait : une fonction SQL n'enregistre pas les fonctions qu'elle
  appelle comme des dépendances, le DROP passe sans rien dire. Le test est
  désormais écrit dans la fonction (`20261011110000`). Avant de supprimer une
  fonction : `select proname from pg_proc where prosrc ilike '%nom%'`.
- Quelques objets n'existent qu'en production, créés à la main : les tables
  `quiz_completions` et `dilemme_votes`, les fonctions `get_quiz_counts`,
  `get_quiz_total`, `get_dilemme_counts`, `get_dilemme_total`. Ils ne sont
  dans aucun fichier du dépôt (voir RECOVERY.md avant une restauration).

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
- `.blog-card` (liste du blog) et `.dernier-article` (les trois derniers
  articles de l'accueil) : chaque partie de la carte est un enfant direct, sur
  sa propre ligne d'une sous-grille (`grid-template-rows: subgrid`), si bien
  que dans une rangée la date, l'extrait et le bouton sont à la même hauteur
  d'une carte à l'autre, quelle que soit la longueur des titres ; sans
  sous-grille, une colonne flex cale le bouton en bas. Un texte tronqué par
  `-webkit-line-clamp` n'a jamais de rembourrage vertical : le masque passe au
  bord du rembourrage, et jusqu'au 15 octobre 2026 celui du bas de l'extrait
  laissait voir le haut de la quatrième ligne, coupée en deux contre « Lire
  l'article » (remarque de Thomas). L'espace autour est une marge, et dans la
  sous-grille le texte tronqué garde sa propre hauteur (`align-self: start`) :
  étiré à la hauteur de la rangée, il montrerait la ligne suivante. Les points
  de suspension prennent la couleur du bloc, pas celle du lien : un titre
  tronqué porte donc la couleur de son lien (ils sortaient en noir au bout des
  titres roses de l'accueil).
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

Le prénom suit la même mécanique depuis le 7 octobre 2026 (Thomas : des avis
signés d'une seule lettre, d'autres d'un prénom interminable) : **de 3 à 60
caractères, espaces compris**, après retrait des espaces des deux bouts
(`AVIS_NOM_MIN`, `AVIS_NOM_MAX`, `nomAvis`, écrits deux fois eux aussi). Le
champ garde son `maxlength="60"` ; la borne basse et le message (`nomRegle`,
cinq langues) sont dans le script, dans la langue de la page, pas dans la
bulle du navigateur, et le champ fautif reçoit `aria-invalid` et le focus.

La clé publique ne lit pas la colonne `ip_address` de `reviews` (migration
`20261006120000_avis_ip_privee.sql`) : le site demande ses colonnes une à
une, jamais `select=*` (refusé), et la question « cette adresse a-t-elle déjà
laissé un avis ? » passe par la fonction `avis_deja_depose(p_ip)`, qui répond
oui ou non. Un dépôt public avec `is_approved: true` est refusé par la règle
d'insertion. L'admin lit tout par la fonction serveur `admin-reviews`.

Depuis le 12 octobre 2026, un avis part avec la langue de sa page (`lang`,
l'une des cinq, contrainte `reviews_lang_valeur`) : `langueAvis` et
`envoiAvis`, écrits trois fois (quiz-extras.js, quiz-engine-core.js, et
reviews.js pour l'accueil). Si la base répond que la colonne n'existe pas
(PGRST204), l'avis repart sans elle : il ne se perd jamais pour une
information en plus. La langue n'est affichée nulle part : un avis va au
test, et les cinq versions d'une page montrent les mêmes avis, la même note
et le même nombre, données structurées comprises (Thomas, 12 octobre 2026 :
« c'est juste la traduction qui change, pas le test en lui-même »).

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
