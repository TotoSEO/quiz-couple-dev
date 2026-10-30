# Le néerlandais : où on en est

Le chantier est décrit dans `docs/langues/CADRAGE-NL.md` ; ce fichier dit ce
qui est fait, ce qui reste, et les chiffres des contrôles au dernier lot. On
le met à jour dans la PR de chaque lot.

## Les lots

| Lot | Contenu | État |
|---|---|---|
| 0 | `nl` caché dans le code, contrôles, guide de style | fait le 30 octobre 2026 |
| 1 | Carte des mots-clés (requêtes françaises qui apportent des clics → équivalent néerlandais), adresses des 99 pages | fait le 30 octobre 2026 |
| 2 | Textes communs : menu, accueil, pied de page, textes communs des moteurs, pages juridiques | en cours : 2a fait le 30 octobre 2026 (menu, pied, pages d'information) ; 2b accueil, 2c textes communs des moteurs, 2d pages juridiques |
| 3 | Tests de couple, avec leurs textes de moteur | à faire |
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
  - **À trancher par Thomas** : la case de la porte e-mail dit « 16 jaar of
    ouder » en néerlandais, pas 15 comme en France : c'est l'âge du
    consentement numérique aux Pays-Bas (13 ans en Belgique).
  - La clé `nav.bilanCoupleDesc` parle encore d'un rapport de 30 pages dans
    les cinq langues publiques ; aucune page ne l'affiche.

## Les chiffres

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
