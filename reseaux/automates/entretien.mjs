// Entretien quotidien : jeton Instagram, ménage du stockage, statistiques,
// réserve, et l'état que lit la routine Claude (reseaux/atelier/etat.json).
//
//   node reseaux/automates/entretien.mjs [--etat <fichier>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connexion } from './lib/supabase.mjs';
import { Instagram, verifierJeton } from './lib/instagram.mjs';
import { ajouterJours, aujourdhui, categorieAttendue } from './lib/calendrier.mjs';
import { viserCreneaux } from './lib/idees.mjs';

const JOUR = 86400000;
const CRENEAUX = ['matin', 'midi', 'soir'];
// Un créneau d'aujourd'hui n'est proposé à la routine que s'il commence dans
// plus de trois heures : le temps d'écrire le post et de le rendre (le rendu
// passe toutes les heures).
const MARGE_MIN = 180;
const DEBUTS_DEFAUT = { matin: '06:00', midi: '11:00', soir: '16:00' };

const enMinutes = (hhmm) => { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + m; };
// l'heure qu'il est dans le fuseau du compte, en minutes depuis minuit
const minutesLocales = (fuseau, maintenant) => {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: fuseau, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(maintenant);
  const lire = (type) => Number(p.find((x) => x.type === type)?.value ?? 0);
  return (lire('hour') % 24) * 60 + lire('minute');
};
const debutCreneau = (compte, creneau) => enMinutes((compte?.creneaux || []).find((c) => c.cle === creneau)?.debut || DEBUTS_DEFAUT[creneau]);

// Le jeton de Page (connexion Facebook) n'expire pas : on vérifie une fois
// par semaine qu'il marche encore, et on alerte dès qu'il ne répond plus,
// pour que Thomas reconnecte le compte dans l'admin avant le prochain post.
export async function verifierJetons(base, { maintenant = new Date(), verifier = verifierJeton } = {}) {
  const comptes = await base.select('social_comptes', 'select=id,langue,ig_user_id,jeton_expire_le');
  for (const c of comptes) {
    const [j] = await base.select('social_jetons', `select=jeton,obtenu_le,renouvele_le&compte_id=eq.${c.id}`);
    if (!j || !c.ig_user_id) continue;
    const reste = c.jeton_expire_le ? Math.floor((new Date(c.jeton_expire_le) - maintenant) / JOUR) : null;
    if (reste !== null && reste < 10) await base.journal('erreur', 'entretien', `jeton ${c.langue} : ${reste} jours restants, à reconnecter dans l'admin`);
    const derniere = new Date(j.renouvele_le || j.obtenu_le);
    if (maintenant - derniere < 7 * JOUR) continue;
    try {
      const moi = await verifier(j.jeton, c.ig_user_id);
      await base.update('social_jetons', `compte_id=eq.${c.id}`, { renouvele_le: maintenant.toISOString() });
      await base.journal('info', 'entretien', `jeton ${c.langue} vérifié : @${moi.username || '?'} répond`);
    } catch (e) {
      await base.journal('erreur', 'entretien', `jeton ${c.langue} refusé par Meta, à reconnecter dans l'admin : ${e.message}`);
    }
  }
}

// Fichiers lourds supprimés 24 h après la publication, 7 jours après un échec.
// La vignette reste pour l'historique de l'admin.
export async function menage(base, { maintenant = new Date() } = {}) {
  const avant = (ms) => new Date(maintenant.getTime() - ms).toISOString();
  const publiees = await base.select('social_variantes', `select=id,fichiers&statut=eq.publie&publie_le=lt.${avant(JOUR)}&fichiers_supprimes_le=is.null`);
  const echouees = await base.select('social_variantes', `select=id,fichiers&statut=eq.echec&updated_at=lt.${avant(7 * JOUR)}&fichiers_supprimes_le=is.null`);
  // filet : un post rendu mais jamais parti (compte coupé, pause) depuis plus
  // d'un jour passe en échec et libère le stockage
  const oubliees = await base.select('social_variantes', `select=id,fichiers&statut=in.(rendu,conteneur)&publier_a=lt.${avant(JOUR)}`);
  for (const v of oubliees) {
    await base.update('social_variantes', `id=eq.${v.id}`, { statut: 'echec', erreur: 'créneau passé sans publication' });
  }
  let n = 0;
  for (const v of [...publiees, ...echouees, ...oubliees]) {
    const chemins = [v.fichiers?.reel, v.fichiers?.couverture, v.fichiers?.image, ...(v.fichiers?.pages || [])].filter(Boolean);
    await base.effacer(chemins);
    await base.update('social_variantes', `id=eq.${v.id}`, { fichiers: {}, fichiers_supprimes_le: maintenant.toISOString() });
    n += chemins.length;
  }
  if (n) await base.journal('info', 'entretien', `${n} fichiers supprimés du stockage`);
  return n;
}

