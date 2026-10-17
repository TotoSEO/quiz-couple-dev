// La charte du bonhomme bâton : du papier blanc, de l'encre, Shantell Sans
// (la police dessinée des mipaps) pour le titre. Le canevas, la zone utile
// et le contrôle de mise en page restent ceux du studio (classes qc-*).
import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import './baton.css';

loadFont({
  family: 'Shantell Sans',
  url: staticFile('fonts/ShantellSans-latin-variable.woff2'),
  weight: '300 800',
  style: 'normal',
});
