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
| `citation` | reel.mp4 + couverture.jpg | Phrase en police plume, mot à mot, fleurs au trait, musique douce |
| `image` | image.jpg | Post 4:5 : phrase émotive (plume, fleurs) ou drôle (Fredoka), avec ou sans scène dessinée (`scene`) |
| `carrousel` | page-1.jpg... | Couverture et page finale (avec ou sans scène dessinée), pages numérotées |

Dans les jeux, la question entre seule et reste le temps d'être lue (0,7 s
plus 0,3 s par mot, de 1,2 à 3,5 s) avant que le chrono parte.

Les exemples de `studio/recettes/exemples/` montrent chaque champ.

## Le moteur d'animation (`studio/src/pov/`)

Un scénario `pov` est une suite de plans. Chaque plan a un décor
(`vocabulaire.json` : décors et leurs spots, objets, effets, gestes, sons),
des personnages placés sur un spot (« lit-gauche », « canape-droite »,
« banc-gauche »...) ou à une abscisse, et une ligne de temps de gestes
(`marche`, `saute`, `salue`, `calin`, `bisou`, `offre`, `tient`, `mange`,
`vaisselle`, `telephone`, `dort`, `apparait`...). S'y ajoutent les objets
posés ou qui s'envolent, les effets (cœurs, Z, « ! », flocons, confettis,
feux d'artifice), les bulles de dialogue, les textes qui s'écrivent mot à
mot, la caméra (zoom sur un personnage, secousse) et une légende par plan.
Les bruitages se déduisent des gestes.

- `temps.ts` : l'état de chaque personnage et de la caméra à un instant
  (fonctions pures). Respiration et clignement sont automatiques.
- `decors.ts`, `objets.ts` : les dessins au trait (couleurs `decor-*` de la
  charte).
- `Scene.tsx`, `Textes.tsx` : le rendu d'un plan et de ses textes.
- `plan.ts` : minutage, images contrôlées, bruitages.

Le contrôle du scénario avant rendu est dans
`automates/lib/pov.mjs` (vocabulaire, temps, longueurs, emojis).

## Sons

Bruitages CC0 de Kenney, packs Interface, Digital Audio, RPG Audio et Impact (`studio/public/sons/LICENCES.md`), musiques du
domaine public du catalogue FreePD (`studio/public/musique/bibliotheque.json`).