export async function statistiques(base, { maintenant = new Date(), instagramPour } = {}) {
  const comptes = await base.select('social_comptes', 'select=id,langue,ig_user_id,actif');
  const publiees = await base.select('social_variantes', `select=id,langue,ig_media_id,publie_le,post_id&statut=eq.publie&publie_le=gte.${new Date(maintenant - 9 * JOUR).toISOString()}`);
  for (const v of publiees) {
    const age = maintenant - new Date(v.publie_le);
    const releve = age >= 7 * JOUR ? 'j7' : age >= JOUR ? 'j1' : null;
    if (!releve || !v.ig_media_id) continue;
    const [deja] = await base.select('social_stats', `select=id&variante_id=eq.${v.id}&releve=eq.${releve}`);
    if (deja) continue;
    const compte = comptes.find((c) => c.langue === v.langue);
    const [j] = compte ? await base.select('social_jetons', `select=jeton&compte_id=eq.${compte.id}`) : [];
    if (!j) continue;
    const ig = instagramPour ? instagramPour(j.jeton, compte.ig_user_id) : new Instagram(j.jeton, compte.ig_user_id);
    try {
      const s = await ig.statistiques(v.ig_media_id);
      await base.insert('social_stats', [{ variante_id: v.id, releve, ...s }], { conflit: 'variante_id,releve' });
    } catch (e) {
      await base.journal('alerte', 'entretien', `statistiques ${releve} indisponibles : ${e.message}`, null, v.id);
    }
  }
}

// Jours d'avance : jours consécutifs, à partir d'aujourd'hui, dont les trois
// créneaux ont un post validé (jusqu'à 120 jours : la réserve peut couvrir
// toute la banque, écrite d'un coup).
export async function reserve(base, { maintenant = new Date(), fuseau = 'Europe/Paris' } = {}) {
  const debut = aujourdhui(fuseau, maintenant);
  const posts = await base.select('social_posts', `select=jour,creneau,statut&jour=gte.${debut}&statut=eq.valide`);
  let jours = 0;
  for (let i = 0; i < 120; i++) {
    const jour = ajouterJours(debut, i);
    if (CRENEAUX.every((c) => posts.some((p) => p.jour === jour && p.creneau === c))) jours++;
    else break;
  }
  return jours;
}

// Les fichiers que la synchro a refusés ces dernières 24 h (journal), un par
// fichier, le dernier refus faisant foi. La routine ne réécrit jamais un
// fichier existant, sauf ceux-là : sans cette liste, un fichier refusé
// restait refusé à chaque passage et son créneau ne partait jamais.
async function refusesSynchro(base, maintenant) {
  const depuis = new Date(maintenant.getTime() - 24 * 3600 * 1000).toISOString();
  const lignes = await base.select('social_journal', `select=message,details,at&source=eq.synchro&niveau=eq.erreur&at=gte.${depuis}&order=at.desc&limit=200`);
  const parFichier = new Map();
  for (const l of lignes) {
    const fichier = l.details?.fichier || (l.message.match(/^(\S+\.json)/) || [])[1];
    if (!fichier || parFichier.has(fichier)) continue;
    parFichier.set(fichier, { fichier, fautes: l.details?.fautes || [l.message] });
  }
  return [...parFichier.values()];
}

// Les sujets datés (Noël, Nouvel An) de la banque du dépôt : une idée de
// Thomas ne prend jamais leur créneau. Sans le fichier, aucune date.
function sujetsDates() {
  try {
    const chemin = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'atelier', 'sujets.json');
    return (JSON.parse(fs.readFileSync(chemin, 'utf8')).saison?.sujets || []).map((s) => ({ jour: s.jour, creneau: s.creneau }));
  } catch {
    return [];
  }
}

