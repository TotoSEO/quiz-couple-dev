import React from 'react';
import { Canevas, Signature } from '../charte/Canevas';
import { Fleurs } from '../charte/Fleurs';
import { LIBELLES } from '../charte/libelles';
import type { RecetteImage } from '../recette';

const bas: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 'var(--zone-post-marge)',
  display: 'flex',
  justifyContent: 'center',
};

// P1 : une phrase centrée, la signature en bas. Émotive : police plume et
// fleurs. Drôle : Fredoka, sans fleurs.
export const ImageFixe: React.FC<{ recette: RecetteImage; verification?: boolean }> = ({ recette: r, verification }) => (
  <Canevas theme={r.theme} format="post" verification={verification}>
    {r.style === 'citation' && <Fleurs choix={r.fleurs} />}
    <div className="qc-utile">
      {r.style === 'citation' ? (
        <p className={'qc-citation' + (r.longue ? ' is-longue' : '')} data-verif="citation" data-lignes-max={r.longue ? 7 : 4}>
          {r.texte}
        </p>
      ) : (
        <p className="qc-phrase" style={{ margin: 0 }} data-verif="phrase" data-lignes-max={4}>
          {r.texte}
        </p>
      )}
    </div>
    <div style={bas}>
      <Signature texte={LIBELLES[r.langue].site} />
    </div>
  </Canevas>
);
