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
- [ ] Cocon 2
- [ ] Cocon 3
- [ ] Cocon 4
- [ ] Cocon 5
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
