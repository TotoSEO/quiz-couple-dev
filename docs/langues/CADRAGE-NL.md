# Le néerlandais : cadrage du chantier

30 octobre 2026. Thomas, après les volumes de recherche néerlandais : « Allez,
je crois qu'on est bon, ya de très très bons volumes ! On fonce. Avant de
commencer, tu vas devoir cadrer ce projet ».

Ce document est la référence du chantier : chaque session le relit avant de
travailler, et le fichier d'avancement (`docs/langues/nl/AVANCEMENT.md`, créé
au lot 0) dit où on en est.

## 1. Pour qui

- **Pays-Bas et Flandre** : environ 24 millions de personnes, un public que les
  annonceurs paient cher, l'euro (9,90 € pour l'évaluation, sans conversion),
  iDEAL et Bancontact chez Stripe.
- **Une seule version** : préfixe `/nl/`, `hreflang="nl"` (la langue, sans
  pays, pour couvrir les deux côtés de la frontière), néerlandais standard
  compris aux Pays-Bas comme en Flandre.
- **Les volumes mesurés par Thomas** (Pays-Bas, recherches par mois, la
  deuxième colonne de son outil est la difficulté) :

| Requête | Volume | Difficulté | Page visée |
|---|---|---|---|
| vragen voor koppels | 1 600 | 20 | page des questions de couple |
| 100 vragen voor koppels | 390 | 13 | page des questions de couple |
| grappige vragen voor koppels | 260 | 13 | quiz drôle |
| leuke vragen voor koppels | 90 | 9 | page des questions (secondaire) |
| liefdestest | 320 | 23 | calculatrice de l'amour |
| liefdestest namen | 30 | - | calculatrice (secondaire) |
| spelletjes voor koppels | 210 | 13 | hub des jeux |
| relatietest | 170 | 20 | test de couple |
| online relatietest | 30 | 14 | test de couple (secondaire) |
| zou je liever vragen | 170 | 10 | tu préfères |
| zou je liever vragen seksueel | 40 | 8 | tu préfères (secondaire) |

Les difficultés vont de 8 à 23 : la concurrence néerlandaise est faible.

## 2. L'étendue, mesurée dans le dépôt

| Ce qu'il y a | Combien |
|---|---|
| Pages à traduire | 99 routes (toutes sauf les 3 `frOnly`) |
| Textes des pages et des moteurs | 100 fichiers JSON, 25 870 chaînes, environ 292 000 mots (en anglais) |
| dont les moteurs (`gd.json` : questions, réponses, résultats) | 118 000 mots |
| dont l'évaluation payante (`bilan-questions.json`, `bilan.json`) | 19 000 mots |
| Blog | 71 articles traduits, environ 119 000 mots |
| Code qui énumère les cinq langues (listes, objets par langue, expressions régulières) | 57 fichiers, en plus de `LANGUAGES` dans config.js |
| Branches `lang === 'xx'` | 213, dans 73 fichiers (dont 40 dans blog-article.ejs) |
| Codes de locale (`fr-FR`, `de-DE`...) | 158, dans 27 fichiers |
| Fichiers par langue | image de partage `public/og/quiz-couple-<lang>.jpg`, carte e-mail `public/email/voir-tu-preferes-<lang>.png`, aperçus du rapport `public/bilan/apercu-*-<lang>.webp`, textes alternatifs de chaque image (`QUIZ_FEATURED`, `IMAGE_PARTAGE` dans config.js) |
| Base et serveur | `LANGUES` de `_shared/abonnes/regles.mjs` (porte e-mail), contrainte `reviews_lang_valeur` (avis), fonctions de l'évaluation, e-mails Resend et Brevo |

Environ **410 000 mots** à écrire en néerlandais : l'équivalent du site
allemand entier.

## 3. Ne rien oublier : quatre contrôles automatiques et un interrupteur

Rien ne repose sur la mémoire. Le lot 0 a écrit `static-site/build/verifie-langue.mjs`,
qui échoue tant qu'il manque quelque chose. Chaque PR du chantier joint sa sortie.
Ses quatre contrôles : le code, les textes et le site (ci-dessous), et les
balises (§ 4).

