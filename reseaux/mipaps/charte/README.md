# Les mipaps : la charte du Gribouillou et de la Gribouillette

Le compte Instagram « Les mipaps » (français : reels animés, reels statiques,
carrousels-histoires et posts) est dessiné avec deux personnages :
le Gribouillou (bleu pâle) et la Gribouillette (rose pâle, deux cils et une
fleur sur l'oreille). Ce sont les noms de travail du code (`perso: 'lui'` et
`perso: 'elle'`). Dans le lore du compte (la bio Instagram, les légendes qui
les nomment), elle s'appelle **Eli** et lui **Toh** (Thomas, 8 octobre
2026) ; les posts eux-mêmes parlent de « mon amoureux » et « ma personne »
pour que chacun s'y mette. Le canevas de référence, avec les 86 expressions, les 25 poses, les
18 scènes à deux, les 80 objets, la table de rotation et un exemple de
chaque format (les deux reels, une page de carrousel, un mini) :
https://claude.ai/artifact/DYX3xFtQBrV4jDUerw8LDH (privé, Thomas).

## La direction artistique

- Fond blanc, toujours. Pas de décor complet : un objet, un meuble vu de
  trois quarts, un trait de sol au plus.
- Tout au même trait d'encre, épais et tremblé (filtre de déplacement),
  repassé une seconde fois plus fin : personnages, objets, cases, flèches.
- Cinq couleurs : l'encre `#17171a`, le bleu de lui `#cfe6ff`, le rose
  d'elle `#ffd9e6`, le rose des joues `#ffa6c1`, le rose des cœurs et de la
  fleur `#ff7fa7`, et le blanc. Rien d'autre, jamais de dégradé.
- Une émotion par image. Texte court, en minuscules, comme un message
  envoyé à l'autre, en Shantell Sans (Google Fonts), 700 pour les textes,
  500 pour la signature et les mentions.
- Les textes ne se chevauchent jamais : une page ou une case est une
  colonne, le texte en haut en flux, le dessin en dessous qui prend la place
  qui reste. Aucun texte posé en absolu (une phrase sur deux lignes recule
  le dessin au lieu d'écraser la ligne suivante).

## Les fichiers

- `gribouillou.mjs` : le personnage. `mipap({ perso, expression, pose, bras,
  pattes, angle, marqueur, signes, vers, seed, id })` rend un fragment SVG
  dans une boîte de 300 x 300 (corps centré en 150, 165) et ses `defs`
  (filtres). `EXPRESSIONS` (86, par famille : bonne humeur, amour, surprise
  et peur, chagrin, colère, fatigue, réflexion, effort, nuances), `POSES`
  (25 : debout, marche, court, sprint, saut, assis, allongé, tombe, glisse,
  rampe, boule, étiré, penché, tremble, vole, pousse, tire, salue, danse,
  roule, visière, plante un panneau, porte à bout de bras, arrive), `BRAS`
  (30 positions de mains), `PATTES`, `PROPS` (80 objets, `prop(nom, x, y,
  echelle, id)`), `document(contenu, { w, h, defs })` pour un fichier SVG
  complet, `pose(o, x, y, taille, miroir)` pour poser un personnage dans une
  scène (x, y = milieu du bas).
- Le personnage est un rig : chaque trait a une place en trois dimensions
  sur le corps (dx à droite, dy en bas, dz vers le spectateur) et `angle`
  les projette : 0 de face, 90 de profil vers la droite, 180 de dos, -90
  vers la gauche, toute valeur entre. Ce qui passe derrière se cache, ce qui
  s'approche grossit un peu (`taille(z)`), une foulée s'écrit en profondeur
  (de face les pattes restent proches, de profil elles s'écartent). Pour
  l'animation : interpoler `angle`, la position et la pose d'une image à
  l'autre, changer d'expression sur une image, et changer `seed` toutes les
  quatre images (à 24 images par seconde) pour que le trait vive.
- Dès qu'une main se pose quelque part (joue, bouche, yeux, tête, objet),
  le bras entier se dessine : un tube depuis l'épaule et une patte ronde au
  bout. Un ovale posé seul sur la bouche ressemblait à une moustache
  (Thomas, 8 octobre 2026).
- `scenes.mjs` : les scènes à deux (`DUOS`, `scene(nom, { prefix })`), les
  meubles en perspective (`MEUBLES` : lit, canapé, vus de trois quarts un peu
  par-dessus : un bord proche plus large que le bord lointain, une face
  avant). Un objet tenu se place sur la patte : la position projetée d'une
  main se calcule depuis les coordonnées de `BRAS` et la taille du
  personnage (voir `parapluie` et `selfie`).
- `planches.mjs` : fabrique les douze planches du canevas (`canevas/`,
  ignoré par git) et un aperçu local `canevas/apercu.html`.

## Le compte, branché (8 octobre 2026)

Le studio Remotion (`reseaux/studio/src/mipaps/`) rend quatre gabarits avec
ces personnages, importés tels quels depuis `gribouillou.mjs` et
`scenes.mjs` : `mipaps-post` (mini, déclaration, schéma de bureau),
`mipaps-carrousel` (l'histoire page par page), `mipaps-statique` (le dessin
qui respire) et `mipaps-reel` (l'animation : étapes interpolées, cycle de
marche, rotation continue). Pas de BD : Thomas n'en veut pas. Le compte est
la langue `fr` des tables `social_*` (migration `20261009110000`), avec sa
semaine type ; l'atelier (`../atelier/`) porte la ligne éditoriale, les
consignes de la routine, la banque de sujets et les posts, sur la branche
`mipaps-atelier`. Le contrôle des recettes (`reseaux/automates/lib/mipaps.mjs`)
lit les listes de ce rig : `LISTE_POSES`, `LISTE_BRAS`, `LISTE_PATTES`,
`LISTE_SIGNES`, `LISTE_PROPS`, `EXPRESSIONS`, `DUOS`, `MEUBLES`.

Pour l'animation, `mipap()` prend `foulee` (0 à 1) : le cycle des pattes et
le balancement des bras de course suivent la distance parcourue ; les poses
qui courent posent des bras de course d'elles-mêmes. Le visage ne tourne
jamais au-delà de 62° (il glisse au bord avant du corps et reste lisible de
profil), puis s'efface entre 100° et 150°.
