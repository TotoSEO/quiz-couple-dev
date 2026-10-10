// Le reel statique des mipaps : un dessin qui vit à peine (le corps
// respire, les yeux clignent, les cœurs flottent, le trait tremble), un
// texte qui s'écrit mot à mot en haut, 10 à 15 secondes. La musique
// s'attache à la publication. Même colonne qu'un post : le texte en flux,
// le dessin prend la place qui reste et déborde de la zone utile sur les
// côtés, cadré sur ce qui est dessiné.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { entree } from '../charte/animation';
import { Canevas } from '../charte/Canevas';
import { FPS, TEMPO } from '../charte/charte';
import type { Plan } from '../plan';
import { MARQUE } from './charte';
import { cadreDe, elementsDe, resoudre, Scene } from './dessin';
import { vivant } from './mouvement';
import type { RecetteMipapsStatique } from './recette';
import { classeTaille, Mots } from './Textes';

export const MipapsStatique: React.FC<{ recette: RecetteMipapsStatique; plan: Plan; verification?: boolean }> = ({ recette: r, plan, verification }) => {
  const f = useCurrentFrame();
  const base = elementsDe(r.dessin).map(resoudre);
  // le cadre vient du dessin au repos : la respiration ne le fait pas bouger
  const cadre = cadreDe([base]);
  const rendus = base.map((x, i) => vivant(x, f, i, FPS));
  const debut = plan.detail.texte;
  return (
    <Canevas theme={r.theme} format="reel" verification={verification} classes="is-mipaps">
      <div className="qc-utile mp-colonne">
        <p className={'mp-texte' + classeTaille(r.texte)} style={entree(f, debut, TEMPO.moyen, 18)} data-verif="texte" data-lignes-max={4}>
          <Mots texte={r.texte} f={f} debut={debut} motAMot />
        </p>
        <Scene rendus={rendus} graine={Math.floor(f / 4)} prefix="s" cadre={cadre} ancrage="centre" className="mp-dessin is-large" />
      </div>
      <span className="mp-signature is-reel" data-verif="signature">
        {MARQUE}
      </span>
    </Canevas>
  );
};
