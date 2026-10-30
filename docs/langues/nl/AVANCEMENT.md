# Le néerlandais : où on en est

Le chantier est décrit dans `docs/langues/CADRAGE-NL.md` ; ce fichier dit ce
qui est fait, ce qui reste, et les chiffres des contrôles au dernier lot. On
le met à jour dans la PR de chaque lot.

## Les lots

| Lot | Contenu | État |
|---|---|---|
| 0 | `nl` caché dans le code, contrôles, guide de style | fait le 30 octobre 2026 |
| 1 | Carte des mots-clés (requêtes françaises qui apportent des clics → équivalent néerlandais), adresses des 99 pages | fait le 30 octobre 2026 |
| 2 | Textes communs : menu, accueil, pied de page, textes communs des moteurs, pages juridiques | fait le 30 octobre 2026 : 2a (menu, pied, pages d'information), 2b (accueil), 2c (textes communs des moteurs), 2d (contact, mentions légales, confidentialité) |
| 3 | Tests de couple, avec leurs textes de moteur (35 pages : la famille sans les cinq outils, lot 7, ni l'évaluation, lot 8), par paquets de quatre pages environ | en cours : 3a (test de couple, points communs, compatibilité, compatibilité sexuelle), 3b (relation à distance, fin de couple) |
| - | Relecture native de l'échantillon | à faire |
| 4 à 7 | Tests célibataires, quiz et questions, jeux, outils et quiz spéciaux | à faire |
| Ouverture | `nl` sort de `LANGUES_CACHEES` | à faire |
| 8 | Évaluation payante, e-mails, CGV | à faire |
| 9 et suite | Blog | à faire |

## Lot 0 (30 octobre 2026)

- **L'interrupteur** : `LANGUES_CACHEES = ['nl']`, `LANGUES_PUBLIQUES` et
  `langueCachee()` dans `static-site/build/config.js`. Une page /nl/ est
  construite dès que sa route a une adresse `nl` dans `ROUTE_SLUGS` ; tant que
  la langue est cachée, elle est en « noindex, follow », sans hreflang, sans
  flux RSS, hors des sitemaps, d'IndexNow et du sélecteur de langue des
  autres pages (son propre menu la montre, pour la relire). Un article n'y
  existe qu'avec son adresse dans `BLOG_ARTICLES` et son fichier dans
  `data/blog/nl/` (`articleTraduit`) ; avant, les liens écrits vers lui sont
  neutralisés comme ceux d'un article programmé. Une clé absente de `nl/`
  retombe sur le français.
- **Ce qui est publié** : `/nl/` (l'accueil, textes encore en français) et
  `/nl/404.html`, tous deux en noindex. Les cinq langues publiques sont
  identiques octet pour octet à la construction d'avant, aux identifiants
  tirés au hasard près (`vague-*`, compteur des mascottes) et à l'adresse
  `home.nl` ajoutée dans la liste embarquée des pages de jeu.
- **Les contrôles** : `static-site/build/verifie-langue.mjs` (mode d'emploi
  en tête du fichier), calé sur l'allemand, l'italien et l'espagnol :
  - `code` : listes, objets par langue, expressions et branches qui
    énumèrent les langues sans `nl`, libellés écrits en dur dans les scripts
    des pages publiques (six, dans `purete.js` et `quiz-ado-multiplayer.js`,
    qui restent en français dans toutes les langues) ;
  - `textes` : `nl/*.json` partie par partie face au français et à
    l'anglais ;
  - `seo` : la carte `mots-cles.tsv` et les balises des pages construites ;
  - `site` : les pages /nl/ de `dist/` dans Chromium à 360 et 1 280 px, en
    clair et en sombre, et `--jouer` chaque moteur jusqu'à son résultat, une
    fois par mode.
- **Le guide** : `STIJLGIDS.md` ; les valeurs gardées telles quelles :
  `identiques.txt`.

## Lot 1 (30 octobre 2026)

- **La carte** : `mots-cles.tsv`, une ligne par route (99), avec la requête
  française qui apporte le plus de clics et ses clics (Search Console, du
  1er août au 29 octobre 2026). Le mot-clé principal en est l'équivalent
  néerlandais naturel, jamais le même pour deux pages (92 mots-clés, les 7
  pages d'information n'en ont pas). Les volumes mesurés par Thomas fixent
  six pages : « vragen voor koppels » (questions), « grappige vragen voor
  koppels » (quiz drôle), « liefdestest » (calculatrice), « spelletjes voor
  koppels » (jeux), « relatietest » (test de couple), « zou je liever
  vragen » (tu préfères).
- **Les choix qui ne viennent pas de la requête française** :
  - les points communs ne gardent pas « test de compatibilité amoureuse »,
    qui leur apporte des clics en France mais appartient au test de
    compatibilité (« passen we bij elkaar ») ;
  - « test amour » et « quiz amour » ne vont ni à l'amour ou l'habitude ni
    au « suis-je amoureux », mais à la calculatrice (« liefdestest ») et au
    quiz sur l'amour (« quiz over liefde ») ;
  - les 30 pages sans clic en France (les pages d'information, les tests
    « ex » du 28 octobre, les quiz d'Halloween, le jeu de soirée, le
    compteur...) prennent la requête de la page anglaise quand elle en a,
    sinon le nom que l'usage néerlandais donne à la chose ;
  - l'emprise devient « controlerende relatie test » : « dwingende
    controle » est le terme officiel, peu tapé, il reste en secondaire.
- **Les adresses** : `ROUTE_SLUGS.nl` pour les 99 routes, ASCII, tirées du
  mot-clé principal. Les 99 pages sont construites (`/nl/...`), cachées, avec
  les textes français en attendant les lots 2 à 7. Joués un à un
  (`site nl --jouer --sans-rendus`), tous les moteurs vont jusqu'à leur
  résultat, sans erreur de console. Pour ça, les fichiers de données qu'une
  langue cachée n'a pas encore (`games-nl.json`, `purete-nl.json`,
  `bilan-nl.json`) sont ceux du français : le jeu de pureté, qui ne sait pas
  retomber seul sur le français, ne se lançait pas sur /nl/.

## Lot 2a (30 octobre 2026) : le menu, le pied de page, les pages d'information

- **Les textes** : `nl/common.json` (menu, pied de page, boutons, avis, porte
  e-mail, blog, 404, barre de la réduction) et `nl/custom-quiz.json` (la page
  « Maak je eigen quiz »). Les libellés du menu suivent la carte des
  mots-clés (« Relatietest », « Zou je liever? », « Wie van ons twee »...).
  Deux mots trop longs pour la colonne du menu à 360 px portent une césure
  conditionnelle : « Persoonlijk­heids­test », « superschurken­duo ».
- **Le code** : titres et descriptions des pages d'information, fil
  d'Ariane, 404, prix (`nl-NL` : « € 9,90 »), blocs des questions des pages
  de moteur (`STATIC_Q_LABELS`, `STATIC_Q_HEADINGS`), titres du flux RSS
  (generate.js) ; barre de preuve sociale, bloc des avis, chargement du
  moteur, 404, page « Over mij », cartes « Hierna », plan du site (gabarits) ;
  formulaires d'avis, écran du résultat, mot « Advertentie » au-dessus du
  bandeau (scripts) ; catégories du blog (`BLOG_CATEGORIES`).
- **À reprendre plus tard** :
  - `STATIC_Q_HEADINGS` (generate.js) reprend le titre de l'écran de départ
    de huit moteurs : à vérifier quand leurs textes seront écrits (lots 3 à 6).
  - Les listes de langues acceptées pour un avis (`LANGUES_AVIS`, écrite
    trois fois), la porte e-mail (`capture.js`, `lead-capture`) et l'admin
    (`LANGUES_ABONNES`) n'auront `nl` qu'avec la migration qui l'ajoute aux
    contraintes de la base (`reviews_lang_valeur`, `abonnes`...) : sinon un
    avis envoyé depuis une page /nl/ serait refusé par la base et perdu.
    Avant l'ouverture.
  - **L'âge de la case de la porte e-mail** : « 16 jaar of ouder » en
    néerlandais, l'âge du consentement numérique aux Pays-Bas (13 ans en
    Belgique), validé par Thomas le 30 octobre 2026 (« ok pour 16 ans ») ;
    15 ans dans les cinq langues publiques.
  - La clé `nav.bilanCoupleDesc` parle encore d'un rapport de 30 pages dans
    les cinq langues publiques ; aucune page ne l'affiche.

## Lot 2b (30 octobre 2026) : l'accueil

- **Les textes** : `nl/home.json`. Title « Quiz voor koppels: gratis online
  tests voor jullie relatie » (58 signes), H1 « Test jullie relatie met een
  quiz voor koppels », description de 154 signes avec « quiz voor koppels ».
  Les phrases de la scène du hero sont courtes (« Wie valt altijd als eerste in
  slaap? », « Zou je liever… ») et tiennent à 360 px. Les phrases des cartes
  qui manquent dans `home.json` sont les descriptions des pages
  (`quizzes.json`) : elles viendront avec chaque page, aux lots 3 à 7.
- **L'image de partage** : `public/og/quiz-couple-nl.jpg` (« Quizzen, tests
  en spelletjes voor koppels », « Gratis, zonder account »), dessinée par
  `build/image-partage.mjs --langue nl`, qui ne refait plus que les langues
  demandées ; texte alternatif dans `IMAGE_PARTAGE`.
