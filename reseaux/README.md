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
| `baton` | reel.mp4 + couverture.jpg | Le bonhomme bâton (« me in my dreams with u ») : une petite histoire de couple de 15 à 40 s au trait noir, un héros articulé (fille ou garçon) qui bouge comme un ninja, des ralentis, neuf trames de rêve où l'impossible arrive (le dragon, les ailes, les bandits au karaté, le jardin rempli de chiens, la quête du diamant, l'étoile, le nuage shooté, la lune au lasso, la promesse de la lune qui finit mal) ; hors de la DA des mascottes, voir plus bas |

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
un héros au corps de traits et à la tête ronde qui se déplace comme un
ninja (course, passe-muraille, saut, roulade, glissade, grand bond, vol),
l'autre personnage, et une petite histoire de couple qui prend le temps
qu'il lui faut (le dragon fait 34 s ; la cible « 10 à 20 s » du départ est
abandonnée depuis le 16 octobre 2026, Thomas : « ne te base plus sur ça »,
des scènes étaient précipitées ; le contrôle accepte de 10 à 40 s). Noir et
blanc au trait sur papier blanc, seuls les éléments qui comptent sont en
couleur (le bandana violet du garçon, le nœud rose de la fille, la lame
électrique bleue, les yeux et la gueule rouges du dragon, le diamant bleu
pâle, l'or de la bague, la lune pâle, la langue rose des chiens, les
flammes des torches, le bouquet, les cœurs). Rien à voir avec la DA des
mascottes : c'est un format à part. Le héros (« me ») est un garçon ou une
fille (`heros` dans la recette) : la fille garde son nœud et sa queue de
cheval, le garçon son bandana, quel que soit le rôle (Thomas, 16 octobre
2026 : « tu lui as mis le bandana de ninja et pas le nœud rose ») ; l'autre
s'appelle `elle` dans les recettes, même quand c'est lui ; les bandits
(`bandit1` à `bandit4`) sont des figurants au même rig, bonnet et masque.

**Le concept** (Thomas, 16 octobre 2026, devant une version qui racontait le
quotidien, le parapluie et les crêpes : « me in my dreams with u veut dire
moi dans mes rêves avec toi. La personne rêve ! Elle fait des choses qui
normalement sont pas possibles, comme avec le dragon ! Je dis pas que tout
doit être tourné médiéval fantaisie, je dis juste que faut pas faire des
trucs banals ») : chaque histoire est un rêve où l'impossible arrive, avec
une vraie chute. **Le réalisateur** (`realisateur.mjs`, JavaScript partagé
avec les automates par `realisateur.d.mts` ; `plans.ts` le mémoïse)
transforme un **brief par séquences** (`histoire.sequences` : ouverture et
son incident, emotion en gros plan, depart, traversee, arrivee,
preparation, surprise, exploit, retrouvailles ou chute, chacune avec ses
paramètres et sa description) en plans techniques, avec les réglages mis au
point sur le dragon : visages sous le titre, caméra qui pousse, ralenti au
bon moment, transitions floues, sol tenu au-dessus de la signature. Neuf
trames (`TRAMES`) :

- `sauvetage` : le dragon l'emporte, épée, traversée, tour, garde, bond au
  ralenti, le dragon explose, bouquet au sommet. **La seule avec l'épée**,
  le réalisateur la refuse ailleurs.
- `ailes` : elle regarde passer les oiseaux et soupire ; des ailes se
  déploient dans le dos du héros (vêtement `ailes`, plumes, onde de choc),
  il plane jusqu'à elle, lui tend la main, elle la prend au ralenti
  (`attache` bras : sa main levée arrive dans la sienne) et ils traversent
  le ciel (décor `ciel`, travelling de nuages, un looping par `rot`), se
  posent sur un nuage (décor `nuages` fixe), s'asseyent devant le soleil, et
  des ailes lui poussent à elle aussi.
