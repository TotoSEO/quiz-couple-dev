// Planche de contrôle d'un reel : des images choisies, en petit, côte à côte.
//   node scripts/planche.mjs <recette.json> <sortie.png> [--toutes 0.5] [image...]
// --toutes s : une image toutes les s secondes ; sinon les images du contrôle.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const ici = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const i = args.indexOf('--toutes');
const pas = i >= 0 ? Number(args[i + 1]) : 0;
const reste = args.filter((a, k) => !a.startsWith('--') && (i < 0 || k !== i + 1));
const [fichier, sortie, ...choisies] = reste;
const recette = JSON.parse(fs.readFileSync(fichier, 'utf8'));
const c = { browserExecutable: process.env.NAVIGATEUR || null, logLevel: 'error', chromiumOptions: { gl: 'swangle' }, timeoutInMilliseconds: 120000 };
const serveUrl = await bundle({ entryPoint: path.join(ici, '..', 'src', 'index.ts') });
const reel = await selectComposition({ ...c, serveUrl, id: 'reel', inputProps: { recette } });
const { plan } = reel.props;
let images = choisies.map(Number);
if (!images.length) images = pas ? Array.from({ length: Math.floor(reel.durationInFrames / (pas * 30)) + 1 }, (_, k) => Math.round(k * pas * 30)).filter((n) => n < reel.durationInFrames) : plan.verifs;
const colonnes = Math.min(8, images.length);
const composition = await selectComposition({ ...c, serveUrl, id: 'planche', inputProps: { recette, images, colonnes } });
await renderStill({ ...c, serveUrl, composition, output: sortie, imageFormat: 'png' });
console.log(`planche : ${images.length} images sur ${reel.durationInFrames} (${(reel.durationInFrames / 30).toFixed(1)} s)`);