- **L'évaluation fermée en néerlandais** (`BILAN_LANGUES_FERMEES`,
  `bilanOuvertPour(lang)` dans config.js) : plus de bouton dans le menu, de
  barre de la réduction, de section ni de bouton sur l'accueil, d'encart sous
  les résultats, de bannière ni de carte dans les familles sur les pages /nl/ ;
  la page `/nl/relatiecheck/` est construite en noindex, hors du hreflang et
  des sitemaps du néerlandais, et les liens écrits vers elle sont neutralisés.
  Elle rouvre en retirant `nl` de la liste, au lot 8. Les cinq langues
  publiques n'ont pas bougé d'un octet sur ce point.
- **Les derniers articles** : la section ne s'affiche que s'il y a des articles
  dans la langue ; l'accueil /nl/ n'en a pas avant le lot 9.
- **Au passage, sur l'accueil des cinq langues publiques** : les cartes du
  mariage, du divorce et de la parentalité donnaient 30, 25 et 20 questions
  (20, 15, et 12 ou 24 en vrai, aussi dans les cartes « À faire ensuite ») ;
  l'introduction du blog parlait encore des tests d'applications de rencontre,
  retirés ; celle d'Instagram de « trois animations par jour » ; le titre
  « Qu'est-ce qu'un quiz pour couples ? » avait une espace avant son « ? » en
  anglais, en espagnol, en allemand et en italien, et une espace précédait la
  ponctuation après les mots en gras du même bloc (« constructifs . »).
