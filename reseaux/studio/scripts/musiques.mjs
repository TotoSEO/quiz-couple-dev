// Prépare les musiques de la bibliothèque : chaque morceau Mixkit est
// téléchargé une fois, coupé à 85 s à partir de son début utile, ramené à
// -16 LUFS (la même balance avec les bruitages d'un morceau à l'autre) et
// écrit en MP3 dans public/musique/. Les fichiers Mixkit ne sont pas dans le
// dépôt (une cinquantaine de Mo) : le workflow de rendu les garde en cache et
// relance ce script, qui ne refait que ce qui manque.
//
//   node scripts/musiques.mjs            prépare ce qui manque
//   node scripts/musiques.mjs --refaire  reprend tout
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ici = path.dirname(fileURLToPath(import.meta.url));
const dossier = path.join(ici, '..', 'public', 'musique');
const bibliotheque = JSON.parse(fs.readFileSync(path.join(dossier, 'bibliotheque.json'), 'utf8'));
const outils = path.dirname(createRequire(import.meta.url).resolve(`@remotion/compositor-${process.platform}-${process.arch}${process.platform === 'linux' ? '-gnu' : ''}/package.json`));
const env = { ...process.env, LD_LIBRARY_PATH: outils };
const DUREE = 85;
const SORTIE = 3;

const ffmpeg = (args) => spawnSync(path.join(outils, 'ffmpeg'), ['-hide_banner', ...args], { env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

export function preparer(m, { refaire = false } = {}) {
  const cible = path.join(dossier, m.fichier);
  if (!m.url || (fs.existsSync(cible) && !refaire)) return 'deja';
  const brut = path.join(os.tmpdir(), `musique-${path.basename(m.fichier)}`);
  const dl = spawnSync('curl', ['-fsSL', '--retry', '3', '--retry-delay', '2', '-o', brut, m.url], { encoding: 'utf8' });
  if (dl.status !== 0) throw new Error(`${m.fichier} : téléchargement impossible (${dl.stderr.trim().slice(0, 200)})`);
  const coupe = ['-ss', String(m.debut ?? 0), '-t', String(DUREE), '-i', brut];
  // fondu de sortie dans le fichier même, pour qu'un reel plus long que le
  // morceau ne le reprenne pas sur une coupure franche
  const fondu = `volume='if(gt(t,${DUREE - SORTIE}),(${DUREE}-t)/${SORTIE},1)':eval=frame`;
  const mesure = ffmpeg([...coupe, '-af', `${fondu},loudnorm=I=-16:TP=-2:LRA=11:print_format=json`, '-f', 'null', '-']);
  const json = mesure.stderr.slice(mesure.stderr.lastIndexOf('{'));
  const l = JSON.parse(json.slice(0, json.indexOf('}') + 1));
  const filtre = `${fondu},loudnorm=I=-16:TP=-2:LRA=11:measured_I=${l.input_i}:measured_TP=${l.input_tp}:measured_LRA=${l.input_lra}:measured_thresh=${l.input_thresh}:offset=${l.target_offset}:linear=true`;
  const r = ffmpeg(['-v', 'error', '-y', ...coupe, '-af', filtre, '-ar', '44100', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '128k', cible]);
  fs.rmSync(brut, { force: true });
  if (r.status !== 0) throw new Error(`${m.fichier} : ${r.stderr.slice(-300)}`);
  return 'fait';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const refaire = process.argv.includes('--refaire');
  const bilan = { fait: 0, deja: 0, echec: 0 };
  for (const m of bibliotheque.morceaux) {
    try {
      bilan[preparer(m, { refaire })]++;
    } catch (e) {
      // un morceau absent n'empêche pas le rendu : le choix ne prend que les
      // fichiers présents
      bilan.echec++;
      console.error(e.message);
    }
  }
  console.log(`musiques : ${bilan.fait} préparées, ${bilan.deja} déjà là, ${bilan.echec} en échec`);
}
