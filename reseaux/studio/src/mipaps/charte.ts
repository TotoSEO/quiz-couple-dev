// La charte des mipaps (reseaux/mipaps/charte/README.md) : fond blanc, trait
// d'encre tremblé, cinq couleurs, Shantell Sans. Le canevas, la zone utile et
// le contrôle de mise en page restent ceux du studio (classes qc-*) ; la
// classe is-mipaps du canevas pose le fond blanc et la police.
import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import './mipaps.css';

loadFont({
  family: 'Shantell Sans',
  url: staticFile('fonts/ShantellSans-latin-variable.woff2'),
  weight: '300 800',
  style: 'normal',
});

// La signature en bas des visuels, et les deux mots que le studio écrit
// lui-même sur un carrousel (le reste vient toujours de la recette).
export const MARQUE = 'les mipaps';
export const APPEL_DEFAUT = 'envoie ça à ta personne';
export const GLISSE = 'fais glisser →';

// Une scène se dessine dans la boîte de scenes.mjs : 640 x 420, le sol à 380.
export const BOITE = { w: 640, h: 420, sol: 380 };

// Dans un reel animé (1080 x 1920), la scène est agrandie de ECHELLE_REEL
// (on voit la boîte de x = 75 à x = 565, un personnage ordinaire fait 310 px
// de large) et son sol est posé à SOL_REEL, au-dessus de la bande du bas
// d'Instagram ; le texte tient au-dessus, à 140 px du haut de la zone utile.
export const ECHELLE_REEL = 2.2;
export const SOL_REEL = 1340;
