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
```

Avant tout rendu, chaque écran passe le contrôle de mise en page : texte dans
la zone utile, pas de débordement, pas de mot seul en dernière ligne, 34 px
au moins, nombre de lignes maximal. Une faute arrête le rendu avec son
explication ; on corrige la recette (on raccourcit la phrase), jamais la
taille du texte.

Le son du reel fini est ramené à -14 LUFS et -1 dBTP (jetons `son-*`).

## Gabarits

| Recette `gabarit` | Sortie | Contenu |
|---|---|---|
| `citation` | reel.mp4 + couverture.jpg | Phrase en police plume, mot à mot, fleurs au trait, musique douce |
| `quiz-chrono` | reel.mp4 + couverture.jpg | Intro, questions chronométrées, réponse, fin ; mascottes qui attendent puis font « Yay! » |
| `image` | image.jpg | Phrase émotive (plume, fleurs) ou drôle (Fredoka) |
| `carrousel` | page-1.jpg... | Couverture, pages numérotées, page finale |

Les exemples de `studio/recettes/exemples/` montrent chaque champ.

## Sons

Bruitages CC0 de Kenney (`studio/public/sons/LICENCES.md`), musiques du
domaine public du catalogue FreePD (`studio/public/musique/bibliotheque.json`).