- `bandits` : en ville, trois ou quatre bandits masqués déboulent et
  l'encerclent ; le héros fait craquer ses jointures, prend la garde de
  karaté, et le combo : coup de poing (le premier vole hors de l'image),
  coup de pied (le deuxième passe par-dessus lui et s'étale K.-O., étoiles
  autour de la tête), saut et coup de pied retourné au ralenti (les derniers
  hors de l'image) ; il s'époussette les mains, elle lui saute au cou.
- `chiens` : le héros veut un chien (bulle de pensée au chiot, les yeux qui
  brillent), l'autre croise les bras et fait non de la tête. Le soir même
  (séquence `surprise`), le héros l'emmène par la main jusqu'au jardin :
  rempli de chiens (créature `chiens`, une meute de neuf) ; l'autre tourne
  de l'œil (spirale, yeux en spirale) et s'évanouit raide comme une planche
  au ralenti ; le héros cajole un chiot, s'agenouille, l'autre se réveille et
  rit.
- `diamant` : elle rêve d'une bague (bulle) ; le héros sort une pioche,
  traverse la falaise, le donjon (torches, chaînes, obstacle `pique`) et le
  tapis de nuages (obstacle `trou`) jusqu'à la grotte où le diamant géant
  pulse (effet `diamant-geant`) ; pioche levée, pieds ancrés, le saut et le
  coup au ralenti : mille éclats de cristal (`eclats-diamant`, son
  `cristal`), la pierre parfaite qui flotte (`diamant-flotte`), trois coups
  de marteau (`enclume`), la bague ; retour en courant (transition floue),
  un genou à terre, elle les mains sur la bouche, saut de joie, câlin.
- `etoile` : elle montre une étoile, le héros s'accroupit, bondit, la
  décroche au ralenti et la lui pose dans les mains.
- `nuage` : un nuage d'orage les arrose ; le héros bondit et le shoote d'un
  coup de pied au ralenti (action `bond` avec `pose: coup-pied`, effet
  `impact`), le nuage crève, les rayons du soleil (`rayons`) ; rires.
- `lune` : elle montre la lune (créature `lune`, le décor n'en dessine pas :
  `sansAstre`) ; le héros sort une corde, fait tournoyer le lasso (objet
  `lasso`), le lance au ralenti dans la fumée (`fumee`) et le sol qui se
  brise (trois fissures), la boucle vole (`lasso-vole`) et se referme sur la
  lune, qui ouvre des yeux ronds ; il tire de tout son poids (`tire-corde`,
  objet `corde-tendue` : la scène dessine la corde jusqu'à la lune) et la
  lune descend se poser sur la colline ; ils sautent dessus et s'asseyent
  côte à côte (fin `assis`, `sol` au sommet de la lune).
- `promesse` (l'idée de Thomas, 16 octobre 2026) : le héros dit « i'd pull
  the moon down for you » (bulle de dialogue, effet `dit`), l'autre hausse un
  sourcil (`sceptique`), « ... », et retourne à son téléphone (objet
  `telephone`) ; gros plan de colère (`colere`, joues rouges) ; il recule de
  quatre pas (`recul`), sort le lasso, le lance au ralenti, attrape la lune
  et la tire : elle grossit, elle arrive. Séquence `chute` : gros plan sur
  l'autre au téléphone, grondement, la caméra tremble, elle lève les yeux,
  la lune se reflète dans ses pupilles (`reflet`, zoom 7 sur le visage),
  visage horrifié (`horreur`), fondu au noir. La seule trame sans fin
  heureuse, et la seule qui change de titre (« when he promises u the
  moon »).

Les briefs modèles sont `recettes/exemples/baton-*.json`, un par trame ; le
contrôle (`automates/lib/baton.mjs`) compile le brief et vérifie les plans.

Une recette peut encore écrire ses **plans** à la main, comme un découpage
technique (`recettes/exemples/baton-dragon.md` pour le modèle) :
description de 120 signes au moins, durée de récit, décor (`montagnes`,
`prairie`, `ville`, `plage`, `maison`, `salon`, `foret`, `falaise`,
`pont`, `tour`, `sommet`, et depuis le format rêvé `ciel`, `nuages`,
`donjon`, `grotte`, `jardin`), nuit, travelling, obstacles, personnages
(`heros`, `elle`, `bandit1` à `bandit4`) avec leurs étapes (position,
hauteur, rotation, sol, pose, expression, regard, arme, objet tenu,
vêtement, attache, couché, reflet) et leurs actions (course aux quatre
allures, saut, passe-muraille, roulade, glissade, grand bond avec sa pose,
rémanences, traînée de lame, électrisation, charge, tremblement, souffle,
parole, gigote, vent, vol, non de la tête), créatures (dragon, nuage
d'orage, lune, meute de chiens avec `nombre` et `largeur`), effets, caméra
(clés, cibles, secousses), ralentis, sons, ambiance, transition (`coupe`,
`fondu`, `flou`, `noir`). Les noms sont ceux de `src/baton/vocabulaire.json`.
Le rig (`rig.ts`) compte soixante-quatorze poses et trente expressions ; les
bulles de dialogue sont dessinées à l'écran par le gabarit (`Baton.tsx`),
dans la zone utile, jamais sur le titre, et comptent comme un texte pour le
contrôle de mise en page.

Les bruitages viennent de Mixkit (`public/sons/bibliotheque.json` : lame qui
sort du fourreau et qui rentre, sifflement de lame, grognement et rugissement
du dragon, souffles d'air et de passage, fusée, météore, tempête,
crépitements et montées électriques, onde de choc, déflagrations, débris,
impacts, chutes de corps, pierre qui craque, cailloux, battements de cœur,
paillettes, roulement de tambour, trombone) et des sons synthétisés par
`scripts/synthese-sons.mjs` (`public/sons/sy-*.mp3`, manifeste
`synthese.json`, dans le dépôt : whooshs, zaps, bourdon, boums, explosion,
grondement, ailes, sol qui craque, éclats, flash, montée, drone du ralenti,
réception, et depuis le format rêvé l'aboiement, le cristal qui éclate et
le marteau sur l'enclume) ; jamais de voix. `plan.ts` les déduit des gestes
(épée en main → `epee-tire` puis `lame`, coup de karaté → `whoosh` et
l'effet `impact` → `coup`, ailes qui se déploient → `froissement` et
`etincelle-magique`, vol → `ailes`, lasso → trois `whoosh`, corde tendue →
`craque`, diamant brisé → `cristal`, évanouissement → `trombone`, meute →
`aboie` et `boing`, lune qui se pose → `impact-profond` et `boum`, bulle de
dialogue → `bulle`, ralenti → `coeur-ambiance`, transition floue →
`passage`). Le contrôle du scénario est `automates/lib/baton.mjs`. Depuis le
16 octobre 2026, le format est la catégorie `baton` de tous les matins
(`MELANGE_DEFAUT`, migration `20261016150000` ; trois matins par semaine
le matin même, un par jour depuis le soir, Thomas : « on lance ces
animations à raison de une par jour »), avec une banque de 63 histoires
(`atelier/sujets.json`, sept par trame, les trames à tour de rôle, jamais
le même décor d'ouverture deux jours de suite, le héros fille presque une
fois sur deux et dans chaque trame, un titre de musique connu par histoire) et sa section dans
`atelier/CONSIGNES.md` ; la publication cherche ce titre dans la
bibliothèque Instagram (`son.recherche`), à défaut l'ambiance de la trame
(`epique` pour le dragon, les bandits et le diamant, `drole` pour les
chiens, le nuage et la promesse, `tendre` pour les autres). Un rendu
complet prend une vingtaine de minutes sur quatre cœurs.

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
