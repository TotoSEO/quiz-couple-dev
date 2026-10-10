// Publication : passe toutes les 10 minutes (GitHub Actions).
//  1. Une heure avant l'heure prévue, crée le conteneur Instagram d'un reel
//     (Instagram met quelques minutes à traiter la vidéo), avec un son
//     tendance de la bibliothèque Instagram attaché (Audio API).
//  2. À l'heure prévue, vérifie que le conteneur est prêt et publie.
//  3. Le reel du matin est repris en story (media_type STORIES) : le conteneur
//     part juste après la publication du reel, la story est publiée au passage
//     suivant, quand Instagram a traité la vidéo (publierStories).
// Une image ou un carrousel se prépare et se publie dans le même passage.
//  4. Ce qui vient d'être publié sur Instagram part aussi sur la Page Facebook
//     reliée, si le compte le demande (publierFacebook) : le partage
//     automatique d'Instagram vers Facebook ne joue pas pour l'API.
// Rien ne part si la pause générale est active, si le compte n'est pas
// actif ou s'il n'a pas de jeton : la déclinaison attend, sans erreur.
//
//   node reseaux/automates/publication.mjs [--a-blanc]
import { fileURLToPath } from 'node:url';
import { connexion } from './lib/supabase.mjs';
import { Instagram } from './lib/instagram.mjs';
import { PageFacebook } from './lib/facebook.mjs';
import { legendeFinale } from './lib/controle.mjs';
import { VOLUME_MUSIQUE, VOLUME_VIDEO, ambianceDuReel, choisirSon, requetePour, sonsRecents } from './lib/son.mjs';

const AVANCE_REEL_MIN = 60;
const ESSAIS_MAX = 3;
// Au-delà, un post en retard n'est plus publié : il passerait hors créneau.
const RETARD_MAX_MIN = 90;

const minutes = (n) => n * 60 * 1000;

// Le son d'un reel : celui déjà choisi (reprise après un échec passager),
// sinon un son de la bibliothèque Instagram qui va avec l'image : la
// recette dit une ambiance (ou la catégorie du post en donne une), et on
// cherche dans la bibliothèque avec les mots de cette ambiance ; une
// recherche écrite en toutes lettres dans la recette l'emporte ; l'ambiance
// « tendance » lit les tendances du moment. Jamais un son posé récemment
// sur le compte. Une recette qui porte une musique mixée dans la vidéo n'en
// reçoit pas de second. Sans son (API en panne, liste vide), le reel part
// avec ses seuls bruitages : on ne rate pas un créneau pour une musique.
async function sonDuReel(ig, base, v, tendances, categorie) {
  const r = v.recette || {};
  if (r.musique) return null;
  if (r.son?.id) return r.son;
  const ambiance = ambianceDuReel(r, categorie);
  const recherche = String(r.son?.recherche || '').trim() || requetePour(ambiance, v.id);
  const lire = (q) => {
    const cle = `${v.langue}|${q}`;
    if (!tendances.has(cle)) tendances.set(cle, ig.sons(q ? { recherche: q } : {}));
    return tendances.get(cle);
  };
  let candidats;
  try {
    candidats = await lire(recherche);
    // la recherche ne rend rien : les tendances plutôt qu'aucun son
    if (recherche && !candidats.length) {
      await base.journal('alerte', 'publication', `aucun son pour « ${recherche} » (${ambiance}), tendances à la place`, null, v.id);
      candidats = await lire('');
    }
  } catch (e) {
    await base.journal('alerte', 'publication', `sons indisponibles, reel envoyé avec ses bruitages : ${e.message}`, null, v.id);
    return null;
  }
  const son = choisirSon({ candidats, recents: await sonsRecents(base, v.langue), dureeS: Number(v.fichiers?.duree) || 0, graine: v.id });
  if (!son) {
    await base.journal('alerte', 'publication', 'aucun son disponible, reel envoyé avec ses bruitages', null, v.id);
    return null;
  }
  const choisi = { ...son, ambiance, ...(recherche ? { recherche } : {}) };
  v.recette = { ...r, son: choisi };
  await base.update('social_variantes', `id=eq.${v.id}`, { recette: v.recette });
  return choisi;
}

