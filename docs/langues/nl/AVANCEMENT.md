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
| 3 | Tests de couple, avec leurs textes de moteur (34 pages : la famille sans les cinq outils, lot 7, ni l'évaluation, lot 8, ni le test des vacances, français seulement), par paquets de quatre pages environ | fait le 30 octobre 2026 : 3a (test de couple, points communs, compatibilité, compatibilité sexuelle), 3b (relation à distance, fin de couple), 3c (couple toxique, red flag), 3d (partenaire narcissique, relation sous contrôle), 3e (amour ou habitude, amour ou attachement, est-ce le bon, je l'aime encore), 3f (couple sain, mariage, divorce), 3g (parentalité, emménager), 3h (jalousie, confiance), 3i (dépendance affective, infidélité), 3j (m'aime-t-il encore, à distance), 3k (couché avec un autre, a-t-il oublié son ex), 3l (charge mentale), 3m (langages de l'amour, personnalité amoureuse), 3n (style d'attachement, âme sœur), 3o (relation karmique), 3p (test de pureté) |
| - | Relecture native de l'échantillon | à faire |
| 4 | Tests célibataires, avec leurs textes de moteur (16 pages), par paires | fait le 31 octobre 2026 : 4a (pourquoi je ne trouve pas l'amour, pourquoi suis-je encore célibataire), 4b (combien de temps vais-je rester célibataire, couple ou célibat), 4c (prêt pour une nouvelle relation, suis-je amoureux), 4d (amour ou crush), 4e (amour ou amitié, amoureux de son meilleur ami), 4f (m'aime-t-il en secret, mon ex pense-t-il encore à moi), 4g (encore amoureux de mon ex, combien de temps pour oublier son ex), 4h (mon ex va-t-il revenir, dois-je me remettre avec mon ex), 4i (pourquoi mon ex m'a quitté(e)) |
| 5 à 7 | Quiz et questions, jeux, outils et quiz spéciaux | en cours : 5a (quiz over liefde, wat voor koppel zijn jullie), 5b (ondeugende quiz), 5c (grappige vragen voor koppels), 5d (hoe goed ken je je partner, wie is het meest), 5e (vragen eerste date, gênante vragen) |
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
    des pages publiques (six au départ, restés en français dans toutes les
    langues : ceux de `purete.js` sont passés dans les fichiers de langue au
    lot 3p, restent les deux de `quiz-ado-multiplayer.js`) ;
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

## Lot 3c (30 octobre 2026) : couple toxique, red flag

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/toxische-relatie-test/` | Toxische relatie test: 25 vragen, gratis en vertrouwelijk | Zit ik in een toxische relatie? Test het gratis online |
  | `/nl/red-flag-test/` | Red flag test: is deze persoon een red flag? | Is hij een red flag, of zij? Zoek het uit in 20 vragen |

- **Les textes de moteur** : `toxic` (25 questions, quatre verdicts, dans la
  structure du français, sans les trois verdicts que l'anglais garde sans
  s'en servir) et, dans quizGames.json, `toxic` (l'écran de départ) ;
  `redFlagH` et `redFlagF` (les deux séries de 20 questions, points
  recopiés du français, l'écran des modes), `redFlag` (neuf verdicts) et,
  dans quizGames.json, `red-flag`.
- **Les numéros d'aide** des verdicts graves : en néerlandais, Veilig Thuis
  (0800-2000, Pays-Bas, gratuit, jour et nuit), 1712 (Belgique), et 112 en
  danger immédiat, à la place du 3919 et du 17.
- **Ce que le néerlandais ne reprend pas** : la page du couple toxique parle,
  en français comme en anglais, à la première personne d'un thérapeute
  (« la question que l'on me pose le plus souvent en cabinet », « en tant
  que thérapeute ») ; personne sur le site n'a ce titre, et le néerlandais
  dit la même chose sans s'en réclamer. Le test du couple toxique et le red
  flag ne promettent pas non plus l'anonymat (« anonyme », « anoniem ») :
  la porte e-mail demande une adresse pour le résultat complet. Les cinq
  langues publiques gardent ces phrases : à trancher par Thomas.
- **Les liens** : vers le red flag, le couple sain, la jalousie, le
  partenaire narcissique, la relation sous contrôle, le couple toxique et
  « is hij de ware » ; quatre liens vers des articles du blog (red flags
  chez un homme et chez une femme, love bombing) attendent leur traduction.
- **identiques.txt** accepte « red flag » et « Green flag », que le
  néerlandais emploie tels quels.

## Lot 3d (30 octobre 2026) : partenaire narcissique, relation sous contrôle

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/narcistische-partner-test/` | Narcistische partner test: word ik gemanipuleerd? | Is mijn partner een narcist, of zie ik spoken? |
  | `/nl/controlerende-relatie-test/` | Controlerende relatie test: hoe vrij ben je nog? | Zit ik in een controlerende relatie? |

- **Les textes de moteur** : `pervers` (20 questions, quatre verdicts) et
  `emprise` (20 questions, la cinquième réponse de la question 6, points
  recopiés du français, quatre verdicts), avec leur écran de départ dans
  quizGames.json.
- **« Pervers narcissique »** n'a pas d'équivalent courant en néerlandais :
  la page cite une fois le terme d'origine (« perverse narcist », Marie-France
  Hirigoyen), puis dit « narcist » et « narcistisch misbruik ».
- **Les numéros d'aide** : Veilig Thuis (0800-2000, Pays-Bas, gratuit, jour
  et nuit, conseil anonyme possible), 1712 (Belgique, gratuit et anonyme, les
  jours ouvrables) et 112 en danger. Le verdict le plus grave du red flag
  laissait entendre que le 1712 répond jour et nuit : corrigé. La relation
  sous contrôle ne cite aucune loi, là où le français cite le harcèlement au
  sein du couple et l'anglais le droit anglais et français.
- **La carte des mots-clés** : « zit ik in een controlerende relatie », le H1
  et le libellé du menu, rejoint les mots-clés secondaires de la relation
  sous contrôle.
