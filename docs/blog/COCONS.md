# Les cocons du blog (6 sujets, 6 pages piliers, 48 articles)

3 novembre 2026. Thomas : « enrichir le blog actuel avec un sujet qu'on a pas
encore traité, et faire genre 8 articles par sujets, ultra bien maillés avec
une page pilier par sujet. 6 sujets, 48 articles, 6 pages piliers », puis,
Haloscan ayant retiré l'analyse en masse gratuite : « part du principe que
tous les mots-clés que tu as donné ont du volume [...] à condition que lors de
la rédaction, tu respectes à 100 % toutes les règles de rédaction ». Les
règles : CLAUDE.md (« Tonalité de rédaction », « Maillage interne », la forme
d'un article de la série Histoires d'amour, la réécriture du blog) et
`docs/consignes-redaction-contenus.txt`. Les articles de blog tutoient.

## La forme d'une page

- `data/blog/<langue>/<slug interne>.ts`, six langues, mêmes dates que le
  français (publishedAt avec l'heure de Paris), `author: AUTHORS['thomas']`.
- `metaTitle` (title, 60 signes au plus, la requête en premier) différent du
  `title` (H1, le sujet en entier) ; `metaDescription` de 160 signes au plus
  avec les mots tapés ; `excerpt` d'une ou deux phrases.
- `introduction` courte : deux paragraphes, la réponse d'abord, le mot-clé
  dedans. `quickSummary` : quatre à six faits.
- Sections : H2 qui portent les requêtes, paragraphes de longueurs très
  différentes, l'essentiel en gras, listes à puces (intitulé en gras suivi de
  deux points), un encart de chiffres (`.blog-chiffres`, deux à quatre
  colonnes, des chiffres vérifiés), un bloc « À savoir » (`tip`), une citation
  (`blockquote`) quand elle est vraie, et pour le pilier la liste des huit
  articles en tête (`ol.blog-liste-reperes`).
- Maillage : chaque article a au moins deux liens dans son texte sur des
  ancres qui disent le sujet de la cible (jamais le titre de la page, jamais
  en bas de page) : le pilier, un ou deux articles frères, un test ou
  l'évaluation ; une carte « Lire aussi » vers le pilier. Le pilier renvoie
  vers ses huit articles dans le texte, vers les tests du sujet et vers
  l'évaluation (`data-bilan-src="article-<cocon>"`). Les liens s'écrivent
  avec des marqueurs que `scratchpad/cocons/liens.py` remplace par l'adresse
  de la langue : `@@r:<route>@@` et `@@a:<slug interne>@@` (une cible sans
  version dans la langue, frOnly ou pas traduite, perd sa balise et garde son
  texte).
- Image de couverture 1536 x 864 sans texte (Discover), variantes 480, 720 et
  1080 (`build/variantes-images.cjs`), texte alternatif descriptif par langue.
- Vérification : `npm run build`, puis `node build/verifie-article.mjs` sur
  les 54 pages de la langue, `node build/verifie-langue.mjs liens nl`.

## Les six cocons et leur calendrier

Un cocon publie son pilier puis un article tous les deux jours (seize jours),
à 8 h 30 (heure de Paris). La réserve d'avant s'arrête le 26 décembre 2026.

| # | Cocon | Pilier (slug interne) | Dates |
|---|---|---|---|
| 1 | Thérapie de couple et crise de couple | `therapie-de-couple` | 28 déc. 2026 → 12 janv. 2027 |
| 2 | Demande en mariage et fiançailles | `demande-en-mariage` | 13 → 28 janv. 2027 |
| 3 | Raviver la flamme (routine, rendez-vous, surprises) | `raviver-la-flamme-dans-son-couple` | 29 janv. → 13 févr. 2027 |
| 4 | L'argent dans le couple | `argent-et-couple` | 14 févr. → 1er mars 2027 |
| 5 | La relation à distance | `relation-a-distance` | 2 → 17 mars 2027 |
| 6 | Les signes astrologiques en amour | `signes-astrologiques-en-amour` | 18 mars → 2 avr. 2027 |

