// Aperçu rapide d'un reel : quelques images fixes en petit, sans rendre la vidéo.
//   node scripts/apercu.mjs <recette.json> <dossier> <image> [<image>...]
import path from 'node:path'; import fs from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
const [recetteF, sortie, ...frames] = process.argv.slice(2);
const recette = JSON.parse(fs.readFileSync(recetteF, 'utf8'));
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const c = { browserExecutable: process.env.NAVIGATEUR, logLevel: 'error' };
const composition = await selectComposition({ ...c, serveUrl, id: 'reel', inputProps: { recette } });
fs.mkdirSync(sortie, { recursive: true });
for (const fr of frames) await renderStill({ ...c, serveUrl, composition, frame: Number(fr), output: path.join(sortie, `f${fr}.png`), scale: 0.35 });
console.log('ok', composition.durationInFrames);
