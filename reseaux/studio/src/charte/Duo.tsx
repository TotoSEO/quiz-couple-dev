import React from 'react';
import { Mascotte } from './Mascotte';

// Le petit duo qui signe chaque visuel sans scène : la rose et le violet
// serrés l'un contre l'autre, elle fait la mignonne, lui passe un bras.
// Règle de Thomas (octobre 2026) : les mascottes sont sur tous les posts,
// même en tout petit sur une phrase tendre. f : l'image courante, pour la
// respiration et le trait qui vit (absent : dessin figé).
export const Duo: React.FC<{ echelle?: number; f?: number; style?: React.CSSProperties; verif?: string }> = ({ echelle = 0.6, f, style, verif }) => {
  const tremble = f === undefined ? 3 : Math.floor(f / 4);
  const souffle = f === undefined ? 0 : Math.sin((2 * Math.PI * f) / 72);
  return (
    <div className="qc-duo-mini" style={style} data-verif={verif} data-sans-lignes={verif ? '' : undefined} data-sans-chevauchement={verif ? '' : undefined}>
      <Mascotte
        nom="rose"
        echelle={echelle}
        options={{ tremble, bras: [6, 44], devant: [false, true], yeux: 'heureux', bouche: 'chat', rougit: true, penche: 7, saut: 1.5 + 1.5 * souffle }}
      />
      <Mascotte
        nom="violet"
        echelle={echelle}
        options={{ tremble: tremble + 1, bras: [46, 6], devant: [true, false], yeux: 'heureux', bouche: 'sourire', rougit: true, penche: -7, saut: 1.5 - 1.5 * souffle }}
        style={{ marginLeft: -44 * echelle }}
      />
    </div>
  );
};