// Ce que la routine Claude lit avant d'écrire : les créneaux à remplir, ce
// qui est déjà passé ou prévu (pour varier), les idées de Thomas avec le
// créneau que chacune vise, ce qui marche, les recettes refusées à
// corriger, les posts hors grille et les fichiers refusés par la synchro.
// L'horizon est long (100 jours) depuis le 7 octobre 2026 : la routine écrit
// toute la réserve d'avance, pour que le compte continue à publier même si
// elle ne tourne plus (le rendu et la publication n'ont pas besoin d'elle).
export async function etat(base, { maintenant = new Date(), horizon = 100 } = {}) {
  const [compte] = await base.select('social_comptes', 'select=langue,fuseau,actif,creneaux&order=langue.asc&limit=1');
  const fuseau = compte?.fuseau || 'Europe/Paris';
  const debut = aujourdhui(fuseau, maintenant);
  const minutesMaintenant = minutesLocales(fuseau, maintenant);
  const melange = await base.reglage('melange');
  const posts = await base.select('social_posts', `select=id,jour,creneau,format,gabarit,categorie,statut&jour=gte.${ajouterJours(debut, -30)}&order=jour.asc`);
  const variantes = posts.length
    ? await base.select('social_variantes', `select=post_id,langue,statut,legende,recette,erreur&post_id=in.(${posts.map((p) => p.id).join(',')})`)
    : [];
  // dès aujourd'hui, pour les créneaux qui laissent le temps d'écrire et de rendre
  const aRemplir = [];
  for (let i = 0; i <= horizon; i++) {
    const jour = ajouterJours(debut, i);
    for (const creneau of CRENEAUX) {
      if (i === 0 && debutCreneau(compte, creneau) < minutesMaintenant + MARGE_MIN) continue;
      if (!posts.some((p) => p.jour === jour && p.creneau === creneau && p.statut !== 'annule')) {
        aRemplir.push({ jour, creneau, categorie: categorieAttendue(melange, jour, creneau) });
      }
    }
  }
  const encorePubliable = (p) => p.jour > debut || (p.jour === debut && debutCreneau(compte, p.creneau) >= minutesMaintenant + MARGE_MIN);
  const resume = (p) => {
    const v = variantes.find((x) => x.post_id === p.id);
    const r = v?.recette || {};
    return {
      jour: p.jour,
      creneau: p.creneau,
      gabarit: p.gabarit,
      categorie: p.categorie,
      statut: v?.statut ?? p.statut,
      texte: r.texte || r.accroche || r.pages?.[0]?.accroche || null,
      erreur: v?.erreur || null,
    };
  };
  // les idées de Thomas, dans l'ordre où il les a notées, chacune avec le
  // créneau le plus proche de sa catégorie (lib/idees.mjs) ; une idée sans
  // catégorie laisse la routine choisir, prochain_creneau lui dit où
  const idees = await base.select('social_idees', 'select=id,texte,source,categorie,created_at&utilisee_le=is.null&order=created_at.asc');
  const { vises, prochain } = viserCreneaux(idees, {
    melange, posts, variantes, dates: sujetsDates(), debut, horizon,
    ouvert: (jour, creneau, i) => i > 0 || debutCreneau(compte, creneau) >= minutesMaintenant + MARGE_MIN,
  });
  const stats = await base.select('social_stats', 'select=variante_id,releve,vues,partages,enregistrements&releve=eq.j7');
  return {
    genere_le: maintenant.toISOString(),
    fuseau,
    aujourdhui: debut,
    reserve_jours: await reserve(base, { maintenant, fuseau }),
    a_remplir: aRemplir,
    // seulement ce qui peut encore partir : un post dont le créneau est passé
    // ne sera plus publié quoi qu'on en fasse (la publication refuse tout
    // retard de plus de 90 min), la routine ne doit pas le retravailler
    // chaque matin pendant trente jours
    a_corriger: posts.filter((p) => variantes.some((v) => v.post_id === p.id && v.statut === 'echec') && encorePubliable(p)).map(resume),
    // posts acceptés par la synchro mais dont la catégorie ne suit plus la
    // grille (elle a changé après leur écriture, comme le mardi soir devenu
    // BD le 8 octobre 2026) : ils partiront tels quels si la routine ne les
    // réécrit pas dans la catégorie attendue
    hors_grille: posts
      .filter((p) => p.statut === 'valide' && p.categorie && encorePubliable(p))
      .map((p) => ({ jour: p.jour, creneau: p.creneau, categorie: p.categorie, attendue: categorieAttendue(melange, p.jour, p.creneau) }))
      .filter((p) => p.attendue && p.attendue !== p.categorie),
    // fichiers refusés par la synchro ces dernières 24 h, avec leurs fautes :
    // le fichier existe sur la branche mais rien n'est en base
    refuses: await refusesSynchro(base, maintenant),
    recents_et_prevus: posts.map(resume),
    idees: idees.map((i) => ({ ...i, creneau_vise: vises.get(i.id) ?? null })),
    prochain_creneau: prochain,
    statistiques_j7: stats,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const base = await connexion();
  await verifierJetons(base);
  await menage(base);
  await statistiques(base);
  const e = await etat(base);
  if (e.reserve_jours < 7) await base.journal('alerte', 'entretien', `réserve de ${e.reserve_jours} jours seulement`);
  const i = process.argv.indexOf('--etat');
  if (i > 0) fs.writeFileSync(process.argv[i + 1], JSON.stringify(e, null, 2) + '\n');
  console.log(`réserve : ${e.reserve_jours} jours, ${e.a_remplir.length} créneaux à remplir, ${e.a_corriger.length} à corriger, ${e.hors_grille.length} hors grille, ${e.refuses.length} fichiers refusés, ${e.idees.length} idées de Thomas`);
}