- **À trancher avant l'ouverture** : le blog /nl/ est vide jusqu'au lot 9, et
  le menu, le pied de page et le plan du site y mènent. Soit on traduit
  quelques articles avant d'ouvrir, soit la page du blog reste en noindex et
  hors du menu tant qu'une langue n'a pas d'article.

## Lot 2c (30 octobre 2026) : les textes communs des moteurs

- **Les textes** : dans `nl/quizGames.json`, les parties partagées par tous
  les moteurs (`playerSetup`, `question`, `result`, `meta`, `reviews`,
  `share`, `story`, `quizNames`, `ui`, `salon`) ; dans `nl/gd.json`, la seule
  partie commune (`question`). Les parties propres à un test ou à un jeu
  (`coquin`, `plateau`, `quiDeNous`...) viennent avec leur page, aux lots 3
  à 7. En attendant, `games-nl.json` est complété par le français, clé par
  clé (generate.js) : `tg()` ne retombe pas seul sur le français, et un jeu
  aurait affiché ses clés.
- **Les noms des quiz** (`quizNames`) sont ceux des cartes de fin de partie,
  repris du menu et de la carte des mots-clés, sans césure. Dans un message de
  partage, le nom est entre guillemets (« Ik scoorde 87% bij ‘Relatietest’ »)
  : un nom de test ou de jeu néerlandais prendrait « de » ou « het » selon le
  mot, et les noms en forme de question n'en prennent pas.
