// Publication : passe toutes les 10 minutes (GitHub Actions).
//  1. Une heure avant l'heure prévue, crée le conteneur Instagram d'un reel
//     (Instagram met quelques minutes à traiter la vidéo).
//  2. À l'heure prévue, vérifie que le conteneur est prêt et publie.
// Une image ou un carrousel se prépare et se publie dans le même passage.
// Rien ne part si la pause générale est active, si le compte n'est pas
// actif ou s'il n'a pas de jeton : la déclinaison attend, sans erreur.
//
//   node reseaux/automates/publication.mjs [--a-blanc]
import { fileURLToPath } from 'node:url';
import { connexion } from './lib/supabase.mjs';
import { Instagram } from './lib/instagram.mjs';
import { legendeFinale } from './lib/controle.mjs';

const AVANCE_REEL_MIN = 60;
const ESSAIS_MAX = 3;
// Au-delà, un post en retard n'est plus publié : il passerait hors créneau.
const RETARD_MAX_MIN = 90;

const minutes = (n) => n * 60 * 1000;

export async function publier(base, { maintenant = new Date(), aBlanc = false, instagramPour } = {}) {
  const bilan = { conteneurs: 0, publies: 0, attente: 0, echecs: 0, aBlanc: 0 };
  if ((await base.reglage('pause')) === true) {
    console.log('pause générale : rien ne part');
    return bilan;
  }
  const comptes = await base.select('social_comptes', 'select=id,langue,ig_user_id,actif');
  const horizon = new Date(maintenant.getTime() + minutes(AVANCE_REEL_MIN)).toISOString();
  const candidates = await base.select(
    'social_variantes',
    `select=id,post_id,langue,fichiers,legende,hashtags,publier_a,statut,ig_conteneur_id,essais,recette&statut=in.(rendu,conteneur)&publier_a=lte.${horizon}&order=publier_a.asc`,
  );
  for (const v of candidates) {
    const compte = comptes.find((c) => c.langue === v.langue);
    const [post] = await base.select('social_posts', `select=format,statut,jour,creneau&id=eq.${v.post_id}`);
    if (!post || post.statut !== 'valide') continue;
    const due = new Date(v.publier_a) <= maintenant;
    const [jeton] = compte ? await base.select('social_jetons', `select=jeton&compte_id=eq.${compte.id}`) : [];
    // compte pas encore branché : rien ne part, et rien n'est compté en échec
    if (aBlanc || !compte?.actif || !compte?.ig_user_id || !jeton) {
      if (due) {
        bilan.aBlanc++;
        console.log(`à blanc : ${post.jour} ${post.creneau} ${v.langue} (${post.format}) aurait été publié`);
      }
      continue;
    }
    const enRetard = maintenant - new Date(v.publier_a) > minutes(RETARD_MAX_MIN);
    if (enRetard) {
      await base.update('social_variantes', `id=eq.${v.id}`, { statut: 'echec', erreur: 'créneau dépassé sans publication' });
      await base.journal('erreur', 'publication', `${post.jour} ${post.creneau} ${v.langue} : créneau dépassé`, null, v.id);
      bilan.echecs++;
      continue;
    }
    const ig = instagramPour ? instagramPour(jeton.jeton, compte.ig_user_id) : new Instagram(jeton.jeton, compte.ig_user_id);
    try {
      if (v.statut === 'rendu') {
        // une seule exécution prend la main sur la déclinaison
        const pris = await base.update('social_variantes', `id=eq.${v.id}&statut=eq.rendu`, { statut: 'conteneur' });
        if (!pris.length) continue;
        const legende = legendeFinale(v);
        let conteneur;
        if (post.format === 'reel') {
          conteneur = await ig.conteneurReel({
            videoUrl: await base.signer(v.fichiers.reel),
            couvertureUrl: await base.signer(v.fichiers.couverture),
            legende,
            nomDuSon: v.recette?.nomDuSon || 'Quiz Couple',
          });
        } else if (post.format === 'image') {
          if (!due) {
            await base.update('social_variantes', `id=eq.${v.id}`, { statut: 'rendu' });
            continue;
          }
          conteneur = await ig.conteneurImage({ imageUrl: await base.signer(v.fichiers.image), legende });
        } else {
          if (!due) {
            await base.update('social_variantes', `id=eq.${v.id}`, { statut: 'rendu' });
            continue;
          }
          const enfants = [];
          for (const p of v.fichiers.pages) enfants.push((await ig.conteneurElement({ imageUrl: await base.signer(p) })).id);
          conteneur = await ig.conteneurCarrousel({ enfants, legende });
        }
        v.ig_conteneur_id = conteneur.id;
        v.statut = 'conteneur';
        await base.update('social_variantes', `id=eq.${v.id}`, { ig_conteneur_id: conteneur.id });
        bilan.conteneurs++;
      }
      if (v.statut === 'conteneur' && due) {
        const etat = await ig.etat(v.ig_conteneur_id);
        if (etat.code === 'IN_PROGRESS') {
          bilan.attente++;
          continue;
        }
        if (etat.code !== 'FINISHED') throw new Error(`conteneur ${etat.code} : ${etat.detail || ''}`);
        const pris = await base.update('social_variantes', `id=eq.${v.id}&statut=eq.conteneur`, { statut: 'publication' });
        if (!pris.length) continue;
        const media = await ig.publier(v.ig_conteneur_id);
        const lien = await ig.lien(media.id).catch(() => null);
        await base.update('social_variantes', `id=eq.${v.id}`, {
          statut: 'publie',
          ig_media_id: media.id,
          permalien: lien,
          publie_le: new Date().toISOString(),
          erreur: null,
        });
        bilan.publies++;
        await base.journal('info', 'publication', `${post.jour} ${post.creneau} ${v.langue} publié`, { lien }, v.id);
      }
    } catch (e) {
      const essais = (v.essais || 0) + 1;
      const definitif = essais >= ESSAIS_MAX;
      // un échec passager repart du début au passage suivant
      await base.update('social_variantes', `id=eq.${v.id}`, {
        statut: definitif ? 'echec' : 'rendu',
        ig_conteneur_id: null,
        erreur: e.message,
        essais,
      });
      await base.journal(definitif ? 'erreur' : 'alerte', 'publication', `${post.jour} ${post.creneau} ${v.langue} : ${e.message}`, { essais }, v.id);
      if (definitif) bilan.echecs++;
    }
  }
  return bilan;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const base = await connexion();
  console.log(await publier(base, { aBlanc: process.argv.includes('--a-blanc') }));
}
