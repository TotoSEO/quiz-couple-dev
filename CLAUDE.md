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
- `static-site/js/salon.js` — Mode à distance (chacun sur son téléphone) : codes de partie, QR code, présence, chargé à la demande ; le moteur commun l'appelle via `QuizEngine.chargerSalon`
- `static-site/css/styles.css` — Main stylesheet
- `fr/*.json` — French translations (quizzes.json, common.json, home.json, gd.json, quiz-*.json)

## Quiz Engine Types

- `SoloTest` — Single player, points-based (toxic, divorce, mariage, genant, jalousie, attachement, confiance)
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
  partie comme il y a deux lancés ; l'admin a un onglet Distance
  (`PAGES_DISTANCE` dans admin.js liste les pages), et l'origine des visites
  compte les arrivées par lien ou QR code en « Mode DUO ».
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
