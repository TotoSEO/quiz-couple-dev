// Le lien du rapport du thème astral, envoyé par e-mail une seule fois après
// le paiement, par le premier des deux qui le peut :
// - la page, au retour de Stripe (verifier), avec le jeton qu'elle garde ;
// - le webhook de Stripe (bilan-stripe), qui ne connaît pas ce jeton (la base
//   n'en garde que l'empreinte) : il en tire un à lui, gardé en empreinte
//   dans jeton_mail_hash, et le rapport s'ouvre avec l'un ou l'autre.
// Sans le webhook, un acheteur qui fermait l'onglet pendant la redirection de
// Stripe avait payé sans jamais recevoir son lien. L'envoi est réservé en base
// (lien_envoye_le n'est posé que s'il est vide, reserverEnvoi), si bien que
// les deux chemins ne l'envoient jamais deux fois ; si Resend refuse, la
// réservation est rendue et l'autre chemin peut réessayer.
//
// Module léger, chargé aussi par le webhook : ni éphémérides ni textes du
// rapport.
import { messageAstro } from './courriel.mjs';

// Les langues où la page existe, et son adresse dans chacune : les mêmes
// que ROUTE_SLUGS.themeAstral de static-site/build/config.js. Une langue
// n'entre ici qu'avec sa page, ses textes du rapport (textes/<langue>/) et
// son e-mail (courriel.mjs) ; une commande dans une autre langue passe en
// français. À venir : es /es/carta-astral-de-pareja/, de /de/partnerhoroskop/,
// it /it/tema-natale-di-coppia/, nl /nl/relatiehoroscoop/.
export const LANGUES = ['fr', 'en'];
export const SITE = 'https://quiz-couple.com';
export const CHEMINS = { fr: '/theme-astral-couple/', en: '/en/couples-birth-chart/' };

export async function empreinte(texte) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(texte)));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function nouveauJeton() {
  const o = new Uint8Array(24);
  crypto.getRandomValues(o);
  let s = '';
  for (const b of o) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function adresseRapport(ligne, jeton) {
  const lang = LANGUES.includes(ligne.lang) ? ligne.lang : 'fr';
  return SITE + (CHEMINS[lang] || CHEMINS.fr) + '#r=' + ligne.id + '&t=' + jeton;
}

// envoyerLien(ligne, jeton) : jeton est celui de la page ; sans lui (le
// webhook), un jeton propre à l'e-mail est tiré. Rend vrai si l'e-mail est
// parti par cet appel ; ne lève jamais d'erreur.
export function creerEnvoiLien({ stockage, courriel, maintenant = () => new Date() }) {
  return async function envoyerLien(ligne, jeton) {
    if (!courriel || !ligne || !ligne.paye_le || !ligne.paiement_email || ligne.lien_envoye_le) return false;
    if (!stockage.reserverEnvoi) { console.warn('[astro] stockage sans reserverEnvoi : aucun e-mail'); return false; }
    // La base qui ne répond pas n'arrête ni la page ni le webhook : l'e-mail
    // ne part pas, et l'autre chemin pourra réessayer.
    let reserve = false;
    try { reserve = await stockage.reserverEnvoi(ligne.id, maintenant().toISOString()); } catch (e) {
      console.warn('[astro] réservation', String((e && e.message) || e).slice(0, 160));
      return false;
    }
    if (!reserve) return false;
    try {
      let t = jeton;
      if (!t) {
        t = nouveauJeton();
        await stockage.maj(ligne.id, { jeton_mail_hash: await empreinte(t) });
      }
      const lang = LANGUES.includes(ligne.lang) ? ligne.lang : 'fr';
      const m = messageAstro({ lang, a: ligne.a_prenom, b: ligne.b_prenom, url: adresseRapport(ligne, t) });
      await courriel.envoyer({ a: ligne.paiement_email, sujet: m.sujet, html: m.html, texte: m.texte, lang });
      return true;
    } catch (e) {
      console.warn('[astro] e-mail', String((e && e.message) || e).slice(0, 160));
      try { await stockage.maj(ligne.id, { lien_envoye_le: null }); } catch (e2) { /* la réservation reste : on ne renverra pas */ }
      return false;
    }
  };
}