// Le nom du son original d'un reel sans musique, selon le compte.
const NOM_DU_SON = { fr: 'Les mipaps' };

export async function publier(base, { maintenant = new Date(), aBlanc = false, instagramPour, facebookPour } = {}) {
  const bilan = { conteneurs: 0, publies: 0, attente: 0, echecs: 0, aBlanc: 0 };
  if ((await base.reglage('pause')) === true) {
    console.log('pause générale : rien ne part');
    return bilan;
  }
  const comptes = await base.select('social_comptes', 'select=id,langue,ig_user_id,actif,facebook,page_id');
  const horizon = new Date(maintenant.getTime() + minutes(AVANCE_REEL_MIN)).toISOString();
  const candidates = await base.select(
    'social_variantes',
    `select=id,post_id,langue,fichiers,legende,hashtags,publier_a,statut,ig_conteneur_id,essais,recette&statut=in.(rendu,conteneur)&publier_a=lte.${horizon}&order=publier_a.asc`,
  );
  // les tendances sont lues une fois par passage et par compte
  const tendances = new Map();
  for (const v of candidates) {
    const compte = comptes.find((c) => c.langue === v.langue);
    const [post] = await base.select('social_posts', `select=format,statut,jour,creneau,categorie&id=eq.${v.post_id}`);
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
      // un créneau dépassé n'est pas un échec de rendu : les essais sont mis
      // au maximum pour que la synchro ne remette pas la déclinaison en
      // a_rendre à chaque passage (le 9 octobre 2026, trois posts manqués
      // auraient été re-rendus toutes les heures jusqu'à minuit)
      await base.update('social_variantes', `id=eq.${v.id}`, { statut: 'echec', erreur: 'créneau dépassé sans publication', essais: ESSAIS_MAX });
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
          const son = await sonDuReel(ig, base, v, tendances, post.categorie);
          const params = {
            videoUrl: await base.signer(v.fichiers.reel),
            couvertureUrl: await base.signer(v.fichiers.couverture),
            legende,
            nomDuSon: v.recette?.nomDuSon || NOM_DU_SON[v.langue] || 'Quiz Couple',
          };
          try {
            conteneur = await ig.conteneurReel({ ...params, son: son && { id: son.id, volume: VOLUME_MUSIQUE, volumeVideo: VOLUME_VIDEO, boucle: son.boucle } });
          } catch (e) {
            if (!son) throw e;
            // le son n'est plus autorisé, ou l'API le refuse : le reel part
            // avec ses bruitages plutôt que de manquer son créneau
            await base.journal('alerte', 'publication', `son « ${son.titre} » refusé, reel envoyé avec ses bruitages : ${e.message}`, null, v.id);
            v.recette = { ...v.recette, son: son.recherche ? { recherche: son.recherche } : undefined };
            await base.update('social_variantes', `id=eq.${v.id}`, { recette: v.recette });
            conteneur = await ig.conteneurReel(params);
          }
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
          publie_le: maintenant.toISOString(),
          erreur: null,
          // le reel du matin est repris en story
          story_statut: post.format === 'reel' && post.creneau === 'matin' ? 'a_faire' : null,
          // et tout part aussi sur la Page Facebook reliée, si le compte le demande
          fb_statut: compte.facebook && compte.page_id ? 'a_faire' : null,
          fb_erreur: null,
          fb_essais: 0,
        });
        bilan.publies++;
        const son = v.recette?.son?.id ? `, son « ${v.recette.son.titre}${v.recette.son.artiste ? ` » de ${v.recette.son.artiste}` : ' »'}` : '';
        await base.journal('info', 'publication', `${post.jour} ${post.creneau} ${v.langue} publié${son}`, { lien, son: v.recette?.son || null }, v.id);
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
  bilan.stories = await publierStories(base, { maintenant, instagramPour });
  bilan.facebook = aBlanc ? { publies: 0, echecs: 0 } : await publierFacebook(base, { maintenant, facebookPour });
  return bilan;
}

