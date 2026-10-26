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
import { ajouterJours, aujourdhui, categorieAttendue, estRetiree, melangeDuCompte, MOTIF_FERME, MOTIF_RETRAIT } from './lib/calendrier.mjs';

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

// Les posts et les déclinaisons à venir sont lus en quelques requêtes au
// début, puis tenus à jour en mémoire : jusqu'au 20 octobre 2026, chaque
// passage horaire relisait le post et sa déclinaison et réécrivait le post
// (trois requêtes par fichier, 17 000 lignes par jour dans les logs de la
// passerelle de Supabase, un cinquième du total) pour ne rien changer dans
// l'immense majorité des cas.
const CHAMPS_POST = ['format', 'gabarit', 'categorie', 'theme'];
const memePost = (deja, post) =>
  deja.statut === 'valide' && CHAMPS_POST.every((c) => (deja[c] ?? null) === (post[c] ?? null)) && canon(deja.notes ?? {}) === canon(post.notes ?? {});
const parPaquets = (liste, taille) => Array.from({ length: Math.ceil(liste.length / taille) }, (_, i) => liste.slice(i * taille, (i + 1) * taille));

async function lireExistant(base, comptes, maintenant) {
  const fuseaux = new Set(['Europe/Paris', ...comptes.map((c) => c.fuseau).filter(Boolean)]);
  const jourMin = [...fuseaux].map((f) => aujourdhui(f, maintenant)).sort()[0];
  const postsExistants = await base.select('social_posts', `select=id,langue,jour,creneau,statut,format,gabarit,categorie,theme,notes&jour=gte.${jourMin}`);
  const posts = new Map(postsExistants.map((p) => [`${p.langue}|${p.jour}|${p.creneau}`, p]));
  const variantes = new Map();
  for (const paquet of parPaquets(postsExistants.map((p) => p.id), 60)) {
    const lignes = await base.select('social_variantes', `select=id,post_id,langue,statut,recette,legende,hashtags,publier_a,essais,erreur&post_id=in.(${paquet.join(',')})`);
    for (const v of lignes) variantes.set(`${v.post_id}|${v.langue}`, v);
  }
  return { posts, variantes };
}

