import React from 'react';
import { Audio, interpolate, Sequence, staticFile } from 'remotion';
import { FPS } from './charte';

// Bruitages (public/sons, pack CC0 de Kenney) et leur volume de départ.
// Le volume final du reel est ramené à -14 LUFS au montage (rendre.mjs).
export const VOLUMES = {
  intro: 0.4,
  apparition: 0.3,
  reponse: 0.22,
  bulle: 0.28,
  tic: 0.25,
  revelation: 0.45,
  joie: 0.35,
  fin: 0.4,
  signature: 0.3,
} as const;
export type NomSon = keyof typeof VOLUMES;
export type EvenementSonore = { nom: NomSon; a: number; volume?: number };

export const Bruitages: React.FC<{ sons: EvenementSonore[] }> = ({ sons }) => (
  <>
    {sons.map((s, i) => (
      <Sequence key={i} from={s.a} durationInFrames={2 * FPS} layout="none">
        <Audio src={staticFile(`sons/${s.nom}.ogg`)} volume={s.volume ?? VOLUMES[s.nom]} />
      </Sequence>
    ))}
  </>
);

const bornes = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Musique de fond : fondu d'entrée et de sortie (son-fondu), et baisse de
// 6 dB (volume divisé par deux) le temps de chaque bruitage (son-ducking).
export const Musique: React.FC<{
  fichier: string;
  debut?: number;
  duree: number;
  sons: EvenementSonore[];
  base?: number;
}> = ({ fichier, debut = 0, duree, sons, base = 0.5 }) => {
  const fondu = Math.round(0.5 * FPS);
  const volume = (f: number) => {
    const entree = interpolate(f, [0, fondu], [0, 1], bornes);
    const sortie = interpolate(f, [duree - FPS, duree - 1], [1, 0], bornes);
    let baisse = 1;
    for (const s of sons) {
      const d = f - s.a;
      if (d < -3 || d > 12) continue;
      baisse = Math.min(baisse, interpolate(d, [-3, 0, 9, 12], [1, 0.5, 0.5, 1], bornes));
    }
    return base * entree * sortie * baisse;
  };
  return <Audio src={staticFile(`musique/${fichier}`)} startFrom={Math.round(debut * FPS)} volume={volume} loop />;
};
