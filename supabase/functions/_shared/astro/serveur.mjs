// Le thème astral de couple, côté serveur : la commande, le paiement, le
// rapport. JavaScript pur, testé en Node (test/serveur.test.mjs) et branché
// sur la base, Stripe et Resend par ../../astro/index.ts.
//
// Une commande (table astro_rapports) garde les deux prénoms, les genres, les
// dates et heures de naissance et le fuseau, rien d'autre ; le jeton qui
// l'ouvre ne vit que dans l'adresse du rapport (#r=<id>&t=<jeton>) et dans le
// navigateur, la base n'en garde que l'empreinte. Le rapport se calcule à
// chaque lecture (ciel.mjs, le même calcul que la page) et ne sort qu'une fois
// la commande payée. Prix : PRIX_CENTIMES, ou celui d'une région
// (PRIX_REGIONS, l'Amérique latine comme le point sur ma relation).
import { cielDuCouple, dateValide, heureValide, fuseauValide } from './ciel.mjs';
import { assembler } from './rapport.mjs';
import { messageAstro } from './courriel.mjs';
import { creerPaiement, emailPropre, UUID } from './paiement.mjs';

export const PRIX_CENTIMES = 490;
export const PRIX_REGIONS = { latam: 199 };
export const LANGUES = ['fr'];
export const SITE = 'https://quiz-couple.com';
export const CHEMINS = { fr: '/theme-astral-couple/' };
export const ETAPES = ['page_vue', 'page_vue_test', 'ciel_vu', 'paiement_clic', 'rapport_vu', 'carte_vue', 'carte_clic'];
const SESSION = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;
const JETON = /^[A-Za-z0-9_-]{20,64}$/;

const PRODUIT = {
  fr: {
    nom: 'Thème astral de couple',
    description: 'Votre thème astral de couple, en ligne : votre carte du ciel à deux, vos dix planètes lues une par une, les liens entre vos thèmes, vos signes chinois, vos chemins de vie et vos 12 prochains mois.',
    mention: "TVA non applicable, art. 293 B du CGI. Le rapport s'affiche dès le paiement confirmé : vous avez demandé l'exécution immédiate et renoncé au droit de rétractation.",
  },
};

export function zoneValide(zone) {
  return typeof zone === 'string' && Object.prototype.hasOwnProperty.call(PRIX_REGIONS, zone) ? zone : '';
}
export function prixPour(zone) { return zoneValide(zone) ? PRIX_REGIONS[zone] : PRIX_CENTIMES; }

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
export function prenomPropre(p) {
  const s = String(p || '').normalize('NFC').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim();
  return s.slice(0, 30);
}
export { emailPropre };

// Une personne envoyée par la page : prénom, genre (f ou m), date, heure
// facultative, fuseau. null si quelque chose ne va pas.
export function personnePropre(p, maintenant) {
  if (!p || typeof p !== 'object') return null;
  const prenom = prenomPropre(p.prenom);
  if (!prenom) return null;
  const genre = p.genre === 'f' || p.genre === 'm' ? p.genre : null;
  if (!genre) return null;
  if (!dateValide(p.date)) return null;
  if (new Date(p.date + 'T00:00:00Z') > maintenant) return null;
  const heure = p.heure == null || p.heure === '' ? null : heureValide(p.heure) ? p.heure : undefined;
  if (heure === undefined) return null;
  const fuseau = fuseauValide(p.fuseau) ? p.fuseau : 'Europe/Paris';
  return { prenom, genre, date: p.date, heure, fuseau };
}

