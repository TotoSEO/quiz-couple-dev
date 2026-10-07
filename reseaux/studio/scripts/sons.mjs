// Prépare les bruitages Mixkit de la bibliothèque (public/sons/bibliotheque.json) :
// chaque son est téléchargé une fois et écrit en MP3 dans
// public/sons/mx-<nom>.mp3 (le ffmpeg livré avec Remotion n'encode pas le
// Vorbis des fichiers de Kenney ; il sait lire les deux). Un son de réaction
// (un rire, un cri, un ronflement) perd son silence de tête et crête à
// -1 dBTP, comme les fichiers de Kenney, pour que les volumes de Son.tsx se
// comparent ; une ambiance (oiseaux, vagues, pluie) est coupée à
// DUREE_AMBIANCE secondes, ramenée à -23 LUFS et fondue aux deux bouts.
// Ce ffmpeg n'a que neuf filtres audio (ni afade, ni silenceremove, ni
// volumedetect) : les fondus passent par une expression de volume, le
// silence de tête par silencedetect puis un départ de lecture, la crête
// par la mesure de loudnorm.
// Les fichiers ne sont pas dans le dépôt (licence Mixkit) : le workflow de
// rendu les garde en cache et relance ce script, qui ne refait que ce qui
// manque.
//
//   node scripts/sons.mjs            prépare ce qui manque
//   node scripts/sons.mjs --refaire  reprend tout
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ici = path.dirname(fileURLToPath(import.meta.url));
const dossier = path.join(ici, '..', 'public', 'sons');
export const BIBLIOTHEQUE = JSON.parse(fs.readFileSync(path.join(dossier, 'bibliotheque.json'), 'utf8'));
const outils = path.dirname(createRequire(import.meta.url).resolve(`@remotion/compositor-${process.platform}-${process.arch}${process.platform === 'linux' ? '-gnu' : ''}/package.json`));
const env = { ...process.env, LD_LIBRARY_PATH: outils };
export const DUREE_AMBIANCE = 45;
const FONDU = 0.8;

export const fichierDe = (s) => `mx-${s.nom}.mp3`;
export const urlDe = (s) => `https://assets.mixkit.co/active_storage/sfx/${s.id}/${s.id}-preview.mp3`;

const ffmpeg = (args) => spawnSync(path.join(outils, 'ffmpeg'), ['-hide_banner', ...args], { env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const sortieMp3 = ['-ar', '44100', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '160k'];
const mesureLoudnorm = (stderr) => {
  const json = stderr.slice(stderr.lastIndexOf('{'));
  return JSON.parse(json.slice(0, json.indexOf('}') + 1));
};

export function preparer(s, { refaire = false } = {}) {
  const cible = path.join(dossier, fichierDe(s));
  if (fs.existsSync(cible) && !refaire) return 'deja';
  const brut = path.join(os.tmpdir(), `son-${s.id}.mp3`);
  const dl = spawnSync('curl', ['-fsSL', '--retry', '3', '--retry-delay', '2', '-A', 'Mozilla/5.0', '-o', brut, urlDe(s)], { encoding: 'utf8' });
  if (dl.status !== 0) throw new Error(`${s.nom} : téléchargement impossible (${dl.stderr.trim().slice(0, 200)})`);
  let r;
  if (s.type === 'ambiance') {
    const coupe = ['-t', String(DUREE_AMBIANCE), '-i', brut];
    const fin = DUREE_AMBIANCE - FONDU;
    const fondus = `volume='if(lt(t,${FONDU}),t/${FONDU},if(gt(t,${fin}),max(0,(${DUREE_AMBIANCE}-t)/${FONDU}),1))':eval=frame`;
    const mesure = ffmpeg([...coupe, '-af', `${fondus},loudnorm=I=-23:TP=-3:LRA=9:print_format=json`, '-f', 'null', '-']);
    if (mesure.status !== 0) throw new Error(`${s.nom} : mesure impossible (${mesure.stderr.slice(-200)})`);
    const l = mesureLoudnorm(mesure.stderr);
    const filtre = `${fondus},loudnorm=I=-23:TP=-3:LRA=9:measured_I=${l.input_i}:measured_TP=${l.input_tp}:measured_LRA=${l.input_lra}:measured_thresh=${l.input_thresh}:offset=${l.target_offset}:linear=true`;
    r = ffmpeg(['-v', 'error', '-y', ...coupe, '-af', filtre, ...sortieMp3, cible]);
  } else {
    // le silence de tête (un son de réaction doit partir à l'instant du
    // geste) : silencedetect dit où il finit, la lecture part de là ; puis la
    // crête, lue dans la mesure de loudnorm, ramenée à -1 dBTP
    const mesure = ffmpeg(['-i', brut, '-af', 'silencedetect=noise=-45dB:d=0.03,loudnorm=I=-16:TP=-1:LRA=11:print_format=json', '-f', 'null', '-']);
    if (mesure.status !== 0) throw new Error(`${s.nom} : mesure impossible (${mesure.stderr.slice(-200)})`);
    const tete = /silence_start: (-?[\d.e-]+)[\s\S]*?silence_end: ([\d.]+)/.exec(mesure.stderr);
    const depart = tete && parseFloat(tete[1]) <= 0.02 ? Math.max(0, parseFloat(tete[2]) - 0.02) : 0;
    const tp = parseFloat(mesureLoudnorm(mesure.stderr).input_tp);
    const gain = Number.isFinite(tp) ? -1 - tp : 0;
    r = ffmpeg(['-v', 'error', '-y', '-ss', depart.toFixed(3), '-i', brut, '-af', `volume=${gain.toFixed(2)}dB`, ...sortieMp3, cible]);
  }
  fs.rmSync(brut, { force: true });
  if (r.status !== 0) throw new Error(`${s.nom} : ${r.stderr.slice(-300)}`);
  return 'fait';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const refaire = process.argv.includes('--refaire');
  const bilan = { fait: 0, deja: 0, echec: 0 };
  for (const s of BIBLIOTHEQUE.sons) {
    try {
      bilan[preparer(s, { refaire })]++;
    } catch (e) {
      // un son absent n'empêche pas le rendu : le studio le signale et
      // continue sans lui (rendre.mjs)
      bilan.echec++;
      console.error(e.message);
    }
  }
  console.log(`bruitages : ${bilan.fait} préparés, ${bilan.deja} déjà là, ${bilan.echec} en échec`);
}