1. **Le code** (`verifie-langue.mjs code`) : toute liste, tout objet par langue
   et toute expression régulière qui énumère `fr|en|es|de|it` doit contenir
   `nl`, ou porter un commentaire `langues: sans-nl` qui dit pourquoi
   (Instagram, en anglais seulement). Le contrôle refait la recherche à chaque
   passage : un fichier ajouté plus tard est vu aussi. Il relève aussi les
   libellés écrits en dur dans les scripts des pages publiques (`aria-label`,
   `title`, `alert`, `confirm`), qui restent en français dans toutes les
   langues.
2. **Les textes** (`verifie-langue.mjs textes nl`) : chaque clé de `fr/*.json`
   (hors pages `frOnly`) existe dans `nl/*.json` et n'est pas vide ; mêmes
   variables `{{...}}`, mêmes balises HTML et autant de liens ; chaque lien
   mène à une page /nl/ qui existe ; aucune valeur identique au français ou à
   l'anglais (hors noms propres listés) ; les accolades de genre `{a|b}` là où
   le moteur les lit ; les points des barèmes (`_pts`, `_axes`, `_si`) recopiés
   à l'identique, jamais traduits.
3. **Le site construit** (`verifie-langue.mjs site nl`, dans Chromium) : chaque
   page /nl/ de `dist/` ouverte à 360 et à 1 280 px, en clair et en sombre :
   aucun texte visible qui existe tel quel en français ou en anglais, aucune
   erreur de console, aucun élément qui déborde. Chaque test, quiz et jeu est
   joué jusqu'à l'écran de résultat, dans chaque mode (règle « Avant de dire
   qu'un quiz est vérifié » de CLAUDE.md), porte e-mail, encart de
   l'évaluation, formulaire d'avis et mode à distance compris.

**L'interrupteur** : `LANGUES_CACHEES = ['nl']` dans config.js. Tant que `nl`
y figure, les pages /nl/ sont construites et publiées, mais en `noindex`,
hors des sitemaps, du hreflang, des flux RSS et du sélecteur de langue :
Thomas peut tout parcourir en ligne avant que Google ne voie quoi que ce soit.
On retire `nl` de la liste quand les trois contrôles sont verts et que Thomas
a relu. Le même principe ferme l'évaluation en néerlandais (aucun encart,
aucun lien) jusqu'à son propre lot. Le 31 octobre 2026, Thomas a demandé
d'ouvrir la langue dès les jeux traduits, avant les outils et les quiz
spéciaux : `nl` a quitté `LANGUES_CACHEES`, et les pages encore à traduire
attendent dans `PAGES_EN_ATTENTE.nl` (config.js), sans être construites ni
citées nulle part (voir AVANCEMENT.md, « L'ouverture »).

### Les zones, relues à chaque lot

- **Navigation** : menu bureau et mobile (familles, tuiles 2 x 2, bouton
  « Évaluer son couple », barre de la réduction), sélecteur de langue, fil
  d'Ariane, pied de page, plan du site, page 404.
- **Accueil** : hero (bulles de la scène des mascottes, boutons, compteurs),
  ruban, carrousels des familles, section de l'évaluation, derniers articles,
  avis, Instagram.
- **Pages** : hero, sections, FAQ, bandeau de preuve sociale, bloc « À faire
  ensuite », cartes d'articles, maillage (règles de CLAUDE.md, contrôlées par
  `build/liens-contenu.mjs`).
- **Moteurs** : écran de départ, prénoms et genres, questions, relais, barre et
  mascottes, résultats, encarts (évaluation, produits affiliés, porte e-mail,
  avis), mode à distance (salon, QR code), jeu de soirée, pub (« Advertentie »
  au-dessus du bandeau).
- **Outils** : calculatrice (le mot de la méthode historique devient
  « liefde », six lettres : vérifier le calcul), date de naissance, signes
  chinois, compteur de durée (noms des noces néerlandais), prénoms et signes.
- **Évaluation payante** : page de vente, application, cent questions,
  rapport et PDF (césure néerlandaise dans `bilan/cesure.mjs`, échantillons
  `nl` dans `bilan-controle.yml`), e-mails Resend, CGV, Stripe (`locale: 'nl'` ;
  iDEAL et Bancontact à activer par Thomas dans le tableau de bord).
- **E-mails du parcours** : `emails/textes/nl.json`, version sobre,
  `immediat.langues`, campagnes par langue.