export function creerServeur({ stockage, stripe = null, courriel = null, textes, maintenant = () => new Date() }) {
  const ok = (json) => ({ statut: 200, json });
  const non = (statut, erreur, plus) => ({ statut, json: { erreur, ...(plus || {}) } });

  async function compter(etape) {
    try { await stockage.compter(etape); } catch (e) { console.warn('[astro] compteur', String(e.message || e).slice(0, 120)); }
  }

  async function charger(corps) {
    const id = typeof corps.id === 'string' && UUID.test(corps.id) ? corps.id : '';
    const jeton = typeof corps.jeton === 'string' && JETON.test(corps.jeton) ? corps.jeton : '';
    if (!id || !jeton) return { erreur: non(400, 'lien') };
    const ligne = await stockage.lire(id);
    if (!ligne || ligne.jeton_hash !== await empreinte(jeton)) return { erreur: non(404, 'introuvable') };
    return { ligne };
  }

  async function vue(corps) {
    if (!ETAPES.includes(corps.etape)) return non(400, 'etape');
    await compter(corps.etape);
    return ok({ ok: true });
  }

  async function creer(corps) {
    const lang = LANGUES.includes(corps.lang) ? corps.lang : 'fr';
    const m = maintenant();
    const ps = Array.isArray(corps.personnes) ? corps.personnes.slice(0, 2).map((p) => personnePropre(p, m)) : [];
    if (ps.length !== 2 || ps.some((p) => !p)) return non(400, 'personnes');
    const jeton = nouveauJeton();
    const ligne = await stockage.inserer({
      lang,
      jeton_hash: await empreinte(jeton),
      a_prenom: ps[0].prenom, a_genre: ps[0].genre, a_date: ps[0].date, a_heure: ps[0].heure, a_fuseau: ps[0].fuseau,
      b_prenom: ps[1].prenom, b_genre: ps[1].genre, b_date: ps[1].date, b_heure: ps[1].heure, b_fuseau: ps[1].fuseau,
      source: corps.source === 'test' ? 'test' : 'direct',
      zone: zoneValide(corps.zone) || null,
    });
    return ok({ id: ligne.id, jeton });
  }

  async function payer(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne } = c;
    if (ligne.paye_le) return ok({ paye: true });
    if (!stripe) return non(503, 'paiement_ferme');
    if (corps.majeur !== true || corps.renonciation !== true) return non(400, 'cases');
    const lang = LANGUES.includes(ligne.lang) ? ligne.lang : 'fr';
    const t = PRODUIT[lang] || PRODUIT.fr;
    const zone = zoneValide(corps.zone) || zoneValide(ligne.zone);
    const base = SITE + (CHEMINS[lang] || CHEMINS.fr);
    const metadata = { astro: ligne.id, ...(zone ? { zone } : {}) };
    let session;
    try {
      session = await stripe.creerSession({
        mode: 'payment',
        locale: lang,
        success_url: base + '?paiement={CHECKOUT_SESSION_ID}&r=' + ligne.id,
        cancel_url: base + '?annule=1&r=' + ligne.id,
        metadata,
        payment_intent_data: { metadata },
        custom_text: { submit: { message: t.mention } },
        line_items: [{
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: prixPour(zone),
            product_data: { name: t.nom + ' · ' + ligne.a_prenom + ' & ' + ligne.b_prenom, description: t.description },
          },
        }],
      });
    } catch (e) {
      return non(502, 'stripe', { detail: String(e.message || e).slice(0, 200) });
    }
    await stockage.maj(ligne.id, {
      renonciation_le: maintenant().toISOString(),
      paiement_session: session.id,
      zone: zone || null,
    });
    return ok({ url: session.url, total: Number.isInteger(session.amount_total) ? session.amount_total : null });
  }

  const { marquerPaye, marquerRembourse } = creerPaiement({ stockage, maintenant });

  // Le lien du rapport, envoyé une seule fois, au premier passage qui
  // connaît le jeton (la page, au retour de Stripe) : le webhook, lui, ne
  // connaît pas le jeton, que la base ne garde pas.
  async function envoyerLien(ligne, jeton) {
    if (!courriel || !ligne.paiement_email || ligne.lien_envoye_le) return false;
    const lang = LANGUES.includes(ligne.lang) ? ligne.lang : 'fr';
    const url = SITE + (CHEMINS[lang] || CHEMINS.fr) + '#r=' + ligne.id + '&t=' + jeton;
    const m = messageAstro({ lang, a: ligne.a_prenom, b: ligne.b_prenom, url });
    try {
      await courriel.envoyer({ a: ligne.paiement_email, sujet: m.sujet, html: m.html, texte: m.texte, lang });
      await stockage.maj(ligne.id, { lien_envoye_le: maintenant().toISOString() });
      return true;
    } catch (e) {
      console.warn('[astro] e-mail', String(e.message || e).slice(0, 160));
      return false;
    }
  }

  async function verifier(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    let { ligne } = c;
    if (!ligne.paye_le) {
      if (!stripe) return non(503, 'paiement_ferme');
      const s = typeof corps.session === 'string' && SESSION.test(corps.session) ? corps.session : ligne.paiement_session;
      if (!s) return ok({ paye: false });
      let session;
      try { session = await stripe.lireSession(s); } catch (e) { return non(502, 'stripe'); }
      if (session?.metadata?.astro !== ligne.id) return non(400, 'session');
      await marquerPaye(session);
      ligne = await stockage.lire(ligne.id);
    }
    if (ligne.paye_le) await envoyerLien(ligne, corps.jeton);
    return ok({ paye: !!ligne.paye_le });
  }

  function cielDe(ligne) {
    return cielDuCouple([
      { date: ligne.a_date, heure: ligne.a_heure, fuseau: ligne.a_fuseau },
      { date: ligne.b_date, heure: ligne.b_heure, fuseau: ligne.b_fuseau },
    ], new Date(ligne.paye_le || ligne.cree_le || maintenant()));
  }

  async function rapport(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne } = c;
    if (!ligne.paye_le) return non(402, 'non_paye');
    const lang = LANGUES.includes(ligne.lang) ? ligne.lang : 'fr';
    const personnes = [
      { prenom: ligne.a_prenom, genre: ligne.a_genre, date: ligne.a_date, heure: ligne.a_heure },
      { prenom: ligne.b_prenom, genre: ligne.b_genre, date: ligne.b_date, heure: ligne.b_heure },
    ];
    const ciel = cielDe(ligne);
    return ok({ rapport: assembler({ ciel, personnes, lang, textes: textes[lang] || textes.fr, date: ligne.paye_le }) });
  }

  // Le droit à l'effacement, depuis le rapport.
  async function supprimer(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    await stockage.supprimer(c.ligne.id);
    return ok({ supprime: true });
  }

  const ACTIONS = { vue, creer, payer, verifier, rapport, supprimer };
  async function traiter(corps) {
    if (!corps || typeof corps !== 'object') return non(400, 'corps');
    const action = ACTIONS[corps.action];
    if (!action) return non(400, 'action');
    return action(corps);
  }
  return { traiter, marquerPaye, marquerRembourse };
}