- **Les liens** : du partenaire narcissique vers le couple toxique, la
  relation sous contrôle, la jalousie et le couple sain ; de la relation sous
  contrôle vers le couple toxique, le partenaire narcissique (deux fois) et
  la dépendance affective. Trois liens vers des articles du blog (dépendance
  affective, red flags chez un homme, ce qu'on ne devrait jamais accepter)
  attendent leur traduction.

## Lot 3e (30 octobre 2026) : amour ou habitude, amour ou attachement, est-ce le bon, je l'aime encore

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/liefde-of-gewoonte-test/` | Liefde of gewoonte test: is het nog liefde? | Blijf je bij je partner uit liefde of gewoonte? |
  | `/nl/verliefd-of-gehecht-test/` | Verliefd of gehecht test: blijf je voor de persoon? | Liefde of gehechtheid: wat houdt je bij je partner? |
  | `/nl/is-hij-de-ware/` | Is hij de ware? Of is zij de ware? Doe de test | De ware test: is dit de juiste persoon voor je? |
  | `/nl/hou-ik-nog-van-hem/` | Hou ik nog van hem of haar? De test in 20 vragen | Hou ik nog van mijn partner, of niet meer? |

- **Les textes de moteur** : `habitude` (quatre verdicts), `attache` (le
  moteur à deux axes, « Liefde » et « Gehechtheid », cinq profils, points et
  axes recopiés du français), `estCeLeBon` (cinq verdicts) et `jeLaime` (huit
  niveaux), points recopiés ; l'écran de départ de « est-ce le bon » dans
  quizGames.json.
- **La porte e-mail** : les quatre pages l'ont. La question « le test est-il
  anonyme ? » de trois FAQ devient en néerlandais « mes réponses restent-elles
  privées ? » et dit ce qui part vraiment : l'adresse une fois, jamais les
  réponses. Les cinq langues publiques gardent « anonyme » : à trancher par
  Thomas avec les pages du lot 3c.
- **La carte des mots-clés** : pour « je l'aime encore », le mot-clé
  secondaire « hou ik nog van mijn partner test » devient « hou ik nog van
  mijn partner », la forme que porte le H1.
- **Les liens** : entre les quatre pages, vers « moet ik scheiden », la
  liefdestaal, le couple sain, la dépendance affective, la fin de couple,
  « ben ik verliefd » et « houdt hij nog van mij ». Un lien vers un article du
  blog (« il ne fait pas d'effort ») attend sa traduction.

## Lot 3f (30 octobre 2026) : couple sain, mariage, divorce

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/gezonde-relatie-test/` | Gezonde relatie test: hoe gezond is jullie relatie? | Heb ik een gezonde relatie? De test voor jullie twee |
  | `/nl/klaar-om-te-trouwen-test/` | Klaar om te trouwen test: 20 vragen voor jullie twee | Zijn jullie klaar om te trouwen? De huwelijkstest voor koppels |
  | `/nl/moet-ik-scheiden-test/` | Moet ik scheiden test: scheiden of nog een kans? | Moet ik scheiden? Een test om het helder te zien |

- **Les textes de moteur** : le couple sain suit le réservoir international
  (préfixe `healthy`, 78 questions, comme l'anglais ; le français a ses 30
  questions sous `couple`), avec l'écran des modes (`sainMode`) et la note de
  sécurité (`healthy` de quizGames.json) ; `marriage` (30 questions, huit
  thèmes, trois verdicts) ; `divorce` (25 questions, les remarques sous
  certaines réponses, quatre verdicts) et son avertissement. L'outil du
  scratchpad (`applique.py`) prend désormais l'anglais comme modèle d'un
  préfixe quand le français n'a pas la même structure (`GD_SOURCE_LANGUE`).
- **Le droit et les numéros** : la section du divorce sur la procédure parle
  des Pays-Bas et de la Belgique (pas de divorce pour faute, avocat obligatoire
  aux Pays-Bas, plan de parentalité, Juridisch Loket, aide juridique de
  première ligne) au lieu du droit français ; Veilig Thuis, 1712 et 112 à la
  place du 3919, du 15, du 17 et du 18.
- **La porte e-mail** : les trois pages l'ont. « Sans inscription » devient
  « zonder account », et le divorce ne dit plus ses réponses « anonymes »
  (« elles ne sont pas enregistrées »).
- **Les titres** : cinq questions affichées en H3 dans la liste statique
  contenaient « echt » ; elles sont reformulées.
- **Les liens** : vers le quiz vrai ou faux, le couple toxique, la confiance,
  la dépendance affective, les questions pour couple, « is hij de ware », le
  test de couple et le couple sain. Le lien du mariage vers l'évaluation est
  écrit et neutralisé à la construction tant qu'elle reste fermée en
  néerlandais.

## Lot 3g (30 octobre 2026) : parentalité, emménager

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/klaar-voor-een-baby-test/` | Klaar voor een baby test: 12 of 24 eerlijke vragen | Zijn we klaar voor een kind? Doe de test met z'n tweeën |
  | `/nl/samenwonen-test/` | Samenwonen test: zijn jullie er klaar voor? | Zijn jullie klaar om samen te wonen? De test voor koppels |

- **Les textes de moteur** : `parentalite` (24 questions, version courte de
  12 et version complète, verdicts et écart entre les deux) et `emmenager`
  (20 questions, quatre verdicts, trois textes d'écart), points recopiés du
  français ; l'écran de départ commun (`parentalite` de quizGames.json).
- **Les chiffres et le droit** : la parentalité parle en euros, sans les
  chiffres français (Insee, coût moyen d'un enfant) ni américains, et
  nomme le congé parental (`ouderschapsverlof`) et la garde
  (`kinderopvang`) sans montant ni durée par pays ; l'emménagement compte en
  mètres carrés et dit du bail ce qui vaut des deux côtés de la frontière
  (les deux noms sur le contrat, ou un seul), sans le droit français.
- **La porte e-mail** : les deux pages l'ont, « zonder account ».
- **Les titres** : une question de la parentalité affichée en H3 dans la
  liste statique contenait « concreet » ; elle est reformulée.
- **Les liens** : de la parentalité vers le test de couple, les points
  communs, le mariage et le couple toxique ; de l'emménagement vers la charge
  mentale, couple ou célibat, le test de couple, le quiz sur l'amour, les
  questions pour couple, le quiz marrant, le quiz coquin et le couple
  toxique. Un lien vers un article du blog (la peur de l'engagement) attend
  sa traduction.

## Lot 3h (30 octobre 2026) : jalousie, confiance

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/jaloezie-test/` | Jaloezie test: ben ik te jaloers, of mijn partner? | Ben ik te jaloers? De jaloezie test voor jou en je partner |
  | `/nl/vertrouwen-relatie-test/` | Vertrouwen in een relatie test: vertrouw je elkaar? | Vertrouw ik mijn partner? De vertrouwenstest voor koppels |

- **Les textes de moteur** : les deux séries de la jalousie, `jalousie1` (la
  sienne) et `jalousie2` (celle du partenaire, des questions « Wat doet je
  partner als... ? » et des réponses qui commencent par le verbe), cinq
  verdicts chacune ; `confiance` (20 questions, quatre verdicts).
- **Le gabarit de la jalousie** : ses onglets et ses deux paragraphes
  d'introduction sont écrits dans `quiz-jalousie.ejs`, langue par langue ;
  le néerlandais y a sa branche (sans elle, la page aurait affiché
  l'italien, la dernière branche de chaque phrase). Le contrôle `code` ne
  signale plus ce gabarit.
- **La porte e-mail** : les deux pages l'ont. Le sous-titre de la confiance
  dit « zonder account » au lieu de « confidentiel », et la FAQ ne reprend
  pas le chiffre de 35 à 40 % des couples qui retrouvent la confiance après
  une infidélité, faute de source.
- **Les liens** : de la jalousie vers le style d'attachement, « is hij over
  zijn ex heen », la confiance, la relation sous contrôle, le couple toxique
  et la dépendance affective ; de la confiance vers la jalousie, le style
  d'attachement, l'infidélité et la dépendance affective.
- **Les mots gardés** : « Factor » et « Effect » (en-têtes du tableau de la
  confiance) rejoignent `identiques.txt`.

## Lot 3i (30 octobre 2026) : dépendance affective, infidélité

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/emotionele-afhankelijkheid-test/` | Emotionele afhankelijkheid test: liefde of vastklampen? | Ben ik emotioneel afhankelijk van mijn partner? Doe de test |
  | `/nl/gaat-mijn-partner-vreemd/` | Gaat mijn partner vreemd? De vreemdgaan test in 20 vragen | Vreemdgaan test: de signalen die niet liegen |

- **Les textes de moteur** : `dependance` (20 questions, quatre verdicts) et
  `infidelite` (20 questions, quatre verdicts).
- **Les numéros** : la section de la dépendance qui parle d'« idées noires »
  donne en néerlandais 113 Zelfmoordpreventie (113 ou 0800-0113, Pays-Bas)
  et la Zelfmoordlijn (1813, Belgique), que le français ne donne pas.
- **Les chiffres** : le tableau de l'infidélité reprend la version anglaise
  (20 à 40 % selon l'enquête et le pays, sans l'IFOP), et la part des
  couples qui se reconstruisent après une thérapie y dit « ongeveer de
  helft », comme le texte de la section 6 (l'anglais écrit 50 à 60 %).
- **La porte e-mail** : la dépendance l'a (« zonder account ») ;
  l'infidélité ne l'a jamais.
- **Les liens** : de la dépendance vers le style d'attachement et la
  jalousie ; de l'infidélité vers le quiz Temptation Island, le style
  d'attachement, le couple toxique et la confiance (verdict 2). Les liens
  du français vers six articles du blog sur la dépendance, absents en
  anglais, ne sont pas repris ; ceux de l'infidélité vers les deux articles
  red flags attendent leur traduction.

## Lot 3j (30 octobre 2026) : m'aime-t-il encore, m'aime-t-il encore à distance

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/houdt-hij-nog-van-mij/` | Houdt hij nog van mij? Of zij? De test in 20 vragen | Houdt mijn vriend nog van mij? Of mijn vriendin? |
  | `/nl/houdt-hij-van-mij-op-afstand/` | Houdt hij van mij op afstand? De test in 15 vragen | Lange afstandsrelatie: houdt hij nog van mij? Of zij? |

- **Les textes de moteur** : `aimeEncore` (20 questions, quatre verdicts)
  et `distanceAime` (15 questions, quatre verdicts), et leurs écrans de
  départ dans quizGames.json (`aime-encore`, `distanceAime`), que le contrôle
  `site` a trouvés en français au premier passage : les textes d'un écran de
  départ propre à un test se cherchent sous la clé du test dans
  `quizGames.json` avant de dire la page finie.
- **Le tableau du score à distance, dans les six langues** : il disait 0 à
  11, 12 à 23, 24 à 35, 36 à 45, alors que le test compte de 0 à 160 points
  (poids de 1 à 3, réponses de 0 à 5 fois le poids) et découpe ses quatre
  verdicts par tranches de 40, comme le dit le texte juste au-dessus. Le
  néerlandais et les cinq langues publiques donnent désormais 0 à 39, 40 à
  79, 80 à 119 et 120 à 160 ; une partie jouée dans Chromium affiche 86/160
  et le verdict de la troisième tranche.
- **La porte e-mail** : les deux pages l'ont (« zonder account », jamais
  « anoniem »).
- **Les liens** : vers « liefde of gewoonte », le couple sain, « is mijn
  relatie voorbij », le test de couple, le couple toxique, la relation sous
  contrôle, « ben ik verliefd », l'infidélité, la dépendance affective, la
  confiance et, entre les deux pages, de l'une à l'autre.

## Lot 3k (30 octobre 2026) : couché avec un autre, a-t-il oublié son ex

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/met-iemand-anders-geslapen/` | Heeft hij met iemand anders geslapen? De test in 15 vragen | Heeft mijn partner met een ander geslapen? |
  | `/nl/is-hij-over-zijn-ex-heen/` | Is hij over zijn ex heen? De test in 20 vragen | Denkt mijn vriend nog aan zijn ex? De test, voor hem of voor haar |

- **Les textes de moteur** : `couche`, `coucheH` et `coucheF` (quinze
  questions qui changent selon que le partenaire est un homme ou une femme,
  quatre verdicts), `sonExH` et `sonExF` (vingt questions dans l'ordre, cinq
  verdicts, écran du choix « Je partner is… » ; les points sont recopiés du
  français), et les écrans de départ `couche` et `oublie-son-ex` de
  quizGames.json. Les deux modes de chaque page ont été joués jusqu'au
  résultat dans Chromium.
- **Le tableau du score du test « couché avec un autre », dans les six
  langues** : il disait 0 à 11, 12 à 23, 24 à 35, 36 à 45, alors que le test
  compte de 0 à 155 points et découpe ses quatre verdicts par tranches de 39.
  Les six langues donnent désormais 0 à 38, 39 à 77, 78 à 116 et 117 à 155,
  et l'encadré dessous parle d'un score de 140 et d'un score de 20 (40 et 8
  avant) ; une partie jouée affiche 80/155 et le verdict de la troisième
  tranche.
- **La porte e-mail** : les deux pages l'ont. La FAQ néerlandaise dit qu'on
  demande l'adresse une seule fois pour la réponse complète, sans les
  réponses ; le français de « a-t-il oublié son ex » disait « rien à créer ni
  à remplir », corrigé à part dans les cinq langues.
- **Les liens** : vers la confiance, la jalousie, le couple sain et
  l'infidélité pour la première page ; vers « over je ex heen komen »,
  « nog verliefd op mijn ex » et la jalousie pour la seconde. Le lien du
  français vers l'article « rester ami avec son ex » attend la traduction du
  blog.

## Lot 3l (30 octobre 2026) : la charge mentale

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/mentale-belasting-test/` | Mentale belasting test: wie denkt er bij jullie aan alles? | Wie draagt de mental load in jullie relatie? |

- **Les mots** : les Néerlandais et les Flamands disent « mental load » pour
  la charge mentale du foyer ; « mentale belasting », mot-clé principal de la
  carte, sert surtout dans les études et au travail. Le title, la description
  et le menu gardent « mentale belasting », le H1 et le texte disent « mental
  load », ajouté aux mots-clés secondaires de la carte (`mots-cles.tsv`).
- **Les textes de moteur** : `chargeMentale` (vingt tâches, quatre domaines,
  six verdicts, écran des deux façons de jouer, « Alleen » et « Met z'n
  tweeën »). Les deux modes ont été joués jusqu'au résultat dans Chromium :
  « Je draagt 100% van de mental load » seul(e), « Sanne draagt 100% van de
  mental load » à deux.
- **Les chiffres de la FAQ** : le français cite le baromètre de l'Ifop et
  l'Insee. Le néerlandais cite l'Emancipatiemonitor 2024 du CBS (chapitre
  « Werken en zorgen », lu le 30 octobre 2026) : 51 % des personnes en couple
  voudraient partager à égalité le travail payé et le ménage, 10 % le font,
  et 46 % disent qu'en pratique la femme fait plus de ménage et l'homme
  travaille plus (couples homme-femme dont l'un au moins travaille, 2024).
- **La porte e-mail** : la page l'a ; « zonder account » au lieu de
  « anonyme », et la FAQ dit que l'adresse est demandée une fois.
- **Les liens** : vers la relation toxique, l'emménagement, le couple sain
  et, par l'encart du haut, la parentalité, quatre pages déjà traduites.

## Lot 3m (30 octobre 2026) : les langages de l'amour, la personnalité amoureuse

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/liefdestaal-test/` | Liefdestaal test: welke van de 5 liefdestalen spreek jij? | De 5 liefdestalen test: ontdek de jouwe in 30 vragen |
  | `/nl/persoonlijkheidstest-liefde/` | Persoonlijkheidstest liefde: hoe ben jij in een relatie? | Persoonlijkheid in de liefde: wat voor partner ben ik? |

- **Les noms des langages** sont ceux de la traduction néerlandaise du livre
  de Chapman (« De vijf talen van de liefde ») : bevestigende woorden,
  dienstbaarheid, cadeaus ontvangen, quality time, lichamelijke aanraking.
  « Quality time » est donc le même mot qu'en anglais, ajouté à
  `identiques.txt`.
- **Les profils de la personnalité amoureuse** : de Gepassioneerde, de
  Zorgzame (le Dévoué, comme « Fürsorgliche » en allemand), de Speelse, de
  Bouwer, et de Evenwichtige quand aucun ne se détache. Le sens des lettres
  tourne d'une question à l'autre : chaque réponse a été traduite lettre par
  lettre, sans rien réordonner.
- **Les textes de moteur** : `loveLanguage` (trente questions, cinq verdicts,
  écran des deux formats, palier des quinze questions) et `personnalite`
  (quinze questions, cinq profils). Les deux formats du premier test et le
  second ont été joués jusqu'au résultat dans Chromium.
- **Le script des statistiques** (`langage-amour-stats.js`, la répartition
  des langages chez les gens qui ont fait le test, affichée à partir de
  quarante résultats) connaît le néerlandais (`nl-NL` pour les nombres) et
  écrit les pourcentages comme le moteur (`PCT_COLLE` : « 34% » en anglais et
  en néerlandais, « 34 % » ailleurs, avec une espace insécable). C'est le
  seul changement public du lot : l'anglais passe de « 34 % » à « 34% ».
- **La porte e-mail** : les deux pages l'ont ; « zonder account », et la FAQ
  de la personnalité dit que l'adresse est demandée une fois.
- **Les liens** : vers le test de couple, les points communs, « hoe goed ken
  je je partner » (pas encore traduite), le quiz coquin et les questions pour
  couple pour la première page ; vers le type de couple (pas encore
  traduit), les langages de l'amour, l'attachement (pas encore traduit) et le
  test de couple pour la seconde. Le lien du français vers l'article des cinq
  langages attend la traduction du blog.

## Lot 3n (30 octobre 2026) : le style d'attachement, l'âme sœur

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/hechtingsstijl-test/` | Hechtingsstijl test: welke hechtingsstijl heb jij? | Welke hechtingsstijl heb ik? Ontdek hoe jij liefhebt |
  | `/nl/zielsverwant-test/` | Zielsverwant test: is dit de juiste persoon voor jou? | Soulmate test: is hij of zij de ware? |

- **Les mots de l'attachement** : veilig, angstig (gepreoccupeerd),
  vermijdend (afstandelijk), gedesorganiseerd (angstig-vermijdend), les
  termes de la psychologie néerlandaise. Le badge du haut dit « Gebaseerd op
  de hechtingstheorie » plutôt que « test scientifique ». Les écrans du
  moteur lisent `attachment` dans quizGames.json (titre de départ, « Jouw
  hechtingsstijl ») : le contrôle `site` les a trouvés en français au premier
  passage.
- **L'âme sœur** : trois façons de jouer (alleen, met z'n tweeën,
  vrijgezel) et deux préfixes (`ameSoeur`, vingt-quatre questions, cinq
  verdicts et la comparaison à deux ; `ameSoeurPortrait`, le portrait de qui
  irait à un célibataire). Les piliers : Gemak, Op één lijn, Tegenslag,
  Zelfstandigheid ; la fusion devient « symbiose », la flamme jumelle
  « tweelingziel ». Le dernier paragraphe donne Veilig Thuis, 1712 et 112 à
  la place du 3919.
- **Les liens** : la dépendance affective, le couple sain et la relation
  toxique pour la première page ; la relation karmique (pas encore
  traduite), la dépendance affective, le couple sain, l'attachement et les
  langages de l'amour pour la seconde. Les ancres qui portaient le nom de la
  page visée (« dépendance affective », « style d'attachement ») disent ce
  dont parle la phrase (« niet meer zonder de ander kunt », « hoe jij je hecht
  aan een partner »). Les trois liens du français vers des articles du blog
  sur l'attachement attendent sa traduction.
- **Ce qui reste en français sur ces pages** : la description de deux cartes
  « Ga verder » vers des pages pas encore traduites (la relation karmique,
  « amour ou crush »).

## Lot 3o (30 octobre 2026) : la relation karmique

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/karmische-relatie-test/` | Karmische relatie test: wat voor band hebben jullie? | Zit ik in een karmische relatie? Test het in 20 vragen |

  Le H1 porte « zit ik in een karmische relatie », la question telle qu'on
  la tape, ajoutée aux mots-clés secondaires de la carte ; le H2 des signes
  dit « De 7 kenmerken van een karmische relatie » pour « karmische relatie
  kenmerken ».
- **Les trois axes** : de rustige band, de spiegelband (la flamme jumelle,
  « tweelingziel ») et de karmische band, plus les « karmische echo's ». Le
  « renforcement intermittent » garde son nom de psychologie,
  « intermitterende bekrachtiging ».
- **Les liens** : la compatibilité (« de band bekijken vanuit jullie
  waarden »), l'attachement, « mon ex pense-t-il encore à moi » (pas encore
  traduite), le couple sain, la relation toxique et le partenaire
  narcissique, avec des ancres qui disent le sujet de la phrase. Les deux
  liens du français vers le blog (love bombing, dépendance affective)
  attendent sa traduction.
- **Ce qui reste en français sur la page** : la description de deux cartes
  « Ga verder » vers des pages pas encore traduites (la date de naissance,
  « amour ou crush »).

## Lot 3p (30 octobre 2026) : le test de pureté

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/puriteitstest/` | Puriteitstest: 50 vragen, alleen of als koppel \| Gratis | Puriteitstest alleen of als koppel |

  « Puriteitstest » est le mot que tapent les Néerlandais et les Flamands,
  « purity test » et « rice purity test nederlands » restent en mots-clés
  secondaires.
- **Les questions** : les cent questions (cinquante seul, cinquante à deux),
  les catégories et les sept paliers de chaque mode sont dans
  `nl/purete.json`, servi en `/js/data/purete-nl.json` ; points, catégories
  et drapeaux « tout public » sont ceux du français. Seul, on tutoie
  (« Heb je weleens... ») ; à deux, « Hebben jullie weleens... ». Le
  registre suit celui du français, familier sans être vulgaire
  (« bodycount », « fuckbuddy » pour « plan cul », « doorhalen » pour une
  nuit blanche). L'écran de l'âge dit 16 ans, comme les cinq langues ; la
  version « moins de 16 ans » pose 29 questions seul et 23 à deux.
- **`purete.js`, pour toutes les langues** : cinq libellés étaient écrits
  en dur en français et s'affichaient ainsi sur les pages anglaise,
  espagnole, allemande et italienne : « ← Changer de mode », le titre
  d'erreur du chargement, « N° » devant le numéro de la question, « N points
  sur M » sous chaque catégorie du résultat et l'étiquette de la croix pour
  quitter (`aria-label`). Ils passent par les fichiers de langue
  (`changer_mode`, `erreur_titre`, `numero`, `cat_detail`, `quitter_aria`).
  L'arrivée sur le résultat (`QCResultat.arrivee`) reçoit la langue de la
  page au lieu de `'fr'` (elle ne sert qu'à la porte e-mail, que cette page
  n'a pas), et les nombres prennent le séparateur de la langue (`nl-NL`
  ajouté à `LOCALES`). Deux libellés ne suivaient pas le mode : « Votre
  résultat » et « Vous êtes ici » servaient au solo comme au couple, si bien
  que l'allemand et l'italien disaient « euer » et « siete » à une seule
  personne, l'espagnol « tu » à un couple et le français mélangeait « tu » et
  « vous » en solo ; ils deviennent `verdict_kicker_solo` et
  `verdict_kicker_couple`, `jauge_ici_solo` et `jauge_ici_couple`. L'encart
  de la boutique partenaire reste en français, marqué `langues: sans-nl`.
- **Les liens** : le hub des jeux (« spel voor een avondje »), les questions
  pour couple (« vragen die je elkaar nooit stelt »), le test de couple
  (« hoe jullie relatie er vandaag voor staat »), l'infidélité dans la liste
  des catégories et la compatibilité (« jullie waarden en jullie plannen »),
  comme en français ; la FAQ renvoie les moins de 16 ans au quiz des ados.
- **Ce qui reste en français sur la page** : le nom de quatre cartes « En
  nu? » vers des jeux et quiz pas encore traduits (le quiz coquin, action ou
  vérité et sa version coquine, la roue des gages).

## Lot 4a (31 octobre 2026) : pourquoi je ne trouve pas l'amour, pourquoi suis-je encore célibataire

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/waarom-vind-ik-geen-liefde/` | Waarom vind ik geen liefde? Test in 15 vragen | Waarom vind ik geen relatie? 15 vragen om het te begrijpen |
  | `/nl/waarom-ben-ik-nog-single/` | Waarom ben ik nog single? Gratis test in 20 vragen | Waarom ben ik single? 20 vragen om de oorzaak te vinden |

  Chaque H1 porte un mot-clé secondaire de la carte, posé comme la question
  qu'on se pose (« waarom vind ik geen relatie », « waarom ben ik single »).
- **Les moteurs** : `trouverAmour` (quinze questions, quatre paliers) et
  `celib` (le diagnostic à huit causes, vingt-deux questions dont deux qui
  dépendent des réponses) ; les poids des causes (`_axes`), les conditions
  (`_si`), l'icône et la durée sont repris du français. Les questions disent
  « je » au lecteur, les réponses sont à la première personne (« Ik denk na
  over wat ik zou kunnen zeggen... »), et la page qui en cite deux les cite
  mot pour mot. L'écran de départ de `trouver-amour` est traduit
  (quizGames.json) ; le diagnostic n'en a pas.
- **Les liens** : chaque page renvoie à l'autre, à la durée du célibat, à
  « couple ou célibat », à l'attachement, à « prêt pour une nouvelle
  relation », à « m'aime-t-il en secret », à « mon ex pense-t-il encore à
  moi », à la dépendance affective, à « amour ou crush » et aux questions du
  premier rendez-vous, avec des ancres qui disent le sujet de la phrase ; les
  ancres françaises du type « ce test » et « celui sur la dépendance
  affective » deviennent « wat er aan zijn of haar kant nog speelt » et
  « het gemis harder praat dan de liefde ». Les trois liens vers l'article sur
  la peur de l'engagement attendent sa traduction.
- **Ce qui reste en français sur les pages** : rien, d'après le contrôle
  `site` joué jusqu'aux résultats.

## Lot 4b (31 octobre 2026) : combien de temps vais-je rester célibataire, couple ou célibat

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/hoe-lang-blijf-ik-nog-single/` | Hoe lang blijf ik nog single? Gratis online test | Wanneer vind ik de liefde? De test die het in maanden schat |
  | `/nl/single-of-relatie-test/` | Single of relatie test: ben je beter af alleen of samen? | Relatie of single: welke manier van leven past bij jou? |

- **Le moteur de la durée** (`dureeCelib`) : les unités sont « 1 maand »,
  « {{n}} maanden », « 1 jaar », « {{n}} jaar » (le néerlandais garde
  « jaar » après un nombre), « 1 jaar en 4 maanden », la marge « Meestal
  tussen 11 maanden en 3 jaar » et la date « Dus rond augustus 2028 » (mois
  en minuscules par `Intl.DateTimeFormat('nl')`, l'année seule passe dans le
  même modèle : pas besoin des clés propres à l'allemand). Les clés des
  verdicts (`r{N}_cle`) restent celles du français, elles partent dans
  `profil_resultats`.
- **Le moteur des deux parts** (`balance`) : points (`_pts`) et clés des
  verdicts repris du français ; « 34% gemaakt om alleen te leven », pourcentage
  collé au nombre.
- **Les liens** : « waarom ben ik nog single » (« komt heel weinig mensen
  tegen », « wat je tot nu toe op afstand heeft gehouden »), « prêt pour une
  nouvelle relation » (« je laatste relatie »), « pourquoi je ne trouve pas
  l'amour » (« de liefde te vinden »), emménager (« onder één dak »), la
  dépendance affective et l'attachement.
- **Le script d'application** (`applique.py`, dans le scratchpad) sait
  désormais ajouter le texte alternatif néerlandais aux objets écrits en JSON
  dans `QUIZ_FEATURED` (`"it": "..."`, comme celui de la durée).
- **Ce qui reste en français sur les pages** : la description d'une carte
  vers « prêt pour une nouvelle relation », pas encore traduite (lot 4c).

## Lot 4c (31 octobre 2026) : prêt pour une nouvelle relation, suis-je amoureux

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/klaar-voor-een-nieuwe-relatie/` | Klaar voor een nieuwe relatie na een breuk? Doe de test | Ben ik klaar voor een nieuwe relatie? De test om het te weten |
  | `/nl/ben-ik-verliefd-test/` | Ben ik verliefd test: liefde of alleen aantrekking? | Ben ik verliefd? |

  Le title et le H1 de « ben ik verliefd » évitent « crush » : c'est le
  mot-clé de la page « amour ou crush » (`crush-test`).
- **Les moteurs** : `pretRelation` (barème explicite repris du français,
  86 points, cinq paliers, et l'écran de départ) et `suisjeamoureux` (barème
  pondéré du chargeur, 205 points). Le français « béguin » devient
  « bevlieging », « relation pansement » devient « reboundrelatie », et la
  distinction néerlandaise entre « houden van » et « verliefd zijn » porte la
  question de la FAQ.
- **Une erreur corrigée sur les cinq pages publiques** : la page « suis-je
  amoureux » annonçait « un score sur 60 » (« out of 60 », « sobre 60 »,
  « einen Wert von 60 », « su 60 ») depuis que le barème pondéré du chargeur
  mène le total à 205, ce que disait déjà le tableau du score de la même
  page ; le résultat affiche bien « …/205 ». La phrase dit désormais 205
  dans les cinq langues.
- **Les liens** : l'ex (« klaar bent met aan je ex denken », « je je nog
  afvraagt wat je ex van je denkt »), « encore amoureux de mon ex » (« komt
  uit gemis »), l'attachement, « pourquoi je ne trouve pas l'amour »,
  « couple ou célibat », amour ou amitié (« de grens met vriendschap »,
  l'ancre française « le test amour ou amitié » nommait la page visée),
  « c'est un 10 mais », l'amour pour un meilleur ami et amour ou habitude.
- **Ce qui reste en français sur les pages** : la description de quatre
  cartes vers des tests célibataires pas encore traduits (lots 4d à 4f).

## Lot 4d (31 octobre 2026) : amour ou crush

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/crush-test/` | Crush test: is het liefde of een crush? (35 vragen) | Crush test: heb je gevoelens voor deze persoon? |

  Le H2 « Heb ik een crush? Zo weet je het » porte le second mot-clé de la
  carte, et « Liefde of een crush: wat is het verschil? » le premier.
  « Crush test » s'écrit en deux mots comme on le tape (et comme « Red flag
  test »), et rejoint `identiques.txt` puisque l'anglais dit pareil.
- **Les moteurs** : `crushH` et `crushF`, deux séries entières de 35
  questions (lui : « hij, hem, zijn » ; elle : « ze, zij, haar »), barème
  explicite repris du français (161 points par série) et l'écran des deux
  modes ; `crush`, les cinq verdicts communs, écrits pour « die persoon ».
  Public de 13 à 18 ans : « je », « in de les », « stories », « een
  bericht sturen » plutôt que « appen », que la Flandre dit moins. Les
  réponses qui suivent une question en « … » sont des phrases entières
  (« Ik word er blij van », pas « Word ik blij ») : la question dit « je »,
  la réponse « ik », et une suite de la phrase mélangerait les deux. Le
  « râteau » devient « een blauwtje lopen ».
- **Les liens** : « het begin van verliefdheid » (ben ik verliefd) et « de
  signalen die hij of zij onbewust geeft » (stiekem verliefd op mij ; l'ancre
  française, onze mots, aurait dépassé huit). Les deux articles du blog
  (« homme nerveux devant une femme », « questions à poser à son crush ») n'ont
  pas d'adresse néerlandaise : leurs phrases restent sans lien, et `textes`
  les rappelle en « à faire » jusqu'au lot 9.
- **Ce qui reste en français sur la page** : la description de trois cartes
  vers des tests célibataires pas encore traduits (lots 4e à 4h).

## Lot 4e (31 octobre 2026) : amour ou amitié, amoureux de son meilleur ami

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/liefde-of-vriendschap-test/` | Liefde of vriendschap test: wat voel je voor die persoon? | Is het liefde of vriendschap? 20 vragen |
  | `/nl/verliefd-op-je-beste-vriend/` | Verliefd op je beste vriend of vriendin? Doe de test | Test: ben je verliefd op je beste vriend of vriendin? |

- **Les moteurs** : `amourAmitie` (barème explicite repris du français,
  146 points, six paliers ; les noms des paliers du tableau de la page sont
  ceux des verdicts) ; `amourAmiH` et `amourAmiF`, deux séries de 15
  questions (beste vriend, beste vriendin), 129 points, et `amourAmi`, les
  quatre verdicts communs, avec l'écran des deux modes et l'écran de départ
  (`amour-ami` de `quizGames.json`). Le vouvoiement français de « amour ou
  amitié » devient « je », comme partout. Les pronoms qui renvoyaient à « de
  vriendschap » ou « de vraag » (« koester haar », « dan kun je haar
  opbergen ») sont remplacés par le nom : avec une amie pour sujet du test,
  « haar » se lisait « elle ».
- **Les liens** : « je gewoon afvragen of je verliefd bent » (ben ik
  verliefd), « signalen dat iemand stiekem gevoelens voor je heeft » et « je
  vriend of vriendin stiekem meer voor je voelt » (stiekem verliefd op mij),
  « liefde die gewoonte is geworden » (liefde of gewoonte), « zo dicht bij
  je beste vriend of vriendin » (dans la FAQ, le premier passage de la page
  qui parle d'un meilleur ami), « wat vriendschap en liefde met elkaar
  delen » (liefde of vriendschap), « je al een tijdje single bent » (waarom
  vind ik geen liefde) et « prille aantrekking tot iemand die je amper
  kent » (crush test ; l'ancre française aurait fait neuf mots). L'article
  du blog sur le manque (« ce n'est pas de l'amour, c'est du manque ») n'a
  pas d'adresse néerlandaise : la phrase reste sans lien, rappelée par
  `textes` jusqu'au lot 9 ; celui sur la dépendance affective en amitié
  disparaît de la première phrase de « amour ou amitié », que l'anglais
  n'a pas non plus.
- **Ce qui reste en français sur les pages** : la description de la carte
  vers « m'aime-t-il en secret » (lot 4f).

## Lot 4f (31 octobre 2026) : m'aime-t-il en secret, mon ex pense-t-il encore à moi

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/stiekem-verliefd-op-mij/` | Is hij stiekem verliefd op mij? Gratis test in 10 vragen | Is hij stiekem verliefd op mij? Of zij? |
  | `/nl/denkt-mijn-ex-nog-aan-mij/` | Denkt mijn ex nog aan mij? Gratis test in 15 vragen | Denkt mijn ex nog aan mij, of ben ik al vergeten? |

  Le mot-clé de la première page est au masculin, comme la recherche : « Of
  zij? » dit dans le H1 que le test vaut aussi pour une femme, sans couper le
  mot-clé (« is hij of zij stiekem… » ne le porterait plus d'un seul tenant).
- **Les moteurs** : `secretH` et `secretF` (dix questions, barème pondéré du
  chargeur, `SOLO_BAREME`, 105 points), `exH` et `exF` (quinze questions,
  150 points), leurs verdicts communs (`secret`, `ex`), les écrans des deux
  modes et l'écran de départ de « en secret » (`secret` de
  `quizGames.json`). Les deux pages vouvoient en français, « je » en
  néerlandais. L'en-tête « Niveau » du tableau devient « Uitslag », comme sur
  les pages déjà traduites où le mot français et le mot néerlandais étaient
  les mêmes.
- **Une erreur corrigée sur les cinq pages publiques** : le tableau du score
  de « m'aime-t-il en secret » découpait encore 0 à 30 (« 0 à 7 », « 8 à
  15 », « 16 à 23 », « 24 à 30 »), alors que la phrase au-dessus dit 105 et
  que le moteur classe sur 105 depuis le barème pondéré (`SOLO_BAREME`,
  poids 21 × 5 ; tranches de `parseGdResults` : 0 à 26, 27 à 53, 54 à 80,
  81 à 105). Le tableau dit désormais ces tranches dans les cinq langues ;
  joué en néerlandais, 55/105 tombe bien dans la troisième. Celui de « mon
  ex pense-t-il encore à moi » (0 à 37 jusqu'à 114 à 150) était juste.
- **Les liens** : « wat je zelf voelt, liefde of aantrekking » (ben ik
  verliefd), « hoe goed jullie in de kern bij elkaar passen » (passen we bij
  elkaar), « dat je ex terugkomt » (komt mijn ex terug), « het bewijs dat het
  nog niet voorbij is » (is mijn relatie voorbij), « een deur op een kier te
  houden » (stiekem verliefd op mij) et « je leven weer oppakt » (klaar voor
  een nieuwe relatie). Le lien français vers l'article sur la dépendance
  affective après une rupture, que les autres langues n'ont pas, n'est pas
  repris.
- **Ce qui reste en français sur les pages** : rien.

## Lot 4g (31 octobre 2026) : encore amoureux de mon ex, combien de temps pour oublier son ex

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/nog-verliefd-op-mijn-ex/` | Ben ik nog verliefd op mijn ex? Test in 20 vragen | Ben ik nog verliefd op mijn ex, of mis ik gewoon de relatie? |
  | `/nl/over-je-ex-heen-komen/` | Over je ex heen komen: hoe lang duurt het? Doe de test | Hoe lang duurt het om over je ex heen te komen? De test in 20 vragen |

  Le title de la seconde commence par le mot-clé tel quel (« over je ex
  heen komen ») ; le H1 porte le secondaire, la question entière (« hoe lang
  duurt het om over je ex heen te komen »), où le « te » coupe le premier.
- **Les moteurs** : `encoreEx` (AxesQuiz, les deux balken « Liefde voor je
  ex » et « Gemis van de relatie », points et axes recopiés du français) et
  `oublierEx` (DureeQuiz : unités, fourchette, date et leviers repris de la
  forme de `dureeCelib` au lot 4b ; la durée sort par exemple « ongeveer 2
  jaar en 2 maanden », « Dus rond december 2028 »). Les deux pages vouvoient
  en français, « je » en néerlandais. Les études gardent leurs chiffres
  (Chong et Fraley 2025, Gardner et Oswald 2006, Marshall 2012, Langeslag et
  Sanchez 2018, Fisher 2010, Lewandowski et Bizzoco 2007) ; « Un de perdu,
  dix de retrouvés » devient « Er zijn nog genoeg vissen in de zee », et le
  3114 français devient 113 Zelfmoordpreventie (113 ou gratis 0800-0113)
  et la Zelfmoordlijn (1813), comme sur les pages déjà traduites.
- **Les liens** : « de zin om weer bij hem of haar te zijn » (terug naar
  mijn ex), « aan je ex denken » (over je ex heen komen), « miste je vooral
  de relatie » (klaar voor een nieuwe relatie), « een bericht van hem of
  haar » (denkt mijn ex nog aan mij), « de hoop dat hij of zij terugkomt »
  (komt mijn ex terug), « waarom het voorbij is » (waarom heeft mijn ex het
  uitgemaakt), « vaak bang zijn om verlaten te worden » (hechtingsstijl) et
  « hun verliefde gevoelens » (nog verliefd op mijn ex). Les trois liens vers
  le blog (« mon ex était-il le bon », deux fois, et la dépendance après une
  rupture) attendent le lot 9, rappelés par `textes`.
- **Ce qui reste en français sur les pages** : rien.

## Lot 4h (31 octobre 2026) : mon ex va-t-il revenir, dois-je me remettre avec mon ex

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/komt-mijn-ex-terug/` | Komt mijn ex terug? Test in 20 vragen | Komt mijn ex ooit terug? De test die je kansen inschat |
  | `/nl/terug-naar-mijn-ex/` | Moet ik terug naar mijn ex? Test in 20 vragen | Weer samen met je ex? De test die je doet voordat je ja zegt |

  Les deux H1 portent un mot-clé secondaire de la carte (« komt mijn ex
  ooit terug », « weer samen met je ex »), le H2 de la seconde page aussi.
- **Les moteurs** : `exRevenir` (102 points, paliers, plancher et plafonds
  repris du français) et `remettreEx` (112 points, six verdicts, plafonds,
  et le rappel sous la question 8, `q8_r`), avec leurs écrans de départ
  (`ex-revenir`, `remettre-ex` de `quizGames.json`). Les noms des verdicts
  cités dans le texte de la page (« weinig kans », « een reële kans », « ga
  niet terug naar je ex », « alles zegt nee, voorlopig », « niet zolang er
  niets is veranderd ») sont ceux du tableau et du résultat. « On-off » se
  dit « knipperlichtrelatie ». Les numéros français deviennent Veilig Thuis
  (0800-2000, jour et nuit), le 1712 (jours ouvrables) et le 112, et pour un
  ex qui menace de se faire du mal, 113 Zelfmoordpreventie et la
  Zelfmoordlijn, qui aident aussi les proches ; joué jusqu'au verdict le plus
  grave, tout s'affiche.
- **Les liens** : « de reden van de breuk » (waarom heeft mijn ex het
  uitgemaakt), « een “ik mis je” » (denkt mijn ex nog aan mij), « de zin om
  weer samen te zijn » (terug naar mijn ex), « zo snel verder te gaan »
  (over je ex heen komen), « de deur lijkt niet helemaal dicht te zijn »
  (komt mijn ex terug), « het comfort van een relatie » (nog verliefd op mijn
  ex) et « de ernstigste red flags » (red flag test). L'article sur les
  ruptures à répétition attend son adresse néerlandaise (lot 9) : ses deux
  phrases restent sans lien.
- **Ce qui reste en français sur les pages** : rien.

## Lot 4i (31 octobre 2026) : pourquoi mon ex m'a quitté(e)

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/waarom-heeft-mijn-ex-het-uitgemaakt/` | Waarom heeft mijn ex het uitgemaakt? Test in 20 vragen | Waarom heeft mijn ex het uitgemaakt? De test om de breuk te begrijpen |

  Le H2 de la première section porte le mot-clé secondaire « redenen om het
  uit te maken ».
- **Le moteur** : le diagnostic `pourquoiQuitte` (huit causes, les poids
  `q{N}{lettre}_axes` repris du français), ses fiches et ses libellés de
  causes, et l'écran de départ. Joué jusqu'au résultat : la cause en tête,
  la seconde quand elle pèse assez, et les huit jauges.
- **Les liens** : « met iemand anders wel werken » (klaar voor een nieuwe
  relatie) et « terug te denken aan de minpunten van hun ex » (over je ex
  heen komen). L'article « on ne quitte pas quelqu'un pour quelqu'un
  d'autre » attend son adresse néerlandaise (lot 9) : sa phrase reste sans
  lien.
- **Ce qui reste en français sur la page** : rien.
- **Le lot 4 en entier** : les seize pages célibataires ouvertes ensemble
  dans Chromium à 360 et 1 280 px, en clair et en sombre : aucun
  débordement, aucun mot coupé, aucun texte resté en français ni sur les
  pages ni sur les cartes « À faire ensuite ».

## Lot 5a (31 octobre 2026) : quiz sur l'amour, quel type de couple

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/quiz-over-liefde/` | Quiz over liefde: 20 vragen, antwoorden jullie hetzelfde? | Antwoorden jullie hetzelfde? Een quiz over liefde in 20 vragen |
  | `/nl/wat-voor-koppel-zijn-jullie/` | Wat voor koppel zijn jullie? De quiz voor twee in 15 vragen | Welk type koppel zijn we? De quiz om samen te doen |

  « Liefdesquiz » reste au quiz des ados (carte des mots-clés) : la première
  page dit « quiz over liefde », jusque dans son H2.
- **Les moteurs** : `amoureux` dans la structure du français (`q{N}`,
  `q{N}a` à `d`, trente questions), sans les verdicts `r0t` à `r3a` que les
  autres langues gardent sans s'en servir ; `typeCouple` (quinze situations,
  chaque lettre garde la famille qu'elle a en français, puisque le moteur
  fait tourner l'ordre d'après elle). Les quatre familles : de
  Onafscheidelijken, de Maatjes, de Vrije Vogels, de Bouwers, et le
  kameleonkoppel. « Pizza » et « Sushi » s'écrivent pareil (identiques.txt).
- **Les liens** : « vragen om elkaar beter te leren kennen » (vragen voor
  koppels), « wat jullie gemeen hebben » (hoeveel hebben we gemeen), « hoe
  stevig jullie relatie is » (relatietest), « hoe ieder van jullie
  liefheeft » (persoonlijkheidstest liefde) et « de liefdestaal van de
  ander » (liefdestaal test).
- **Ce qui reste en français sur les pages** : sur les cartes « À faire
  ensuite » du quiz sur l'amour, les phrases de deux jeux du lot 6 (« tu
  préfères » et les dilemmes), tirées de leur description dans
  `quizzes.json` : elles partent avec le lot 6.

