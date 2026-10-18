// La logique de la fonction `bilan`, sans rien de propre à Deno : le stockage
// et Stripe sont passés en paramètres, ce qui permet de tout essayer en Node
// avec une base en mémoire et un faux Stripe (test/serveur.test.mjs).
//
// Chaque bilan a deux clés, une par partenaire. La page les garde dans la
// partie # du lien (jamais envoyée à un serveur web) ; la base n'en garde que
// l'empreinte SHA-256. La clé d'invitation de B est remplacée dès que B
// rejoint : celui qui a envoyé le lien ne peut plus s'en servir pour lire les
// réponses de l'autre.

import * as C from './coeur.mjs';

export const LANGUES = ['fr', 'en', 'es', 'de', 'it'];
export const SITE = 'https://quiz-couple.com';
// Les adresses de la page, les mêmes que ROUTES.bilanCouple dans
// static-site/build/config.js (test/serveur.test.mjs le vérifie).
export const CHEMINS = {
  fr: '/bilan-de-couple/',
  en: '/en/couple-check-up/',
  es: '/es/chequeo-de-pareja/',
  de: '/de/beziehungs-check/',
  it: '/it/check-up-di-coppia/',
};

// Ce que Stripe affiche sur sa page de paiement, dans la langue de la page.
const PRODUIT = {
  fr: {
    nom: 'Bilan de couple : le rapport complet',
    description: 'Pour vous deux : tous vos écarts avec les deux réponses, les guides pour en parler, vos quatre prochaines conversations et la météo de votre couple.',
    mention: 'TVA non applicable, art. 293 B du CGI. Le rapport s\'ouvre dès le paiement confirmé : vous avez demandé l\'accès immédiat et renoncé au droit de rétractation.',
    garantie: 'Satisfaits ou remboursés pendant {jours} jours : il suffit d\'un message depuis la page contact.',
  },
  en: {
    nom: 'Couple check-up: the full report',
    description: 'For both of you: every difference with both answers, conversation guides, your next four conversations and how your relationship is doing.',
    mention: 'VAT not applicable, art. 293 B of the French tax code. The report opens as soon as payment is confirmed: you asked for immediate access and waived your right of withdrawal.',
    garantie: 'Money-back guarantee for {jours} days: just send us a message from the contact page.',
  },
  es: {
    nom: 'Chequeo de pareja: el informe completo',
    description: 'Para los dos: todas vuestras diferencias con las dos respuestas, guías para hablarlo, vuestras cuatro próximas conversaciones y cómo está vuestra pareja.',
    mention: 'IVA no aplicable, art. 293 B del CGI francés. El informe se abre en cuanto se confirma el pago: habéis pedido el acceso inmediato y renunciado al derecho de desistimiento.',
    garantie: 'Satisfechos o reembolsados durante {jours} días: basta con un mensaje desde la página de contacto.',
  },
  de: {
    nom: 'Beziehungs-Check: der vollständige Bericht',
    description: 'Für euch beide: alle Unterschiede mit beiden Antworten, Gesprächshilfen, eure nächsten vier Gespräche und wie es eurer Beziehung geht.',
    mention: 'Keine Umsatzsteuer gemäß Art. 293 B des französischen Steuergesetzbuchs. Der Bericht öffnet sich, sobald die Zahlung bestätigt ist: Ihr habt den sofortigen Zugang verlangt und auf das Widerrufsrecht verzichtet.',
    garantie: 'Geld-zurück-Garantie für {jours} Tage: Eine Nachricht über die Kontaktseite genügt.',
  },
  it: {
    nom: 'Check-up di coppia: il report completo',
    description: 'Per tutti e due: tutte le differenze con le due risposte, le guide per parlarne, le vostre prossime quattro conversazioni e come sta la vostra coppia.',
    mention: 'IVA non applicabile, art. 293 B del CGI francese. Il report si apre appena il pagamento è confermato: avete chiesto l\'accesso immediato e rinunciato al diritto di recesso.',
    garantie: 'Soddisfatti o rimborsati per {jours} giorni: basta un messaggio dalla pagina dei contatti.',
  },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const JETON = /^[A-Za-z0-9_-]{20,64}$/;
const SESSION = /^cs_[A-Za-z0-9_]{10,200}$/;
// Créations de bilans par adresse IP et par heure.
export const CREATIONS_PAR_HEURE = 10;

// ── Petits outils ───────────────────────────────────────────────────────

export async function empreinte(texte) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function nouveauJeton() {
  const octets = new Uint8Array(24);
  crypto.getRandomValues(octets);
  let s = '';
  for (const o of octets) s += String.fromCharCode(o);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Un prénom : espaces resserrés, sans caractère de contrôle, 1 à 30 signes.
export function prenomPropre(p) {
  if (typeof p !== 'string') return null;
  // eslint-disable-next-line no-control-regex
  const s = p.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim();
  if (s.length < 1 || s.length > 30) return null;
  return s;
}

function genrePropre(g) {
  return g === 'f' || g === 'h' ? g : null;
}

const ok = (json) => ({ statut: 200, json });
const non = (statut, erreur, plus) => ({ statut, json: { erreur, ...(plus || {}) } });

// ── Le serveur ──────────────────────────────────────────────────────────

// stockage : { inserer(ligne), lire(id), maj(id, champs), supprimer(id),
//              compterRecents(ipHash, depuisIso) }
// stripe   : { creerSession(params), lireSession(id) } ou null (paiement fermé)
// stripeTest : clé de test (sk_test_...) ; la page ouvre alors le paiement
//              même tant que le bilan n'est pas ouvert, pour l'essayer.
/** @param {{ stockage: any, stripe?: any, stripeTest?: boolean, sel?: string, maintenant?: () => Date }} options */
export function creerServeur({ stockage, stripe = null, stripeTest = false, sel = '', maintenant = () => new Date() }) {

  async function charger(corps) {
    const id = corps?.id;
    const jeton = corps?.jeton;
    if (typeof id !== 'string' || !UUID.test(id) || typeof jeton !== 'string' || !JETON.test(jeton)) {
      return { erreur: non(400, 'lien') };
    }
    const ligne = await stockage.lire(id);
    if (!ligne) return { erreur: non(404, 'introuvable') };
    const h = await empreinte(jeton);
    const role = h === ligne.a_jeton ? 'a' : h === ligne.b_jeton ? 'b' : null;
    if (!role) return { erreur: non(404, 'introuvable') };
    return { ligne, role };
  }

  function personne(ligne, r) {
    return { prenom: ligne[r + '_prenom'], genre: ligne[r + '_genre'] || null };
  }

  function etatPour(ligne, role) {
    const autre = role === 'a' ? 'b' : 'a';
    const repAutre = ligne[autre + '_reponses'] || {};
    const prog = C.progression(ligne.situation, repAutre);
    return {
      id: ligne.id,
      role,
      lang: ligne.lang,
      situation: ligne.situation,
      creeLe: ligne.cree_le,
      prix: C.PRIX_CENTIMES,
      garantie: C.GARANTIE_JOURS,
      paiementOuvert: !!stripe, paiementTest: !!stripe && stripeTest,
      paye: !!ligne.paye_le,
      verrouille: !!(ligne.a_fini && ligne.b_fini),
      moi: {
        ...personne(ligne, role),
        consent: !!ligne[role + '_consent'],
        reponses: ligne[role + '_reponses'] || {},
        nn: ligne[role + '_nn'] || [],
        fini: !!ligne[role + '_fini'],
      },
      autre: {
        ...personne(ligne, autre),
        rejoint: !!ligne[autre + '_consent'],
        fini: !!ligne[autre + '_fini'],
        repondu: prog.repondu,
        total: prog.total,
      },
    };
  }

  async function creer(corps, ctx) {
    const lang = LANGUES.includes(corps.lang) ? corps.lang : null;
    if (!lang) return non(400, 'lang');
    if (!C.situationValide(corps.situation)) return non(400, 'situation');
    const pa = prenomPropre(corps.moi?.prenom);
    const pb = prenomPropre(corps.autre?.prenom);
    if (!pa || !pb) return non(400, 'prenom');
    if (corps.consentement !== true || corps.majeur !== true) return non(400, 'consentement');

    const ipHash = await empreinte((ctx?.ip || 'inconnue') + '|' + sel);
    const depuis = new Date(maintenant().getTime() - 3600e3).toISOString();
    const recents = await stockage.compterRecents(ipHash, depuis);
    if (recents >= CREATIONS_PAR_HEURE) return non(429, 'trop');

    const jetonA = nouveauJeton();
    const jetonB = nouveauJeton();
    const quand = maintenant().toISOString();
    const ligne = await stockage.inserer({
      lang,
      situation: C.nettoieSituation(corps.situation),
      a_prenom: pa, a_genre: genrePropre(corps.moi?.genre),
      b_prenom: pb, b_genre: genrePropre(corps.autre?.genre),
      a_jeton: await empreinte(jetonA),
      b_jeton: await empreinte(jetonB),
      a_consent: quand,
      ip_hash: ipHash,
      cree_le: quand,
      maj_le: quand,
    });
    return ok({ id: ligne.id, jeton: jetonA, invitation: jetonB, etat: etatPour(ligne, 'a') });
  }

  async function etat(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (!ligne[role + '_consent']) {
      // B arrive par l'invitation : ni réponses ni progression, juste de quoi
      // présenter le bilan et demander son accord.
      return ok({
        id: ligne.id, role, invite: true, lang: ligne.lang, situation: ligne.situation,
        prix: C.PRIX_CENTIMES, garantie: C.GARANTIE_JOURS, paiementOuvert: !!stripe, paiementTest: !!stripe && stripeTest,
        moi: personne(ligne, role), autre: personne(ligne, role === 'a' ? 'b' : 'a'),
      });
    }
    return ok(etatPour(ligne, role));
  }

  async function consentir(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (ligne[role + '_consent']) return non(409, 'deja');
    if (corps.consentement !== true || corps.majeur !== true) return non(400, 'consentement');
    const champs = {};
    if (corps.prenom !== undefined) {
      const p = prenomPropre(corps.prenom);
      if (!p) return non(400, 'prenom');
      champs[role + '_prenom'] = p;
    }
    if (corps.genre !== undefined) champs[role + '_genre'] = genrePropre(corps.genre);
    const jeton = nouveauJeton();
    champs[role + '_jeton'] = await empreinte(jeton);
    champs[role + '_consent'] = maintenant().toISOString();
    champs.maj_le = champs[role + '_consent'];
    const maj = await stockage.maj(ligne.id, champs);
    return ok({ jeton, etat: etatPour(maj, role) });
  }

  async function situation(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (!ligne[role + '_consent']) return non(403, 'consentement');
    if (ligne.a_fini || ligne.b_fini) return non(409, 'fini');
    if (!C.situationValide(corps.situation)) return non(400, 'situation');
    const maj = await stockage.maj(ligne.id, {
      situation: C.nettoieSituation(corps.situation),
      maj_le: maintenant().toISOString(),
    });
    return ok({ etat: etatPour(maj, role) });
  }

  async function repondre(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (!ligne[role + '_consent']) return non(403, 'consentement');
    if (ligne.a_fini && ligne.b_fini) return non(409, 'verrouille');
    const v = C.valideReponses(corps.reponses, corps.nn);
    if (v.erreur) return non(400, v.erreur);
    const complet = C.complet(ligne.situation, v.reponses);
    const dejaFini = !!ligne[role + '_fini'];
    let fini = null;
    if (complet && (corps.fini === true || dejaFini)) {
      fini = dejaFini ? ligne[role + '_fini'] : maintenant().toISOString();
    }
    const maj = await stockage.maj(ligne.id, {
      [role + '_reponses']: v.reponses,
      [role + '_nn']: v.nn,
      [role + '_fini']: fini,
      maj_le: maintenant().toISOString(),
    });
    const prog = C.progression(maj.situation, v.reponses);
    return ok({
      fini: !!fini,
      complet,
      progression: prog,
      etat: etatPour(maj, role),
    });
  }

  async function resultat(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (!ligne[role + '_consent']) return non(403, 'consentement');
    if (!ligne.a_fini || !ligne.b_fini) return non(409, 'pas_fini');
    const base = {
      role,
      lang: ligne.lang,
      situation: ligne.situation,
      prix: C.PRIX_CENTIMES,
      garantie: C.GARANTIE_JOURS,
      paiementOuvert: !!stripe, paiementTest: !!stripe && stripeTest,
      finiLe: ligne.a_fini > ligne.b_fini ? ligne.a_fini : ligne.b_fini,
      payeLe: ligne.paye_le || null,
    };
    if (ligne.paye_le) {
      return ok({
        ...base,
        paye: true,
        a: { ...personne(ligne, 'a'), reponses: ligne.a_reponses || {}, nn: ligne.a_nn || [] },
        b: { ...personne(ligne, 'b'), reponses: ligne.b_reponses || {}, nn: ligne.b_nn || [] },
      });
    }
    const analyse = C.analyser(ligne.situation,
      { reponses: ligne.a_reponses, nn: ligne.a_nn },
      { reponses: ligne.b_reponses, nn: ligne.b_nn });
    return ok({
      ...base,
      paye: false,
      a: personne(ligne, 'a'),
      b: personne(ligne, 'b'),
      resume: C.resumeGratuit(analyse),
    });
  }

  async function payer(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (!ligne[role + '_consent']) return non(403, 'consentement');
    if (!ligne.a_fini || !ligne.b_fini) return non(409, 'pas_fini');
    if (ligne.paye_le) return ok({ paye: true });
    if (!stripe) return non(503, 'paiement_ferme');
    if (corps.renonciation !== true) return non(400, 'renonciation');
    const lang = LANGUES.includes(corps.lang) ? corps.lang : ligne.lang;
    const t = PRODUIT[lang];
    const base = SITE + CHEMINS[lang];
    const message = [t.mention, C.GARANTIE_JOURS > 0 ? C.remplir(t.garantie, { jours: C.GARANTIE_JOURS }) : '']
      .filter(Boolean).join(' ');
    let session;
    try {
      session = await stripe.creerSession({
        mode: 'payment',
        locale: lang,
        client_reference_id: ligne.id,
        success_url: base + '?paiement={CHECKOUT_SESSION_ID}&b=' + ligne.id,
        cancel_url: base + '?annule=1&b=' + ligne.id,
        allow_promotion_codes: 'true',
        metadata: { bilan: ligne.id },
        payment_intent_data: { metadata: { bilan: ligne.id } },
        custom_text: { submit: { message } },
        line_items: [{
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: C.PRIX_CENTIMES,
            product_data: { name: t.nom, description: t.description },
          },
        }],
      });
    } catch (e) {
      return non(502, 'stripe', { detail: String(e.message || e).slice(0, 200) });
    }
    await stockage.maj(ligne.id, {
      renonciation_le: maintenant().toISOString(),
      paiement_session: session.id,
    });
    return ok({ url: session.url });
  }

  // Une session Stripe payée débloque le bilan qu'elle porte en métadonnée.
  async function marquerPaye(session) {
    const id = session?.metadata?.bilan || session?.client_reference_id;
    if (typeof id !== 'string' || !UUID.test(id)) return false;
    if (session.payment_status !== 'paid') return false;
    const ligne = await stockage.lire(id);
    if (!ligne) return false;
    if (ligne.paye_le) return true;
    await stockage.maj(id, {
      paye_le: maintenant().toISOString(),
      paiement_session: session.id,
      paiement_montant: Number.isInteger(session.amount_total) ? session.amount_total : null,
      // Le bilan payé est gardé six mois à partir d'ici (bilan_menage).
      maj_le: maintenant().toISOString(),
    });
    return true;
  }

  async function verifier(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne } = c;
    if (ligne.paye_le) return ok({ paye: true });
    if (!stripe) return non(503, 'paiement_ferme');
    const s = corps.session;
    if (typeof s !== 'string' || !SESSION.test(s)) return non(400, 'session');
    let session;
    try {
      session = await stripe.lireSession(s);
    } catch (e) {
      return non(502, 'stripe', { detail: String(e.message || e).slice(0, 200) });
    }
    if (session?.metadata?.bilan !== ligne.id) return non(400, 'session');
    const paye = await marquerPaye(session);
    return ok({ paye });
  }

  async function supprimer(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    await stockage.supprimer(c.ligne.id);
    return ok({ supprime: true });
  }

  const ACTIONS = { creer, etat, consentir, situation, repondre, resultat, payer, verifier, supprimer };

  async function traiter(corps, ctx) {
    if (!corps || typeof corps !== 'object') return non(400, 'corps');
    const action = ACTIONS[corps.action];
    if (!action) return non(400, 'action');
    return action(corps, ctx);
  }

  return { traiter, marquerPaye };
}

// Le webhook de Stripe (fonction bilan-stripe). `verifier` est la fonction de
// vérification de signature (stripe.mjs), passée pour garder ce fichier sans
// dépendance.
export async function traiterWebhook({ corps, signature, secret, verifierSignature, marquerPaye }) {
  if (!secret) return { statut: 503, json: { erreur: 'secret' } };
  const valide = await verifierSignature(corps, signature, secret);
  if (!valide) return { statut: 400, json: { erreur: 'signature' } };
  let evenement;
  try { evenement = JSON.parse(corps); } catch { return { statut: 400, json: { erreur: 'json' } }; }
  const type = evenement?.type;
  if (type === 'checkout.session.completed' || type === 'checkout.session.async_payment_succeeded') {
    const marque = await marquerPaye(evenement.data?.object);
    return { statut: 200, json: { recu: true, marque } };
  }
  return { statut: 200, json: { recu: true, ignore: type || null } };
}
