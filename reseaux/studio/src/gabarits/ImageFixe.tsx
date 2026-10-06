import React from 'react';
import { Canevas, Signature } from '../charte/Canevas';
import { Fleurs } from '../charte/Fleurs';
import { LIBELLES } from '../charte/libelles';
import type { RecetteImage } from '../recette';
import { DECORS_CALMES, SceneFixe } from '../pov/Scene';

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
    {r.scene && <SceneFixe plan={r.scene.plan} t={r.scene.t} haut={r.scene.haut} />}
    {r.style === 'citation' && !r.scene && <Fleurs choix={r.fleurs} />}
    <div className={'qc-utile' + (r.scene ? ' is-haut' : '') + (r.scene && !DECORS_CALMES.has(r.scene.plan.decor) ? ' is-carte' : '')}>
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
      <Signature texte={LIBELLES[r.langue].site} style={r.scene ? { padding: '8px 24px 8px 8px', borderRadius: 999, background: 'color-mix(in srgb, var(--fond) 82%, transparent)' } : undefined} />
    </div>
  </Canevas>
);
