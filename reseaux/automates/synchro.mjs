// Synchro de l'atelier : les posts écrits par la routine Claude arrivent en
// fichiers JSON sur la branche reseaux-atelier (reseaux/atelier/posts/), ce
// script les contrôle puis les écrit dans Supabase. Claude n'a ainsi jamais
// de clé Supabase : il pousse des fichiers, GitHub Actions fait le reste.
//
//   node reseaux/automates/synchro.mjs <dossier des posts> [<autre dossier>...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connexion } from './lib/supabase.mjs';
import { controlerPost } from './lib/controle.mjs';
import { aujourdhui, categorieAttendue, melangeDuCompte } from './lib/calendrier.mjs';

const MODIFIABLES = ['a_rendre', 'rendu', 'echec'];
// Un rendu en échec est retenté par les synchros suivantes, trois fois en
// tout ; au-delà, la déclinaison reste en échec et l'atelier la corrige.
const ESSAIS_RENDU_MAX = 3;

// Même contenu à l'ordre des clés près : PostgREST rend le jsonb avec ses
// clés triées, pas dans l'ordre du fichier.
const trier = (x) => (Array.isArray(x) ? x.map(trier) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, trier(x[k])])) : x);
const canon = (x) => JSON.stringify(trier(x) ?? null);
// Le son d'un reel ne change rien au fichier rendu : l'atelier écrit une
// demande (ambiance, recherche), la publication y ajoute son choix (id,
// titre, artiste). On compare donc les recettes sans leur `son`, et une
// demande qui change se pose sur la déclinaison sans refaire le rendu.
const sansSon = (r) => {
  if (!r?.son) return r;
  const { son, ...reste } = r;
  return reste;
};
const demandeSon = (r) => ({ ambiance: r?.son?.ambiance ?? null, recherche: r?.son?.recherche ?? null });
const memeContenu = (a, b) =>
  canon(sansSon(a.recette)) === canon(sansSon(b.recette)) && (a.legende || '') === (b.legende || '') && canon(a.hashtags || []) === canon(b.hashtags || []);
const memeInstant = (a, b) => Date.parse(a) === Date.parse(b);

