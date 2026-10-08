# Réseaux sociaux

Tout ce qui fabrique et publie les posts Instagram de Quiz Couple. Le plan
d'ensemble est dans `docs/reseaux-sociaux/ARCHITECTURE.md`, la charte dans
le design system « Quiz Couple Social ».

- `charte/` : copie de la charte du design system (`tokens.json`, `qc.css`)
  et le dessin des mascottes (`mascottes.js`). Une seule source pour les
  aperçus du design system et pour le studio.
- `studio/` : le studio Remotion. Une recette JSON entre, un reel MP4 ou des
  images JPEG sortent.

## Rendre une recette

```bash
cd reseaux/studio
npm ci
node scripts/rendre.mjs recettes/exemples/quiz-chrono.json sorties/quiz
node scripts/rendre.mjs --verifier recettes/exemples/carrousel.json sorties/c   # contrôle seul
node scripts/planche.mjs recettes/exemples/pov-frites.json sorties/planche.png --toutes 0.5   # une image toutes les 0,5 s
```

La planche montre un reel d'un coup d'œil (images réduites côte à côte,
avec leur numéro et leur temps) : c'est ce qu'on relit avant de valider une
animation.

Avant tout rendu, chaque écran passe le contrôle de mise en page : texte dans
la zone utile, pas de débordement, pas de mot seul en dernière ligne, 34 px
au moins, nombre de lignes maximal ; dans les animations, chaque visage
reste dans l'image et n'est jamais caché par un texte, et deux textes ne se
chevauchent jamais. Une faute arrête le rendu avec son
explication ; on corrige la recette (on raccourcit la phrase), jamais la
taille du texte.

Le son du reel fini est ramené à -14 LUFS et -1 dBTP (jetons `son-*`).

## Gabarits

| Recette `gabarit` | Sortie | Contenu |
|---|---|---|
| `pov` | reel.mp4 + couverture.jpg | Animation avec les mascottes : POV, mini message, scène coquine, reel statique (un plan). Scénario plan par plan, voir plus bas |
| `connais-tu` | reel.mp4 + couverture.jpg | « Connais-tu ton partenaire ? » : accroche animée, 8 questions sans réponse, lecture puis chrono, « Comment your score! » |
| `tu-preferes` | reel.mp4 + couverture.jpg | Tu préfères : accroche animée, dilemmes A ou B (alignés à gauche), lecture puis chrono |
| `quiz-chrono` | reel.mp4 + couverture.jpg | Quiz à bonne réponse : lecture, réponses, chrono, réponse, fin |
| `citation` | reel.mp4 + couverture.jpg | Phrase en police plume, mot à mot, fleurs au trait, le petit duo des mascottes, 10 à 14 s |
| `image` | image.jpg | Post 4:5 : phrase émotive (plume, fleurs) ou drôle (Fredoka), avec une scène dessinée (`scene`) ou le petit duo |
| `carrousel` | page-1.jpg... | Couverture et page finale (scène dessinée ou duo), pages numérotées avec le duo en tout petit dans le coin |
| `bd` | image.jpg (ou page-1.jpg... avec `sortie: carrousel`) | Bande dessinée en quatre cases : une scène figée par case (vocabulaire des animations), bordée d'un trait d'encre, répliques courtes en haut du côté de celui qui parle, chute dans la dernière case |

Les mascottes sont sur tous les visuels (`Duo.tsx` quand il n'y a pas de
scène). Elles sont dessinées : trait d'encre tremblé (`charte/mascottes.js`,
option `tremble`), aplats, joues estompées, le nœud de la rose, seize poses
et humeurs ; un grain de papier léger (`is-papier`) couvre toute l'image.

Dans les jeux, la question entre seule et reste le temps d'être lue (0,7 s
plus 0,3 s par mot, de 1,2 à 3,5 s) avant que le chrono parte.

Les exemples de `studio/recettes/exemples/` montrent chaque champ.

## Le moteur d'animation (`studio/src/pov/`)

