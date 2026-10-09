import React from 'react';
import { Canevas, Signature } from '../charte/Canevas';
import { jeton } from '../charte/charte';
import { LIBELLES } from '../charte/libelles';
import type { CaseBd, RecetteBd } from '../recette';
import { SceneFixe } from '../pov/Scene';

// La bande dessinée en quatre cases. Chaque case est une scène des
// animations figée à l'instant t, réduite à la largeur de la case et
// bordée d'un trait d'encre, avec ses répliques en haut, du côté de celui
// qui parle. Les quatre cases remplissent la zone utile du post, la
// signature est dessous.
const MARGE = parseFloat(jeton('zone-post-marge'));
const GRILLE = parseFloat(jeton('zone-grille-post'));
const LARGEUR = 1080;
const HAUTEUR = 1350;
// entre deux cases, et la place gardée sous la grille pour la signature
const ECART = 24;
const SIGNATURE = 84;
// le trait d'encre d'une case, en pixels
const BORD = 6;
const UTILE_L = LARGEUR - 2 * (MARGE + GRILLE);
const UTILE_H = HAUTEUR - 2 * MARGE - SIGNATURE;
const CASE_L = (UTILE_L - ECART) / 2;
const CASE_H = (UTILE_H - ECART) / 2;
// Dans une case, la scène montre le décor à partir de cette hauteur : plus
// bas que sur un post (240), pour garder le sol et les personnages debout.
const HAUT_CASE = 300;

const bas: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 'var(--zone-post-marge)',
  display: 'flex',
  justifyContent: 'center',
};

const Case: React.FC<{ c: CaseBd; l: number; h: number; n: number }> = ({ c, l, h, n }) => {
  const interieur = l - 2 * BORD;
  const echelle = (interieur / LARGEUR) * (c.scene.echelle ?? 1);
  // agrandie, la scène reste centrée dans la case
  const dx = (interieur - LARGEUR * echelle) / 2;
  return (
    <div className="bd-case" style={{ width: l, height: h, borderWidth: BORD }}>
      <div style={{ position: 'absolute', left: dx, top: 0, width: LARGEUR, height: 1920, transform: `scale(${echelle})`, transformOrigin: '0 0' }}>
        <SceneFixe plan={c.scene.plan} t={c.scene.t} haut={c.scene.haut ?? HAUT_CASE} />
      </div>
      {(c.repliques ?? []).map((r, i) => (
        <div
          key={i}
          className={'bd-bulle is-' + (r.cote ?? 'centre')}
          style={{ top: 18 + i * 100 }}
          data-verif={`case ${n}, réplique ${i + 1}`}
          data-lignes-max={2}
          data-sans-chevauchement
        >
          {r.texte}
        </div>
      ))}
    </div>
  );
};

export const Bd: React.FC<{ recette: RecetteBd; verification?: boolean }> = ({ recette: r, verification }) => (
  <Canevas theme={r.theme} format="post" verification={verification} classes="is-papier">
    <div className="qc-utile" style={{ justifyContent: 'flex-start' }}>
      <div className="bd-cases" style={{ gap: ECART, width: UTILE_L, height: UTILE_H }}>
        {r.cases.map((c, i) => (
          <Case key={i} c={c} l={CASE_L} h={CASE_H} n={i + 1} />
        ))}
      </div>
    </div>
    <div style={bas}>
      <Signature texte={LIBELLES[r.langue].site} />
    </div>
  </Canevas>
);

// En carrousel : une case par page, la scène en grand, les répliques en
// haut dans la zone utile, la pagination en bas et la signature sur la
// dernière page.
export const PageBd: React.FC<{ recette: RecetteBd; page: number; verification?: boolean }> = ({ recette: r, page, verification }) => {
  const c = r.cases[page];
  const derniere = page === r.cases.length - 1;
  return (
    <Canevas theme={r.theme} format="post" verification={verification} classes="is-papier">
      <SceneFixe plan={c.scene.plan} t={c.scene.t} haut={c.scene.haut ?? 240} />
      <div className="qc-utile is-haut" style={{ justifyContent: 'flex-start', gap: 'var(--pas-3)' }}>
        {(c.repliques ?? []).map((rep, i) => (
          <div key={i} className={'bd-bulle is-page is-' + (rep.cote ?? 'centre')} data-verif={`case ${page + 1}, réplique ${i + 1}`} data-lignes-max={2} data-sans-chevauchement>
            {rep.texte}
          </div>
        ))}
      </div>
      <div style={bas}>
        {derniere ? (
          <Signature texte={LIBELLES[r.langue].site} style={{ padding: '8px 24px 8px 8px', borderRadius: 999, background: 'color-mix(in srgb, var(--fond) 82%, transparent)' }} />
        ) : (
          <div className="qc-mention bd-pagination" data-verif="pagination">
            {page + 1} / {r.cases.length}
          </div>
        )}
      </div>
    </Canevas>
  );
};
