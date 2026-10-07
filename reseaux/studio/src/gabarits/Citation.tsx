import React from 'react';
import { useCurrentFrame } from 'remotion';
import { entree, fondu } from '../charte/animation';
import { Canevas, Signature } from '../charte/Canevas';
import { Duo } from '../charte/Duo';
import { Fleurs } from '../charte/Fleurs';
import { LIBELLES } from '../charte/libelles';
import type { Plan } from '../plan';
import type { RecetteCitation } from '../recette';

// R2 et R9 : une phrase en police plume qui arrive mot à mot, deux fleurs
// au trait, la signature. La dernière image revient à la première (fleurs
// seules), pour que le reel boucle sans à-coup.
export const Citation: React.FC<{ recette: RecetteCitation; plan: Plan; verification?: boolean }> = ({
  recette: r,
  plan,
  verification,
}) => {
  const frame = useCurrentFrame();
  const { debut, pas, signature, sortieDebut } = plan.detail;
  const mots = r.texte.trim().split(/\s+/);
  const sortie = fondu(frame, sortieDebut, plan.duree - 1);
  return (
    <Canevas theme={r.theme} format="reel" verification={verification}>
      <Fleurs choix={r.fleurs} />
      <div className="qc-utile" style={{ gap: 'var(--pas-8)', opacity: sortie }}>
        <p className={'qc-citation' + (r.longue ? ' is-longue' : '')} data-verif="citation" data-lignes-max={r.longue ? 7 : 4}>
          {mots.map((mot, i) => (
            <React.Fragment key={i}>
              <span style={{ display: 'inline-block', ...entree(frame, debut + i * pas) }}>{mot}</span>
              {i < mots.length - 1 ? ' ' : ''}
            </React.Fragment>
          ))}
        </p>
        <Duo echelle={0.72} f={frame} verif="mascottes" />
        <Signature texte={LIBELLES[r.langue].site} style={entree(frame, signature)} />
      </div>
    </Canevas>
  );
};