## Lot 5b (31 octobre 2026) : le quiz coquin

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/ondeugende-quiz/` | Ondeugende quiz: 30 pikante vragen voor jullie twee | Ondeugende vragen voor koppels: de quiz voor twee |

  Le title évite « quiz voor koppels », le mot-clé de l'accueil (le contrôle
  `seo` le signalait) ; le H1 porte le mot-clé secondaire « ondeugende
  vragen voor koppels », les titres des sections disent « ondeugende quiz »
  et « pikante quiz ».
- **Le moteur** : les 60 questions sous `coquinQ`, le nom que le préfixe
  porte hors du français (`PREFIX_ALIASES`), dans la structure du français ;
  l'écran du jeu (`coquin` de quizGames.json). « Lingerie » s'écrit pareil
  (identiques.txt).
- **Les liens** : « smaak, gedeelde herinneringen en kleine gewoontes van
  elke dag » (relatietest), « partners op afstand » (lange afstandsrelatie
  test) et « verwachtingen en verlangens » (seksuele compatibiliteit test).
- **Ce qui reste en français sur la page** : les phrases de trois cartes «
  À faire ensuite », vers deux jeux du lot 6 (action ou vérité coquin, la
  roue des gages) et vers le quiz de l'île de la tentation (lot 5).

## Lot 5c (31 octobre 2026) : le quiz marrant

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/grappige-vragen-voor-koppels/` | Grappige vragen voor koppels: 150 vragen om samen te lachen | Grappige quiz voor koppels: 150 vragen om elkaar te stellen |

  Le français répète « quiz pour couple marrant » à chaque paragraphe ; le
  néerlandais garde « grappige quiz voor koppels » là où il est en gras et
  écrit le reste comme on le dirait.
