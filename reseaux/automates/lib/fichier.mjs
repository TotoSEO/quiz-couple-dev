// Contrôle n° 3 du guide : le fichier. Dimensions, codecs, cadence, durée,
// poids, son présent. ffprobe est celui que Remotion installe avec le studio.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const studio = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'studio');
const plateforme = `@remotion/compositor-${process.platform}-${process.arch}${process.platform === 'linux' ? '-gnu' : ''}`;
export const outils = () => path.dirname(createRequire(path.join(studio, 'package.json')).resolve(`${plateforme}/package.json`));

const lancer = (binaire, args) => {
  const dossier = outils();
  const r = spawnSync(path.join(dossier, binaire), args, { env: { ...process.env, LD_LIBRARY_PATH: dossier }, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${binaire} : ${r.stderr.slice(-300)}`);
  return r.stdout;
};

export const sonder = (fichier) =>
  JSON.parse(lancer('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,pix_fmt,r_frame_rate,sample_rate:format=duration,size', '-of', 'json', fichier]));

export function controlerReel(fichier) {
  const fautes = [];
  const s = sonder(fichier);
  const video = s.streams.find((x) => x.codec_type === 'video');
  const audio = s.streams.find((x) => x.codec_type === 'audio');
  const duree = parseFloat(s.format.duration);
  const poids = Number(s.format.size);
  if (!video || video.codec_name !== 'h264') fautes.push('vidéo H.264 absente');
  if (video && (video.width !== 1080 || video.height !== 1920)) fautes.push(`dimensions ${video.width}x${video.height} au lieu de 1080x1920`);
  if (video && video.pix_fmt !== 'yuv420p') fautes.push(`format de pixels ${video.pix_fmt}`);
  if (video && video.r_frame_rate !== '30/1') fautes.push(`cadence ${video.r_frame_rate}`);
  if (!audio || audio.codec_name !== 'aac') fautes.push('son AAC absent');
  if (audio && audio.sample_rate !== '48000') fautes.push(`son à ${audio.sample_rate} Hz`);
  if (!(duree >= 5 && duree <= 90)) fautes.push(`durée ${duree} s hors de 5 à 90 s`);
  if (poids > 50 * 1024 * 1024) fautes.push('plus de 50 Mo');
  return fautes;
}

export function controlerImage(fichier, largeur = 1080, hauteur = 1350) {
  const s = sonder(fichier);
  const v = s.streams[0];
  const fautes = [];
  if (!v || v.width !== largeur || v.height !== hauteur) fautes.push(`image ${v?.width}x${v?.height} au lieu de ${largeur}x${hauteur}`);
  if (fs.statSync(fichier).size > 8 * 1024 * 1024) fautes.push('image de plus de 8 Mo');
  return fautes;
}

// Vignette de 270 px de large, gardée pour l'admin après la publication.
export function vignette(source, cible) {
  lancer('ffmpeg', ['-v', 'error', '-y', '-i', source, '-vf', 'scale=270:-2', '-q:v', '4', cible]);
  return cible;
}