Les huit articles de chaque cocon, leurs requêtes et leurs adresses dans
les six langues sont dans `BLOG_ARTICLES` (config.js), par cocon, avec un
commentaire en tête de chaque bloc.

## Avancement

- [x] Cocon 1 : fr · en · es · de · it · nl · images · liens entrants (`QUIZ_RELATED_ARTICLES`, CLAUDE.md) · PR (3 novembre 2026)
- [x] Cocon 2 : 54 pages écrites et vérifiées le 3 novembre 2026 (build daté au 29 janvier 2027, `verifie-article`, `verifie-langue liens nl`), entrants dans `QUIZ_RELATED_ARTICLES`.
- [x] Cocon 3 : 54 pages écrites et vérifiées le 3 novembre 2026 (build daté au 14 février 2027, `verifie-article`, `verifie-langue liens nl`), entrants dans `QUIZ_RELATED_ARTICLES`.
- [x] Cocon 4 : 54 pages écrites et vérifiées le 3 novembre 2026 (build daté au 2 mars 2027, `verifie-article`, `verifie-langue liens nl`), entrants dans `QUIZ_RELATED_ARTICLES`.
- [x] Cocon 5 : 54 pages écrites et vérifiées le 3 novembre 2026 (build daté au 18 mars 2027, `verifie-article`, `verifie-langue liens nl`), entrants dans `QUIZ_RELATED_ARTICLES`.
- [ ] Cocon 6
- [ ] Entrants des cocons 2 à 6 : `QUIZ_RELATED_ARTICLES` (tests → piliers),
      passages des articles existants vers les piliers, CLAUDE.md.

## Ce qu'on a appris sur le cocon 1

- `liens.py` retire la balise d'une cible absente dans la langue (la charge
  mentale, frOnly) : la phrase doit se relire sans « l'article sur… ». En
  anglais et en espagnol elle était écrite sans ; en allemand elle a été
  reprise après coup ; en italien et en néerlandais elle est écrite sans lien.
- Les descriptions dépassent facilement 160 signes en allemand et en
  néerlandais : `forme.py` les signale, on raccourcit avant la construction.
- Les images : `scratchpad/cocons/images.mjs` (mascottes de face, `regard`
  pour la direction ; la vue de profil dessine mal la bouche), un aperçu PNG
  par scène à relire avant de produire les variantes.

## Ce qu'on a appris sur le cocon 2

- Une transposition n'est pas une traduction : chaque langue a reçu ses
  propres repères (prix des bagues, âge au premier mariage, formalités du
  mariage civil, régime matrimonial par défaut, alternative au mariage). Le
  pacs n'a d'équivalent ni en Allemagne (plus de Lebenspartnerschaft pour un
  nouveau couple) ni en Italie pour un couple homme-femme (l'unione civile est
  réservée aux couples de même sexe) : les articles « il ne veut pas se
  marier » y parlent de ce qui se règle sans mariage, et de ce qui ne se
  règle pas.
- Les descriptions allemandes et néerlandaises dépassent 160 signes à
  chaque fois : on écrit la liste des candidats dans un script avec
  `assert len(v) <= 160` plutôt que de compter à la main.
- Un `tip` posé après l'accolade fermante d'une section passe le contrôle
  de forme et casse le build : le contrôle de syntaxe (évaluer le fichier
  dans Node après avoir retiré les imports) se fait avant la construction.
- `images.mjs` a une aide `mainDe(perso, 0|1)` qui donne la position d'une
  main en pixels de la page d'après `mains()` de la charte, pour y poser
  l'objet tenu (écrin, loupe, stylo) ; un reflet dans un miroir est le même
  perso en plus petit, `miroir: true`, derrière un cadre dessiné en
  `devant` ; une scène peut changer la couleur du sol (`sol`).

## Ce qu'on a appris sur le cocon 3