// La story du matin : le reel publié le matin repart tel quel en story (24 h),
// deuxième surface sans rien écrire de plus. Un reel de plus de 60 s ne peut
// pas devenir une story ; les autres créneaux n'en ont pas.
export async function publierStories(base, { maintenant = new Date(), instagramPour } = {}) {
  const bilan = { conteneurs: 0, publiees: 0, attente: 0, echecs: 0 };
  const depuis = new Date(maintenant.getTime() - 24 * 3600 * 1000).toISOString();
  const lignes = await base.select(
    'social_variantes',
    `select=id,langue,fichiers,story_statut,story_conteneur_id,publie_le&story_statut=in.(a_faire,conteneur)&publie_le=gte.${depuis}`,
  );
  if (!lignes.length) return bilan;
  const comptes = await base.select('social_comptes', 'select=id,langue,ig_user_id,actif');
  for (const v of lignes) {
    const compte = comptes.find((c) => c.langue === v.langue);
    const [jeton] = compte ? await base.select('social_jetons', `select=jeton&compte_id=eq.${compte.id}`) : [];
    if (!compte?.actif || !compte?.ig_user_id || !jeton) continue;
    const ig = instagramPour ? instagramPour(jeton.jeton, compte.ig_user_id) : new Instagram(jeton.jeton, compte.ig_user_id);
    try {
      if (v.story_statut === 'a_faire') {
        if (!v.fichiers?.reel) throw new Error('fichier du reel absent');
        if (Number(v.fichiers.duree) > 60) throw new Error(`reel de ${v.fichiers.duree} s, une story dure 60 s au plus`);
        const pris = await base.update('social_variantes', `id=eq.${v.id}&story_statut=eq.a_faire`, { story_statut: 'conteneur' });
        if (!pris.length) continue;
        const c = await ig.conteneurStory({ videoUrl: await base.signer(v.fichiers.reel) });
        await base.update('social_variantes', `id=eq.${v.id}`, { story_conteneur_id: c.id });
        bilan.conteneurs++;
        continue; // Instagram traite la vidéo : la story part au passage suivant
      }
      if (v.story_statut === 'conteneur' && v.story_conteneur_id) {
        const etat = await ig.etat(v.story_conteneur_id);
        if (etat.code === 'IN_PROGRESS') {
          bilan.attente++;
          continue;
        }
        if (etat.code !== 'FINISHED') throw new Error(`conteneur ${etat.code} : ${etat.detail || ''}`);
        const pris = await base.update('social_variantes', `id=eq.${v.id}&story_statut=eq.conteneur`, { story_statut: 'publication' });
        if (!pris.length) continue;
        const media = await ig.publier(v.story_conteneur_id);
        await base.update('social_variantes', `id=eq.${v.id}`, { story_statut: 'publie', story_media_id: media.id, story_publie_le: maintenant.toISOString() });
        bilan.publiees++;
        await base.journal('info', 'publication', `story du matin publiée (${v.langue})`, { media: media.id }, v.id);
      }
    } catch (e) {
      await base.update('social_variantes', `id=eq.${v.id}`, { story_statut: 'echec' });
      await base.journal('alerte', 'publication', `story du matin non publiée : ${e.message}`, null, v.id);
      bilan.echecs++;
    }
  }
  return bilan;
}

