// Rendu : fabrique les fichiers des déclinaisons qui seront publiées dans
// les prochaines heures, les contrôle et les dépose dans le stockage privé.
//
//   node reseaux/automates/rendu.mjs [--heures 30]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { connexion } from './lib/supabase.mjs';
import { controlerImage, controlerReel, vignette } from './lib/fichier.mjs';

const ici = path.dirname(fileURLToPath(import.meta.url));
const studio = path.join(ici, '..', 'studio');

// Lance le studio sur une recette ; renvoie les fichiers produits.
export function rendreRecette(recette, dossier) {
  fs.mkdirSync(dossier, { recursive: true });
  const fichierRecette = path.join(dossier, 'recette.json');
  fs.writeFileSync(fichierRecette, JSON.stringify(recette));
  const r = spawnSync(process.execPath, [path.join(studio, 'scripts', 'rendre.mjs'), fichierRecette, dossier], {
    cwd: studio,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) {
    const message = (r.stderr || r.stdout).match(/Contrôle de mise en page[^\n]*|Error: [^\n]*/)?.[0] || r.stderr.slice(-400);
    throw new Error(message);
  }
  return fs.readdirSync(dossier).filter((f) => /\.(mp4|jpg)$/.test(f));
}

const TYPES = { mp4: 'video/mp4', jpg: 'image/jpeg' };

export async function rendre(base, { heures = 30, maintenant = new Date(), rendreFn = rendreRecette, controles = { controlerReel, controlerImage, vignette } } = {}) {
  const limite = new Date(maintenant.getTime() + heures * 3600 * 1000).toISOString();
  const variantes = await base.select(
    'social_variantes',
    `select=id,post_id,langue,recette,publier_a,essais&statut=eq.a_rendre&publier_a=lte.${limite}&order=publier_a.asc`,
  );
  const bilan = { rendues: 0, echecs: 0 };
  for (const v of variantes) {
    const [post] = await base.select('social_posts', `select=jour,statut,format&id=eq.${v.post_id}`);
    if (!post || post.statut !== 'valide') continue;
    const dossier = fs.mkdtempSync(path.join(os.tmpdir(), 'rendu-'));
    try {
      const produits = rendreFn(v.recette, dossier);
      const fautes = [];
      for (const f of produits) {
        const chemin = path.join(dossier, f);
        if (f === 'reel.mp4') fautes.push(...controles.controlerReel(chemin));
        else if (f === 'couverture.jpg') fautes.push(...controles.controlerImage(chemin, 1080, 1920));
        else fautes.push(...controles.controlerImage(chemin));
      }
      if (!produits.length) fautes.push('aucun fichier produit');
      if (fautes.length) throw new Error('Contrôle du fichier : ' + fautes.join(' ; '));
      const premier = produits.includes('couverture.jpg') ? 'couverture.jpg' : produits.includes('image.jpg') ? 'image.jpg' : 'page-1.jpg';
      controles.vignette(path.join(dossier, premier), path.join(dossier, 'vignette.jpg'));
      const racine = `${post.jour}/${v.id}`;
      const fichiers = {};
      for (const f of [...produits, 'vignette.jpg']) {
        await base.televerser(`${racine}/${f}`, fs.readFileSync(path.join(dossier, f)), TYPES[f.split('.').pop()]);
      }
      if (produits.includes('reel.mp4')) {
        fichiers.reel = `${racine}/reel.mp4`;
        fichiers.couverture = `${racine}/couverture.jpg`;
      } else if (produits.includes('image.jpg')) {
        fichiers.image = `${racine}/image.jpg`;
      } else {
        fichiers.pages = produits.filter((f) => f.startsWith('page-')).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5))).map((f) => `${racine}/${f}`);
      }
      await base.update('social_variantes', `id=eq.${v.id}&statut=eq.a_rendre`, {
        statut: 'rendu',
        fichiers,
        vignette: `${racine}/vignette.jpg`,
        rendu_le: new Date().toISOString(),
        erreur: null,
      });
      bilan.rendues++;
      await base.journal('info', 'rendu', `${post.jour} ${v.langue} rendu`, { fichiers }, v.id);
    } catch (e) {
      bilan.echecs++;
      await base.update('social_variantes', `id=eq.${v.id}`, { statut: 'echec', erreur: e.message, essais: (v.essais || 0) + 1 });
      await base.journal('erreur', 'rendu', `${post.jour} ${v.langue} : ${e.message}`, null, v.id);
    } finally {
      fs.rmSync(dossier, { recursive: true, force: true });
    }
  }
  return bilan;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--heures');
  const heures = i > 0 ? Number(process.argv[i + 1]) : 30;
  const base = await connexion();
  console.log(await rendre(base, { heures }));
}
