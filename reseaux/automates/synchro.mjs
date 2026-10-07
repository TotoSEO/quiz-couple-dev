// Synchro de l'atelier : les posts écrits par la routine Claude arrivent en
// fichiers JSON sur la branche reseaux-atelier (reseaux/atelier/posts/), ce
// script les contrôle puis les écrit dans Supabase. Claude n'a ainsi jamais
// de clé Supabase : il pousse des fichiers, GitHub Actions fait le reste.
//
//   node reseaux/automates/synchro.mjs <dossier des posts>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connexion } from './lib/supabase.mjs';
import { controlerPost } from './lib/controle.mjs';
import { aujourdhui, categorieAttendue } from './lib/calendrier.mjs';

const MODIFIABLES = ['a_rendre', 'rendu', 'echec'];

export async function synchroniser(base, posts, { maintenant = new Date() } = {}) {
  const bilan = { ecrits: 0, refuses: 0, ignores: 0 };
  const melange = await base.reglage('melange');
  const comptes = await base.select('social_comptes', 'select=langue,fuseau');
  for (const { fichier, post } of posts) {
    const fautes = controlerPost(post);
    const compte = comptes.find((c) => post.variantes && c.langue in post.variantes);
    const fuseau = compte?.fuseau || 'Europe/Paris';
    if (post.jour && post.jour < aujourdhui(fuseau, maintenant)) {
      bilan.ignores++;
      continue; // un post passé n'est plus touché
    }
    const attendu = categorieAttendue(melange, post.jour, post.creneau);
    if (attendu && attendu !== post.categorie) fautes.push(`le créneau ${post.creneau} du ${post.jour} attend la catégorie ${attendu}, pas ${post.categorie}`);
    for (const langue of Object.keys(post.variantes || {})) {
      if (!comptes.some((c) => c.langue === langue)) fautes.push(`aucun compte pour la langue ${langue}`);
    }
    if (fautes.length) {
      bilan.refuses++;
      await base.journal('erreur', 'synchro', `${fichier} refusé`, { fautes });
      continue;
    }
    const [deja] = await base.select('social_posts', `select=id,statut&jour=eq.${post.jour}&creneau=eq.${post.creneau}`);
    if (deja && ['suspendu', 'annule'].includes(deja.statut)) {
      bilan.ignores++;
      await base.journal('alerte', 'synchro', `${fichier} : post ${deja.statut} dans l'admin, laissé tel quel`);
      continue;
    }
    const [ligne] = await base.insert(
      'social_posts',
      [{ jour: post.jour, creneau: post.creneau, format: post.format, gabarit: post.gabarit, categorie: post.categorie ?? null, theme: post.theme ?? null, statut: 'valide', notes: post.notes ?? {} }],
      { conflit: 'jour,creneau' },
    );
    for (const [langue, v] of Object.entries(post.variantes)) {
      const [existante] = await base.select('social_variantes', `select=id,statut&post_id=eq.${ligne.id}&langue=eq.${langue}`);
      const valeurs = { recette: v.recette, legende: v.legende, hashtags: v.hashtags };
      if (!existante) {
        await base.insert('social_variantes', [{ post_id: ligne.id, langue, ...valeurs }]);
      } else if (MODIFIABLES.includes(existante.statut)) {
        // la recette change : il faut refaire le rendu
        await base.update('social_variantes', `id=eq.${existante.id}`, { ...valeurs, statut: 'a_rendre', fichiers: {}, erreur: null, essais: 0 });
      } else {
        await base.journal('alerte', 'synchro', `${fichier} (${langue}) déjà ${existante.statut}, laissé tel quel`, null, existante.id);
        continue;
      }
    }
    // une idée de Thomas reprise par ce post n'est plus proposée
    if (post.idee_id) await base.update('social_idees', `id=eq.${post.idee_id}`, { utilisee_le: new Date().toISOString(), post_id: ligne.id });
    bilan.ecrits++;
  }
  await base.journal('info', 'synchro', `${bilan.ecrits} posts écrits, ${bilan.refuses} refusés, ${bilan.ignores} passés ignorés`);
  return bilan;
}

export function lirePosts(dossier) {
  if (!fs.existsSync(dossier)) return [];
  return fs
    .readdirSync(dossier)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      try {
        return { fichier: f, post: JSON.parse(fs.readFileSync(path.join(dossier, f), 'utf8')) };
      } catch (e) {
        return { fichier: f, post: { erreurLecture: e.message } };
      }
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dossier = process.argv[2] || 'reseaux/atelier/posts';
  const base = await connexion();
  const bilan = await synchroniser(base, lirePosts(dossier));
  console.log(bilan);
  if (bilan.refuses) process.exitCode = 1;
}