- **Le moteur** : les 150 questions et l'écran du jeu sous `funny`, le nom
  hors du français (`PREFIX_ALIASES`), avec les mêmes clés que le français
  (chaque question deux fois, sous sa famille et sous `q{N}`). Aucune
  question ne dit « echt » ni « eigenlijk », que la page écrit en H3.
- **Les liens** : « meest gênante moment » (gênante vragen), « elkaar al
  spelend te leren kennen » (vragen eerste date) et « koppels op afstand »
  (lange afstandsrelatie test).
- **Ce qui reste en français sur la page** : les phrases de deux cartes «
  À faire ensuite », vers le quiz gênant (lot 5) et le « tu préfères » (lot
  6).
- **Le contrôle** : le moteur n'a pas d'écran de résultat (`SANS_RESULTAT`)
  et `site --jouer` ne le joue pas ; `feuillette.cjs` du scratchpad l'a
  lancé et a fait défiler quatre questions, toutes en néerlandais, avec leur
  famille.

## Lot 5d (31 octobre 2026) : qui connaît le mieux l'autre, qui est le plus

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/hoe-goed-ken-je-je-partner/` | Hoe goed ken je je partner? Quiz met 100 vragen | Wie kent de ander het best? (puis « Quiz voor koppels ») |
  | `/nl/wie-is-het-meest/` | Wie is het meest? Meer dan 240 vragen voor 2 tot 8 spelers | Wie is het meest...? Het spel voor koppels en vrienden |

- **Les moteurs** : `knowledge` (100 questions avec `{{name}}`) et `most`
  (244 questions) dans la structure du français, puisque l'anglais a
  d'autres questions sous d'autres clés : les réponses que ces deux jeux
  n'affichent pas (`q1a` à `q30d` pour le premier, « Speler 1 » et « Speler
  2 » pour le second) sont écrites quand même. Le « qui est le plus » ne dit
  jamais « wie zou eerder », le mot-clé du « qui pourrait » (lot 6) : « wie
  ... het snelst », « het vaakst », « het meest ». « TikTok », « YouTube »
  et « Streetwear » s'écrivent pareil (identiques.txt). La FAQ cite les
  boutons tels que le moteur les écrit (« Opnieuw beginnen », « Andere
  spelers »).
- **Les liens** : « hoe stevig jullie relatie is » (relatietest), « de
  spellen die voor een koppel zijn geschreven » (spelletjes voor koppels) et
  « ondeugendere vragen » (ondeugende quiz). Le lien français vers le quiz
  des Z'amours, page française seulement, n'a pas d'équivalent.
- **Ce qui reste en français sur les pages** : les phrases de quatre cartes
  « À faire ensuite », vers des jeux du lot 6.

## Lot 5e (31 octobre 2026) : premier rendez-vous, quiz gênant

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/vragen-eerste-date/` | Vragen eerste date: 60 vragen in 3 niveaus voor jullie twee | Vragen voor een eerste date: het spel om elkaar te leren kennen |
  | `/nl/genante-vragen/` | Gênante vragen: de test en 80 vragen om elkaar te stellen | Gênante vragen voor koppels: hoe ver durven jullie te gaan? |

  Le title du premier commence par la requête telle qu'on la tape (« vragen
  eerste date ») ; le H1 l'écrit en phrase. Le second évite « vragen voor
  koppels » dans son title, le mot-clé de la page des questions.