- **Le moteur** (`quiz-engine-core.js`) : les phrases qu'il assemble lui-même
  suivent la typographie de la langue (`avantPonct`, `pctTexte` dans le
  socle) : « Sanne! », « Score: », « 87% » en néerlandais et en anglais, une
  espace insécable en français ; les étiquettes de l'écran de résultat
  (`pcLabels`) et le message de chargement trop long (`quiz-loader.js`) ont
  leur néerlandais. Les produits affiliés restent sans néerlandais
  (`langues: sans-nl`, pas d'identifiant Amazon.nl), et `verifie-langue.mjs`
  accepte une marque posée sur l'ouverture d'une table entière.
- **Les phrases à ordre fixe** : « Sanne weet veel meer over de ander dan
  Daan! » (le quiz « Wie kent de ander het best? » assemble prénom, texte,
  prénom), « Nu is het de beurt aan Sanne! ».
- **Restent pour la base, avant l'ouverture** : `LANGUES_AVIS` (écrite trois
  fois, dont `quiz-engine-core.js`), `capture.js`, `lead-capture`.

## Lot 2d (30 octobre 2026) : contact, mentions légales, confidentialité

- **Les textes** : `nl/contact.json`, `nl/legal.json` (mentions légales et
  politique de confidentialité, traduites au plus près, en « u », comme le
  veut le guide pour les pages juridiques) et, de `nl/cgv.json`, les seuls
  libellés du vendeur (`vendeur`), que les deux pages juridiques affichent ;
  le statut du vendeur en néerlandais est dans `VENDEUR` (config.js). Le
  reste des conditions de vente vient au lot 8, avec l'évaluation.
- **Les adaptations** : le droit de réclamation nomme, en plus de la CNIL,
  l'Autoriteit Persoonsgegevens (Pays-Bas) et la Gegevensbeschermingsautoriteit
  (Belgique) ; l'âge des e-mails est celui de la case de la porte, 16 ans
  (validé par Thomas).
