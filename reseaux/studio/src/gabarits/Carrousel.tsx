import React from 'react';
import { Canevas, Signature } from '../charte/Canevas';
import { LIBELLES } from '../charte/libelles';
import type { RecetteCarrousel } from '../recette';

const bas: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 'var(--zone-post-marge)',
  display: 'flex',
  justifyContent: 'center',
};

// C1 : une page du carrousel. Couverture, pages numérotées, page finale.
export const PageCarrousel: React.FC<{ recette: RecetteCarrousel; page: number; verification?: boolean }> = ({
  recette: r,
  page,
  verification,
}) => {
  const p = r.pages[page];
  const lib = LIBELLES[r.langue];
  const total = r.pages.length;
  return (
    <Canevas theme={r.theme} format="post" verification={verification}>
      <div className="qc-utile" style={{ gap: 'var(--pas-6)' }}>
        {p.type === 'couverture' && (
          <>
            <div className="qc-etiquette" data-verif="etiquette">{p.etiquette}</div>
            <div className="qc-accroche" data-verif="accroche" data-lignes-max={4}>{p.accroche}</div>
          </>
        )}
        {p.type === 'page' && (
          <>
            <div className="qc-chiffre">{p.numero ?? page}</div>
            <div className="qc-question" data-verif="question" data-lignes-max={3}>{p.question}</div>
            {p.texte && (
              <div className="qc-texte" style={{ color: 'var(--encre-douce)' }} data-verif="texte" data-lignes-max={3}>
                {p.texte}
              </div>
            )}
          </>
        )}
        {p.type === 'fin' && (
          <>
            <div className="qc-question" data-verif="fin" data-lignes-max={3}>{p.texte}</div>
            <div className="qc-bouton" data-verif="bouton" data-lignes-max={2}>{p.bouton}</div>
          </>
        )}
      </div>
      <div style={bas}>
        {p.type === 'couverture' && <div className="qc-mention" data-verif="glisse">{lib.glisse}</div>}
        {p.type === 'page' && <div className="qc-mention" data-verif="pagination">{page + 1} / {total}</div>}
        {p.type === 'fin' && <Signature texte={lib.site} />}
      </div>
    </Canevas>
  );
};