export async function synchroniser(base, posts, { maintenant = new Date() } = {}) {
  const bilan = { ecrits: 0, inchanges: 0, refuses: 0, ignores: 0 };
  const melangeGlobal = await base.reglage('melange');
  const comptes = await base.select('social_comptes', 'select=langue,fuseau,melange');
  const existant = await lireExistant(base, comptes, maintenant);
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
    // Une catégorie retirée de la grille (les animations des mascottes, le
    // 16 octobre 2026 au soir) ne part plus du tout : le post est écrit en
    // base pour que l'entretien le signale à la routine (`hors_grille`), mais
    // sa déclinaison est mise en échec avec le motif du retrait, essais au
    // maximum, et rien ne la rend ni ne la publie tant que le fichier n'est
    // pas réécrit dans la catégorie attendue. Au 16 octobre 2026, 59 posts de
    // la réserve étaient concernés, dont certains déjà rendus pour le
    // lendemain : accepter les posts hors grille « en attendant leur
    // réécriture » les aurait fait partir.
    const retiree = estRetiree(post.categorie);
    // un créneau fermé par la grille (huit reels par semaine, 26 octobre
    // 2026) : le post est écrit en base et sa déclinaison retenue, comme pour
    // une catégorie retirée
    const fermee = attendu === null;
    const motifRetenue = retiree ? MOTIF_RETRAIT : MOTIF_FERME;
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
    const clePost = `${langue}|${post.jour}|${post.creneau}`;
    const deja = existant.posts.get(clePost);
    // un post suspendu ou annulé dans l'admin reste tel quel ; un post que la
    // synchro a annulé elle-même (fichier disparu de la branche) revit quand
    // son fichier revient
    if (deja && ['suspendu', 'annule'].includes(deja.statut) && deja.notes?.annule_par !== 'synchro') {
      bilan.ignores++;
      await base.journal('alerte', 'synchro', `${fichier} : post ${deja.statut} dans l'admin, laissé tel quel`);
      continue;
    }
    let ligne = deja;
    if (!deja || !memePost(deja, post)) {
      [ligne] = await base.insert(
        'social_posts',
        [{ langue, jour: post.jour, creneau: post.creneau, format: post.format, gabarit: post.gabarit, categorie: post.categorie ?? null, theme: post.theme ?? null, statut: 'valide', notes: post.notes ?? {} }],
        { conflit: 'langue,jour,creneau' },
      );
      existant.posts.set(clePost, ligne);
    }
    let change = false;
    for (const [langue, v] of Object.entries(post.variantes)) {
      const cleVariante = `${ligne.id}|${langue}`;
      const existante = existant.variantes.get(cleVariante);
      // une écriture met la mémoire à jour, pour un second fichier qui viserait la même place
      const ecrire = async (valeursEcrites) => {
        const [l] = existante
          ? await base.update('social_variantes', `id=eq.${existante.id}`, valeursEcrites)
          : await base.insert('social_variantes', [{ post_id: ligne.id, langue, ...valeursEcrites }]);
        if (l) existant.variantes.set(cleVariante, { ...(existante || {}), ...l });
      };
      const valeurs = { recette: v.recette, legende: v.legende, hashtags: v.hashtags };
      // Une heure de publication écrite dans le post remplace la minute tirée
      // au sort dans le créneau (déclencheur social_variante_heure, qui ne
      // joue que si publier_a est nul) : pour un post qu'on veut voir partir
      // à une heure précise, par exemple un soir où le créneau est déjà passé.
      if (post.publier_a) valeurs.publier_a = new Date(post.publier_a).toISOString();
      if (retiree || fermee) {
        const retenue = { ...valeurs, statut: 'echec', erreur: motifRetenue, essais: ESSAIS_RENDU_MAX, fichiers: {} };
        if (!existante || (MODIFIABLES.includes(existante.statut) && !(existante.statut === 'echec' && existante.erreur === motifRetenue))) {
          await ecrire(retenue);
          change = true;
        }
        // déjà retenue, ou déjà partie : rien à faire
        continue;
      }
      if (!existante) {
        await ecrire(valeurs);
        change = true;
      } else if (MODIFIABLES.includes(existante.statut)) {
        const aRetenter = existante.statut === 'echec' && (existante.essais || 0) < ESSAIS_RENDU_MAX;
        if (memeContenu(existante, v) && !aRetenter) {
          // Le fichier n'a pas changé : le rendu reste bon. Jusqu'au 7 octobre
          // 2026, chaque synchro remettait toutes les déclinaisons en a_rendre
          // et le rendu refaisait chaque heure tous les posts des 48 h à venir.
          if (valeurs.publier_a && !memeInstant(valeurs.publier_a, existante.publier_a)) {
            await ecrire({ publier_a: valeurs.publier_a });
            change = true;
          }
          // La demande de son a changé (une ambiance posée ou corrigée) : on
          // la remplace telle quelle, un choix fait pour l'ancienne demande
          // n'a plus cours ; le fichier rendu, lui, reste bon.
          if (canon(demandeSon(existante.recette)) !== canon(demandeSon(v.recette))) {
            const recette = v.recette?.son ? { ...sansSon(existante.recette), son: v.recette.son } : sansSon(existante.recette);
            await ecrire({ recette });
            change = true;
          }
          continue;
        }
        // la recette change (ou un rendu en échec est retenté) : il faut refaire le rendu
        await ecrire({ ...valeurs, statut: 'a_rendre', fichiers: {}, erreur: null, essais: aRetenter ? existante.essais || 0 : 0 });
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
    if (retiree && change) await base.journal('alerte', 'synchro', `${fichier} : ${post.categorie} retiré de la grille, rien ne partira tant qu'il n'est pas réécrit en ${attendu || 'la catégorie attendue'}`, { fichier, attendue: attendu, categorie: post.categorie });
    else if (fermee && change) await base.journal('alerte', 'synchro', `${fichier} : le créneau ${post.creneau} du ${post.jour} est fermé par la grille, rien n'en partira`, { fichier, categorie: post.categorie, langue });
    else if (horsGrille && change) await base.journal('alerte', 'synchro', `${fichier} : ${horsGrille}`, { fichier, attendue: attendu, categorie: post.categorie });
  }
  // Un fichier retiré de la branche retire son post du planning (statut
  // annule, notes.annule_par = synchro), pour les jours à venir seulement :
  // jusqu'au 26 octobre 2026, un post dont le fichier avait disparu restait
  // « valide » en base et partait quand même. Garde-fou : jamais quand la
  // branche d'un compte montre moins de dix fichiers (un checkout vide
  // annulerait toute la réserve). Un fichier qui revient fait revivre le post.
  for (const compte of comptes) {
    const fichiers = posts.filter(({ post }) => (post.langue || Object.keys(post.variantes || {})[0]) === compte.langue);
    if (fichiers.length < 10) continue;
    const cles = new Set(fichiers.map(({ post }) => `${compte.langue}|${post.jour}|${post.creneau}`));
    const demain = ajouterJours(aujourdhui(compte.fuseau || 'Europe/Paris', maintenant), 1);
    for (const [cle, p] of existant.posts) {
      if (p.langue !== compte.langue || p.statut !== 'valide' || p.jour < demain || cles.has(cle)) continue;
      await base.update('social_posts', `id=eq.${p.id}`, { statut: 'annule', notes: { ...(p.notes || {}), annule_par: 'synchro', annule_le: maintenant.toISOString() } });
      existant.posts.set(cle, { ...p, statut: 'annule' });
      bilan.annules = (bilan.annules || 0) + 1;
      await base.journal('alerte', 'synchro', `${p.jour} ${p.creneau} (${compte.langue}) : plus de fichier sur la branche, post annulé`, { jour: p.jour, creneau: p.creneau, langue: compte.langue });
    }
  }
  await base.journal('info', 'synchro', `${bilan.ecrits} posts écrits, ${bilan.inchanges} inchangés, ${bilan.refuses} refusés, ${bilan.ignores} passés ignorés${bilan.annules ? `, ${bilan.annules} annulés (fichier disparu)` : ''}`);
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