- **Juridique** : mentions légales, confidentialité, CGV. Le droit reste
  français : ce sont les seules pages traduites au plus près, sans réécriture.
- **SEO technique** : `<html lang="nl">`, `og:locale` `nl_NL`, hreflang
  réciproques (le `x-default` ne change pas), sitemaps, flux RSS, JSON-LD
  (noms, descriptions, FAQ, `inLanguage`), canoniques, image de partage.
- **Base et serveur** : porte e-mail (`LANGUES`), avis (contrainte et
  `langueAvis`, écrit trois fois), évaluation, admin (langues des abonnés,
  sources).
- **Numéros d'aide** (le 3919 et ses équivalents dans les verdicts) : Pays-Bas
  et Belgique (Veilig Thuis, 113 Zelfmoordpreventie, 1712, Zelfmoordlijn),
  chacun vérifié sur le site officiel avant d'être écrit.
- **Sans néerlandais, volontairement** : Instagram (anglais), produits
  affiliés tant que Thomas n'a pas d'identifiant Amazon.nl (une langue sans
  produit n'affiche pas de carte), pages `frOnly`.

## 4. Les mots-clés et les balises

### La carte des mots-clés

Un fichier, `docs/langues/nl/mots-cles.tsv` : une ligne par page (les 99
routes, puis les articles), colonnes `cle` (la route, ou `blog:<slug
interne>`), `adresse`, `principal`, `secondaires` (séparés par « ; »),
`requete_fr`, `clics_fr` et `notes`. Le title, le H1 et la description ne
s'y recopient pas : ils vivent dans les JSON, et le contrôle `seo` les lit
dans les pages construites.

Thomas, le 30 octobre 2026 : « pas besoin d'analyser les mots-clés. Si les
pages françaises ont des clics organiques sur une requête FR, il suffit juste
de trouver son équivalent en néerlandais naturel pas littéral. » Donc :

1. Pour chaque page, la Search Console française (connecteur
   `searchconsole` de Windsor, trois mois) donne la requête qui apporte le
   plus de clics, et les suivantes.
2. J'écris son **équivalent néerlandais naturel**, comme un Néerlandais ou un
   Flamand le taperait, jamais traduit mot à mot : la requête devient le
   mot-clé principal, les suivantes donnent les secondaires. Une page sans
   clic en France prend la requête de la page anglaise, ou à défaut le nom
   que l'usage néerlandais donne à la chose.
3. Les volumes que Thomas a mesurés (§ 1) fixent les pages qui les portent.
4. **Un mot-clé principal par page, jamais le même pour deux pages.** Les
   pages proches ont chacune leur angle, comme en français et en allemand :
   la calculatrice « liefdestest », le test de couple « relatietest », la date
   de naissance, les prénoms et signes, et le test de compatibilité en vingt
   questions ont chacun leur requête.
5. Après l'ouverture, la Search Console néerlandaise corrige la carte, comme
   pour l'allemand le 30 octobre 2026.

### Les règles, contrôlées par `verifie-langue.mjs seo nl` (bloquant)

- **Adresse** : tirée du mot-clé principal, en néerlandais, sans accents ni
  mots vides, unique ; jamais changée après l'ouverture.
- **Title** : commence par le mot-clé principal (ou le porte dans ses trente
  premiers signes), 60 signes au plus, unique sur /nl/.
- **H1** : différent du title, porte le mot-clé principal ou un secondaire de
  la carte, unique.
- **Description** : 120 à 155 signes, porte le mot-clé principal, dit ce qu'on
  obtient (gratuit, nombre de questions, résultat tout de suite), unique.
- **Titres H1 à H3** : aucun mot interdit (§ 5).
- **Cannibalisation** : aucun mot-clé principal d'une page dans le title d'une
  autre (avertissement, à justifier).

## 5. Un néerlandais parlé, pas une traduction

### Le guide de style

`docs/langues/nl/STIJLGIDS.md`, écrit au lot 0, transpose « Tonalité de
rédaction » de CLAUDE.md :

- « je » à la personne, « jullie » au couple ; « u » seulement dans les pages
  juridiques.
- Néerlandais standard : aucun mot d'une seule région ; les mots anglais que
  les gens emploient vraiment (date, crush, red flag, ghosten).
- Les mots de l'oral (gewoon, even, toch, best, eigenlijk dans le texte),
  phrases courtes et longues mêlées, un exemple concret tout de suite.
- Les marqueurs IA interdits, en néerlandais : « in een notendop »,
  « kortom », « duik in », « het draait allemaal om », « ontdek » à chaque
  phrase, « niet alleen… maar ook » en boucle, « of je nu… of… », « het mooie
  is dat… », plus les tics de construction déjà bannis en français (triades,
  aphorismes, fragments sans verbe).
- Interdits dans les titres : « echt », « eigenlijk », « kortom »,
  « concreet », « in een notendop ».
- Typographie : guillemets ‘…’ et “…”, aucune espace avant « ? ! : »,
  virgule décimale (« 4,8/5 »), point des milliers, mois en minuscules.

### La méthode, page par page

1. La ligne de la carte des mots-clés d'abord.
2. Lire les trois premiers résultats Google néerlandais du mot-clé principal,
   pour le vocabulaire et ce que les gens attendent, sans rien en reprendre.
3. Réécrire à partir du français (la source), avec l'anglais en contrôle, et
   adapter les exemples au pays : prénoms néerlandais, Sinterklaas plutôt que
   la galette, samenwonen ou samenlevingscontract plutôt que le PACS.
4. Relire chaque texte comme s'il était lu à voix haute, contre le guide.
5. Passer les quatre contrôles (code, textes, SEO, site).

### Ce que je ne garantis pas seul

J'écris le néerlandais couramment, mais pas en natif. La seule vraie garantie
est un relecteur néerlandophone : je recommande de payer une relecture native
**tôt**, juste après le lot 3, sur l'accueil et sept ou huit pages. Ses
remarques corrigent le guide de style, puis les lots déjà faits, et tout ce
qui suit en profite.

## 6. Les lots

Un lot = une PR, les quatre contrôles verts, rien de visible pour Google avant
l'ouverture.

| Lot | Contenu | Ce que fait Thomas |
|---|---|---|
| 0 | `nl` dans le code, caché ; les quatre contrôles ; le guide de style | - |
| 1 | Carte des mots-clés (requêtes françaises à clics → néerlandais), adresses des 99 pages | Valider la carte |
| 2 | Textes communs : menu, accueil, pied de page, textes communs des moteurs, pages juridiques | - |
| 3 | Tests de couple, avec leurs textes de moteur | Trouver le relecteur natif |
| - | Relecture native de l'échantillon, corrections | Transmettre ses remarques |
| 4 à 6 | Tests célibataires, quiz et questions, jeux | - |
| Ouverture | `nl` sort de `LANGUES_CACHEES` (évaluation encore fermée en néerlandais), les pages pas encore traduites attendent dans `PAGES_EN_ATTENTE` ; faite le 31 octobre 2026 | Envoyer le sitemap /nl/ dans la Search Console |
| 8 | Évaluation payante, e-mails, CGV, puis ouverture de l'évaluation en néerlandais | Activer iDEAL et Bancontact dans Stripe |
| 9 et suite | Blog, dans l'ordre des clics français, mots-clés tirés des requêtes françaises de chaque article | - |
| 7 | Outils, puis les quiz spéciaux en dernier (Thomas, 31 octobre 2026 : « Le plus important : jeux, évaluation payante et pages légales, blog, quiz spéciaux ») | - |

## 7. Les risques

- **Le volume** : environ 410 000 mots, une vingtaine de sessions de travail,
  une part importante du forfait Claude.
- **Les mots longs** : le néerlandais colle ses mots comme l'allemand ; le
  contrôle à 360 px trouve les débordements, et les titres reçoivent des
  césures conditionnelles comme « Beziehungs­dauer ».
- **La pub** : rien ne garantit que la régie vende bien les Pays-Bas et la
  Belgique ; lire son CPM par pays un mois après l'ouverture.
- **Les e-mails** : les adresses néerlandaises entrent dans le même plafond
  Brevo de 300 envois par jour.
- **Les cent pages d'un coup** : sans risque avec le hreflang et un contenu
  soigné, à condition que l'ouverture attende les contrôles verts ; c'est le
  rôle de l'interrupteur.
