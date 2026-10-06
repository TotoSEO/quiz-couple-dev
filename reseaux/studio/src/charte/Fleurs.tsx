import React from 'react';
import { Img, staticFile } from 'remotion';
import type { Fleurs as ChoixFleurs } from '../recette';
import { useBalancement } from './animation';

// Deux fleurs au plus, dans deux coins opposés (groupe Ornements).
const PAIRES: Record<Exclude<ChoixFleurs, 'aucune'>, [string, string][]> = {
  'brin-marguerite': [
    ['brin', 'is-haut-gauche'],
    ['marguerite', 'is-bas-droite'],
  ],
  feuillage: [
    ['feuillage', 'is-haut-droite'],
    ['feuillage', 'is-bas-gauche'],
  ],
};

export const Fleurs: React.FC<{ choix?: ChoixFleurs }> = ({ choix = 'brin-marguerite' }) => {
  const angle = useBalancement();
  if (choix === 'aucune') return null;
  return (
    <>
      {PAIRES[choix].map(([fleur, coin], i) => (
        <Img
          key={i}
          className={`qc-fleur ${coin}`}
          src={staticFile(`ornements/fleur-${fleur}.svg`)}
          style={{ rotate: `${i ? -angle : angle}deg` }}
        />
      ))}
    </>
  );
};
