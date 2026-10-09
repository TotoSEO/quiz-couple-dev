// Le reel animé des mipaps : un plan après l'autre, les personnages en
// mouvement (étapes interpolées, cycle de marche, rotation continue), les
// objets qui entrent, les textes en haut ou en bas de la zone utile. Un
// plan en « fondu » s'éteint vers le blanc et le suivant s'allume.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { entree } from '../charte/animation';
import { Canevas } from '../charte/Canevas';
import { FPS, TEMPO } from '../charte/charte';
import type { Plan } from '../plan';
import { BOITE, ECHELLE_REEL, MARQUE, SOL_REEL } from './charte';
import { Scene, type Rendu } from './dessin';
import { etatObjet, etatPerso } from './mouvement';
import type { PlanMipaps, RecetteMipapsReel } from './recette';
import { classeTaille, Mots } from './Textes';

// la durée du fondu vers le blanc, en images
const FONDU = 8;

// Les éléments d'un plan à l'instant t : les meubles, les objets de
// derrière, les personnages, puis les objets de devant (les cœurs).
export const rendusDuPlan = (p: PlanMipaps, t: number, K: number): Rendu[] => {
  const rendus: Rendu[] = (p.meubles ?? []).map((nom) => ({ type: 'meuble', nom }));
  const objets = (p.objets ?? []).map((ob, i) => ({ ob, etat: etatObjet(ob, t, i) }));
  for (const { ob, etat } of objets) if (etat && ob.derriere) rendus.push(etat);
  for (const perso of p.persos) {
    const etat = etatPerso(perso, t);
    if (!etat) continue;
    // la tête est hors de l'image quand le personnage est encore dehors
    const xEcran = 540 + (etat.x - BOITE.w / 2) * K;
    rendus.push({ ...etat, horsChamp: xEcran < 24 || xEcran > 1056 });
  }
  for (const { ob, etat } of objets) if (etat && !ob.derriere) rendus.push(etat);
  return rendus;
};

export const MipapsAnime: React.FC<{ recette: RecetteMipapsReel; plan: Plan; verification?: boolean }> = ({ recette: r, plan, verification }) => {
  const f = useCurrentFrame();
  const scenes = plan.scenes;
  let i = scenes.findIndex((sc) => f >= sc.debut && f < sc.debut + sc.duree);
  if (i < 0) i = scenes.length - 1;
  const sc = scenes[i];
  const p = r.plans[i];
  const fPlan = f - sc.debut;
  const t = fPlan / FPS;
  const [z0, z1] = p.zoom ?? [1, 1];
  const zoom = z0 + (z1 - z0) * Math.min(1, fPlan / Math.max(1, sc.duree - 1));
  const K = ECHELLE_REEL * zoom;
  const rendus = rendusDuPlan(p, t, K);
  const style: React.CSSProperties = { position: 'absolute', left: 540 - (BOITE.w / 2) * K, top: SOL_REEL - BOITE.sol * K, width: BOITE.w * K, height: BOITE.h * K };
  let opacite = 1;
  if (i > 0 && p.transition === 'fondu') opacite = Math.min(1, fPlan / FONDU);
  const suivant = r.plans[i + 1];
  if (suivant?.transition === 'fondu') opacite = Math.min(opacite, (sc.duree - fPlan) / FONDU);
  const textes = (p.textes ?? []).map((x, j) => ({ x, j })).filter(({ x }) => t >= x.de && (x.a === undefined || t < x.a));
  return (
    <Canevas theme={r.theme} format="reel" verification={verification} classes="is-mipaps">
      <Scene rendus={rendus} graine={Math.floor(f / 4)} prefix={`a${i}`} style={{ ...style, opacity: opacite }} />
      <div className="qc-utile mp-reel">
        {textes.map(({ x, j }) => (
          <p
            key={j}
            className={`mp-message is-${x.place ?? 'haut'}` + (x.style === 'titre' ? ' is-titre' : classeTaille(x.texte))}
            style={entree(fPlan, Math.round(x.de * FPS), TEMPO.moyen, 18)}
            data-verif={`plan ${i + 1}, texte ${j + 1}`}
            data-lignes-max={(x.place ?? 'haut') === 'bas' ? 1 : x.style === 'titre' ? 3 : 4}
            data-sans-chevauchement
          >
            <Mots texte={x.texte} f={fPlan} debut={Math.round(x.de * FPS)} motAMot={x.motAMot} />
          </p>
        ))}
      </div>
      <span className="mp-signature is-reel" data-verif="signature">
        {MARQUE}
      </span>
    </Canevas>
  );
};
