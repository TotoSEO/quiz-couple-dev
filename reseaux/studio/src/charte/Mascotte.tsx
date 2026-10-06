import React from 'react';
// Le dessin des mascottes vient du design system (reseaux/charte/mascottes.js),
// une seule source pour l'aperçu et pour le studio. Le fichier est un script
// classique (l'aperçu du design system l'inclut tel quel) : il se déclare sur
// window, on le lit là.
import '../../../charte/mascottes.js';
import type { OptionsMascotte } from '../../../charte/mascottes.js';

type Dessin = {
  mascotte: (nom: 'rose' | 'violet', o?: OptionsMascotte) => string;
  mainsMascotte: (nom: 'rose' | 'violet', o?: OptionsMascotte) => [[number, number], [number, number]];
  POSES_MASCOTTES: Record<string, OptionsMascotte>;
};
const { mascotte, mainsMascotte, POSES_MASCOTTES: POSES } = window as unknown as Dessin;

export { POSES, mascotte, mainsMascotte };
export type { OptionsMascotte };

// Largeurs d'affichage qui gardent le rapport de taille de la planche
// d'origine (le violet fait 1,3 fois la hauteur de la rose).
const ECHELLE = 1;
export const LARGEUR = { rose: 260 * ECHELLE, violet: 220 * ECHELLE };

export const Mascotte: React.FC<{
  nom: 'rose' | 'violet';
  options: OptionsMascotte;
  echelle?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ nom, options, echelle = 1, style, children }) => (
  <div className="qc-perso" style={{ width: LARGEUR[nom] * echelle, ...style }}>
    <div dangerouslySetInnerHTML={{ __html: mascotte(nom, options) }} />
    {children}
  </div>
);
