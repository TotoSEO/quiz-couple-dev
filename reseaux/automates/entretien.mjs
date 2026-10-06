// Entretien quotidien : jetons Instagram, ménage du stockage, statistiques,
// réserve, et l'état que lit la routine Claude (reseaux/atelier/etat.json).
//
//   node reseaux/automates/entretien.mjs [--etat <fichier>]
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { connexion } from './lib/supabase.mjs';
import { Instagram, renouvelerJeton } from './lib/instagram.mjs';
import { ajouterJours, aujourdhui, categorieAttendue } from './lib/calendrier.mjs';

const JOUR = 86400000;
const CRENEAUX = ['matin', 'midi', 'soir'];

export async function renouvelerJetons(base, { maintenant = new Date(), renouveler = renouvelerJeton } = {}) {
  const comptes = await base.select('social_comptes', 'select=id,langue,jeton_expire_le');
  for (const c of comptes) {
    const [j] = await base.select('social_jetons', `select=jeton,obtenu_le,renouvele_le&compte_id=eq.${c.id}`);
    if (!j) continue;
    const dernier = new Date(j.renouvele_le || j.obtenu_le);
    if (maintenant - dernier < 7 * JOUR) continue; // une fois par semaine suffit (jeton de 60 jours)
    try {
      const r = await renouveler(j.jeton);
      await base.update('social_jetons', `compte_id=eq.${c.id}`, { jeton: r.jeton, renouvele_le: maintenant.toISOString() });
      await base.update('social_comptes', `id=eq.${c.id}`, { jeton_expire_le: r.expireLe });
      await base.journal('info', 'entretien', `jeton ${c.langue} renouvelé jusqu'au ${r.expireLe.slice(0, 10)}`);
    } catch (e) {
      const reste = c.jeton_expire_le ? Math.floor((new Date(c.jeton_expire_le) - maintenant) / JOUR) : null;
      await base.journal(reste !== null && reste < 10 ? 'erreur' : 'alerte', 'entretien', `jeton ${c.langue} non renouvelé (${reste ?? '?'} jours restants) : ${e.message}`);
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
// créneaux ont un post validé.
export async function reserve(base, { maintenant = new Date(), fuseau = 'Europe/Paris' } = {}) {
  const debut = aujourdhui(fuseau, maintenant);
  const posts = await base.select('social_posts', `select=jour,creneau,statut&jour=gte.${debut}&statut=eq.valide`);
  let jours = 0;
  for (let i = 0; i < 60; i++) {
    const jour = ajouterJours(debut, i);
    if (CRENEAUX.every((c) => posts.some((p) => p.jour === jour && p.creneau === c))) jours++;
    else break;
  }
  return jours;
}

// Ce que la routine Claude lit avant d'écrire : les créneaux à remplir, ce
// qui est déjà passé ou prévu (pour varier), les idées de Thomas, ce qui
// marche, les recettes refusées à corriger.
export async function etat(base, { maintenant = new Date(), horizon = 21 } = {}) {
  const [compte] = await base.select('social_comptes', 'select=langue,fuseau,actif&order=langue.asc&limit=1');
  const fuseau = compte?.fuseau || 'Europe/Paris';
  const debut = aujourdhui(fuseau, maintenant);
  const melange = await base.reglage('melange');
  const posts = await base.select('social_posts', `select=id,jour,creneau,format,gabarit,categorie,statut&jour=gte.${ajouterJours(debut, -30)}&order=jour.asc`);
  const variantes = posts.length
    ? await base.select('social_variantes', `select=post_id,langue,statut,legende,recette,erreur&post_id=in.(${posts.map((p) => p.id).join(',')})`)
    : [];
  const aRemplir = [];
  for (let i = 2; i <= horizon; i++) {
    const jour = ajouterJours(debut, i);
    for (const creneau of CRENEAUX) {
      if (!posts.some((p) => p.jour === jour && p.creneau === creneau && p.statut !== 'annule')) {
        aRemplir.push({ jour, creneau, categorie: categorieAttendue(melange, jour, creneau) });
      }
    }
  }
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
  const idees = await base.select('social_idees', 'select=id,texte,source,created_at&utilisee_le=is.null&order=created_at.asc');
  const stats = await base.select('social_stats', 'select=variante_id,releve,vues,partages,enregistrements&releve=eq.j7');
  return {
    genere_le: maintenant.toISOString(),
    fuseau,
    aujourdhui: debut,
    reserve_jours: await reserve(base, { maintenant, fuseau }),
    a_remplir: aRemplir,
    a_corriger: posts.filter((p) => variantes.some((v) => v.post_id === p.id && v.statut === 'echec')).map(resume),
    recents_et_prevus: posts.map(resume),
    idees,
    statistiques_j7: stats,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const base = await connexion();
  await renouvelerJetons(base);
  await menage(base);
  await statistiques(base);
  const e = await etat(base);
  if (e.reserve_jours < 7) await base.journal('alerte', 'entretien', `réserve de ${e.reserve_jours} jours seulement`);
  const i = process.argv.indexOf('--etat');
  if (i > 0) fs.writeFileSync(process.argv[i + 1], JSON.stringify(e, null, 2) + '\n');
  console.log(`réserve : ${e.reserve_jours} jours, ${e.a_remplir.length} créneaux à remplir, ${e.a_corriger.length} à corriger`);
}
