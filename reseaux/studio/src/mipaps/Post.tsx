// Le post des mipaps (1080 x 1350) : un texte court et un dessin (mini),
// le texte d'abord et le petit duo dessous (declaration), ou un titre et un
// schéma de bureau (schema). Le texte est en flux, le dessin prend la place
// qui reste, la signature est en bas.
import React from 'react';
import { Canevas } from '../charte/Canevas';
import { MARQUE } from './charte';
import { cadreDe, DUO_PETIT, elementsDe, resoudre, Scene } from './dessin';
import type { RecetteMipapsPost } from './recette';
import { Schema } from './Schema';
import { classeTaille } from './Textes';

export const Signature: React.FC = () => (
  <div className="mp-bas">
    <span className="mp-signature" data-verif="signature">
      {MARQUE}
    </span>
  </div>
);

export const MipapsPost: React.FC<{ recette: RecetteMipapsPost; verification?: boolean }> = ({ recette: r, verification }) => {
  if (r.style === 'declaration') {
    return (
      <Canevas theme={r.theme} format="post" verification={verification} classes="is-mipaps">
        <div className="qc-utile mp-colonne is-centre">
          <p className="mp-texte is-declaration" data-verif="texte" data-lignes-max={7}>
            {r.texte}
          </p>
          <Scene rendus={DUO_PETIT} graine={0} prefix="d" cadre={cadreDe([DUO_PETIT], 10)} ancrage="centre" className="mp-duo" />
        </div>
        <Signature />
      </Canevas>
    );
  }
  if (r.style === 'schema' && r.schema) {
    return (
      <Canevas theme={r.theme} format="post" verification={verification} classes="is-mipaps">
        <div className="qc-utile mp-colonne">
          <p className={'mp-texte' + classeTaille(r.texte)} data-verif="texte" data-lignes-max={4}>
            {r.texte}
          </p>
          <Schema schema={r.schema} />
        </div>
        <Signature />
      </Canevas>
    );
  }
  const rendus = r.dessin ? elementsDe(r.dessin).map(resoudre) : [];
  return (
    <Canevas theme={r.theme} format="post" verification={verification} classes="is-mipaps">
      <div className="qc-utile mp-colonne">
        <p className={'mp-texte' + classeTaille(r.texte)} data-verif="texte" data-lignes-max={5}>
          {r.texte}
        </p>
        <Scene rendus={rendus} graine={0} prefix="p" cadre={cadreDe([rendus])} ancrage="centre" className="mp-dessin" />
      </div>
      <Signature />
    </Canevas>
  );
};
