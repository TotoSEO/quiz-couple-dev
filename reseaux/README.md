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
| `baton` | reel.mp4 + couverture.jpg | Le bonhomme bâton (« me in my dreams with u ») : une mini-aventure de 20 à 40 s au trait noir, un héros articulé qui bouge comme un ninja, des ralentis, un dragon ; hors de la DA des mascottes, voir plus bas |

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

## Le bonhomme bâton (`studio/src/baton/`, gabarit `baton`)

Le format « me in my dreams with u » (idée de Thomas, 15 octobre 2026) :
un héros au corps de traits et à la tête ronde, bandana violet, qui se
déplace comme un ninja (course, passe-muraille, saut, roulade, glissade,
grand bond), sa copine (queue de cheval, nœud rose), un dragon, dans des
mini-aventures qui prennent le temps qu'il leur faut (le dragon fait 34 s ;
la cible « 10 à 20 s » du départ est abandonnée depuis le 16 octobre 2026,
Thomas : « ne te base plus sur ça », des scènes étaient précipitées ; le
contrôle accepte de 10 à 40 s). Noir et blanc au trait sur papier blanc,
seuls les éléments qui comptent sont en couleur (le bandana, le nœud, la
lame électrique bleue, les yeux et la gueule rouges du dragon, le bouquet,
les cœurs). Rien à voir avec la DA des mascottes : c'est un format à part.

Le scénario est un **découpage technique** plan par plan
(`recettes/exemples/baton-dragon.md` pour le modèle, `baton-dragon.json`
pour la recette) : description de 120 signes au moins, durée de récit,
décor (`montagnes`, `foret`, `falaise`, `pont`, `tour`, `sommet`),
travelling (`defile`, le paysage glisse en deux plans de profondeur, des
`obstacles` posés par l'instant où ils passent sous le héros), personnages
avec leurs `etapes` (position, hauteur, rotation, pose fondue depuis la
précédente, expression, arme, bouquet, regard) et leurs `actions`
procédurales (`court`, `saute`, `vaulte`, `roule`, `glisse`, `bond`,
`trainee`, `trainee-lame`, `electrise`, `charge`, `tremble`, `souffle`,
`parle`, `gigote`, `vent`), le dragon (`vole`, `plonge`, `perche`, `rugit`,
`eclate`, il emporte un personnage avec `porte`), les effets (poussière,
onde de choc, fissure, lignes de vitesse, flash, ombre qui passe, cœurs,
étincelles, éclats), la caméra (zoom sur la tête, le corps ou les pieds
d'un personnage, déplacement, secousse) et les **ralentis** : les temps
d'un plan sont en secondes de récit, `ralentis` étire une tranche à
l'écran (facteur 0,1 : 0,2 s de récit en 2 s), et `plan.ts` convertit tout
en images d'écran. Un plan s'ouvre par une coupe franche, un `fondu` court,
ou un `flou` (Thomas, 16 octobre 2026 : « un effet flou comme une
transition CapCut, pour le côté le temps passe ») : pendant une seconde le
plan d'avant continue de jouer en se brouillant et en s'éclaircissant
pendant que le nouveau se précise, un souffle de passage dessus ; une
action (la course) peut déborder son plan d'une seconde pour continuer sous
la transition, et le contrôle de mise en page ne regarde ce plan qu'après
elle (les visages du plan fantôme ne comptent pas).

- `rig.ts` : le squelette (hanches, buste, tête ; épaules, coudes, mains ;
  hanches, genoux, chevilles, pieds), 28 poses nommées en degrés (dont
  `abattu`, la tête qui tombe), le fondu
  entre poses, le cycle de course (sprint de ninja : buste couché, bras en
  arrière, lame qui traîne), les visages (17 expressions, dont `chagrin`,
  une larme qui perle et coule, deux par seconde et demie, depuis le changement d'expression, et
  `vengeur`, sourcils en biais, yeux plissés et sourire en coin), l'épée (poignée
  au dos, lame tenue avec halo et étincelles selon la charge), le bouquet,
  les pans du bandana et la queue de cheval qui suivent le vent et la
  vitesse. La hauteur des hanches est recalculée pour que le pied le plus
  bas touche toujours le sol.
- `temps.ts` : l'état de chacun et de la caméra à un instant du récit, et
  le remap des ralentis.
- `decors.ts`, `creatures.ts`, `effets.ts` : les dessins.
- `Scene.tsx`, `gabarits/Baton.tsx` : le rendu (rémanences, traînée de la
  lame, flash, voile du ralenti, lignes de vitesse, titre, signature).
- `plan.ts` : durées à l'écran, images contrôlées, bruitages déduits des
  gestes.

Les bruitages viennent de Mixkit depuis le 16 octobre 2026 (Thomas :
« plusieurs sound effects sont pas bons, genre quand il sort son épée ») :
39 sons ajoutés à `public/sons/bibliotheque.json` (la lame qui sort du
fourreau et qui rentre, le sifflement de lame, grognement et rugissements
du dragon, souffles d'air et de passage, fusée, météore, tempête,
crépitements et montées électriques, onde de choc, déflagrations, débris,
impacts, chutes de corps, pierre qui craque, cailloux, battements de cœur,
paillettes) et l'ambiance `vent-montagne` pour les montagnes, la tour et le
sommet ; `plan.ts` les déduit des gestes (épée en main → `epee-tire` puis
`lame`, au dos → `epee-range`, saut → `air` puis `chute`, grand bond →
`onde-choc` et `fusee`, électrisation → `montee-electrique` et `crepite`,
lame qui se charge → `charge-electrique`, dragon qui bouge → `dragon-grogne`,
qui rugit → `dragon-rugit`, qui pique → `meteore`, qui explose →
`deflagration` et `debris`, fissure → `craquement` et `cailloux`, ralenti →
`coeur-ambiance`, transition floue → `passage`, sourire charmeur →
`scintille`). Les sons synthétisés par `scripts/synthese-sons.mjs`
(`public/sons/sy-*.mp3`, manifeste `synthese.json`, dans le dépôt) restent
pour les ailes, le bourdon, le drone du ralenti et le flash ; jamais de
voix. Le contrôle du scénario est `automates/lib/baton.mjs`. Le format n'a
pas encore de catégorie dans la grille : il attend le feu vert de Thomas
sur le premier reel.

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
