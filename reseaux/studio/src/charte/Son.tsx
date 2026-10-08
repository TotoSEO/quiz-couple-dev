import React from 'react';
import { Audio, interpolate, Sequence, staticFile } from 'remotion';
import { FPS } from './charte';
import bibliotheque from '../../public/sons/bibliotheque.json';

// Bruitages : les sons de Kenney (public/sons/<nom>.ogg, CC0, dans le dépôt)
// et ceux de Mixkit (public/sons/mx-<nom>.mp3, préparés par scripts/sons.mjs,
// jamais commités), et leur volume de départ. Depuis le 7 octobre 2026
// (Thomas : « des bruits de tout type, bruits d'ambiance, cri, pleure »),
// les réactions des mascottes (pleurs, rires, cris, ronflements, soupirs...)
// et les ambiances des décors (oiseaux, vagues, rue, café, pluie...) viennent
// de Mixkit ; les sons d'interface et de gestes restent ceux de Kenney.
// Les bruitages partent doucement (Thomas, octobre 2026 : « moins forts ») :
// tous les fichiers crêtent à -1 dBTP ou près de 0, ce volume est la seule
// atténuation, et il n'y a pas de musique en dessous pour les couvrir (le
// son tendance s'ajoute à la publication, par-dessus).
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
  // réactions des mascottes (Mixkit, crête à -1 dBTP)
  pleure: 0.22,
  rire: 0.22,
  cri: 0.2,
  sursaut: 0.22,
  ronfle: 0.14,
  baille: 0.2,
  soupir: 0.2,
  grogne: 0.2,
  croque: 0.18,
  aspire: 0.18,
  miam: 0.18,
  eternue: 0.2,
  aie: 0.2,
  applaudit: 0.18,
  smack: 0.2,
  boing: 0.18,
  splat: 0.18,
  trombone: 0.2,
  tambour: 0.2,
  // objets et lieux (Mixkit)
  notification: 0.16,
  sonne: 0.14,
  reveil: 0.16,
  pose: 0.16,
  tinte: 0.16,
  portiere: 0.18,
  clochette: 0.14,
  sonnette: 0.16,
  klaxon: 0.14,
  demarre: 0.16,
  'pas-herbe': 0.12,
  oiseau: 0.12,
  grillon: 0.12,
  hibou: 0.12,
  tonnerre: 0.2,
  battement: 0.2,
  coussin: 0.18,
  tape: 0.12,
  // ambiances (Mixkit, -23 LUFS) : un lit sous tout le plan, posé par le
  // décor ou par le champ ambiance du plan
  // (mesuré le 7 octobre 2026 sur un reel en forêt : -29 LUFS intégrés
  // avec les oiseaux à 0,6 ; relevés d'un quart pour rester audibles sous le
  // son tendance que la publication ajoute à 70 %)
  oiseaux: 0.75,
  foret: 0.75,
  grillons: 0.7,
  circulation: 0.6,
  'rue-nuit': 0.4,
  vagues: 0.75,
  brouhaha: 0.55,
  pluie: 0.65,
  vent: 0.6,
  moteur: 0.5,
  cinema: 0.45,
  feu: 0.6,
  horloge: 0.55,
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
  pleure: 3,
  rire: 3,
  cri: 2,
  sursaut: 3,
  baille: 2,
  soupir: 2,
  grogne: 2,
  croque: 2,
  aspire: 2,
  eternue: 2,
  aie: 2,
  smack: 3,
  notification: 3,
  reveil: 2,
  pose: 2,
  tinte: 2,
  klaxon: 2,
  'pas-herbe': 2,
  oiseau: 3,
  grillon: 2,
  tonnerre: 2,
  coussin: 2,
};
// Les sons qui viennent de Mixkit (fichiers mx-<nom>.mp3) et, parmi eux, les ambiances.
export const MIXKIT = new Set(bibliotheque.sons.map((s) => s.nom.replace(/-\d+$/, '')));
export const AMBIANCES = new Set(bibliotheque.sons.filter((s) => s.type === 'ambiance').map((s) => s.nom));
export type NomSon = keyof typeof VOLUMES;
export type EvenementSonore = { nom: NomSon; a: number; volume?: number };
// Une ambiance : un lit sonore qui tourne en boucle de « a » pendant « duree » images.
export type EvenementAmbiance = { nom: NomSon; a: number; duree: number; volume?: number };

export const fichierSon = (nom: NomSon, a: number) => {
  const mx = MIXKIT.has(nom);
  const base = mx ? `sons/mx-${nom}` : `sons/${nom}`;
  const ext = mx ? 'mp3' : 'ogg';
  const n = VARIANTES[nom] ?? 1;
  if (n <= 1) return `${base}.${ext}`;
  // un pseudo-hasard stable sur l'instant (en images) et le nom
  let h = 2166136261;
  for (const c of `${nom}${a}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const k = (h >>> 0) % n;
  return k === 0 ? `${base}.${ext}` : `${base}-${k + 1}.${ext}`;
};
// Le temps laissé à un bruitage pour finir : les sons de Kenney font moins
// de deux secondes, ceux de Mixkit jusqu'à quatre (un rire, un bâillement),
// le tonnerre dix.
const dureeSon = (nom: NomSon) => (nom === 'tonnerre' ? 10 : MIXKIT.has(nom) ? 4.5 : 2) * FPS;

const bornes = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const Bruitages: React.FC<{ sons: EvenementSonore[] }> = ({ sons }) => (
  <>
    {sons.map((s, i) => (
      <Sequence key={i} from={s.a} durationInFrames={Math.round(dureeSon(s.nom))} layout="none">
        <Audio src={staticFile(fichierSon(s.nom, s.a))} volume={s.volume ?? VOLUMES[s.nom]} />
      </Sequence>
    ))}
  </>
);

// Les ambiances : chacune entre et sort en fondu (0,6 s) et tourne en
// boucle si le plan dure plus que le fichier (45 s, scripts/sons.mjs).
export const Ambiances: React.FC<{ ambiances: EvenementAmbiance[] }> = ({ ambiances }) => {
  const fondu = Math.round(0.6 * FPS);
  return (
    <>
      {ambiances.map((x, i) => {
        const base = x.volume ?? VOLUMES[x.nom];
        return (
          <Sequence key={i} from={x.a} durationInFrames={x.duree} layout="none">
            <Audio
              src={staticFile(fichierSon(x.nom, 0))}
              loop
              volume={(f) => base * interpolate(f, [0, fondu], [0, 1], bornes) * interpolate(f, [x.duree - fondu, x.duree - 1], [1, 0], bornes)}
            />
          </Sequence>
        );
      })}
    </>
  );
};

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