- **À trancher avant l'ouverture** : la porte e-mail enregistre une adresse
  néerlandaise comme française (`capture.js` ne connaît pas `nl` tant que la
  base ne l'accepte pas), et rien ne part en néerlandais avant le lot 8. Soit
  la porte reste fermée en néerlandais jusqu'à ses e-mails, soit la
  migration passe d'abord et les adresses attendent.
- **Remarqué au passage, sans y toucher** : les mentions légales des cinq
  langues listent les services tiers sans Brevo, qui envoie les e-mails du
  parcours depuis le 24 octobre 2026 ; la politique de confidentialité, elle,
  le nomme.

## Lot 3a (30 octobre 2026) : test de couple, points communs, compatibilité, compatibilité sexuelle

- **Les pages**, sur la carte des mots-clés (title avec le mot-clé principal en
  tête, H1 différent avec le principal ou un secondaire, description de 120 à
  155 signes) :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/relatietest/` | Relatietest gratis online: 20 vragen over jullie relatie | Relatietest: hoe stevig is jullie relatie? |
  | `/nl/hoeveel-hebben-we-gemeen/` | Hoeveel hebben we gemeen? Test met 153 vragen voor koppels | Wat hebben we gemeen? Test jullie raakvlakken in 20 vragen |
  | `/nl/passen-we-bij-elkaar/` | Passen we bij elkaar? Compatibiliteitstest in 20 vragen | Compatibiliteitstest: zijn jullie voor elkaar gemaakt? |
  | `/nl/seksuele-compatibiliteit-test/` | Seksuele compatibiliteit test: 20 vragen voor jullie twee | Passen we seksueel bij elkaar? De test voor koppels |

- **Les textes de moteur** : `testerC` (33 questions, deux modes) et
  `coupleLevel` (huit niveaux) ; `cp`, le nom des points communs hors du
  français, avec les 153 questions et le vocabulaire d'options partagé
  (`qNopts` recopiés du français, libellés `o_*`), dans la structure du
  français, sans les verdicts `r0t` à `r3a` que les autres langues gardent
  sans s'en servir (les verdicts viennent de `result.low/medium/high` de
  quizGames.json) ; `compatibilite` (20 questions) ; `compatSex` (20
  questions, cinq dimensions, cinq niveaux). Les textes alternatifs des
  images de tête sont dans `QUIZ_FEATURED`.
- **Le maillage** : les mêmes cibles que l'anglais, en /nl/ (`relatietest`,
  `passen-we-bij-elkaar`, `vragen-voor-koppels`, `klaar-voor-een-baby-test`,
  `zielsverwant-test`, `sterrenbeelden-match`, `waarheid-of-durven-18`,
  `seksuele-compatibiliteit-test`...). Deux liens de la compatibilité
  sexuelle vers des articles du blog (langages de l'amour, questions
  intimes) attendent leur traduction : le texte est là, sans lien.
- **Corrigé dans les cinq langues publiques** : la section 6 du test de
  couple annonçait 10 signes et en listait 5 ; sa FAQ disait 30 questions
  pour une réserve de 33. Le moteur écrivait « 100 % » avec une espace
  ordinaire dans les dimensions de la compatibilité sexuelle et dans
  l'étiquette de l'anneau du « Qui de nous deux » : `pctTexte` (« 100% » en
  anglais et en néerlandais, espace insécable ailleurs).
- **Les contrôles** : `site --captures <dossier>` photographie l'écran de
  résultat de chaque moteur joué, sans la porte e-mail, pour relire les
  verdicts ; `identiques.txt` accepte Pasta, Burger, Japan, New York, Winter.

## Lot 3b (30 octobre 2026) : relation à distance, fin de couple

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/lange-afstandsrelatie-test/` | Lange afstandsrelatie test: 100 vragen, alleen of samen | Lange afstandsrelatie test: houden jullie het samen vol? |
  | `/nl/is-mijn-relatie-voorbij/` | Is mijn relatie voorbij? De test in 24 eerlijke vragen | Is mijn relatie voorbij, of nog niet? Onze test |

- **Les textes de moteur** : `distance` (100 questions, deux modes, quatre
  verdicts et leurs étiquettes) ; `finCouple` (24 questions et leurs points
  recopiés du français, huit niveaux) et, dans quizGames.json, `finCouple`
  (les trois pistes de la fin du test).
- **Les adaptations** : la page « relation à distance » parlait de « la
  réalité française » (l'indépendance des couples français, 18 à 24 mois
  avant de se retrouver) ; en néerlandais, la sous-partie dit seulement la
  durée moyenne, sans parler de la France. Les deux témoignages gardent
  leurs prénoms et leurs villes.
- **Les liens** : vers « houdt hij van mij op afstand », le test toxique et
  « met iemand anders geslapen » ; trois liens vers des articles du blog
  (Marie-Antoinette et Fersen, arrêter ou continuer) attendent leur
  traduction.
- **Corrigé dans les cinq langues publiques** : le résumé de la page « fin
  de couple » promettait « aucune donnée personnelle », alors que la porte
  e-mail demande une adresse pour voir le résultat complet (CLAUDE.md : une
  page à porte ne promet jamais « sans e-mail ») ; il dit désormais
  seulement « aucune inscription ».
- **Le contrôle seo** a trouvé « concreet » dans le titre H3 d'une question
  de la liste pour les robots : la question 1 a été reformulée.

## Les chiffres

Au lot 3b : `textes nl` 114 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (9 pages traduites) ; `site nl` sur les deux pages : aucun
débordement, chaque moteur va jusqu'à son résultat dans chaque mode, et les
trois textes restés en français sont ceux des cartes « Hierna » vers des
pages pas encore traduites. Côté public, seule la phrase du résumé de la fin
de couple change, dans les cinq langues.


Au lot 3a : `textes nl` 84 parties écrites sur 1 045, sans erreur (trois
avertissements voulus : « Relatieblog », « Thrillers », « Rap/hiphop ») ;
`seo nl` sans erreur (7 pages traduites contrôlées) ; `site nl` sur les quatre
pages : aucun débordement ni mot coupé à 360 et 1 280 px, chaque moteur va
jusqu'à son résultat dans chaque mode, et les quatre textes restés en français
sont ceux des cartes « Hierna » qui mènent à des pages pas encore traduites.
Côté public, seules les cinq pages du test de couple changent (les deux
corrections ci-dessus), et les paquets du moteur.


Au lot 2d : `textes nl` 44 parties écrites sur 1 045 (1 042 avant que le contrôle ne lise aussi `cp`, `coquinQ` et `funny`, les préfixes de `gd.json` qui portent un autre nom hors du français) ; `site nl --jouer --sans-rendus` : chaque moteur va jusqu'à son résultat, dans chaque mode, sans erreur de console, et les 753 textes restés en français sur 73 pages sont ceux propres à chaque test ou jeu (lots 3 à 7).

Au lot 2c : `code nl` 259 passages (dans le moteur, il ne reste que `LANGUES_AVIS`, pour la base, et les textes de l'encart de l'évaluation, lot 8), `textes nl` 38 parties écrites sur 1 042.

Au lot 2b : `code nl` 280 passages, `textes nl` 27 parties écrites sur 1 042,
`seo nl` sans erreur (3 pages contrôlées), `site nl --pages '/nl/$'` sans
débordement ni erreur de console, les textes restés en français étant les
descriptions des pages (`quizzes.json`).

Au lot 1 : `code nl` 334 passages dans 61 fichiers (169 dans `config.js`),
`seo nl` sans erreur (92 pages dont le title est encore en français),
`textes nl` 0 partie écrite sur 1 042.

### Au lot 0

| Contrôle | Résultat |
|---|---|
| `code nl` | 432 passages sans `nl`, dans 61 fichiers (dont 267 dans `config.js` : les adresses au lot 1, les textes alternatifs des images au lot 2), et 9 fichiers propres à la langue à faire |
| `textes nl` | 0 partie écrite sur 1 042 |
| `seo nl` | carte des mots-clés absente (lot 1) |
| `site nl` | 2 pages (`/nl/`, `/nl/404.html`), textes encore en français |

### Ce que `code` demande, et le lot qui s'en charge

| Fichiers | Lot |
|---|---|
| `config.js` (`ROUTE_SLUGS`, `BLOG_ARTICLES`, `BLOG_CATEGORIES`), `sitemap.ejs` | 1 (adresses), puis 9 (articles) |
| `generate.js` (titres des pages d'information, fil d'Ariane, 404), gabarits partagés (`header`, `preuve-sociale`, `quiz-reviews`, `related-tests`, `quiz-loading`, `404`, `about`, `home`), `home-dynamic.js`, `quiz-extras.js`, `reviews.js`, `resultat-url.js`, `pub.js`, `capture.js`, `admin.js`, `image-partage.mjs`, textes alternatifs de `config.js` | 2 |
| `quiz-engine-core.js`, `quiz-loader.js`, `quiz-ado-multiplayer.js`, gabarits de pages (`quiz-astro-prenoms`, `quiz-date-naissance`, `quiz-jalousie`, `quiz-tu-preferes`, `questions-couple`), `compteur-couple.js`, `purete.js`, `langage-amour-stats.js`, `questions-couple.js` | 3 à 7, avec leurs pages |
| Base et fonctions : `_shared/abonnes/regles.mjs` (porte e-mail), contrainte des avis, `manage-custom-quiz`, migrations (`reviews`, `abonnes`, `custom_quizzes`, chemins du blog) | 2 (une migration qui ajoute `nl` partout) |
| L'évaluation : `bilan.js`, `_shared/bilan/*`, `bilan/*`, `bilan-banniere`, `bilan-sous-moteur`, migrations des bilans | 8 |
| Les e-mails : `emails/*`, migrations des e-mails, `brevo-reglages.yml` | 8 |

Les fichiers propres à la langue (`public/og/quiz-couple-nl.jpg`,
`public/email/voir-tu-preferes-nl.png`, les aperçus du rapport) sont listés
par `code` en « à faire ».

## Ce que le joueur automatique sait faire

Calé le 30 octobre 2026 sur 24 moteurs allemands (`site de --jouer
--sans-rendus`), qui vont tous jusqu'à leur résultat, dans chaque mode. Il remplit les prénoms, les dates et les listes, choisit une
bascule seulement dans un groupe où rien n'est choisi (genre, nombre de
cartes), répond, tape les relais entre joueurs ou attend qu'ils s'effacent,
passe en dernier les boutons qui ne sont qu'un symbole (↺, ✕), ne joue
pas un mode « chacun sur son téléphone » (il en faut deux), et s'arrête à
`.quiz-result-card` ou `[data-quiz-done]`. Les pages sans écran
de résultat (cartes sans fin, salons à plusieurs téléphones, hubs) sont dans
`SANS_RESULTAT` et se vérifient à la main ; le jeu de soirée a son essai à
six téléphones (CLAUDE.md).
