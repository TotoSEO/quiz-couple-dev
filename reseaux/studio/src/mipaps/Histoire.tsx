// Une page du carrousel-histoire des mipaps : chaque page est un moment de
// l'histoire, le texte en haut, le dessin dessous. La première page porte
// « fais glisser », les suivantes leur numéro, la dernière l'appel.
import React from 'react';
import { Canevas } from '../charte/Canevas';
import { APPEL_DEFAUT, GLISSE, MARQUE } from './charte';
import { cadreDe, elementsDe, resoudre, Scene } from './dessin';
import type { RecetteMipapsCarrousel } from './recette';
import { classeTaille } from './Textes';

export const MipapsPage: React.FC<{ recette: RecetteMipapsCarrousel; page: number; verification?: boolean }> = ({ recette: r, page, verification }) => {
  const p = r.pages[page];
  const total = r.pages.length;
  const derniere = page === total - 1;
  const rendus = p.dessin ? elementsDe(p.dessin).map(resoudre) : [];
  // le même cadre sur toutes les pages : les personnages gardent leur taille d'une page à l'autre
  const cadre = cadreDe(r.pages.filter((pg) => pg.dessin).map((pg) => elementsDe(pg.dessin!).map(resoudre)));
  return (
    <Canevas theme={r.theme} format="post" verification={verification} classes="is-mipaps">
      <div className={'qc-utile mp-colonne' + (p.dessin ? '' : ' is-centre')}>
        {p.texte && (
          <p className={'mp-texte' + classeTaille(p.texte)} data-verif={`page ${page + 1}`} data-lignes-max={p.dessin ? 5 : 8}>
            {p.texte}
          </p>
        )}
        {p.dessin && <Scene rendus={rendus} graine={page} prefix={`c${page}`} cadre={cadre} ancrage="centre" className="mp-dessin" />}
        {derniere && (
          <p className="mp-appel" data-verif="appel" data-lignes-max={2}>
            {p.appel ?? APPEL_DEFAUT}
          </p>
        )}
      </div>
      <div className="mp-bas">
        {page === 0 ? (
          <span className="mp-mention" data-verif="glisse">
            {GLISSE}
          </span>
        ) : (
          <span className="mp-signature" data-verif="signature">
            {MARQUE}
          </span>
        )}
      </div>
      {page > 0 && (
        <span className="mp-pagination" data-verif="pagination">
          {page + 1}/{total}
        </span>
      )}
    </Canevas>
  );
};
