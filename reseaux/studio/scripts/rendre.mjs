// Rend une recette en fichiers prêts à publier.
//   node scripts/rendre.mjs <recette.json> <dossier de sortie>
// Reel : reel.mp4 + couverture.jpg. Image : image.jpg. Carrousel : page-1.jpg...
// BD : image.jpg (les quatre cases), ou page-1.jpg... avec « sortie: carrousel ».
// Avant tout rendu, chaque écran passe le contrôle de mise en page (texte
// dans la zone utile, pas de débordement, pas de mot seul, 34 px au moins).
// NAVIGATEUR : chemin d'un Chromium déjà installé (sinon Remotion télécharge
// le sien).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { openBrowser, renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const ici = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
// --verifier : seulement le contrôle de mise en page, sans rien rendre
const seulementVerifier = args.includes('--verifier');
const [fichier, sortie] = args.filter((a) => !a.startsWith('--'));
if (!fichier || !sortie) {
  console.error('usage : node scripts/rendre.mjs <recette.json> <dossier de sortie>');
  process.exit(2);
}
const recette = JSON.parse(fs.readFileSync(fichier, 'utf8'));
fs.mkdirSync(sortie, { recursive: true });
const browserExecutable = process.env.NAVIGATEUR || null;
const chromiumOptions = { gl: 'swangle' };
// Un seul navigateur pour toutes les étapes : l'ouvrir à chaque image
// vérifiée coûtait plusieurs secondes par écran.
const puppeteerInstance = await openBrowser('chrome', { browserExecutable, chromiumOptions, logLevel: 'warn' });
const commun = { browserExecutable, chromiumOptions, puppeteerInstance, logLevel: 'warn', timeoutInMilliseconds: 60000 };

const serveUrl = await bundle({ entryPoint: path.join(ici, '..', 'src', 'index.ts') });
const choisir = (id, inputProps) => selectComposition({ ...commun, serveUrl, id, inputProps });

const verifier = async (id, inputProps, images) => {
  const composition = await choisir(id, { ...inputProps, verification: true });
  for (const frame of images) {
    await renderStill({ ...commun, serveUrl, composition, frame, output: path.join(sortie, '.verif.png') });
  }
  fs.rmSync(path.join(sortie, '.verif.png'), { force: true });
};

const jpeg = { imageFormat: 'jpeg', jpegQuality: 92 };

