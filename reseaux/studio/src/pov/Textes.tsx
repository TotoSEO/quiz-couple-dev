// Les textes d'une animation, posés par-dessus l'image et jamais zoomés :
// le titre (« POV: ... »), la légende du plan, les messages qui arrivent
// mot à mot, les bulles des personnages, la mention du site. Tout est dans
// la zone utile (.qc-utile) : le contrôle de mise en page s'y applique.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { entree } from '../charte/animation';
import { FPS, TEMPO, ZONE } from '../charte/charte';
import { LIBELLES } from '../charte/libelles';
import type { PlanPov, RecettePov } from './scenario';
import { aLEcran, hautDeTete, type Camera, type EtatPerso } from './temps';

const HAUT = ZONE.haut;
const GAUCHE = ZONE.gauche;
const LARGEUR = 1080 - ZONE.gauche - ZONE.droite;
const bornes = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const enImages = (s: number) => Math.round(s * FPS);

// Un mot toutes les 0,28 s : le rythme de lecture du design system.
export const PAS_MOT = TEMPO.lectureParMot / 1000 - 0.02;

const Mots: React.FC<{ texte: string; f: number; debut: number; motAMot?: boolean }> = ({ texte, f, debut, motAMot }) => {
  const mots = texte.trim().split(/\s+/);
  if (!motAMot) return <>{texte}</>;
  return (
    <>
      {mots.map((m, i) => (
        <React.Fragment key={i}>
          <span style={{ display: 'inline-block', ...entree(f, debut + enImages(i * PAS_MOT), TEMPO.court, 14) }}>{m}</span>
          {i < mots.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </>
  );
};

export const Calque: React.FC<{
  recette: RecettePov;
  plan: PlanPov;
  fPlan: number;
  etats: EtatPerso[];
  cam: Camera;
  nu: boolean;
}> = ({ recette: r, plan, fPlan, etats, cam, nu }) => {
  const t = fPlan / FPS;
  const visibles = (plan.textes ?? []).map((x, i) => ({ x, i })).filter(({ x }) => t >= x.de && (x.a === undefined || t < x.a));
  const message = ({ x, i }: { x: NonNullable<PlanPov['textes']>[number]; i: number }) => (
    <p
      key={i}
      className={'pov-message is-' + (x.style ?? 'phrase')}
      style={x.place === 'milieu' ? { top: 330 } : undefined}
      data-verif={`message ${i + 1}`}
      data-lignes-max={4}
      data-sans-chevauchement
    >
      <Mots texte={x.texte} f={fPlan} debut={enImages(x.de)} motAMot={x.motAMot} />
    </p>
  );
  return (
    <div className="qc-utile pov-calque">
      {/* en haut, empilés sans jamais se chevaucher : titre, légende, messages du haut */}
      <div className="pov-pile">
        {r.titre && (
          <div className={'pov-titre' + (nu ? ' is-nu' : '')} data-verif="titre" data-lignes-max={3} data-sans-chevauchement>
            {r.titre}
          </div>
        )}
        {plan.legende && (
          <div className="pov-legende" style={entree(fPlan, 0, TEMPO.court, 12)} data-verif="légende" data-lignes-max={1} data-sans-chevauchement>
            {plan.legende}
          </div>
        )}
        {visibles.filter(({ x }) => x.place !== 'milieu').map(message)}
      </div>
      {visibles.filter(({ x }) => x.place === 'milieu').map(message)}
      {(plan.bulles ?? []).map((b, i) => {
        if (t < b.de || t >= b.a) return null;
        const e = etats.find((x) => x.qui === b.qui);
        if (!e) return null;
        const [hx, hy] = aLEcran(cam, ...hautDeTete(e));
        // largeur estimée, pour garder la bulle dans la zone utile
        const l = Math.min(560, 70 + b.texte.length * 25);
        const x = bornes(hx - GAUCHE, l / 2, LARGEUR - l / 2);
        const pointe = bornes(hx - GAUCHE - (x - l / 2), 40, l - 40);
        const pop = entree(fPlan, enImages(b.de), TEMPO.court, 10);
        return (
          <div
            key={'b' + i}
            className="pov-bulle"
            style={{ left: x - l / 2, width: l, bottom: 1280 - (hy - HAUT) + 46, opacity: pop.opacity, transform: pop.transform, ['--pointe' as string]: `${pointe}px` }}
            data-verif={`bulle ${i + 1}`}
            data-lignes-max={3}
            data-sans-chevauchement
          >
            {b.texte}
          </div>
        );
      })}
      {r.signature !== false && (
        <div className="qc-signature pov-signature" data-verif="signature">
          <Img src={staticFile('marque/logo-quiz-couple-180.png')} alt="" />
          {LIBELLES[r.langue].site}
        </div>
      )}
    </div>
  );
};