- **Les moteurs** : `rencontre` (60 questions en trois niveaux, l'écran
  qui annonce chaque niveau) ; `genant` (le test : quinze situations, barème
  et paliers repris du français, cinq verdicts, l'écran des deux formats) et
  `genantJeu` (80 questions en quatre familles). La question que Thomas
  glisse dans la dernière famille (« j'ai créé ce site tout seul… ») est
  traduite telle quelle.
- **Les liens** : « over je ex praten » (denkt mijn ex nog aan mij), « hoe
  je met onenigheid omgaat » (gezonde relatie test), « wegen stiltes
  zwaarder en valt het gesprek sneller stil » (lange afstandsrelatie test),
  « een goed gesprek » (vragen voor koppels) et « iedereen een eigen
  puriteitsscore heeft » (puriteitstest). Le lien français vers l'article
  des 36 questions d'Aron attend son adresse néerlandaise (lot 9).
- **Ce qui reste en français sur les pages** : les phrases de trois cartes
  « À faire ensuite », vers des jeux du lot 6 et vers la page des questions
  (lot 5).

## Les chiffres

Au lot 5e : `textes nl` 683 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (61 pages traduites) ; `site nl` : le premier rendez-vous et
les deux formats du quiz gênant vont jusqu'à leur résultat ; trois erreurs
attendues, les cartes vers des pages pas encore traduites. Aucune page
publique ne change.

Au lot 5d : `textes nl` 659 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (59 pages traduites) ; `site nl` : les deux moteurs vont
jusqu'à leur résultat ; quatre erreurs attendues, les cartes vers des jeux
du lot 6. Aucune page publique ne change.

Au lot 5c : `textes nl` 637 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (57 pages traduites) ; `site nl` : deux erreurs attendues,
les cartes vers des pages pas encore traduites. Aucune page publique ne
change.

Au lot 5b : `textes nl` 621 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (56 pages traduites) ; `site nl` : le moteur va jusqu'à son
résultat ; trois erreurs attendues, les cartes vers des pages pas encore
traduites. Aucune page publique ne change.

Au lot 5a : `textes nl` 616 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (55 pages traduites) ; `site nl` sur les deux pages : les
deux moteurs vont jusqu'à leur résultat, aucun débordement ; deux erreurs
attendues, les phrases des cartes vers deux jeux du lot 6. Aucune page
publique ne change.

Au lot 4i : `textes nl` 603 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (53 pages traduites) ; `site nl` sur la page, puis sur les
seize pages du lot 4 : aucune erreur, le moteur va jusqu'à son résultat sans
texte resté en français. Aucune page publique ne change.

Au lot 4h : `textes nl` 592 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (52 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, les deux moteurs vont jusqu'à
leur résultat, sans texte resté en français. Aucune page publique ne change.

Au lot 4g : `textes nl` 568 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (50 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, les deux moteurs vont jusqu'à
leur résultat, sans texte resté en français. Aucune page publique ne change.

Au lot 4f : `textes nl` 545 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (48 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, les deux modes de chaque test
vont jusqu'à leur résultat, sans texte resté en français. Côté public, seul
le tableau du score de « m'aime-t-il en secret » change, dans les cinq
langues.

Au lot 4e : `textes nl` 514 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (46 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, le moteur de « amour ou
amitié » et les deux modes de « meilleur ami » vont jusqu'à leur résultat ;
reste en français la description d'une carte vers une page pas encore
traduite. Aucune page publique ne change.

Au lot 4d : `textes nl` 489 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (44 pages traduites) ; `site nl` sur la page : aucun
débordement ni mot coupé à 360 et 1 280 px, les deux modes (crush garçon,
crush fille) vont jusqu'à leur résultat ; restent en français les
descriptions de trois cartes vers des pages pas encore traduites. Aucune
page publique ne change.

Au lot 4c : `textes nl` 476 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (43 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, les deux moteurs vont jusqu'à
leur résultat ; restent en français les descriptions de quatre cartes vers
des pages pas encore traduites. Côté public, les cinq pages « suis-je
amoureux » disent 205 au lieu de 60.

Au lot 4b : `textes nl` 455 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (41 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, les deux moteurs vont jusqu'à
leur résultat ; reste en français la description d'une carte vers une page
pas encore traduite. Aucune page publique ne change.

Au lot 4a : `textes nl` 437 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (39 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, les deux moteurs vont jusqu'à
leur résultat, sans texte resté en français. Aucune page publique ne change.

Au lot 3p : `textes nl` 417 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (37 pages traduites) ; `site nl` sur la page : aucun
débordement ni mot coupé à 360 et 1 280 px, les deux modes vont jusqu'à leur
résultat ; joué aussi dans Chromium dans les six langues, seul et à deux, et
en néerlandais dans la version « moins de 16 ans » et en thème sombre ; reste
en français le nom de quatre cartes vers des pages pas encore traduites ;
`code nl` passe de 223 à 216 erreurs, plus rien dans `purete.js`. Côté
public, les cinq pages du test de pureté affichent leurs propres libellés là
où elles montraient du français.

Au lot 3o : `textes nl` 405 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (36 pages traduites) ; `site nl` sur la page : aucun
débordement ni mot coupé à 360 et 1 280 px, le moteur va jusqu'à son
résultat ; restent en français deux descriptions de cartes vers des pages
pas encore traduites. Aucune page publique ne change.

Au lot 3n : `textes nl` 393 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (35 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, le test d'attachement et les
trois façons de jouer l'âme sœur vont jusqu'à leur résultat ; restent en
français deux descriptions de cartes vers des pages pas encore traduites.
Aucune page publique ne change.

Au lot 3m : `textes nl` 366 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (33 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, les moteurs vont jusqu'à leur
résultat dans chaque format, sans texte resté en français. Côté public, seul
le script des statistiques des langages de l'amour change.

Au lot 3l : `textes nl` 345 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (31 pages traduites) ; `site nl` sur la page : aucun
débordement ni mot coupé à 360 et 1 280 px, les deux modes du moteur vont
jusqu'à leur résultat, sans texte resté en français. Aucune page publique ne
change.

Au lot 3k : `textes nl` 332 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (30 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, les deux modes de chaque moteur
vont jusqu'à leur résultat, sans texte resté en français. Côté public, seul
le tableau du score du test « couché avec un autre » change, dans les cinq
langues.

Au lot 3j : `textes nl` 303 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (28 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, les deux moteurs vont jusqu'à
leur résultat, et le seul texte resté en français est celui d'une carte
« Hierna » vers « ben ik verliefd », pas encore traduite. Côté public, seul
le tableau du score du test à distance change, dans les cinq langues.


Au lot 3i : `textes nl` 276 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (26 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, les deux moteurs vont jusqu'à
leur résultat, et les textes restés en français sont ceux des cartes
« Hierna » vers des pages pas encore traduites. Aucune page publique ne
change.


Au lot 3h : `textes nl` 252 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (24 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, les deux moteurs vont jusqu'à
leur résultat (la deuxième série de la jalousie, derrière son onglet, jouée à
part dans Chromium), et les textes restés en français sont ceux des cartes
« Hierna » vers des pages pas encore traduites. Aucune page publique ne
change, gabarit de la jalousie compris.


Au lot 3g : `textes nl` 228 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (22 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, chaque moteur va jusqu'à son
résultat dans chaque mode (version courte et complète pour la parentalité),
et le seul texte resté en français est celui d'une carte « Hierna » vers la
charge mentale, pas encore traduite. Aucune page publique ne change.


Au lot 3f : `textes nl` 217 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (20 pages traduites) ; `site nl` sur les trois pages : aucun
débordement ni mot coupé à 360 et 1 280 px, chaque moteur va jusqu'à son
résultat dans chaque mode (solo et duo pour le couple sain), et les textes
restés en français sont ceux des cartes « Hierna » vers des pages pas encore
traduites. Aucune page publique ne change.


Au lot 3e : `textes nl` 198 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (17 pages traduites) ; `site nl` sur les quatre pages : aucun
débordement ni mot coupé à 360 et 1 280 px, chaque moteur va jusqu'à son
résultat, et le seul texte resté en français est celui d'une carte « Hierna »
vers une page pas encore traduite. Aucune page publique ne change.


Au lot 3d : `textes nl` 162 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (13 pages traduites) ; `site nl` sur les deux pages : aucun
débordement ni mot coupé à 360 et 1 280 px, chaque moteur va jusqu'à son
résultat, et les textes restés en français sont ceux des cartes « Hierna »
vers des pages pas encore traduites. Aucune page publique ne change.


Au lot 3c : `textes nl` 137 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (11 pages traduites) ; `site nl` sur les deux pages : aucun
débordement, chaque moteur va jusqu'à son résultat dans chaque mode (homme
et femme pour le red flag), et les deux textes restés en français sont ceux
des cartes « Hierna » vers des pages pas encore traduites. Aucune page
publique ne change.


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
| `quiz-engine-core.js`, `quiz-loader.js`, `quiz-ado-multiplayer.js`, gabarits de pages (`quiz-astro-prenoms`, `quiz-date-naissance`, `quiz-jalousie`, `quiz-tu-preferes`, `questions-couple`), `compteur-couple.js`, `purete.js`, `questions-couple.js` | 3 à 7, avec leurs pages (`langage-amour-stats.js` : fait au lot 3m ; `purete.js` : fait au lot 3p) |
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