// La Page Facebook : ce qui vient d'être publié sur Instagram part aussi sur
// la Page reliée, avec le même jeton de Page (il lui faut pages_manage_posts
// et publish_video). Reel en reel Facebook, image en photo, carrousel en
// publication à plusieurs photos, et le reel du matin aussi en story de la
// Page. Jamais au détriment d'Instagram : la publication Instagram est déjà
// faite quand on arrive ici, et un échec Facebook ne la touche pas. Trois
// essais, un par passage, puis « echec » et une erreur au journal.
const FB_ESSAIS_MAX = 3;
export async function publierFacebook(base, { maintenant = new Date(), facebookPour } = {}) {
  const bilan = { publies: 0, stories: 0, echecs: 0 };
  const depuis = new Date(maintenant.getTime() - 24 * 3600 * 1000).toISOString();
  const lignes = await base.select(
    'social_variantes',
    `select=id,post_id,langue,fichiers,legende,hashtags,fb_statut,fb_essais,publie_le&fb_statut=eq.a_faire&publie_le=gte.${depuis}`,
  );
  if (!lignes.length) return bilan;
  const comptes = await base.select('social_comptes', 'select=id,langue,actif,facebook,page_id');
  for (const v of lignes) {
    const compte = comptes.find((c) => c.langue === v.langue);
    const [jeton] = compte ? await base.select('social_jetons', `select=jeton&compte_id=eq.${compte.id}`) : [];
    if (!compte?.actif || !compte.facebook || !compte.page_id || !jeton) continue;
    const [post] = await base.select('social_posts', `select=format,jour,creneau&id=eq.${v.post_id}`);
    if (!post) continue;
    const fb = facebookPour ? facebookPour(jeton.jeton, compte.page_id) : new PageFacebook(jeton.jeton, compte.page_id);
    const pris = await base.update('social_variantes', `id=eq.${v.id}&fb_statut=eq.a_faire`, { fb_statut: 'en_cours' });
    if (!pris.length) continue;
    const ou = `${post.jour} ${post.creneau} ${v.langue}`;
    try {
      const legende = legendeFinale(v);
      let r;
      if (post.format === 'reel') r = await fb.reel({ videoUrl: await base.signer(v.fichiers.reel), legende });
      else if (post.format === 'image') r = await fb.photo({ imageUrl: await base.signer(v.fichiers.image), legende });
      else {
        const imageUrls = [];
        for (const p of v.fichiers.pages) imageUrls.push(await base.signer(p));
        r = await fb.album({ imageUrls, legende });
      }
      await base.update('social_variantes', `id=eq.${v.id}`, { fb_statut: 'publie', fb_id: r.id, fb_lien: r.lien, fb_erreur: null, fb_publie_le: maintenant.toISOString() });
      bilan.publies++;
      await base.journal('info', 'publication', `${ou} publié sur la Page Facebook`, { lien: r.lien }, v.id);
      // le reel du matin repart aussi en story de la Page ; un échec ici ne
      // remet pas le reel en jeu, il est déjà publié
      if (post.format === 'reel' && post.creneau === 'matin' && Number(v.fichiers?.duree) <= 60) {
        try {
          const st = await fb.story({ videoUrl: await base.signer(v.fichiers.reel) });
          await base.update('social_variantes', `id=eq.${v.id}`, { fb_story_id: st.id });
          bilan.stories++;
        } catch (e) {
          await base.journal('alerte', 'publication', `${ou} : story Facebook non publiée : ${e.message}`, null, v.id);
        }
      }
    } catch (e) {
      const essais = (v.fb_essais || 0) + 1;
      const definitif = essais >= FB_ESSAIS_MAX;
      await base.update('social_variantes', `id=eq.${v.id}`, { fb_statut: definitif ? 'echec' : 'a_faire', fb_erreur: e.message, fb_essais: essais });
      await base.journal(definitif ? 'erreur' : 'alerte', 'publication', `${ou} : Page Facebook : ${e.message}`, { essais }, v.id);
      if (definitif) bilan.echecs++;
    }
  }
  return bilan;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const base = await connexion();
  console.log(await publier(base, { aBlanc: process.argv.includes('--a-blanc') }));
}
