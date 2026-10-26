// Contrôle de mise en page de plusieurs recettes de reel en un seul passage :
// un seul bundle et un seul navigateur (rendre.mjs --verifier les refait à
// chaque fichier, 24 s pièce).
//   node verif-lot.mjs <dossier des posts> [fichiers...]
// Lit chaque post (variantes.fr.recette), vérifie les écrans du plan, écrit
// OK/KO par fichier et un résumé.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';

const studio = '/home/user/quiz-couple-dev/reseaux/studio';
const [dossier, ...choisis] = process.argv.slice(2);
const fichiers = (choisis.length ? choisis : fs.readdirSync(dossier).filter((f) => f.endsWith('.json')).sort()).map((f) => (path.isAbsolute(f) ? f : path.join(dossier, f)));
const browserExecutable = process.env.NAVIGATEUR || null;
const chromiumOptions = { gl: 'swangle' };
const puppeteerInstance = await openBrowser('chrome', { browserExecutable, chromiumOptions, logLevel: 'error' });
const commun = { browserExecutable, chromiumOptions, puppeteerInstance, logLevel: 'error', timeoutInMilliseconds: 60000 };
const serveUrl = await bundle({ entryPoint: path.join(studio, 'src', 'index.ts') });
const sortie = path.join(os.tmpdir(), 'verif-lot-' + process.pid + '.png');
let ko = 0;
const t0 = Date.now();
for (const f of fichiers) {
  let recette;
  try {
    const post = JSON.parse(fs.readFileSync(f, 'utf8'));
    recette = post.variantes?.fr?.recette ?? post;
  } catch (e) {
    console.log(`KO ${path.basename(f)} : ${e.message}`);
    ko++;
    continue;
  }
  try {
    const composition = await selectComposition({ ...commun, serveUrl, id: 'reel', inputProps: { recette, verification: true } });
    const { plan } = composition.props;
    for (const frame of plan.verifs) await renderStill({ ...commun, serveUrl, composition, frame, output: sortie });
    console.log(`OK ${path.basename(f)} (${plan.verifs.length} écrans, ${(composition.durationInFrames / composition.fps).toFixed(1)} s)`);
  } catch (e) {
    const m = String(e.message || e).split('\n').filter((l) => /verif|zone|déborde|mot seul|hors|texte|visage|chevauch/i.test(l)).slice(0, 3).join(' | ') || String(e.message || e).slice(0, 300);
    console.log(`KO ${path.basename(f)} : ${m}`);
    ko++;
  }
}
fs.rmSync(sortie, { force: true });
await puppeteerInstance.close({ silent: true });
console.log(`${fichiers.length} recettes, ${ko} KO, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
process.exit(ko ? 1 : 0);
