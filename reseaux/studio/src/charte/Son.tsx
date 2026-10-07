import React from 'react';
import { Audio, interpolate, Sequence, staticFile } from 'remotion';
import { FPS } from './charte';

// Bruitages (public/sons, pack CC0 de Kenney) et leur volume de départ.
// Le volume final du reel est ramené à -14 LUFS au montage (rendre.mjs).
// Les bruitages partent doucement (Thomas, octobre 2026 : « moins forts ») :
// tous les fichiers de Kenney crêtent près de 0 dBTP, ce volume est la seule
// atténuation, et il n'y a plus de musique en dessous pour les couvrir.
export const VOLUMES = {
  intro: 0.22,
  apparition: 0.16,
  reponse: 0.12,
  bulle: 0.15,
  tic: 0.12,
  revelation: 0.24,
  joie: 0.2,
  fin: 0.22,
  signature: 0.16,
  // animations (Kenney, packs Interface, Digital, RPG et Impact, CC0)
  pop: 0.16,
  saut: 0.16,
  pas: 0.1,
  zoom: 0.13,
  glisse: 0.13,
  coeur: 0.14,
  bisou: 0.18,
  froissement: 0.18,
  porte: 0.2,
  tictac: 0.16,
} as const;
// Nombre de variantes d'un même son (pop.ogg, pop-2.ogg, pop-3.ogg...) :
// la variante est tirée de l'instant du son, le même reel donne toujours le
// même rendu, et deux « pop » qui se suivent ne sonnent pas pareil.
export const VARIANTES: Partial<Record<keyof typeof VOLUMES, number>> = {
  pop: 3,
  saut: 3,
  pas: 4,
  coeur: 3,
  bulle: 3,
  glisse: 3,
  froissement: 4,
  zoom: 2,
  bisou: 2,
  joie: 2,
};
export const fichierSon = (nom: keyof typeof VOLUMES, a: number) => {
  const n = VARIANTES[nom] ?? 1;
  if (n <= 1) return `sons/${nom}.ogg`;
  // un pseudo-hasard stable sur l'instant (en images) et le nom
  let h = 2166136261;
  for (const c of `${nom}${a}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const k = (h >>> 0) % n;
  return k === 0 ? `sons/${nom}.ogg` : `sons/${nom}-${k + 1}.ogg`;
};
export type NomSon = keyof typeof VOLUMES;
export type EvenementSonore = { nom: NomSon; a: number; volume?: number };

export const Bruitages: React.FC<{ sons: EvenementSonore[] }> = ({ sons }) => (
  <>
    {sons.map((s, i) => (
      <Sequence key={i} from={s.a} durationInFrames={2 * FPS} layout="none">
        <Audio src={staticFile(fichierSon(s.nom, s.a))} volume={s.volume ?? VOLUMES[s.nom]} />
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
