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
| 5 à 7 | Quiz et questions, jeux, outils et quiz spéciaux | lot 5 fait (5a à 5i : quiz over liefde, wat voor koppel zijn jullie, ondeugende quiz, grappige vragen voor koppels, hoe goed ken je je partner, wie is het meest, vragen eerste date, gênante vragen, waar of niet waar quiz, temptation island quiz, liefdesquiz voor tieners, vragen voor koppels) ; lot 6 en cours : 6a (zou je liever vragen), 6b (waarheid of durven voor koppels, waarheid of durven 18+), 6c (opdrachten voor koppels, bordspel voor koppels), 6d (wie van ons twee, wie zou eerder vragen), 6e (dilemma's voor koppels, voor of tegen stellingen), 6f (ik heb nog nooit vragen, ja of nee vragen), 6g (maak de zin af, hij is een 10 maar), 6h (partyspel voor koppels), 6i (spelletjes voor koppels) : lot 6 fait ; lot 7 à faire |
| Ouverture | `nl` sort de `LANGUES_CACHEES`, les pages pas encore traduites attendent dans `PAGES_EN_ATTENTE` | fait le 31 octobre 2026, après les jeux : 86 pages ouvertes, 13 en attente (les outils et les quiz spéciaux, lot 7 ; les CGV, lot 8 ; la liste du blog, lot 9) |
| 8 | Évaluation payante, e-mails, CGV | en cours : 8a (algemene voorwaarden), 8b (page de vente de la relatiecheck), 8c (textes de l'application et du rapport), 8d (les 118 questions), 8e (serveur, e-mails de l'évaluation, PDF, base), 8f (avis et quiz personnalisés) |
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

## Lot 5f (31 octobre 2026) : le quiz vrai ou faux

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/waar-of-niet-waar-quiz/` | Waar of niet waar quiz: 100 verrassende vragen over relaties | Waar of niet waar quiz over liefde en relaties |

  Le title évite « quiz voor koppels », le mot-clé de l'accueil.
- **Le moteur** : les 100 affirmations, leurs réponses (recopiées) et leurs
  explications, les quatre verdicts et l'écran du jeu (`truefalse`). Les
  affirmations s'affichent en H3 dans la page : aucune ne dit « echt ».
- **Les questions propres à la France** (quinze : divorces, âge au mariage,
  PACS, Ifop, INSEE, mariage posthume...) restent françaises et le disent
  (« In Frankrijk... ») : l'anglais et l'allemand les ont remplacées par des
  chiffres de leur pays, mais les chiffres néerlandais et belges n'ont pas
  été vérifiés un à un, et une affirmation fausse n'a pas sa place dans un
  quiz qui corrige les idées reçues. À reprendre avec le CBS et Statbel si
  Thomas le souhaite.
- **Corrigé dans trois langues publiques** : l'affirmation 98 disait que «
  mariage » (et « marriage », et l'allemand « Ehe ») vient du latin «
  matrimonium », réponse « vrai ». C'est faux (« mariage » vient de «
  marier », du latin « maritare » ; « Ehe » est germanique). Elle dit
  désormais que le mot latin « matrimonium » vient de « mater », ce qui est
  vrai, en français, en anglais et en allemand ; l'espagnol et l'italien («
  matrimonio ») étaient justes.
- **Les liens** : « gezonde relatie » (gezonde relatie test), « fundamentele
  waarden » (passen we bij elkaar) et « vreemdgaan in een relatie » (gaat
  mijn partner vreemd).
- **Ce qui reste en français sur la page** : la phrase d'une carte « À
  faire ensuite », vers les dilemmes (lot 6).

## Lot 5g (31 octobre 2026) : le quiz de l'île de la tentation

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/temptation-island-quiz/` | Temptation Island quiz: zou jij het overleven? | De Temptation Island quiz: hoe lang hou jij het vol op het eiland? |

  « Temptation Island » est le nom de l'émission aux Pays-Bas et en Flandre :
  il reste tel quel (`identiques.txt`). Ce que la page dit de l'émission
  (née aux États-Unis en 2001, diffusée aux Pays-Bas et en Flandre de 2002
  à 2009, revenue en 2016 sur RTL 5, VIJF et Videoland, aujourd'hui sur
  Videoland) a été vérifié avant d'être écrit.
- **Le moteur** : les vingt situations du séjour, leurs réponses, les
  points recopiés du français (`GD_COPIES`), les cinq verdicts et l'écran du
  jeu (`tentation` de quizGames.json) ; « kampvuur » pour le feu de camp,
  « verleider » et « verleidster » pour les tentateurs.
- **Les liens** : « jaloezie » (jaloezie test), « uit gewoonte »
  (liefde of gewoonte), « wat een relatie gezond houdt » (gezonde relatie
  test) et « hoe sterk jullie band is » (relatietest).
- **Les deux-points du moteur, dans toutes les langues** : six phrases que
  le moteur assemble lui-même (« Score de tentation : », « Explication : »,
  l'étiquette des cartes de mode et de résultat, le compte d'un joueur)
  écrivaient « : » avec une espace ordinaire dans toutes les langues. Elles
  passent par `avantPonct()` : espace insécable en français, rien ailleurs.
  Même correction dans `salon.js` (le code de la partie, lu par les
  lecteurs d'écran) et dans `quiz-ado-multiplayer.js` (les deux boutons du
  choix de mode). En français, seul le type d'espace change.

## Lot 5h (31 octobre 2026) : le quiz des ados

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/liefdesquiz-voor-tieners/` | Liefdesquiz voor tieners: blijven jullie samen? | Quiz voor tienerstelletjes: hoe sterk staan jullie samen? |

- **Le moteur** (`quiz-ado-multiplayer.js`, à part du moteur commun) : les
  80 questions et leurs réponses (`nl/quiz-ado.json`, que la construction
  aplatit dans `js/data/gd/ado-nl.json`), les quatre verdicts, et une entrée
  `nl` dans sa propre table de textes. « Je vriend(in) » pour le « ton/ta
  partenaire » du français ; ni « verkering » (Pays-Bas) ni « je lief »
  (Flandre), qui ne parlent qu'à un des deux pays. Le « bac » de la
  question 2 devient le diplôme de fin d'études (« je diploma halen »).
- **Corrigé dans toutes les langues** : la coche et la croix du détail des
  réponses portaient « identique » et « différent » en français pour les
  lecteurs d'écran, quelle que soit la langue ; elles passent par la table
  (`pareil`, `different`).
- **La FAQ** dit ce que fait le moteur : sur deux téléphones, les réponses
  passent par un canal temporaire qui disparaît quand on arrête, et rien
  n'est gardé. Le français et les quatre autres langues parlent encore de
  « sessions qui expirent après 30 minutes », un reste de l'ancienne table
  des parties ; à reprendre si Thomas le souhaite.
- **Les liens** : « een relatie waarin je je goed voelt » (gezonde relatie
  test), « ver van elkaar wonen » (relatie op afstand) et « een relatie
  snel toxisch maken » (toxische relatie test). Le lien du français vers
  l'article des phases de la rupture attend la traduction du blog.
- **Ce qui reste en français sur la page** : la phrase d'une carte « À
  faire ensuite », vers le tu préfères (lot 6).

## Lot 5i (31 octobre 2026) : vragen voor koppels

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/vragen-voor-koppels/` | 100+ vragen voor koppels om aan elkaar te stellen | 100+ leuke vragen voor koppels, om elkaar beter te leren kennen |

  Le français a le même title et le même H1 (le choix de Thomas) ; ici le
  H1 porte deux mots-clés secondaires de la carte (« leuke vragen voor
  koppels », « elkaar beter te leren kennen »).
- **Le contenu** : les 120 questions des cinq thèmes (avec leur nom court
  pour les pastilles du tirage), les neuf situations et leurs exemples, les
  huit jeux, les cinq conseils et la FAQ. Le tirage (`questions-couple.js`)
  a ses libellés néerlandais, et le gabarit écrit les nombres en `nl-NL`.
- **Sans le blog** : le curseur des listes ne s'affiche pas tant qu'aucun
  article de questions n'existe en néerlandais, et les liens des situations
  vers ces articles (neuf en français) attendent le lot 9 ; les phrases qui
  parlaient de « la liste complète » ont été écrites sans elle. Restent dans
  le texte deux liens : « vragen over seks » (ondeugende quiz) et « vragen
  speciaal voor koppels op afstand » (relatie op afstand).
- **Les 36 questions d'Arthur Aron** : le français dit que les deux
  inconnus se regardent ensuite quatre minutes dans les yeux, et la FAQ
  qu'on les pose « en une heure et demie environ ». Seule l'année de
  l'étude (1997, *Personality and Social Psychology Bulletin*) a pu être
  vérifiée depuis une session de travail : l'article lui-même n'a pas pu
  être lu (refus de l'éditeur), et rien de ce qui a été lu ne dit si le
  regard de quatre minutes faisait partie de l'étude ou vient de l'article
  de Mandy Len Catron (New York Times, 2015), ni combien de temps durait
  l'exercice. Le néerlandais ne dit donc ni l'un ni l'autre ; à vérifier
  dans l'article, puis à reprendre dans les cinq langues publiques si
  besoin.
- **Le contrôle `seo`** ne signale plus qu'un title porte le mot-clé d'une
  autre page quand son propre mot-clé le contient déjà (« grappige vragen
  voor koppels » et « vragen voor koppels ») ; le title des points communs
  ne dit plus « vragen voor koppels » (« Hoeveel hebben we gemeen? Test het
  samen met 153 vragen »).

## Lot 6a (31 octobre 2026) : zou je liever

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/zou-je-liever-vragen/` | Zou je liever vragen: 100 lastige keuzes voor jullie relatie | Wat zou je liever? 100 vragen die jullie gaan verrassen |

  Le title évite « dilemma's voor koppels » (le mot-clé des dilemmes) et
  « vragen voor koppels » (celui de la page des questions).
- **Le moteur** : les 100 dilemmes et leurs deux réponses (`wyr` de
  gd.json), et une entrée `nl` dans la table de libellés écrite dans le
  gabarit (`uiLabels` de quiz-tu-preferes.ejs). « Zou je liever hebben
  dat... » quand le choix porte sur ce que fait l'autre ; « je partner », «
  hij of zij » ; les questions s'affichent en H3, aucune ne dit « echt ».
  Partie jouée jusqu'au résultat dans les deux façons de jouer (om de
  beurt, samen) avec `joue-wyr.cjs` (scratchpad de la session) : le
  contrôle `site` ne joue pas ce moteur à part.
- **Les liens** : « je partner beter te leren kennen » (relatietest), «
  groepsspelletjes met andere koppels » (wie is het meest) et « meer
  dingen om samen te doen » (grappige vragen voor koppels).
- **Ce qui reste en français sur la page** : les cartes « Vous aimerez
  aussi » et « À faire ensuite » vers les jeux du lot 6 pas encore faits.

## Lot 6b (31 octobre 2026) : action ou vérité, classique et coquin

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/waarheid-of-durven-koppels/` | Waarheid of durven voor koppels: online spel met 70 kaarten | Waarheid of durven voor koppels, zonder iets voor te bereiden |
  | `/nl/waarheid-of-durven-18/` | Waarheid of durven 18+: 70 pikante kaarten voor jullie twee | Ondeugende waarheid of durven, de versie die zich niet inhoudt |

- **Le moteur** (`PartyGame`, partagé avec le plateau) : les 140 cartes
  (`actionVerite`, `actionVeriteHot`) et les textes du jeu (`jeu` de
  quizGames.json). Vérité, action, gage : « Waarheid », « Durven »,
  « Strafje » (le diminutif garde le gage léger, et la page peut dire
  qu'« een strafje is nooit een echte straf »). Le niveau le plus osé
  garde son nom des cinq langues, « Hot » (`identiques.txt`). « Aan de
  beurt: Sanne » pour le tour, sans forme devant voyelle. « kaart(en)
  gespeeld », le compteur commençant à un.
- **Le premier paragraphe** de la version classique ne parle plus des
  listes « qu'on trouve en ligne » (règle de l'introduction qui ne tape pas
  sur ce qui existe ailleurs) : il dit pourquoi une liste qu'on fait
  défiler s'épuise en cinq minutes.
- **Les liens** : « de ondeugende versie voor volwassenen », « de vragen
  die koppels elkaar stellen » et « tellen wat ieder al eens gedurfd heeft
  » depuis la version classique ; « De klassieke versie » et « met
  ondeugende vragen in plaats van opdrachten » depuis la version coquine.
- **Vérifié** : six cartes jouées sur chaque page, un gage compris, puis
  la fin de partie (`joue-party.cjs`, scratchpad de la session).
- **Ce qui reste en français sur ces pages** : le fil d'Ariane vers le hub
  des jeux et les cartes vers les jeux du lot 6 pas encore faits.

## Lot 6c (31 octobre 2026) : la roue des gages, le jeu de plateau

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/opdrachten-voor-koppels/` | Opdrachten voor koppels: draai aan het rad, 140 opdrachten | Het rad met opdrachten voor koppels: draai zo vaak als jullie willen |
  | `/nl/bordspel-voor-koppels/` | Bordspel voor koppels: 40 vakjes en één winnaar | Het bordspel voor koppels dat je op één telefoon speelt |

- **Les moteurs** : les 140 gages de la roue (`gageRoue`) et ses textes
  (`roue`), les cases, les souvenirs et les duels du plateau (`plateau`) et
  ses textes (`plateau` de quizGames.json). Un gage de la roue est une «
  opdracht » (le mot-clé de la page), une famille une « soort ». Restent
  tels quels, comme dans les cinq langues : « Show », « Massage », « Duel
  », « Start », « Finish » (`identiques.txt`).
- **Corrigé dans les cinq langues publiques** : la case chance du plateau
  était décrite comme pouvant faire reculer de deux cases ou échanger les
  pions, ce que le jeu ne fait plus depuis le 8 octobre 2026
  (`PLATEAU_CHANCES` : une, deux ou trois cases, rejouer, rattraper
  l'autre). Elle dit désormais ce qu'elle fait, et qu'elle ne fait jamais
  reculer.
- **Les introductions** du plateau ne disent plus que « les jeux de couple
  en ligne se ressemblent tous » ni que le gagnant est « ce qui manque à la
  plupart des jeux en ligne » : elles décrivent le jeu, sans taper sur ce
  qui existe ailleurs.
- **Les liens** : « een potje waarheid of durven » et « waarheid of durven
  voor volwassenen » depuis la roue ; « waarheid of durven » (d'où viennent
  les cartes) depuis le plateau.
- **Vérifié** : la roue tourne et tire un gage ; une partie de plateau
  jouée jusqu'à la victoire, puis la dernière carte du perdant
  (`joue-boutons.cjs`, scratchpad de la session).

## Lot 6d (31 octobre 2026) : qui de nous deux, qui pourrait

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/wie-van-ons-twee/` | Wie van ons twee? Gratis spel voor koppels, met z'n tweeën | Wie van ons twee? Het spel met de geheime stemming |
  | `/nl/wie-zou-eerder-vragen/` | Wie zou eerder vragen: het spel voor koppels, 108 vragen | Wie zou eerder? Het spel voor koppels met 100+ vragen |

- **Les moteurs** : les 80 questions et les textes de « wie van ons twee »
  (`quiDeNous`, gd.json et quizGames.json ; les questions sont la fin de «
  Wie van jullie twee… »), les 108 questions et les textes de « wie zou
  eerder » (`quiPourrait` ; chaque question finit la phrase « Wie zou
  eerder … ? », verbe à l'infinitif en dernier). Comme en allemand
  (« Wer würde eher »), le jeu prend le nom que les gens tapent, « wie zou
  eerder », et non la traduction de « qui pourrait ».
- **Corrigé dans les cinq langues publiques** : la description et la
  meta du « qui de nous deux » annonçaient 40 questions ; le jeu en a 80
  (quatre thèmes de vingt), ce que la page dit déjà. Les cartes qui
  reprennent cette description changent avec elle (40 pages construites).
- **Ce que le néerlandais dit autrement** : la FAQ de « wie van ons twee »
  (« deux, et un seul téléphone ») et celle de « wie zou eerder » (chacun
  ouvre le jeu de son côté et on compare à la fin) datent d'avant le mode à
  distance, que les deux jeux ont désormais : le néerlandais parle de la
  façon de le lancer. Le français et les autres langues gardent l'ancienne
  réponse, pas fausse, à reprendre si Thomas le souhaite.
- **Les liens** : « een test over jullie relatie » (relatietest) et « in de
  eerste weken van een relatie » (vragen eerste date) ajoutés à « wie van
  ons twee », qui n'en avait aucun en français ; « ieder in het geheim een
  van jullie aanwijst », « andere spelletjes om met z'n tweeën te doen » et
  « Ik heb nog nooit » depuis « wie zou eerder ».
- **Vérifié** : une partie entière de chaque jeu, jusqu'au score
  d'harmonie et jusqu'au verdict (`joue-boutons.cjs`).

## Lot 6e (31 octobre 2026) : les dilemmes, le pour ou contre

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/dilemmas-voor-koppels/` | Dilemma's voor koppels: 100 situaties om samen te beslissen | 100 dilemma's voor koppels om samen te beslissen, en hoeveel mensen er al stemden! |
  | `/nl/voor-of-tegen-stellingen/` | Voor of tegen stellingen voor koppels: gratis online spel | Voor of tegen: 60 stellingen voor koppels om samen te beslissen |

- **Les moteurs** : les cent dilemmes (`dilemmes` de gd.json : `d{N}`
  l'avantage, `d{N}_mais` le prix, lu après « MAAR ») et les textes du jeu
  (`dilemme` de quizGames.json) ; les soixante stellingen, leurs six
  thèmes (`pourContre`) et les textes du jeu. « Jullie » quand le marché
  vaut pour le couple, « je » quand il ne touche qu'une personne et met
  l'autre en jeu (« je partner weet ook precies wat jij denkt »). Les
  votes partent avec `lang: 'nl'` dans `dilemme_votes` et
  `pour_contre_votes`, qui n'ont pas de contrainte de langue (16 signes au
  plus) ; les pourcentages se comptent toutes langues confondues, comme
  pour les cinq autres.
- **Une stelling sert aussi de titre** : la page écrit les soixante
  stellingen en H3 sous le jeu (« Voor of tegen: … », la liste statique),
  première lettre en minuscule. Une stelling ne prend donc aucun mot
  interdit dans les titres (« Elkaar echt alles vertellen » est devenu
  « Elkaar alles vertellen ») et ne commence pas par un nom qui garde sa
  majuscule (« Kerst … » est devenu « De kerstdagen … »).
- **Les liens** : sur la page des dilemmes, « twee opties en kies je er
  één » (zou je liever) et « een gewoon ja of nee » (ja of nee vragen),
  tous deux dans la première section ; le français met le second dans la
  dernière (« d'autres font voter »), que `liens-contenu.mjs` signale
  `BAS`. Sur le pour ou contre : « de andere spelletjes voor twee » (le
  hub), « wat je wint en wat het kost » (les dilemmes), « vragen om elkaar
  beter te leren kennen » (vragen voor koppels).
- **Le contrôle `textes` reconnaît un lien déplacé** : même cible que la
  référence, autre clé du même texte (le fichier pour une page ; la partie
  pour gd.json, quizGames.json, quizzes.json et common.json). Il le
  signale en avertissement (« lien vers … déplacé dans … ») au lieu d'une
  erreur « lien manquant ».
- **Vérifié** : une partie de chaque jeu jusqu'à son bilan
  (`joue-boutons.cjs`, envois vers la base coupés pour ne compter aucun
  faux vote).

## Lot 6f (31 octobre 2026) : je n'ai jamais, oui ou non

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/ik-heb-nog-nooit-vragen/` | Ik heb nog nooit vragen als koppel: speel ze samen online | ‘Ik heb nog nooit’-spel voor koppels: 100 vragen om samen te spelen |
  | `/nl/ja-of-nee-vragen/` | Ja of nee vragen als koppel: 120 situaties, live stemmen | Ja of nee vragen: het online spel om als koppel te spelen |

  Les deux titles disent « als koppel » et non « voor koppels » : « … vragen
  voor koppels » contient le mot-clé principal de `/nl/vragen-voor-koppels/`
  (1 600 recherches par mois), que `seo` signalait sur les deux pages.
- **Les moteurs** : les cent affirmations de « ik heb nog nooit »
  (`jamais`), qui commencent toutes par « Ik heb nog nooit », ou « Ik ben
  nog nooit » quand le verbe se conjugue avec « zijn » (vreemdgaan,
  vergeten, bang zijn), ce que la page dit ; les boutons « Ik wel » et
  « Ik nooit », la page reprend l'exemple de référence du guide de style.
  Les 120 situations de « ja of nee » (`ouiNon`) et les textes des deux
  jeux. Sinterklaas à la place du père Noël (q84), « huwelijkse
  voorwaarden » pour le contrat de mariage (q25).
- **Ce que le néerlandais dit autrement** : la FAQ de « ik heb nog nooit »
  sur le jeu à distance parle de la façon de le lancer (le jeu a le mode à
  distance) ; le français et les autres langues disent encore de le jouer
  en appel vidéo, sur un seul téléphone. La page de « ja of nee » précise
  que ce n'est pas le « ja-nee-spel » (celui où l'on ne doit dire ni oui ni
  non), le mot que tapent les Néerlandais pour l'autre jeu.
- **Les liens** : comme en français, sauf les ancres. Trois restent en bas
  de page (`BAS`), faute d'un passage plus haut sur le même sujet : la FAQ
  de « ik heb nog nooit » vers « waarheid of durven 18+ » (un jeu plus
  chaud), la dernière section et la FAQ de « ja of nee » vers « vragen voor
  koppels » et les dilemmes ; les cellules du tableau de « ja of nee »
  n'acceptent pas de lien.
- **Vérifié** : une partie de « ik heb nog nooit » jusqu'au résultat, six
  situations de « ja of nee » (`joue-boutons.cjs`, envois vers la base
  coupés).

## Lot 6g (31 octobre 2026) : phrases à compléter, c'est un 10 mais

- **Les pages** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/maak-de-zin-af/` | Maak de zin af: gratis spel voor koppels met 20 zinnen | Maak de zin af: 20 zinnen om met z'n tweeën af te maken |
  | `/nl/hij-is-een-10-maar/` | Hij is een 10 maar... \| Het spel voor koppels (60 kaarten) | ‘Hij is een 10, maar...’: het spel voor koppels |

- **Les moteurs** : les vingt phrases (`phrases`) et les textes des deux
  façons de jouer ; les soixante cartes de « hij is een 10 maar »
  (`dixMais`), écrites une fois pour les deux genres comme en allemand,
  `{hij|zij}` et `{zijn|haar}`, après l'accroche « Hij is een 10, maar... »
  ou « Zij is een 10, maar... ». La « chocolatine » devient le débat
  néerlandais du même genre, « patat » contre « friet » (q19). « Dealbreaker »
  se dit « afknapper ».
- **Les listes de la page** (groupes de cartes, en-têtes et barème) passent
  entières dans le module : l'aide `deplier` ne descend pas dans les
  listes.
- **Les liens** : trois liens du français vers le blog attendent leur
  article néerlandais (« questions pour mieux se connaître », « red flags
  chez un homme », « ce qu'on n'accepte pas dans un couple ») : les
  phrases restent sans lien, `textes` les rappelle en « à faire » jusqu'au
  lot 9. Celui de « maak de zin af » vers « hoe goed ken je je partner »
  reste dans la dernière section, comme en français.
- **Vérifié** : « maak de zin af » joué jusqu'au bout dans ses deux façons
  de jouer, « hij is een 10 maar » en secret jusqu'au résultat
  (`joue-boutons.cjs`), puis les deux pages par `site --jouer`, tous modes,
  sans erreur de moteur.

## Lot 6h (31 octobre 2026) : le jeu de soirée pour couples

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/partyspel-voor-koppels/` | Partyspel voor koppels \| 2 tot 5 koppels, 4 tot 10 spelers | Het spel voor meerdere koppels van Quiz Couple! Multiplayer tot 10 personen |

  Le H1 porte le mot-clé secondaire « spel voor meerdere koppels », le
  title et la description le principal.
- **L'application** : tous les textes `app.*` (accueil, création, salle,
  partie, révélation, podium, bandeau, partage). Le maître du jeu est le
  « spelleider », les manches accord des « raadrondes » (dans chaque couple
  l'un devine la réponse de l'autre), les points « pnt ».
- **Les questions** : les 36 questions d'accord, chacune en deux formes
  (`toi` : « In de auto zing je: », `lui` : « In de auto zingt {{nom}}: »)
  avec des réponses qui servent aux deux, et les 14 manches « Welk
  koppel… ? » avec leur titre. Koh-Lanta devient « Expeditie Robinson »,
  l'émission qui porte ce nom aux Pays-Bas comme en Flandre ; le
  petit-déjeuner sucré, « hagelslag of jam ». « Sport » rejoint
  `identiques.txt` (un sujet de conversation, le même mot en néerlandais).
- **Les liens** : les cinq liens de la page passent par les variables du
  gabarit (`{{quizMost}}`, `{{testCouple}}`…), ancres reprises en
  néerlandais ; l'ancre vers « wie is het meest » tient en sept mots.
- **Vérifié** : l'essai à six téléphones (`scratchpad/soiree/essai.mjs`,
  doublure du canal `transport.js`, `nl` ajouté à ses adresses et à ses
  deux messages) passe en néerlandais : création, cinq joueurs par le
  lien, couple seul refusé, joueuse retirée, couples formés dans l'ordre
  d'arrivée, retardataire refusé, vingt questions dont la prolongation,
  rechargement d'un joueur et du maître du jeu, porte e-mail sur le
  podium, rejouer avec les mêmes couples.