Un scénario `pov` est une suite de plans. Chaque plan a un décor
(`vocabulaire.json` : quinze décors et leurs spots, objets, effets, gestes,
sons, ambiances ; depuis le 7 octobre 2026 la forêt, la rue, le café, la
plage, l'intérieur d'une voiture et la salle de cinéma s'ajoutent aux
intérieurs et au parc, pour varier les scènes),
des personnages placés sur un spot (« lit-gauche », « canape-droite »,
« banc-gauche »...) ou à une abscisse, et une ligne de temps de gestes
(`marche`, `saute`, `salue`, `calin`, `bisou`, `offre`, `tient`, `mange`,
`vaisselle`, `telephone`, `dort`, `pleure`, `fache`, `mignon`, `plonge`,
`apparait`...). S'y ajoutent les objets
posés ou qui s'envolent, les effets (cœurs, Z, « ! », flocons, confettis,
feux d'artifice), les bulles de dialogue, les textes qui s'écrivent mot à
mot, la caméra (zoom sur un personnage, secousse), une légende par plan et
une transition (`coupe`, `fondu`, `glisse`, `noir` : l'image s'éteint puis se
rallume, pour passer d'un moment de la journée à l'autre ; la lumière de la
pièce suit `moment`). Les bruitages se déduisent des gestes ; la musique
n'est pas dans le fichier, c'est un son tendance de la bibliothèque
Instagram attaché à la publication (`automates/lib/son.mjs`). Un reel dure
10 s au moins.

- `temps.ts` : l'état de chaque personnage et de la caméra à un instant
  (fonctions pures). Respiration et clignement sont automatiques.
- `decors.ts`, `objets.ts` : les dessins au trait (couleurs `decor-*` de la
  charte).
- `Scene.tsx`, `Textes.tsx` : le rendu d'un plan et de ses textes.
- `plan.ts` : minutage, images contrôlées, bruitages.

Le contrôle du scénario avant rendu est dans
`automates/lib/pov.mjs` (vocabulaire, temps, longueurs, emojis).

## Sons

Deux sources, toutes deux doux (volumes 0,10 à 0,24) et variés (`VARIANTES`, Son.tsx) :
les sons d'interface et de gestes de Kenney (CC0, packs Interface, Digital Audio, RPG Audio et Impact, dans le dépôt,
`studio/public/sons/LICENCES.md`), et depuis le 7 octobre 2026 les réactions des mascottes et les ambiances des décors,
tirées de Mixkit (`studio/public/sons/bibliotheque.json`, 78 fichiers `mx-*.mp3` préparés par `node scripts/sons.mjs`,
jamais commités, en cache dans le workflow de rendu ; `rendre.mjs` refuse de rendre si l'un manque). Les réactions se
déduisent des gestes (`pleure` fait pleurer, `rit` rire, `fache` grogner, `boude` soupirer, `dort` ronfler, `mange`
croquer, `bisou` fait un vrai petit bisou, un « ! » au-dessus de quelqu'un au téléphone fait une notification, une entrée
par le bord dans une pièce fait la porte, la clochette du café ou la portière de la voiture, un réveil posé sonne, un objet
qui se pose fait un bruit de vaisselle) ou se posent à la main dans `sons` (cri, sursaut, klaxon, tonnerre, trombone...).
Chaque décor a son lit sonore (`ambiance` dans vocabulaire.json : oiseaux dehors et en forêt le jour, grillons la nuit,
circulation dans la rue, vagues à la plage, brouhaha au café et au restaurant, moteur en voiture, projecteur au cinéma),
qu'un plan peut remplacer (`"ambiance": "pluie"`) ou couper (`"aucune"`) ; les pièces fermées n'en ont pas.
Pas de musique dans le fichier : la publication attache un son tendance de la bibliothèque
Instagram (Audio API, connexion Facebook ; `automates/lib/son.mjs`, choix sans répétition écrit dans la recette, `son`).
Une recette qui demande `ambiance` ou `musique` reçoit malgré tout un morceau de notre bibliothèque mixé dans la vidéo :
55 morceaux en cinq ambiances (`studio/public/musique/bibliotheque.json`), six FreePD (CC0) dans le dépôt et 49 Mixkit
préparés par `node scripts/musiques.mjs` (à lancer une fois avant un rendu en local), choix dans `automates/lib/musique.mjs`.