export async function synchroniser(base, posts, { maintenant = new Date() } = {}) {
  const bilan = { ecrits: 0, inchanges: 0, refuses: 0, ignores: 0 };
  const melangeGlobal = await base.reglage('melange');
  const comptes = await base.select('social_comptes', 'select=langue,fuseau,melange');
  for (const { fichier, post } of posts) {
    const fautes = controlerPost(post);
    // le compte du post : celui de sa déclinaison (Quiz Couple écrit en, Les
    // mipaps fr) ; chaque compte a sa grille et son planning
    const langue = post.langue || Object.keys(post.variantes || {})[0];
    const compte = comptes.find((c) => c.langue === langue);
    const fuseau = compte?.fuseau || 'Europe/Paris';
    const melange = melangeDuCompte(compte, melangeGlobal);
    if (post.jour && post.jour < aujourdhui(fuseau, maintenant)) {
      bilan.ignores++;
      continue; // un post passé n'est plus touché
    }
    // La grille de la semaine (réglage « melange ») peut changer après
    // l'écriture d'un post : le 8 octobre 2026 le mardi soir est passé de pov
    // à bd, et deux POV déjà écrits pour les 13 et 20 octobre ont été refusés
    // à chaque passage, donc jamais rendus ni publiés, la routine ne
    // réécrivant pas un fichier existant. Un post hors grille est accepté
    // avec une alerte ; l'entretien le signale à la routine (`hors_grille`
    // dans etat.json) pour qu'elle le réécrive dans la bonne catégorie.
    const attendu = categorieAttendue(melange, post.jour, post.creneau);
    const horsGrille = attendu && attendu !== post.categorie ? `le créneau ${post.creneau} du ${post.jour} attend la catégorie ${attendu}, ${post.categorie} accepté en attendant sa réécriture` : null;
    for (const langue of Object.keys(post.variantes || {})) {
      if (!comptes.some((c) => c.langue === langue)) fautes.push(`aucun compte pour la langue ${langue}`);
    }
    if (fautes.length) {
      bilan.refuses++;
      // les fautes dans le message : le journal du workflow les montre sans
      // ouvrir l'admin, et l'entretien les remet à la routine (`refuses`)
      await base.journal('erreur', 'synchro', `${fichier} refusé : ${fautes.join(' ; ')}`, { fichier, fautes, langue });
      continue;
    }
    const [deja] = await base.select('social_posts', `select=id,statut&langue=eq.${langue}&jour=eq.${post.jour}&creneau=eq.${post.creneau}`);
    if (deja && ['suspendu', 'annule'].includes(deja.statut)) {
      bilan.ignores++;
      await base.journal('alerte', 'synchro', `${fichier} : post ${deja.statut} dans l'admin, laissé tel quel`);
      continue;
    }
    const [ligne] = await base.insert(
      'social_posts',
      [{ langue, jour: post.jour, creneau: post.creneau, format: post.format, gabarit: post.gabarit, categorie: post.categorie ?? null, theme: post.theme ?? null, statut: 'valide', notes: post.notes ?? {} }],
      { conflit: 'langue,jour,creneau' },
    );
    let change = false;
    for (const [langue, v] of Object.entries(post.variantes)) {
      const [existante] = await base.select('social_variantes', `select=id,statut,recette,legende,hashtags,publier_a,essais&post_id=eq.${ligne.id}&langue=eq.${langue}`);
      const valeurs = { recette: v.recette, legende: v.legende, hashtags: v.hashtags };
      // Une heure de publication écrite dans le post remplace la minute tirée
      // au sort dans le créneau (déclencheur social_variante_heure, qui ne
      // joue que si publier_a est nul) : pour un post qu'on veut voir partir
      // à une heure précise, par exemple un soir où le créneau est déjà passé.
      if (post.publier_a) valeurs.publier_a = new Date(post.publier_a).toISOString();
      if (!existante) {
        await base.insert('social_variantes', [{ post_id: ligne.id, langue, ...valeurs }]);
        change = true;
      } else if (MODIFIABLES.includes(existante.statut)) {
        const aRetenter = existante.statut === 'echec' && (existante.essais || 0) < ESSAIS_RENDU_MAX;
        if (memeContenu(existante, v) && !aRetenter) {
          // Le fichier n'a pas changé : le rendu reste bon. Jusqu'au 7 octobre
          // 2026, chaque synchro remettait toutes les déclinaisons en a_rendre
          // et le rendu refaisait chaque heure tous les posts des 48 h à venir.
          if (valeurs.publier_a && !memeInstant(valeurs.publier_a, existante.publier_a)) {
            await base.update('social_variantes', `id=eq.${existante.id}`, { publier_a: valeurs.publier_a });
            change = true;
          }
          // La demande de son a changé (une ambiance posée ou corrigée) : on
          // la remplace telle quelle, un choix fait pour l'ancienne demande
          // n'a plus cours ; le fichier rendu, lui, reste bon.
          if (canon(demandeSon(existante.recette)) !== canon(demandeSon(v.recette))) {
            const recette = v.recette?.son ? { ...sansSon(existante.recette), son: v.recette.son } : sansSon(existante.recette);
            await base.update('social_variantes', `id=eq.${existante.id}`, { recette });
            change = true;
          }
          continue;
        }
        // la recette change (ou un rendu en échec est retenté) : il faut refaire le rendu
        await base.update('social_variantes', `id=eq.${existante.id}`, { ...valeurs, statut: 'a_rendre', fichiers: {}, erreur: null, essais: aRetenter ? existante.essais || 0 : 0 });
        change = true;
      } else {
        await base.journal('alerte', 'synchro', `${fichier} (${langue}) déjà ${existante.statut}, laissé tel quel`, null, existante.id);
        continue;
      }
    }
    // une idée de Thomas reprise par ce post n'est plus proposée
    if (post.idee_id) await base.update('social_idees', `id=eq.${post.idee_id}`, { utilisee_le: new Date().toISOString(), post_id: ligne.id });
    if (change) bilan.ecrits++;
    else bilan.inchanges++;
    // une fois par écriture, pas à chaque passage horaire sur un fichier inchangé
    if (horsGrille && change) await base.journal('alerte', 'synchro', `${fichier} : ${horsGrille}`, { fichier, attendue: attendu, categorie: post.categorie });
  }
  await base.journal('info', 'synchro', `${bilan.ecrits} posts écrits, ${bilan.inchanges} inchangés, ${bilan.refuses} refusés, ${bilan.ignores} passés ignorés`);
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
  // un dossier par atelier : celui de Quiz Couple et celui des mipaps
  // (reseaux/mipaps/atelier/posts, branche mipaps-atelier) ; un dossier
  // absent est simplement vide
  const dossiers = process.argv.slice(2);
  if (!dossiers.length) dossiers.push('reseaux/atelier/posts');
  const base = await connexion();
  const bilan = await synchroniser(base, dossiers.flatMap(lirePosts));
  console.log(bilan);
  // Un fichier refusé est une erreur de contenu, journalisée (pastille de
  // l'onglet Réseaux, liste `refuses` de etat.json pour la routine) : il ne
  // fait pas échouer le workflow. Jusqu'au 8 octobre 2026 le code de sortie
  // passait à 1 et l'étape de rendu qui suit ne tournait pas : deux fichiers
  // refusés ont arrêté le rendu de toute la réserve pendant une matinée.
}