## Lot 6i (31 octobre 2026) : le hub des jeux

- **La page** :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/spelletjes-voor-koppels/` | Spelletjes voor koppels: 13 gratis spellen voor twee | Onze online spelletjes voor koppels, klaar in één klik |

  Les cartes des quatorze jeux reprennent les noms du menu (`nav.*`), le
  tableau « quel jeu pour quel moment » cite les vraies phrases des jeux
  (« Wat we elke keer weer bestellen, is… »).
- **Ce que le néerlandais dit autrement** : la FAQ sur le jeu à distance
  nomme les quatre jeux qui ont le mode à distance (wie van ons twee, wie
  zou eerder, ik heb nog nooit, hij is een 10 maar) ; le français et les
  autres langues disent encore de lire en appel vidéo.
- **Corrigé dans les cinq langues publiques** : la FAQ disait « les sept »
  jeux gratuits, il y en a quatorze ; la carte de « qui de nous deux »
  annonçait 40 questions, le jeu en a 80 (la description et la meta avaient
  été corrigées au lot 6d). Seules les cinq pages du hub changent.
- **Les liens** : « een zin die je hardop afmaakt » (maak de zin af) ; les
  trois liens de la dernière section vers les quiz de saison restent en
  bas de page comme en français (`BAS`) et attendent leurs pages
  néerlandaises (lot 7).
- **Vérifié** : `site nl` sur le hub et une page de jeu : aucune erreur,
  le fil d'Ariane « Spelletjes voor koppels » est désormais traduit sur
  toutes les pages de jeux.

**Le lot 6 est fini** : les quatorze jeux et leur hub sont en néerlandais.

## L'ouverture (31 octobre 2026)

Thomas : « quand tous les jeux seront traduits, je veux que tu mettes en
ligne une première version du NL. Ne fais les quiz spéciaux qu'en dernier.
Le plus important : jeux, évaluation payante et pages légales, blog, quiz
spéciaux ».

- **Ce qui s'ouvre** : `nl` quitte `LANGUES_CACHEES`. Les 86 pages
  traduites (accueil, pages d'information et juridiques, tests de couple,
  tests célibataires, quiz, questions pour couple, jeux et leur hub) passent
  en « index, follow », entrent dans le hreflang des cinq autres langues,
  dans `sitemap-nl.xml` (81 adresses : sans l'évaluation, fermée, ni les
  pages en noindex) et dans IndexNow ; le sélecteur de langue de toutes les
  pages propose le néerlandais, vers l'accueil /nl/ quand la page n'existe
  pas encore dans la langue.
- **Ce qui attend** : `PAGES_EN_ATTENTE.nl` (config.js) : les cinq outils
  (prénoms et signes, liefdestest, compteur, signes chinois, date de
  naissance) et les six pages des quiz spéciaux (lot 7), les CGV (lot 8), la
  liste du blog (lot 9). Une page en attente n'est pas construite :
  `getLocalizedPath` la dit absente, donc elle sort du menu, du pied de
  page, de l'accueil, du plan du site, des cartes « À faire ensuite », du
  hreflang et du sitemap ; `cheminDeclare` garde son adresse pour que la
  construction neutralise les liens écrits vers elle, comme ceux d'un
  article programmé ; les moteurs lisent `ROUTE_SLUGS_PUBLIES` et ne la
  proposent jamais en suite. Chaque lot retire ses pages de la liste ;
  l'entrée `nl` part quand la liste est vide.
- **Les règles du chantier restent** : `langueEnCours(lang)` (cachée, ou
  ouverte avec des pages en attente) remplace `langueCachee` là où il le
  fallait : un article n'existe qu'une fois traduit (aucun en néerlandais,
  donc aucun hreflang nl sur les articles et aucun flux RSS néerlandais,
  `sansFlux`), un fichier de textes absent vient du français, et les textes
  des moteurs sont complétés clé par clé.
- **Le serveur, en attendant le lot 8** : une adresse laissée à la porte
  des résultats d'une page /nl/ est rangée en anglais (`capture.js`) :
  `lead-capture` refuse toute autre langue que les cinq, et les e-mails du
  parcours n'existent pas en néerlandais ; le néerlandophone reçoit donc les
  e-mails anglais, qui mènent aux pages anglaises de l'évaluation. Un quiz
  personnalisé créé en néerlandais est rangé en français par
  `manage-custom-quiz` (son lien de partage reste la page /nl/), et un avis
  part sans langue (`langueAvis`), comme le prévoit la base.
- **Corrigé au passage** : le texte alternatif de l'image du test de charge
  mentale était resté en français sur la page néerlandaise (lot 3l).
- **Le nouveau contrôle** : `node build/verifie-langue.mjs liens nl`, après
  `npm run build`, lit chaque lien de `dist/` qui part d'une page /nl/ ou y
  mène, et signale tout lien mort (une page en attente qu'on aurait oublié
  de neutraliser, une adresse mal recopiée).
- **Vérifié** : `liens nl` sans erreur (24 721 liens lus dans 920 pages) ;
  aucun texte français ni anglais dans les balises, le JSON-LD et le texte
  visible des pages /nl/ (hors admin et évaluation fermée) ; les textes
  des moteurs ne mènent à aucune page absente ; hors /nl/, les pages
  publiques ne changent que par le lien hreflang nl, l'option « NL
  Nederlands » du sélecteur, les adresses néerlandaises de la liste
  embarquée des pages de jeu et la ligne de la porte e-mail.

## Lot 8a (31 octobre 2026) : les conditions générales de vente

- **La page** : `/nl/algemene-voorwaarden/`, toujours en noindex comme dans
  les autres langues, et liée seulement quand l'évaluation sera ouverte en
  néerlandais (pied de page, écran de paiement). Elle quitte
  `PAGES_EN_ATTENTE`.
- **Les textes** : `nl/cgv.json` en entier, en « u » comme les autres pages
  juridiques, au plus près du français : les articles du Code de la
  consommation gardent leur nom français (« artikel L221-28 13° van de
  Franse Code de la consommation »), le droit applicable reste le droit
  français avec la protection des règles impératives du pays de résidence.
  L'évaluation s'y appelle « de relatiecheck », le mode seul(e) « de
  relatiecheck alleen invullen ».
- **Ce que le néerlandais dit autrement** : à l'article 7, le 3919 devient
  Veilig Thuis (0800-2000, Pays-Bas), le 1712 (Belgique) et le 112 en cas de
  danger immédiat ; la date de mise à jour est celle de la version
  néerlandaise.
- **Vérifié** : la page se construit (prix « € 9,90 », vendeur, liens vers
  la page de contact et le privacybeleid, lien vers la relatiecheck
  neutralisé tant qu'elle est fermée) ; `liens nl` sans erreur. Les pages
  publiques des conditions de vente ne changent que par leur option « NL »
  du sélecteur, qui mène désormais à la page néerlandaise.

## Lot 8b (31 octobre 2026) : la page de vente de la relatiecheck

- **La page** (toujours fermée, donc en noindex et liée nulle part) :

  | Page | Title | H1 |
  |---|---|---|
  | `/nl/relatiecheck/` | Relatiecheck online \| Direct resultaat, ook als pdf | Relatiecheck: weet waar jullie staan, zonder therapeut |

  Le H1 garde la promesse de Thomas (« sans aller chez un pro ») ; les deux
  sections de texte s'appellent « Wat is een relatiecheck? » et « Wat heb je
  aan een relatie-evaluatie? » (le mot-clé secondaire, écrit avec son trait
  d'union, comme le veut l'orthographe néerlandaise).
- **Les textes** : `lp` et `jsonLd` de `nl/bilan.json`, `bilanCouple` de
  `nl/quizzes.json`, le texte alternatif de l'image de tête. Les domaines
  s'appellent « thema's » (« twaalf thema's », « thema per thema ») ; les
  conditions de vente du lot 8a disent désormais la même chose. Le couple
  fictif des exemples s'appelle Sanne et Daan (les aperçus du rapport et
  `bilan/exemples.mjs` suivront avec le rapport).
- **Ce que le néerlandais dit autrement** : la citation du prix d'une séance
  (« entre 50 et 90 € » en France) dit « al snel 60 euro of meer », vrai aux
  Pays-Bas comme en Belgique ; l'avertissement du haut donne Veilig Thuis,
  le 1712 et le 112.
- **La construction** : les questions de l'évaluation (`bilan-<langue>.json`)
  sont complétées par le français clé par clé, comme les textes des moteurs
  (`completeParFrancais`), pour que `nl/bilan-questions.json` puisse arriver
  en plusieurs fois. Les fichiers des cinq langues publiques sont identiques
  à la construction d'avant.
- **Le contrôle seo** attend le noindex de l'évaluation tant qu'elle est
  fermée dans la langue (« à faire » au lieu d'une erreur).
- **Corrigé dans trois langues publiques** : le message affiché sans
  JavaScript sur la page de l'évaluation était en anglais en espagnol, en
  allemand et en italien ; il est dans leur langue (et en néerlandais).

## Lot 8c (31 octobre 2026) : l'application et le rapport de la relatiecheck

- **Les textes** : toute la partie `app` de `nl/bilan.json` (environ 5 900
  mots) : accueil, départ (façon de faire, prénoms, genres, case, adresse),
  invitation, acceptation, questions, pause, attente, écran « rapport prêt »
  et paiement, mode seul(e), sondage des célibataires, et tout le texte du
  rapport (couverture, chapitres, verdicts, météo, carte, conversations,
  points bloquants, zones d'ombre, climat, signaux, rôles, domaines, fin,
  suite, écran du rapport). « je » à la personne, « jullie » au couple, comme
  le reste du site ; la structure et les variables `{{ }}` sont celles du
  français, clé par clé.
- **Le vocabulaire, fixé pour le rapport, les questions et les e-mails** :
  accord / réponses proches / écart = « overeenkomst » / « bijna gelijk » /
  « verschil » ; sujet décisif = « beslissend onderwerp » ; non négociable =
  « niet onderhandelbaar » ; point bloquant = « struikelblok » ; zones
  d'ombre = « blinde vlekken » ; domaines = « thema's » ; alignement =
  « overeenstemming » ; climat = « sfeer » ; feuille de route =
  « stappenplan ». Les numéros d'aide sont Veilig Thuis, le 1712 et le 112 ;
  la séance chez un conseiller dit « al snel 60 euro of meer », comme la
  page de vente ; la case du sondage des célibataires dit « 16 jaar of
  ouder ».
- **Le code** : `nl-NL` dans les tables de formats de `js/bilan.js` et du
  gabarit du rapport (`rapport.mjs`, dates et nombres) ; le signe % du
  rapport est collé au nombre en néerlandais (`pcSuffixe`), les autres
  langues gardent leur espace insécable, sans aucun changement.
- **Vérifié** : `textes nl` sans erreur (« Single », « Storm » et « Week
  {{n}} » ajoutés à `identiques.txt`) ; les tests du serveur de l'évaluation
  (61) et de la fabrique du PDF (27) passent. Hors /nl/, seuls changent
  `js/bilan.js` et `js/bilan-rapport.js` (la ligne `nl` et le signe %).

## Lot 8d (31 octobre 2026) : les questions de la relatiecheck

- **Les textes** : `nl/bilan-questions.json` en entier (environ 12 900
  mots) : les 118 questions des douze thèmes, leurs réponses, leur nom court,
  leur « pourquoi ça compte », leurs deux questions pour en parler et ce
  qu'il vaut mieux éviter, les textes du rapport de chaque thème (fort,
  moyen, faible), les sept questions de situation et les réponses « qui »
  (`qui`, `quiNeutre`, `quiPercu`). Les questions parlent à la personne
  (« je »), les questions pour en parler sont celles qu'un partenaire pose à
  l'autre ; les variantes sans prénom (`qNeutre`, `oNeutre`) et les
  questions miroirs suivent le français.
- **Ce que le néerlandais dit autrement** : aucun accord au genre (« {heureux|
  heureuse} » devient « gelukkig ») : le néerlandais n'accorde pas ses
  adjectifs, et le fichier n'a plus aucune accolade de genre ; le PACS
  devient « geregistreerd partnerschap, samenlevingscontract of wettelijke
  samenwoning » (les Pays-Bas et la Belgique) ; la question de l'argent
  citée par la page de vente (« Het geld in jullie relatie, als het aan jou
  ligt... ») est celle du fichier, mot pour mot.
- **Corrigé dans les cinq langues publiques** : l'introduction du thème
  « Comment vous allez » annonçait huit questions ; l'évaluation en pose
  douze (« douze questions », « twelve questions », « doce preguntas »,
  « zwölf Fragen », « dodici domande »).
- **Les tests** : `coeur.test.mjs` vérifie désormais la structure des six
  langues (61 tests, tous passent).
- **Vérifié** : `textes nl` sans erreur ; hors /nl/, seuls changent les
  fichiers de questions des cinq langues (la phrase ci-dessus).

## Lot 8e (31 octobre 2026) : le serveur, les e-mails et le PDF de la relatiecheck

- **Le serveur** (`supabase/functions/_shared/bilan/serveur.mjs`) accepte
  `nl` : la page `/nl/relatiecheck/`, et ce que Stripe affiche sur sa page
  de paiement (nom, descriptions à deux et seul(e), mention de la
  renonciation à la rétractation et de la TVA), `locale: 'nl'` pour la page
  Stripe elle-même.
- **Les e-mails de l'évaluation** (`courriel.mjs`) : le lien du rapport,
  le lien personnel (un, plusieurs, aucun), « votre rapport est prêt », le
  rappel, la reprise (à soi et à l'autre), avec leurs variantes seul(e)
  là où le néerlandais distingue « jullie » et « je » ; expéditeur
  `resultaten@quiz-couple.com`, nom du PDF `relatiecheck-sanne-en-daan.pdf`,
  prix au format néerlandais (« € 7,92 »), la séance chez un thérapeute
  « al snel 60 euro of meer ».
- **Le PDF** : césure néerlandaise (`bilan/cesure.mjs`, motifs du paquet
  `hyphen`) ; le couple fictif des exemples et des aperçus s'appelle Sanne et
  Daan ; `bilan/exemples.mjs` rend désormais 24 rapports (six langues), et
  les six rapports néerlandais passent les contrôles de mise en page (27 à
  49 pages, prénoms de trente signes compris). Les sept aperçus de la page
  de vente sont faits (`public/bilan/apercu-*-nl.webp`).
- **La base** : `20261031130000_langue_nl.sql` ajoute `nl` aux sept
  contraintes de langue (évaluations, sondage des célibataires, abonnés,
  avis, e-mails du parcours, modèles de l'e1, quiz personnalisés) en relisant
  chaque définition dans la base ; appliquée en dernier par bilan-base.yml,
  dont deux migrations (recopiées avec `nl`) recréent `bilans_bornes` et
  `bilan_celib_bornes` à chaque passage. Essayée sur un Postgres 16 local :
  les sept contraintes acceptent `nl`, le reste de chaque définition est
  intact, un second passage ne change rien.
- **Les tests** : `courriel.test.mjs` et `rapport.test.mjs` parcourent les
  six langues ; 61 tests du serveur et 27 de la fabrique passent.

## Lot 8f (31 octobre 2026) : les avis et les quiz personnalisés en néerlandais

- Un avis laissé sur une page /nl/ part avec `lang: 'nl'` (`LANGUES_AVIS`
  dans quiz-extras.js, quiz-engine-core.js et reviews.js), maintenant que
  `reviews_lang_valeur` accepte le néerlandais (lot 8e). Si la base refuse
  la langue, l'avis repart sans elle : jusque-là, seul le PGRST204 (colonne
  absente) le faisait repartir, et un refus de la contrainte l'aurait perdu.
- Un quiz personnalisé créé sur la page néerlandaise est rangé en `nl`
  (`manage-custom-quiz`), et non plus en français.
- Aucune page publique ne change : seuls les scripts des moteurs, de la
  mesure et des avis de l'accueil.

## Les chiffres

Au lot 8e : `code nl` 127 passages (164 à l'ouverture) : les adresses des
articles du blog (lot 9), la page des prénoms et des signes et les autres
outils (lot 7a), les avis, les abonnés et le parcours e-mail, l'encart et la
bannière de l'évaluation (fin du lot 8) ; 61 tests du serveur de
l'évaluation et 27 de la fabrique passent, six rapports néerlandais
d'exemple passent les contrôles de mise en page.

Au lot 8d : `textes nl` 892 parties écrites sur 1 045, sans erreur.

Au lot 8c : `textes nl` 887 parties écrites sur 1 045, sans erreur.

Au lot 8b : `textes nl` 886 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (la relatiecheck en « à faire » tant qu'elle est fermée).

Au lot 8a : `textes nl` 883 parties écrites sur 1 045, sans erreur ; `liens
nl` sans erreur.

À l'ouverture : `textes nl` 878 parties écrites sur 1 045, sans erreur ;
`seo nl` sans erreur ni avertissement (79 pages traduites : la liste du
blog, en attente, n'est plus construite) ; `liens nl` sans erreur ; `code
nl` 164 passages, tous dans ce qui reste à traduire (adresses des articles
et biographies du blog, textes alternatifs des images des outils, des quiz
spéciaux et de l'évaluation, e-mails, évaluation et fonctions serveur).

Au lot 6i : `textes nl` 878 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur ni avertissement (80 pages traduites). Seules les cinq
pages publiques du hub changent (« quatorze » jeux gratuits, 80 questions
pour « qui de nous deux »).

Au lot 6h : `textes nl` 867 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur ni avertissement (79 pages traduites). Aucune page publique
ne change.

Au lot 6g : `textes nl` 855 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur ni avertissement (78 pages traduites). Aucune page publique
ne change.

Au lot 6f : `textes nl` sans erreur ; `seo nl` sans erreur ni
avertissement (76 pages traduites) ; les deux jeux se jouent. Aucune page
publique ne change.

Au lot 6e : `textes nl` 818 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (74 pages traduites) ; les deux jeux vont jusqu'à leur
bilan. Aucune page publique ne change.

Au lot 6d : `textes nl` 794 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (72 pages traduites) ; les deux jeux vont jusqu'à leur
résultat. Les pages publiques ne changent que par le nombre de questions
du « qui de nous deux » (40 devient 80), dans les cinq langues.

Au lot 6c : `textes nl` 772 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (70 pages traduites) ; la roue et le plateau vont au bout.
Les pages publiques ne changent que par la description de la case chance
du plateau, dans les cinq langues.

Au lot 6b : `textes nl` 750 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (68 pages traduites) ; les deux jeux de cartes vont
jusqu'à leur fin de partie. Les pages publiques ne changent pas.

Au lot 6a : `textes nl` 731 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (66 pages traduites) ; le moteur va jusqu'au résultat dans
les deux façons de jouer. Les pages publiques ne changent pas.

Au lot 5i : `textes nl` 720 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur ni avertissement (65 pages traduites) ; `site nl` : la page
des questions sans erreur, tirage compris. Les pages publiques ne changent
que par `questions-couple.js` (sa table de libellés).

Au lot 5h : `textes nl` 710 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (64 pages traduites) ; `site nl` : le quiz va jusqu'à son
résultat ; une erreur attendue, la carte vers un jeu du lot 6. Les pages
publiques ne changent que par le script du quiz des ados (les deux
étiquettes de la coche et de la croix).

Au lot 5g : `textes nl` 703 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (63 pages traduites) ; `site nl` : le quiz va jusqu'à son
résultat (« Verleidingsscore: 9/36 », sans espace avant les deux-points).
Les pages publiques ne changent que par les scripts des moteurs (les
deux-points ci-dessus).

Au lot 5f : `textes nl` 689 parties écrites sur 1 045, sans erreur ; `seo
nl` sans erreur (62 pages traduites) ; `site nl` : le moteur va jusqu'à son
résultat ; une erreur attendue, la carte vers un jeu du lot 6. Les pages
publiques du vrai ou faux en français, anglais et allemand changent par
l'affirmation 98, et par elle seule.

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