// Le volume final du reel : son-final (-14 LUFS) et son-crete (-1 dBTP) du
// design system, en deux passes de loudnorm (mesure, puis correction), la
// vidéo recopiée telle quelle.
const tokens = JSON.parse(fs.readFileSync(path.join(ici, '..', '..', 'charte', 'tokens.json'), 'utf8'));
const son = (nom) => parseFloat(tokens.son.tokens.find((t) => t.name === nom).value);
const outils = path.dirname(createRequire(import.meta.url).resolve(`@remotion/compositor-${process.platform}-${process.arch}${process.platform === 'linux' ? '-gnu' : ''}/package.json`));
const env = { ...process.env, LD_LIBRARY_PATH: outils };
const ffmpeg = (args) => execFileSync(path.join(outils, 'ffmpeg'), args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
// avecMusique : la normalisation à son-final n'a de sens qu'avec une musique
// continue ; sur des bruitages isolés, elle les remonterait de 15 dB. Sans
// musique, on garde le volume des bruitages tel quel et on ne fait que
// rabattre les crêtes sous son-crete si elles dépassent.
const normaliser = (entree, sortieFichier, avecMusique) => {
  // un demi-décibel de marge sous la crête visée : l'encodage AAC la dépasse un peu
  const crete = son('son-crete') - 0.5;
  const cible = `I=${son('son-final')}:TP=${crete}:LRA=11`;
  // loudnorm écrit sa mesure sur la sortie d'erreur
  const r = spawnSync(path.join(outils, 'ffmpeg'), ['-hide_banner', '-i', entree, '-vn', '-af', `loudnorm=${cible}:print_format=json`, '-f', 'null', '-'], { env, encoding: 'utf8' });
  if (r.status !== 0) throw new Error('mesure du volume impossible : ' + r.stderr.slice(-300));
  const mesure = JSON.parse(r.stderr.slice(r.stderr.lastIndexOf('{'), r.stderr.lastIndexOf('}') + 1));
  let filtre;
  if (avecMusique) {
    filtre = `loudnorm=${cible}:measured_I=${mesure.input_i}:measured_TP=${mesure.input_tp}:measured_LRA=${mesure.input_lra}:measured_thresh=${mesure.input_thresh}:offset=${mesure.target_offset}:linear=true`;
  } else {
    const tp = parseFloat(mesure.input_tp);
    const baisse = Number.isFinite(tp) && tp > crete ? crete - tp : 0;
    filtre = `volume=${baisse.toFixed(2)}dB`;
  }
  ffmpeg(['-v', 'error', '-y', '-i', entree, '-c:v', 'copy', '-af', filtre, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', sortieFichier]);
  return mesure;
};

// Les bruitages Mixkit (public/sons/mx-*.mp3) ne sont pas dans le dépôt :
// un fichier absent fait échouer le rendu dans le navigateur avec une erreur
// obscure, autant le dire avant, avec la commande qui le prépare.
const bibliothequeSons = JSON.parse(fs.readFileSync(path.join(ici, '..', 'public', 'sons', 'bibliotheque.json'), 'utf8'));
const mixkit = new Set(bibliothequeSons.sons.map((s) => s.nom.replace(/-\d+$/, '')));
const bruitagesManquants = (plan) => {
  const noms = new Set([...(plan.sons || []).map((s) => s.nom), ...(plan.ambiances || []).map((s) => s.nom)]);
  return [...noms].filter((n) => mixkit.has(n) && !fs.existsSync(path.join(ici, '..', 'public', 'sons', `mx-${n}.mp3`)));
};

const REELS = ['citation', 'quiz-chrono', 'connais-tu', 'tu-preferes', 'pov'];
if (REELS.includes(recette.gabarit)) {
  const composition = await choisir('reel', { recette });
  const { plan } = composition.props;
  await verifier('reel', { recette }, plan.verifs);
  if (seulementVerifier) {
    console.log(`contrôle réussi : ${plan.verifs.length} écrans`);
    process.exit(0);
  }
  const manquants = bruitagesManquants(plan);
  if (manquants.length) throw new Error(`bruitages absents : ${manquants.join(', ')}. Lance « node scripts/sons.mjs » dans reseaux/studio.`);
  await renderMedia({
    ...commun,
    serveUrl,
    composition,
    codec: 'h264',
    crf: 18,
    pixelFormat: 'yuv420p',
    colorSpace: 'bt709',
    audioCodec: 'aac',
    enforceAudioTrack: true,
    outputLocation: path.join(sortie, '.brut.mp4'),
  });
  const mesure = normaliser(path.join(sortie, '.brut.mp4'), path.join(sortie, 'reel.mp4'), !!plan.musique);
  fs.rmSync(path.join(sortie, '.brut.mp4'), { force: true });
  console.log(plan.musique ? `son : ${mesure.input_i} LUFS mesurés, ramenés à ${son('son-final')} LUFS` : `son : bruitages seuls, crête ${mesure.input_tp} dBTP, pas de musique`);
  await renderStill({ ...commun, ...jpeg, serveUrl, composition, frame: plan.couverture, output: path.join(sortie, 'couverture.jpg') });
  console.log(`reel : ${(composition.durationInFrames / composition.fps).toFixed(1)} s, ${plan.verifs.length} écrans vérifiés`);
} else if (recette.gabarit === 'image') {
  await verifier('image', { recette }, [0]);
  if (seulementVerifier) process.exit(0);
  const composition = await choisir('image', { recette });
  await renderStill({ ...commun, ...jpeg, serveUrl, composition, output: path.join(sortie, 'image.jpg') });
  console.log('image : 1 page vérifiée');
} else if (recette.gabarit === 'bd') {
  const pages = recette.sortie === 'carrousel' ? recette.cases.length : 1;
  for (let page = 0; page < pages; page++) {
    await verifier('image', { recette, page }, [0]);
    if (seulementVerifier) continue;
    const composition = await choisir('image', { recette, page });
    await renderStill({ ...commun, ...jpeg, serveUrl, composition, output: path.join(sortie, pages === 1 ? 'image.jpg' : `page-${page + 1}.jpg`) });
  }
  console.log(pages === 1 ? 'bd : une image de quatre cases vérifiée' : `bd : ${pages} pages vérifiées`);
} else if (recette.gabarit === 'carrousel') {
  for (let page = 0; page < recette.pages.length; page++) {
    await verifier('image', { recette, page }, [0]);
    if (seulementVerifier) continue;
    const composition = await choisir('image', { recette, page });
    await renderStill({ ...commun, ...jpeg, serveUrl, composition, output: path.join(sortie, `page-${page + 1}.jpg`) });
  }
  console.log(`carrousel : ${recette.pages.length} pages vérifiées`);
} else {
  throw new Error(`Gabarit inconnu : ${recette.gabarit}`);
}

await puppeteerInstance.close({ silent: true });