- Un test qui n'existe qu'en français (les vacances en couple, `testVacances`)
  ne reçoit pas de lien dans les cinq autres langues : la phrase du week-end
  (« alternez : ce mois-ci c'est toi qui choisis ») est écrite sans lui dès
  le départ, au lieu de laisser `liens.py` retirer la balise.
- Les repères changent avec la langue, même sur un sujet sans droit : le
  musée gratuit (premier dimanche du mois en France et en Italie, musées
  municipaux ailleurs), le cinéma à tarif réduit (mardi, mercredi en Italie,
  « un jour fixe » en néerlandais), l'alba de janvier (8 h 15 en Allemagne,
  7 h 40 en Italie, 8 h 45 aux Pays-Bas), la station « sans ski » (Ardennes
  et Eifel pour le néerlandais), la nuit de San Lorenzo pour les étoiles
  filantes en italien.
- Les descriptions allemandes et néerlandaises dépassent 160 signes à tous
  les coups : on écrit deux candidats par description dans le script, le
  second plus court, et on prend le premier qui passe.
- `images.mjs` a reçu `teteDe(perso)` (centre, haut de la tête, ligne des
  yeux, échelle) pour poser un bonnet et une écharpe par-dessus une mascotte
  (`noeud: false` sur la rose sous le bonnet), des accessoires de saison et
  de sortie (cheminée, luge, sapin, tente, feu de camp, vélos, bougies,
  cadeau) et une scène peut poser sa propre `<defs>` dans `derriere` (le
  vichy du panier).

## Ce qu'on a appris sur le cocon 4

- Un sujet de droit change de réponse à chaque langue, et parfois à l'intérieur
  d'une langue : le néerlandais distingue les Pays-Bas (beperkte gemeenschap
  depuis 2018, samenlevingscontract, en/of-rekening, BKR) et la Belgique
  (wettelijk stelsel, wettelijk samenwonen, OCMW), l'anglais les États-Unis
  (community property / equitable distribution) et le Royaume-Uni (pas de
  régime, pas de common-law marriage, financial association sur le dossier de
  crédit), l'espagnol la Catalogne et les Baléares (séparation de biens par
  défaut). On écrit la section « ce que dit la loi » pour chaque pays, jamais
  en traduisant la française.
- Les exemples chiffrés se recalculent par langue, et les pourcentages doivent
  être justes par rapport à l'exemple (en français, « 55 %, 30 % et 15 % »
  avait été écrit pour un exemple qui donnait 65, 20 et 15) : un seul script
  par langue pour les parts, pas de chiffre écrit de tête.
- `forme.py` refuse aussi « echt » (néerlandais) et « vraiment » dans un H2 :
  on l'apprend à chaque langue.
- `images.mjs` a reçu les accessoires de l'argent : feuille de calcul, pots de
  pièces, balance à plateaux, sacs de courses, ticket de caisse déroulé,
  calculatrice, enveloppe, piles de pièces (un perso debout dessus se place
  avec `y` au sommet de la pile).

## Ce qu'on a appris sur le cocon 5

- Un cocon qui parle d'un mode du site (les jeux à distance, chacun sur son
  téléphone) est l'occasion de lier les pages jouables depuis le texte : les
  activités à distance renvoient au hub des jeux, au test de couple, aux
  points communs, à je n'ai jamais, qui de nous deux, qui pourrait et c'est
  un 10 mais, sur ce qu'on y fait (« chacun avoue de son côté », « on vote en
  secret »), jamais sur le nom du jeu.
- Les études : Jiang et Hancock 2013 (63 couples, Cornell), Kelmer et al.
  2013 (870 personnes, Denver), Dargie et al. 2015 (plus de 700 personnes),
  Stafford, Merolla et Castle 2006 (un tiers de séparations dans les trois
  mois qui suivent la fin de la distance), Maguire et Kinney 2010 (la
  certitude de vivre ensemble un jour), et les repères du centre d'études
  américain de Guldner (200 km, 1,5 visite par mois, 14 mois). Les chiffres
  sont en kilomètres sauf en anglais (125 miles).
- `images.mjs` a reçu une scène de nuit (`ciel`, `fenetreNuit`, `filRouge`,
  `sol` sombre), deux pièces séparées par un `mur`, une télé et un bol de
  pop-corn, un colis ouvert, une valise et le bord de quai, une commode à
  tiroir ouvert, un billet, un calendrier sans jour entouré, des amis en
  silhouettes ; un perso peut se poser en petit dans un cadre de téléphone
  dessiné en `devant`.
