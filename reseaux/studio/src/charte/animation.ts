import { interpolate, useCurrentFrame } from 'remotion';
import { COURBE, FPS, TEMPO } from './charte';

const bornes = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Entrée : fondu et petite montée, en courbe douce (texte, cartes).
export const entree = (frame: number, debut: number, duree = TEMPO.moyen, decalage = 24) => {
  const p = interpolate(frame, [debut, debut + duree], [0, 1], { ...bornes, easing: COURBE.douce });
  return { opacity: p, transform: `translateY(${(1 - p) * decalage}px)` };
};

// Entrée avec un léger rebond (pastilles, bonne réponse).
export const rebond = (frame: number, debut: number, duree = TEMPO.moyen) => {
  const p = interpolate(frame, [debut, debut + duree], [0, 1], { ...bornes, easing: COURBE.rebond });
  return { opacity: Math.min(1, p * 2), transform: `scale(${0.92 + 0.08 * p})` };
};

export const fondu = (frame: number, debut: number, fin: number, de = 1, vers = 0) =>
  interpolate(frame, [debut, fin], [de, vers], bornes);

// Les fleurs se balancent de 2° au plus, sur six secondes.
export const useBalancement = () => {
  const frame = useCurrentFrame();
  return Math.sin((frame / (6 * FPS)) * 2 * Math.PI) * 2;
};
