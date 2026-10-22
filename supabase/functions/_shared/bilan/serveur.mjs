// La logique de la fonction `bilan`, sans rien de propre à Deno : le stockage,
// Stripe et l'envoi des e-mails sont passés en paramètres, ce qui permet de
// tout essayer en Node avec une base en mémoire, un faux Stripe et une fausse
// boîte aux lettres (test/serveur.test.mjs).
//
// Chaque bilan a deux clés, une par partenaire. La page les garde dans la
// partie # du lien (jamais envoyée à un serveur web) ; la base n'en garde que
// l'empreinte SHA-256. La clé d'invitation de B est remplacée dès que B
// rejoint : celui qui a envoyé le lien ne peut plus s'en servir pour lire les
// réponses de l'autre.
//
// Aucun résultat sans paiement (Thomas, 18 octobre 2026 : « Si tu veux avoir
// les résultats, tu payes. Point barre. »). Chacun peut payer dès qu'il a
// fini ses propres réponses ; le rapport s'ouvre quand les deux ont fini, et
// le PDF part par e-mail (fabrique : bilan/fabrique.mjs).
//
// Deux modes (coeur.mjs, MODES) : « duo », les deux répondent ; « solo », une
// seule personne répond pour elle et dit ce que l'autre répondrait d'après
// elle (a_percu). En solo il n'y a pas d'invitation : la clé de B est tirée
// au hasard et jamais rendue, le bilan est figé dès que A a fini, et le
// rapport ne part qu'à A.

import * as C from './coeur.mjs';
import { emailPropre, masquerEmail, messageRapport, messageLien, messagePret, messageRelance, nomFichier } from './courriel.mjs';

export const LANGUES = ['fr', 'en', 'es', 'de', 'it'];
export const SITE = 'https://quiz-couple.com';
// Les adresses de la page, les mêmes que ROUTES.bilanCouple dans
// static-site/build/config.js (test/serveur.test.mjs le vérifie).
export const CHEMINS = {
  fr: '/evaluation-de-couple/',
  en: '/en/relationship-assessment/',
  es: '/es/evaluacion-de-pareja/',
  de: '/de/beziehungsanalyse/',
  it: '/it/valutazione-di-coppia/',
};

// Ce que Stripe affiche sur sa page de paiement, dans la langue de la page.
// `description` pour une évaluation à deux, `descriptionSolo` pour une
// évaluation faite seul(e) ; `mention` et `mentionSolo` de même.
const PRODUIT = {
  fr: {
    nom: 'Évaluation de couple : le rapport complet',
    description: 'Pour vous deux : le rapport complet de votre évaluation de couple, en PDF par e-mail et en ligne. Vos accords, vos écarts avec les deux réponses, les signaux de vigilance, le climat de votre couple et vos quatre prochaines conversations.',
    descriptionSolo: 'Le rapport complet de votre évaluation de couple, faite seul(e), en PDF par e-mail et en ligne : votre regard sur votre relation, sujet par sujet, les écarts que vous percevez, vos zones d\'ombre, les signaux de vigilance et par où commencer.',
    mention: 'TVA non applicable, art. 293 B du CGI. Le rapport est fourni dès le paiement confirmé et dès que vous avez fini tous les deux : vous avez demandé l\'exécution immédiate et renoncé au droit de rétractation.',
    mentionSolo: 'TVA non applicable, art. 293 B du CGI. Le rapport est fourni dès le paiement confirmé : vous avez demandé l\'exécution immédiate et renoncé au droit de rétractation.',
  },
  en: {
    nom: 'Relationship assessment: the full report',
    description: 'For both of you: the full report of your relationship assessment, as a PDF by email and online. Where you agree, every difference with both answers, the warning signs, the climate of your relationship and your next four conversations.',
    descriptionSolo: 'The full report of your relationship assessment, done on your own, as a PDF by email and online: your view of your relationship topic by topic, the gaps you perceive, your blind spots, the warning signs and where to start.',
    mention: 'VAT not applicable, art. 293 B of the French tax code. The report is provided as soon as payment is confirmed and you have both finished: you asked for immediate performance and waived your right of withdrawal.',
    mentionSolo: 'VAT not applicable, art. 293 B of the French tax code. The report is provided as soon as payment is confirmed: you asked for immediate performance and waived your right of withdrawal.',
  },
  es: {
    nom: 'Evaluación de pareja: el informe completo',
    description: 'Para los dos: el informe completo de vuestra evaluación de pareja, en PDF por correo y en línea. En qué estáis de acuerdo, todas las diferencias con las dos respuestas, las señales de alerta, el clima de vuestra pareja y vuestras cuatro próximas conversaciones.',
    descriptionSolo: 'El informe completo de tu evaluación de pareja, hecha a solas, en PDF por correo y en línea: tu mirada sobre tu relación tema por tema, las diferencias que percibes, tus zonas de sombra, las señales de alerta y por dónde empezar.',
    mention: 'IVA no aplicable, art. 293 B del CGI francés. El informe se entrega en cuanto se confirma el pago y habéis terminado los dos: habéis pedido la ejecución inmediata y renunciado al derecho de desistimiento.',
    mentionSolo: 'IVA no aplicable, art. 293 B del CGI francés. El informe se entrega en cuanto se confirma el pago: has pedido la ejecución inmediata y renunciado al derecho de desistimiento.',
  },
  de: {
    nom: 'Beziehungsanalyse: der vollständige Bericht',
    description: 'Für euch beide: der vollständige Bericht eurer Beziehungsanalyse, als PDF per E-Mail und online. Wo ihr euch einig seid, alle Unterschiede mit beiden Antworten, die Warnsignale, das Klima eurer Beziehung und eure nächsten vier Gespräche.',
    descriptionSolo: 'Der vollständige Bericht deiner allein gemachten Beziehungsanalyse, als PDF per E-Mail und online: dein Blick auf deine Beziehung Thema für Thema, die Unterschiede, die du wahrnimmst, deine blinden Flecken, die Warnsignale und womit du anfangen kannst.',
    mention: 'Keine Umsatzsteuer gemäß Art. 293 B des französischen Steuergesetzbuchs. Der Bericht wird geliefert, sobald die Zahlung bestätigt ist und ihr beide fertig seid: Ihr habt die sofortige Ausführung verlangt und auf das Widerrufsrecht verzichtet.',
    mentionSolo: 'Keine Umsatzsteuer gemäß Art. 293 B des französischen Steuergesetzbuchs. Der Bericht wird geliefert, sobald die Zahlung bestätigt ist: Du hast die sofortige Ausführung verlangt und auf das Widerrufsrecht verzichtet.',
  },
  it: {
    nom: 'Valutazione di coppia: il report completo',
    description: 'Per tutti e due: il report completo della vostra valutazione di coppia, in PDF via e-mail e online. Su cosa siete d\'accordo, tutte le differenze con le due risposte, i segnali d\'allarme, il clima della vostra coppia e le vostre prossime quattro conversazioni.',
    descriptionSolo: 'Il report completo della tua valutazione di coppia, fatta da solo o da sola, in PDF via e-mail e online: il tuo sguardo sulla relazione tema per tema, le differenze che percepisci, le tue zone d\'ombra, i segnali d\'allarme e da dove cominciare.',
    mention: 'IVA non applicabile, art. 293 B del CGI francese. Il report viene fornito appena il pagamento è confermato e avete finito tutti e due: avete chiesto l\'esecuzione immediata e rinunciato al diritto di recesso.',
    mentionSolo: 'IVA non applicabile, art. 293 B del CGI francese. Il report viene fornito appena il pagamento è confermato: hai chiesto l\'esecuzione immediata e rinunciato al diritto di recesso.',
  },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const JETON = /^[A-Za-z0-9_-]{20,64}$/;
const SESSION = /^cs_[A-Za-z0-9_]{10,200}$/;
const SOURCE = /^[a-z0-9-]{1,40}$/;
// Créations de bilans par adresse IP et par heure.
export const CREATIONS_PAR_HEURE = 10;
// Envois du rapport par e-mail, au plus, pour un bilan : chacun peut changer
// son adresse, mais la fonction ne doit pas devenir un relais d'envoi.
export const ENVOIS_MAX = 8;
// Durée de l'adresse de téléchargement du PDF, en secondes.
export const DUREE_LIEN_PDF = 600;
// Les liens perdus (19 octobre 2026) : « Recevoir mon lien par e-mail » depuis
// l'évaluation ouverte, et « Retrouver mon évaluation » par l'adresse seule.
// Les limites vivent en mémoire de l'instance, comme dans lead-capture.
export const LIENS_PAR_HEURE = 5;          // envois de son lien, par évaluation et par rôle
export const RETROUVER_PAR_HEURE = 5;      // demandes « retrouver », par adresse IP
export const RETROUVER_DELAI_MS = 10 * 60e3; // une même adresse : un envoi par dix minutes
// Et un plafond global par jour, compté en base (bilan_compteurs : lien_envoye,
// retrouver_envoye, retrouver_aucun) : le plan Resend fait cent envois par
// jour, et le rapport payé passe avant tout. Les limites par IP vivent en
// mémoire d'une instance, qu'il suffit de contourner avec plusieurs adresses
// (audit du 20 octobre 2026). Au-delà, « trop » comme pour la limite horaire.
export const LIENS_PAR_JOUR = 40;
// Les e-mails « votre rapport est prêt » et le rappel (21 octobre 2026,
// Thomas devant l'entonnoir : 24 personnes au bout des cent questions, une
// seule a ouvert la page de paiement, et personne n'était prévenu quand le
// partenaire avait fini). Les deux ne partent qu'à une adresse donnée sous la
// phrase qui les annonce (`rappel` envoyé par la page à la création et à
// l'acceptation de l'invitation : a_rappel, b_rappel), jamais après un
// paiement ni après « ne plus recevoir » (rappels_off). Le rappel part une
// seule fois, RELANCE_APRES_H heures après que le rapport est prêt, par
// l'action interne `relancer` (bilan/relance.mjs, workflow bilan-relance.yml,
// lancé par la base). Plafond quotidien commun aux deux, compté en base
// (pret_envoye, relance_envoye) : le plan Resend fait cent envois par jour,
// rapport payé compris.
export const RAPPELS_PAR_JOUR = 40;
export const RELANCE_APRES_H = 24;
// Les liens personnels écrits dans ces e-mails ont leur propre jeton
// (jetons_mail : rôle et empreinte), pour ne pas toucher au lien gardé sur le
// téléphone. Au plus quatre par évaluation, les plus anciens tombent.
export const JETONS_MAIL_MAX = 4;
// Ce que la page compte elle-même, en plus de la visite et du clic sur
// « Commencer » (21 octobre 2026, Thomas devant l'entonnoir : « comment cette
// stat prend en compte les gens qui répondent seul ? »). Chaque écran du
// parcours est compté une fois par visite, avec `_solo` en plus pour une
// évaluation seul(e) ; la clé est la source pour la page et le bouton, la
// cause pour une erreur du départ, le rôle (a, b) pour l'écran de l'adresse,
// rien sinon.
export const ETAPES_PAGE = ['depart', 'depart_erreur', 'invitation_vue', 'situation_vue', 'email_vue', 'offre_vue', 'attente_vue', 'case_manquante'];
// `accord` : les deux cases ensemble, jusqu'au 22 octobre 2026 ; depuis, la
// case des 18 ans (`majeur`) et celle du consentement sont comptées à part.
const CAUSES_DEPART = ['prenoms', 'majeur', 'consentement', 'accord'];

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

// La page qui a mené au bilan (?src=), « direct » sinon.
export function sourcePropre(s) {
  return typeof s === 'string' && SOURCE.test(s) ? s : 'direct';
}

function genrePropre(g) {
  return g === 'f' || g === 'h' ? g : null;
}

const ok = (json) => ({ statut: 200, json });
const estSolo = (ligne) => ligne.mode === 'solo';
// Le bilan est figé : les deux ont fini, ou la personne seule a fini.
const estVerrouille = (ligne) => (estSolo(ligne) ? !!ligne.a_fini : !!(ligne.a_fini && ligne.b_fini));
// La date où tout a été répondu.
const finiLe = (ligne) => (estSolo(ligne) ? ligne.a_fini : (ligne.a_fini > ligne.b_fini ? ligne.a_fini : ligne.b_fini));
const non = (statut, erreur, plus) => ({ statut, json: { erreur, ...(plus || {}) } });

// L'étape d'une personne : le premier domaine qu'elle n'a pas fini, ou
// « fini ». Les domaines sont posés dans l'ordre.
function etapeDe(situation, reponses) {
  if (!C.situationValide(situation)) return 'situation';
  const e = C.etapes(situation, reponses);
  for (const d of C.DOMAINES) {
    const qs = d.questions.filter((q) => C.applicable(q, situation, reponses));
    if (qs.length && !e.finis.includes(d.id)) return d.id;
  }
  return 'fini';
}

// Les adresses où envoyer le rapport, sans doublon.
function destinataires(ligne) {
  const vues = new Set();
  const liste = [];
  for (const e of [ligne.paiement_email, ligne.a_email, ligne.b_email]) {
    if (!e) continue;
    const cle = e.toLowerCase();
    if (vues.has(cle)) continue;
    vues.add(cle);
    liste.push(e);
  }
  return liste;
}

// ── Le serveur ──────────────────────────────────────────────────────────

// stockage : { inserer(ligne), lire(id), maj(id, champs), supprimer(id),
//              compterRecents(ipHash, depuisIso), compter(evenement, cle, montant),
//              trouverParIntent(intent), lireFichier(chemin),
//              supprimerFichier(chemin), urlSignee(chemin, secondes, nom) }
// stripe   : { creerSession(params), lireSession(id) } ou null (paiement fermé)
// stripeTest : clé de test (sk_test_...) ; la page ouvre alors le paiement
//              même tant que le bilan n'est pas ouvert, pour l'essayer.
// courriel : { envoyer({ a, sujet, html, texte, pieces, lang }) } ou null
/** @param {{ stockage: any, stripe?: any, stripeTest?: boolean, courriel?: any, sel?: string, maintenant?: () => Date }} options */
export function creerServeur({ stockage, stripe = null, stripeTest = false, courriel = null, sel = '', maintenant = () => new Date() }) {

  // Un compteur qui rate ne doit jamais faire échouer une réponse.
  async function compter(evenement, cle, montant) {
    try {
      if (stockage.compter) await stockage.compter(evenement, cle || '', montant || 0);
    } catch (e) {
      console.error('[bilan] compteur', evenement, String(e && e.message || e).slice(0, 200));
    }
  }

  async function charger(corps) {
    const id = corps?.id;
    const jeton = corps?.jeton;
    if (typeof id !== 'string' || !UUID.test(id) || typeof jeton !== 'string' || !JETON.test(jeton)) {
      return { erreur: non(400, 'lien') };
    }
    const ligne = await stockage.lire(id);
    if (!ligne) return { erreur: non(404, 'introuvable') };
    const h = await empreinte(jeton);
    let role = h === ligne.a_jeton ? 'a' : h === ligne.b_jeton ? 'b' : null;
    // Le lien d'un e-mail « rapport prêt » ou du rappel (jetons_mail).
    if (!role && Array.isArray(ligne.jetons_mail)) {
      const m = ligne.jetons_mail.find((x) => x && x.h === h && (x.r === 'a' || x.r === 'b'));
      if (m && (m.r === 'a' || !estSolo(ligne))) role = m.r;
    }
    if (!role) return { erreur: non(404, 'introuvable') };
    return { ligne, role };
  }

  function personne(ligne, r) {
    return { prenom: ligne[r + '_prenom'], genre: ligne[r + '_genre'] || null };
  }

  // La réduction appliquée à la page de paiement : douze heures de plus que
  // la fin affichée (coeur.mjs, PROMO_FIN), le temps que le site soit
  // reconstruit sans elle.
  const promoActive = () => C.promoEnCours(maintenant(), 12);

  // Ce que la page sait du paiement et du rapport.
  function paiementPour(ligne, role) {
    const paye = !!ligne.paye_le;
    const promo = promoActive();
    return {
      prix: promo ? C.prixPromo() : C.PRIX_CENTIMES,
      prixBase: C.PRIX_CENTIMES,
      promo: promo ? { code: C.PROMO_CODE, pourcent: C.PROMO_POURCENT } : null,
      garantie: C.GARANTIE_JOURS,
      paiementOuvert: !!stripe,
      paiementTest: !!stripe && stripeTest,
      paye,
      payeParMoi: paye && ligne.paiement_role === role,
      rapport: paye ? {
        statut: ligne.rapport_statut || null,
        pret: ligne.rapport_statut === 'pret',
        pages: ligne.rapport_pages || null,
        // Les adresses où le rapport part ou est parti, masquées.
        envoiA: destinataires(ligne).map(masquerEmail),
        envoye: (ligne.envois || []).some((e) => e.ok),
      } : null,
    };
  }

  function etatPour(ligne, role) {
    const autre = role === 'a' ? 'b' : 'a';
    const solo = estSolo(ligne);
    const repAutre = ligne[autre + '_reponses'] || {};
    const prog = solo ? { repondu: 0, total: 0 } : C.progression(ligne.situation, repAutre);
    return {
      id: ligne.id,
      role,
      mode: solo ? 'solo' : 'duo',
      lang: ligne.lang,
      situation: ligne.situation,
      creeLe: ligne.cree_le,
      ...paiementPour(ligne, role),
      verrouille: estVerrouille(ligne),
      moi: {
        ...personne(ligne, role),
        consent: !!ligne[role + '_consent'],
        reponses: ligne[role + '_reponses'] || {},
        nn: ligne[role + '_nn'] || [],
        // En solo seulement : ce que la personne pense que l'autre répondrait.
        percu: solo ? (ligne.a_percu || {}) : undefined,
        fini: !!ligne[role + '_fini'],
        email: ligne[role + '_email'] || null,
        // Prévenu(e) par e-mail quand le rapport est prêt (attente à deux).
        prevenu: prevenu(ligne, role),
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

  // La page du bilan vue, son bouton « commencer » (comptés par source) et
  // les écrans du parcours (ETAPES_PAGE). La page ne compte qu'une fois par
  // visite ; `_solo` s'ajoute pour une évaluation seul(e), le total restant
  // sur l'événement de base, comme cree et cree_solo.
  async function vue(corps) {
    const quoi = corps?.quoi === 'page' ? 'vue' : corps?.quoi === 'cta' ? 'cta'
      : ETAPES_PAGE.includes(corps?.quoi) ? corps.quoi : null;
    if (!quoi) return non(400, 'quoi');
    let cle = '';
    if (quoi === 'vue' || quoi === 'cta') cle = sourcePropre(corps.src);
    else if (quoi === 'depart_erreur') cle = CAUSES_DEPART.includes(corps.cle) ? corps.cle : 'autre';
    else if (quoi === 'email_vue') cle = corps.cle === 'b' ? 'b' : 'a';
    await compter(quoi, cle);
    if (corps.mode === 'solo' && quoi !== 'vue') await compter(quoi + '_solo', cle);
    return ok({ compte: true });
  }

  async function creer(corps, ctx) {
    const lang = LANGUES.includes(corps.lang) ? corps.lang : null;
    if (!lang) return non(400, 'lang');
    const mode = corps.mode === undefined ? 'duo' : corps.mode;
    if (!C.modeValide(mode)) return non(400, 'mode');
    // Depuis le 21 octobre 2026, la situation est demandée après la création,
    // comme les premières questions (action `situation`) : la page de
    // départ n'a plus que les prénoms et les deux cases. Une page d'avant
    // l'envoie encore ici.
    if (corps.situation !== undefined && !C.situationValide(corps.situation)) return non(400, 'situation');
    const pa = prenomPropre(corps.moi?.prenom);
    const pb = prenomPropre(corps.autre?.prenom);
    if (!pa || !pb) return non(400, 'prenom');
    if (corps.consentement !== true || corps.majeur !== true) return non(400, 'consentement');
    // L'adresse e-mail reste obligatoire (le rapport y part tout seul), mais
    // depuis le 21 octobre 2026 elle est demandée à la fin de ses propres
    // questions, juste avant l'offre (`email` avec `fin`) : `repondre` ne
    // marque pas fini sans elle. Une page d'avant la donne encore ici.
    const ea = corps.email === undefined || corps.email === null || corps.email === '' ? null : emailPropre(corps.email);
    if (corps.email && !ea) return non(400, 'email');

    const ipHash = await empreinte((ctx?.ip || 'inconnue') + '|' + sel);
    const depuis = new Date(maintenant().getTime() - 3600e3).toISOString();
    const recents = await stockage.compterRecents(ipHash, depuis);
    if (recents >= CREATIONS_PAR_HEURE) return non(429, 'trop');

    const jetonA = nouveauJeton();
    // En solo, la clé de B n'est jamais rendue à personne : aucune invitation
    // ne peut ouvrir ce bilan.
    const jetonB = nouveauJeton();
    const quand = maintenant().toISOString();
    const situation = corps.situation === undefined ? {} : C.nettoieSituation(corps.situation);
    const ligne = await stockage.inserer({
      lang,
      mode,
      situation,
      src: sourcePropre(corps.src),
      a_prenom: pa, a_genre: genrePropre(corps.moi?.genre),
      b_prenom: pb, b_genre: genrePropre(corps.autre?.genre),
      a_email: ea,
      // La page a montré la phrase qui annonce l'e-mail « rapport prêt » et
      // le rappel, sous le champ de l'adresse.
      a_rappel: !!ea && corps.rappel === true,
      a_jeton: await empreinte(jetonA),
      b_jeton: await empreinte(jetonB),
      a_consent: quand,
      a_etape: etapeDe(situation, {}),
      ip_hash: ipHash,
      cree_le: quand,
      maj_le: quand,
    });
    return ok({ id: ligne.id, jeton: jetonA, invitation: mode === 'solo' ? null : jetonB, etat: etatPour(ligne, 'a') });
  }

  async function etat(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (!ligne[role + '_consent']) {
      // B arrive par l'invitation : ni réponses ni progression, juste de quoi
      // présenter le bilan et demander son accord (et dire si A a déjà payé).
      return ok({
        id: ligne.id, role, invite: true, lang: ligne.lang, situation: ligne.situation,
        ...paiementPour(ligne, role), rapport: null,
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
    // Même règle que pour la création : l'adresse est demandée à la fin des
    // questions ; une page d'avant la donne encore ici.
    const eb = corps.email === undefined || corps.email === null || corps.email === '' ? null : emailPropre(corps.email);
    if (corps.email && !eb) return non(400, 'email');
    const champs = {};
    if (eb) { champs[role + '_email'] = eb; champs[role + '_rappel'] = corps.rappel === true; }
    if (corps.prenom !== undefined) {
      const p = prenomPropre(corps.prenom);
      if (!p) return non(400, 'prenom');
      champs[role + '_prenom'] = p;
    }
    if (corps.genre !== undefined) champs[role + '_genre'] = genrePropre(corps.genre);
    const jeton = nouveauJeton();
    champs[role + '_jeton'] = await empreinte(jeton);
    champs[role + '_consent'] = maintenant().toISOString();
    champs[role + '_etape'] = etapeDe(ligne.situation, ligne[role + '_reponses'] || {});
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
    if (estVerrouille(ligne)) return non(409, 'verrouille');
    // Les questions posées dépendent de la situation : sans elle, le compte
    // des questions serait faux et « fini » arriverait trop tôt.
    if (!C.situationValide(ligne.situation)) return non(400, 'situation');
    const solo = estSolo(ligne);
    const v = C.valideReponses(corps.reponses, corps.nn, solo ? (corps.percu === undefined ? {} : corps.percu) : undefined);
    if (v.erreur) return non(400, v.erreur);
    const complet = C.complet(ligne.situation, v.reponses, solo ? v.percu : undefined);
    const dejaFini = !!ligne[role + '_fini'];
    // Fini veut dire : toutes les réponses, et une adresse où envoyer le
    // rapport (demandée à la fin depuis le 21 octobre 2026).
    const emailManque = !ligne[role + '_email'];
    let fini = null;
    if (complet && (corps.fini === true || dejaFini) && (dejaFini || !emailManque)) {
      fini = dejaFini ? ligne[role + '_fini'] : maintenant().toISOString();
    }
    const avant = C.etapes(ligne.situation, ligne[role + '_reponses'] || {});
    const apres = C.etapes(ligne.situation, v.reponses);
    const champs = {
      [role + '_reponses']: v.reponses,
      [role + '_nn']: v.nn,
      [role + '_fini']: fini,
      [role + '_etape']: fini ? 'fini' : complet ? 'email' : etapeDe(ligne.situation, v.reponses),
      maj_le: maintenant().toISOString(),
    };
    if (solo) champs.a_percu = v.percu;
    const maj = await stockage.maj(ligne.id, champs);
    // Où les gens entrent et sortent, domaine par domaine (onglet Bilan de
    // l'admin). Une personne qui revient sur une réponse ne compte pas deux
    // fois : seuls les domaines nouveaux comptent.
    for (const d of apres.entres) if (!avant.entres.includes(d)) await compter('domaine_entre', d);
    for (const d of apres.finis) if (!avant.finis.includes(d)) await compter('domaine_fini', d);
    // Le second vient de finir : le premier, qui n'est plus sur la page, est
    // prévenu par e-mail que le rapport l'attend.
    if (fini && !dejaFini && !solo && estVerrouille(maj) && !maj.paye_le) {
      await avertirPret(maj, role === 'a' ? 'b' : 'a');
    }
    const prog = C.progression(maj.situation, v.reponses, solo ? v.percu : undefined);
    return ok({
      fini: !!fini,
      complet,
      // Tout est répondu mais l'adresse manque : la page la demande, puis
      // renvoie la fin.
      emailManque: complet && !fini && emailManque,
      progression: prog,
      etat: etatPour(maj, role),
    });
  }

  // Le rapport : seulement payé, et seulement quand tout est répondu (les
  // deux en duo, la personne seule en solo).
  async function resultat(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (!ligne[role + '_consent']) return non(403, 'consentement');
    const solo = estSolo(ligne);
    const base = {
      role,
      mode: solo ? 'solo' : 'duo',
      lang: ligne.lang,
      situation: ligne.situation,
      ...paiementPour(ligne, role),
      moiFini: !!ligne[role + '_fini'],
      deuxFinis: estVerrouille(ligne),
      moiEmail: ligne[role + '_email'] || null,
      a: personne(ligne, 'a'),
      b: personne(ligne, 'b'),
    };
    if (!ligne.paye_le) {
      // Pas un mot du contenu, seulement des comptes (21 octobre 2026, Thomas
      // a accepté cette entorse à « aucun résultat gratuit ») : combien
      // d'accords, de réponses proches, d'écarts et de sujets décisifs en
      // désaccord, jamais lesquels.
      return { statut: 402, json: { erreur: 'non_paye', ...base, apercu: estVerrouille(ligne) ? apercuDe(ligne) : null } };
    }
    if (!estVerrouille(ligne)) return { statut: 409, json: { erreur: 'pas_fini', ...base } };
    return ok({
      ...base,
      finiLe: finiLe(ligne),
      payeLe: ligne.paye_le,
      a: { ...personne(ligne, 'a'), reponses: ligne.a_reponses || {}, nn: ligne.a_nn || [], ...(solo ? { percu: ligne.a_percu || {} } : {}) },
      b: solo ? personne(ligne, 'b') : { ...personne(ligne, 'b'), reponses: ligne.b_reponses || {}, nn: ligne.b_nn || [] },
    });
  }

  async function payer(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (!ligne[role + '_consent']) return non(403, 'consentement');
    // On paie quand on a fini ses propres réponses : c'est là que la page
    // propose le rapport. Le rapport, lui, attend que les deux aient fini.
    if (!ligne[role + '_fini']) return non(409, 'pas_fini');
    if (ligne.paye_le) return ok({ paye: true });
    if (!stripe) return non(503, 'paiement_ferme');
    if (corps.renonciation !== true) return non(400, 'renonciation');
    const lang = LANGUES.includes(corps.lang) ? corps.lang : ligne.lang;
    const solo = estSolo(ligne);
    const base = SITE + CHEMINS[lang];
    const email = emailPropre(corps.email) || ligne[role + '_email'] || null;
    let ouverte;
    try {
      ouverte = await ouvrirSession((avecPromo) => sessionStripe({
        lang, solo, email, avecPromo,
        reference: ligne.id,
        metadata: { bilan: ligne.id, role, mode: solo ? 'solo' : 'duo' },
        succes: base + '?paiement={CHECKOUT_SESSION_ID}&b=' + ligne.id,
        annule: base + '?annule=1&b=' + ligne.id,
      }));
    } catch (e) {
      return non(502, 'stripe', { detail: String(e.message || e).slice(0, 200) });
    }
    const { session, promo } = ouverte;
    const champs = {
      renonciation_le: maintenant().toISOString(),
      paiement_session: session.id,
    };
    if (email && !ligne[role + '_email']) champs[role + '_email'] = email;
    await stockage.maj(ligne.id, champs);
    return ok({ url: session.url, promo, total: totalSession(session) });
  }

  // La page de paiement de Stripe, la même pour un client (payer) et pour
  // l'aperçu de l'admin (apercuPaiement) : prix, réduction, textes.
  function sessionStripe({ lang, solo, email, avecPromo, reference, metadata, succes, annule }) {
    const t = PRODUIT[lang];
    return {
      mode: 'payment',
      locale: lang,
      client_reference_id: reference || undefined,
      customer_email: email || undefined,
      success_url: succes,
      cancel_url: annule,
      // La réduction en cours est appliquée d'office (personne n'a de code à
      // taper) ; Stripe refuse `allow_promotion_codes` avec `discounts`, le
      // champ des codes ne revient donc que sans réduction.
      ...(avecPromo
        ? { discounts: [{ promotion_code: C.PROMO_STRIPE }] }
        : { allow_promotion_codes: 'true' }),
      metadata,
      payment_intent_data: { metadata },
      custom_text: { submit: { message: solo ? t.mentionSolo : t.mention } },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: C.PRIX_CENTIMES,
          product_data: { name: t.nom, description: solo ? t.descriptionSolo : t.description },
        },
      }],
    };
  }

  // Un code expiré, désactivé ou à son plafond ne bloque jamais une vente :
  // la page de paiement se rouvre au prix plein, avec le champ des codes, et
  // l'erreur part au journal de la fonction.
  async function ouvrirSession(parametres) {
    const promo = promoActive();
    try {
      return { session: await stripe.creerSession(parametres(promo)), promo };
    } catch (e) {
      if (!promo) throw e;
      console.warn('[bilan] réduction ' + C.PROMO_CODE + ' refusée par Stripe : ' + String(e.message || e).slice(0, 200));
    }
    return { session: await stripe.creerSession(parametres(false)), promo: false };
  }

  // Le montant que Stripe demandera, réduction comprise, tel qu'il le calcule.
  const totalSession = (session) => (Number.isInteger(session && session.amount_total) ? session.amount_total : null);

  // Réservé à l'admin (jeton vérifié par index.ts) : la page de paiement telle
  // qu'un client la voit, pour la regarder sans faire les cent questions.
  // Aucune évaluation n'est créée, donc rien n'entre dans les compteurs de
  // l'onglet Évaluation ; un paiement fait ici ne débloque rien (le webhook
  // ne trouve aucune évaluation et l'ignore).
  async function apercuPaiement(corps, ctx) {
    if (!ctx?.admin) return non(403, 'admin');
    if (!stripe) return non(503, 'paiement_ferme');
    const lang = LANGUES.includes(corps.lang) ? corps.lang : 'fr';
    const solo = corps.mode === 'solo';
    const retour = SITE + '/admin/';
    try {
      const { session, promo } = await ouvrirSession((avecPromo) => sessionStripe({
        lang, solo, avecPromo,
        metadata: { apercu: 'admin', mode: solo ? 'solo' : 'duo' },
        succes: retour,
        annule: retour,
      }));
      return ok({ url: session.url, promo, code: promo ? C.PROMO_CODE : null, total: totalSession(session), prixBase: C.PRIX_CENTIMES });
    } catch (e) {
      return non(502, 'stripe', { detail: String(e.message || e).slice(0, 200) });
    }
  }

  // Une session Stripe payée débloque le bilan qu'elle porte en métadonnée.
  async function marquerPaye(session) {
    const id = session?.metadata?.bilan || session?.client_reference_id;
    if (typeof id !== 'string' || !UUID.test(id)) return false;
    if (session.payment_status !== 'paid') return false;
    const ligne = await stockage.lire(id);
    if (!ligne) return false;
    if (ligne.paye_le) return true;
    const role = session.metadata?.role === 'a' || session.metadata?.role === 'b' ? session.metadata.role : null;
    const intent = typeof session.payment_intent === 'string' ? session.payment_intent
      : (session.payment_intent && typeof session.payment_intent.id === 'string' ? session.payment_intent.id : null);
    const email = emailPropre(session.customer_details?.email) || emailPropre(session.customer_email);
    await stockage.maj(id, {
      paye_le: maintenant().toISOString(),
      paiement_session: typeof session.id === 'string' ? session.id.slice(0, 255) : null,
      paiement_intent: intent ? intent.slice(0, 255) : null,
      paiement_montant: Number.isInteger(session.amount_total) ? session.amount_total : null,
      paiement_role: role,
      paiement_email: email,
      // Le bilan payé est gardé six mois à partir d'ici (bilan_menage).
      maj_le: maintenant().toISOString(),
    });
    return true;
  }

  // Un remboursement fait depuis Stripe (charge.refunded) : noté pour l'admin,
  // le rapport reste ouvert (docs/bilan/STRIPE.md).
  async function marquerRembourse(charge) {
    const intent = typeof charge?.payment_intent === 'string' ? charge.payment_intent : null;
    if (!intent || !charge.refunded) return false;
    const ligne = stockage.trouverParIntent ? await stockage.trouverParIntent(intent) : null;
    if (!ligne) return false;
    if (ligne.rembourse_le) return true;
    await stockage.maj(ligne.id, { rembourse_le: maintenant().toISOString() });
    return true;
  }

  async function verifier(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (!ligne[role + '_consent']) return non(403, 'consentement');
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

  // Envoie le PDF prêt aux adresses qui ne l'ont pas encore reçu. Appelé par
  // la fabrique (action interne) juste après avoir rangé le fichier, et par
  // la page quand quelqu'un donne son adresse après coup.
  async function envoyerA(ligne) {
    if (!ligne.paye_le || ligne.rapport_statut !== 'pret' || !ligne.rapport_chemin) {
      return { envoyes: 0, attente: true };
    }
    const envois = Array.isArray(ligne.envois) ? ligne.envois.slice() : [];
    const deja = new Set(envois.filter((e) => e.ok).map((e) => String(e.email).toLowerCase()));
    const restants = destinataires(ligne).filter((e) => !deja.has(e.toLowerCase()));
    if (!restants.length) return { envoyes: 0 };
    if (!courriel) return { envoyes: 0, erreur: 'courriel' };
    if (envois.length >= ENVOIS_MAX) return { envoyes: 0, erreur: 'trop' };
    const octets = await stockage.lireFichier(ligne.rapport_chemin);
    const mode = estSolo(ligne) ? 'solo' : 'duo';
    const msg = messageRapport({ lang: ligne.lang, a: ligne.a_prenom, b: ligne.b_prenom, pages: ligne.rapport_pages, mode });
    const nom = nomFichier(ligne.lang, ligne.a_prenom, ligne.b_prenom, mode);
    let envoyes = 0;
    for (const dest of restants) {
      if (envois.length >= ENVOIS_MAX) break;
      let reussi = false;
      try {
        await courriel.envoyer({ a: dest, sujet: msg.sujet, html: msg.html, texte: msg.texte, pieces: [{ nom, octets }], lang: ligne.lang });
        reussi = true;
        envoyes++;
      } catch (e) {
        console.error('[bilan] envoi', String(e && e.message || e).slice(0, 200));
      }
      envois.push({ email: dest, le: maintenant().toISOString(), ok: reussi });
      await compter(reussi ? 'envoi_ok' : 'envoi_echec');
    }
    await stockage.maj(ligne.id, { envois });
    return { envoyes, echecs: restants.length - envoyes };
  }

  // L'adresse où recevoir le rapport. Chacun ne règle que la sienne.
  async function email(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (!ligne[role + '_consent']) return non(403, 'consentement');
    if (corps.email === undefined) return non(400, 'email');
    const e = corps.email === '' || corps.email === null ? null : emailPropre(corps.email);
    if (corps.email && !e) return non(400, 'email');
    if ((ligne.envois || []).length >= ENVOIS_MAX) return non(429, 'trop');
    const champs = { [role + '_email']: e, maj_le: maintenant().toISOString() };
    // L'écran de fin des questions montre, sous le champ, la phrase qui
    // annonce l'e-mail « rapport prêt » et le rappel : la page envoie alors
    // `rappel: true`, comme à la création avant le 21 octobre 2026.
    if (e && corps.rappel === true) champs[role + '_rappel'] = true;
    const maj = await stockage.maj(ligne.id, champs);
    const envoi = e ? await envoyerA(maj) : { envoyes: 0 };
    const relu = envoi.envoyes ? await stockage.lire(ligne.id) : maj;
    return ok({ email: e, envoi, etat: etatPour(relu, role) });
  }

  // Une adresse de téléchargement du PDF, valable dix minutes.
  async function pdf(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (!ligne[role + '_consent']) return non(403, 'consentement');
    if (!ligne.paye_le) return non(402, 'non_paye');
    if (ligne.rapport_statut !== 'pret' || !ligne.rapport_chemin) {
      return ok({ pret: false, statut: ligne.rapport_statut || null });
    }
    const url = await stockage.urlSignee(ligne.rapport_chemin, DUREE_LIEN_PDF,
      nomFichier(ligne.lang, ligne.a_prenom, ligne.b_prenom, estSolo(ligne) ? 'solo' : 'duo'));
    return ok({ pret: true, url });
  }

  // L'un ou l'autre efface tout, tout de suite. Une invitation pas encore
  // acceptée ne le peut pas : le lien a pu être transféré.
  async function supprimer(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    if (!c.ligne[c.role + '_consent']) return non(403, 'consentement');
    if (c.ligne.rapport_chemin && stockage.supprimerFichier) {
      try { await stockage.supprimerFichier(c.ligne.rapport_chemin); } catch (e) {
        // La fabrique efface au passage suivant les fichiers sans bilan.
        console.error('[bilan] fichier', String(e && e.message || e).slice(0, 200));
      }
    }
    await stockage.supprimer(c.ligne.id);
    return ok({ supprime: true });
  }

  // Réservé à la fabrique du PDF (clé de service, vérifiée par index.ts).
  async function envoyerRapport(corps, ctx) {
    if (!ctx?.interne) return non(403, 'interne');
    const id = corps?.id;
    if (typeof id !== 'string' || !UUID.test(id)) return non(400, 'lien');
    const ligne = await stockage.lire(id);
    if (!ligne) return non(404, 'introuvable');
    return ok(await envoyerA(ligne));
  }

  // ── Rapport prêt, rappel et « ne plus recevoir » ─────────────────────

  // Les comptes de l'aperçu, tirés de la même analyse que le rapport, et le
  // radar des domaines. Aucun identifiant de question, aucune réponse.
  function apercuDe(ligne) {
    const solo = estSolo(ligne);
    const an = C.analyser(
      ligne.situation,
      { reponses: ligne.a_reponses || {}, nn: ligne.a_nn || [], percu: solo ? (ligne.a_percu || {}) : undefined },
      solo ? null : { reponses: ligne.b_reponses || {}, nn: ligne.b_nn || [] },
      solo ? 'solo' : 'duo',
    );
    const k = an.compte;
    return {
      accords: k.accords,
      proches: k.proches,
      ecarts: k.ecarts,
      decisifs: k.bloquants + k.aTrancher,
      inconnus: solo ? k.inconnus : 0,
      questions: k.poses,
      conversations: an.conversations.length,
      // Le radar de la synthèse (22 octobre 2026, Thomas : « une partie des
      // résultats gratuite, mais vraiment rien, genre juste la synthèse, le
      // graphique araignée ») : le score de chaque domaine et sa bande, comme
      // le radar du rapport. Jamais une question ni une réponse.
      radar: an.domaines.filter((x) => !x.meteo && x.score !== null).map((x) => ({ id: x.id, score: x.score, bande: x.bande })),
    };
  }

  function prevenu(ligne, role) {
    return !!(ligne[role + '_email'] && ligne[role + '_rappel'] && !ligne.rappels_off && !ligne.paye_le);
  }

  async function plafondRappelsAtteint() {
    if (!stockage.compteDuJour) return false;
    try {
      return (await stockage.compteDuJour(['pret_envoye', 'relance_envoye'])) >= RAPPELS_PAR_JOUR;
    } catch (e) {
      console.error('[bilan] compteurs', String(e && e.message || e).slice(0, 200));
      return false;
    }
  }

  // Un lien personnel neuf pour un e-mail : son jeton s'ajoute à jetons_mail,
  // le lien du téléphone reste valable.
  async function jetonMail(jetons, role) {
    const jeton = nouveauJeton();
    const liste = (Array.isArray(jetons) ? jetons : []).filter((x) => x && x.h).concat([{ r: role, h: await empreinte(jeton) }]);
    return { jeton, jetons: liste.slice(-JETONS_MAIL_MAX) };
  }

  function prixPour(ligne) {
    const p = paiementPour(ligne, 'a');
    return { prix: p.prix, prixBase: p.prixBase, promo: !!p.promo };
  }

  async function envoyerRappel(ligne, role, quoi, jetons) {
    const autre = role === 'a' ? 'b' : 'a';
    const solo = estSolo(ligne);
    const j = await jetonMail(jetons, role);
    const url = lienDe(ligne, j.jeton);
    const fabrique = quoi === 'pret' ? messagePret : messageRelance;
    const msg = fabrique({
      lang: ligne.lang, mode: solo ? 'solo' : 'duo',
      moi: ligne[role + '_prenom'], autre: ligne[autre + '_prenom'],
      url, arret: url + '&arret=1', ...prixPour(ligne),
    });
    await courriel.envoyer({ a: ligne[role + '_email'], sujet: msg.sujet, html: msg.html, texte: msg.texte, lang: ligne.lang });
    return j.jetons;
  }

  async function avertirPret(ligne, role) {
    if (!courriel || !prevenu(ligne, role) || ligne.pret_mail_le) return;
    if (!ligne[role + '_consent']) return;
    if (await plafondRappelsAtteint()) return;
    try {
      const jetons = await envoyerRappel(ligne, role, 'pret', ligne.jetons_mail);
      await stockage.maj(ligne.id, { jetons_mail: jetons, pret_mail_le: maintenant().toISOString() });
      await compter('pret_envoye');
    } catch (e) {
      console.error('[bilan] pret', String(e && e.message || e).slice(0, 200));
    }
  }

  // Réservé à bilan/relance.mjs (clé de service, vérifiée par index.ts) : le
  // rappel unique des rapports prêts depuis RELANCE_APRES_H heures et
  // toujours pas débloqués.
  async function relancer(corps, ctx) {
    if (!ctx?.interne) return non(403, 'interne');
    if (!courriel) return non(503, 'courriel');
    if (!stockage.aRelancer) return ok({ relances: 0 });
    const avant = new Date(maintenant().getTime() - RELANCE_APRES_H * 3600e3).toISOString();
    const lignes = await stockage.aRelancer(avant, 25);
    let envoyes = 0;
    let vus = 0;
    for (const ligne of lignes || []) {
      if (ligne.paye_le || ligne.rappels_off || ligne.relance_le || !estVerrouille(ligne)) continue;
      if (finiLe(ligne) > avant) continue;
      vus++;
      let jetons = ligne.jetons_mail;
      for (const role of estSolo(ligne) ? ['a'] : ['a', 'b']) {
        if (!prevenu(ligne, role) || !ligne[role + '_consent']) continue;
        if (await plafondRappelsAtteint()) return ok({ relances: envoyes, vus, plafond: true });
        try {
          jetons = await envoyerRappel(ligne, role, 'relance', jetons);
          envoyes++;
          await compter('relance_envoye');
        } catch (e) {
          console.error('[bilan] relance', String(e && e.message || e).slice(0, 200));
        }
      }
      // Une seule fois, même quand un envoi a raté : jamais deux rappels.
      await stockage.maj(ligne.id, { jetons_mail: jetons, relance_le: maintenant().toISOString() });
    }
    return ok({ relances: envoyes, vus });
  }

  // « Ne plus recevoir de message sur cette évaluation », depuis le lien de
  // l'e-mail. Le rapport payé part quand même : on l'a demandé.
  async function rappels(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (corps.off !== true) return non(400, 'off');
    const maj = ligne.rappels_off ? ligne : await stockage.maj(ligne.id, { rappels_off: true, maj_le: maintenant().toISOString() });
    return ok({ arret: true, etat: etatPour(maj, role) });
  }

  // ── Les liens perdus ──────────────────────────────────────────────────
  // (19 octobre 2026, Thomas : « si quelqu'un ferme l'onglet par erreur et
  // qu'il n'a pas eu le temps de copier son lien, on fait comment ? »)
  const essais = { lien: new Map(), ip: new Map(), adresse: new Map() };
  // Le plafond quotidien des e-mails de lien. Une lecture qui échoue ne bloque
  // personne : la disponibilité passe avant le quota.
  async function plafondLiensAtteint() {
    if (!stockage.compteDuJour) return false;
    try {
      return (await stockage.compteDuJour(['lien_envoye', 'retrouver_envoye', 'retrouver_aucun'])) >= LIENS_PAR_JOUR;
    } catch (e) {
      console.error('[bilan] compteurs', String(e && e.message || e).slice(0, 200));
      return false;
    }
  }
  function freiner(table, cle, max, fenetre) {
    const t = maintenant().getTime();
    const liste = (table.get(cle) || []).filter((x) => t - x < fenetre);
    if (liste.length >= max) { table.set(cle, liste); return false; }
    liste.push(t);
    table.set(cle, liste);
    if (table.size > 5000) for (const [k, v] of table) if (!v.some((x) => t - x < fenetre)) table.delete(k);
    return true;
  }
  function lienDe(ligne, jeton) {
    return SITE + (CHEMINS[ligne.lang] || CHEMINS.fr) + '#b=' + ligne.id + '&t=' + jeton;
  }
  function entreeLien(ligne, role) {
    const autre = role === 'a' ? 'b' : 'a';
    return { a: ligne[role + '_prenom'], b: ligne[autre + '_prenom'], mode: estSolo(ligne) ? 'solo' : 'duo' };
  }

  // Son propre lien, envoyé à l'adresse donnée ou, sans adresse dans la
  // demande, à celle du rapport. Une adresse de rapport déjà gardée (elle
  // l'est toujours depuis le 20 octobre 2026, demandée à la création et à
  // l'acceptation de l'invitation) n'est jamais remplacée ici, sinon
  // « retrouver » par la première adresse ne trouverait plus rien : elle se
  // change au paiement ou sur le rapport, action `email`. Le lien est
  // reconstruit depuis le jeton présenté : la base n'en garde que l'empreinte.
  async function lien(corps) {
    const c = await charger(corps);
    if (c.erreur) return c.erreur;
    const { ligne, role } = c;
    if (!ligne[role + '_consent']) return non(403, 'consentement');
    const e = emailPropre(corps.email) || ligne[role + '_email'] || null;
    if (!e) return non(400, 'email');
    if (!courriel) return non(503, 'courriel');
    if (!freiner(essais.lien, ligne.id + ':' + role, LIENS_PAR_HEURE, 3600e3)) return non(429, 'trop');
    if (await plafondLiensAtteint()) return non(429, 'trop');
    let maj = ligne;
    if (!ligne[role + '_email']) maj = await stockage.maj(ligne.id, { [role + '_email']: e, maj_le: maintenant().toISOString() });
    const msg = messageLien({ lang: ligne.lang, liens: [{ ...entreeLien(ligne, role), url: lienDe(ligne, corps.jeton) }], rotation: false });
    try {
      await courriel.envoyer({ a: e, sujet: msg.sujet, html: msg.html, texte: msg.texte, lang: ligne.lang });
    } catch (err) {
      console.error('[bilan] lien', String(err && err.message || err).slice(0, 200));
      return non(502, 'courriel');
    }
    await compter('lien_envoye');
    return ok({ email: e, envoye: true, etat: etatPour(maj, role) });
  }

  // Retrouver ses évaluations avec la seule adresse e-mail : pour chaque rôle
  // qui porte l'adresse, un jeton neuf remplace l'ancien (la base ne garde que
  // des empreintes, l'ancien lien ne peut pas être relu) et tout part en un
  // e-mail. La réponse est la même qu'il y ait une évaluation ou non ; sans
  // évaluation, l'e-mail le dit, pour ne pas laisser attendre. Le partenaire
  // garde son propre lien, intact.
  async function retrouver(corps, ctx) {
    const e = emailPropre(corps.email);
    if (!e) return non(400, 'email');
    const lang = LANGUES.includes(corps.lang) ? corps.lang : 'fr';
    if (!courriel) return non(503, 'courriel');
    if (!freiner(essais.ip, ctx?.ip || 'inconnue', RETROUVER_PAR_HEURE, 3600e3)) return non(429, 'trop');
    if (await plafondLiensAtteint()) return non(429, 'trop');
    if (!freiner(essais.adresse, e, 1, RETROUVER_DELAI_MS)) return ok({ envoye: true });
    const lignes = stockage.trouverParEmail ? await stockage.trouverParEmail(e) : [];
    const liens = [];
    let langueTrouvee = null;
    const porte = (x) => typeof x === 'string' && x.toLowerCase() === e;
    for (const ligne of lignes || []) {
      const roles = [];
      if (porte(ligne.a_email)) roles.push('a');
      if (!estSolo(ligne) && porte(ligne.b_email)) roles.push('b');
      if (!roles.length && porte(ligne.paiement_email)
        && (ligne.paiement_role === 'a' || (ligne.paiement_role === 'b' && !estSolo(ligne)))) roles.push(ligne.paiement_role);
      for (const role of roles) {
        if (!ligne[role + '_consent']) continue;
        const jeton = nouveauJeton();
        await stockage.maj(ligne.id, { [role + '_jeton']: await empreinte(jeton), maj_le: maintenant().toISOString() });
        liens.push({ ...entreeLien(ligne, role), url: lienDe(ligne, jeton) });
        if (!langueTrouvee && LANGUES.includes(ligne.lang)) langueTrouvee = ligne.lang;
      }
    }
    const msg = messageLien({ lang: langueTrouvee || lang, liens, rotation: true });
    try {
      await courriel.envoyer({ a: e, sujet: msg.sujet, html: msg.html, texte: msg.texte, lang: langueTrouvee || lang });
    } catch (err) {
      console.error('[bilan] retrouver', String(err && err.message || err).slice(0, 200));
      return non(502, 'courriel');
    }
    await compter(liens.length ? 'retrouver_envoye' : 'retrouver_aucun');
    return ok({ envoye: true });
  }

  const ACTIONS = {
    vue, creer, etat, consentir, situation, repondre, resultat, payer, verifier,
    email, pdf, supprimer, lien, retrouver, rappels, envoyer_rapport: envoyerRapport, relancer,
    apercu_paiement: apercuPaiement,
  };

  async function traiter(corps, ctx) {
    if (!corps || typeof corps !== 'object') return non(400, 'corps');
    const action = ACTIONS[corps.action];
    if (!action) return non(400, 'action');
    return action(corps, ctx);
  }

  return { traiter, marquerPaye, marquerRembourse };
}

// Le webhook de Stripe (fonction bilan-stripe). `verifierSignature` est la
// fonction de vérification de signature (stripe.mjs), passée pour garder ce
// fichier sans dépendance.
export async function traiterWebhook({ corps, signature, secret, verifierSignature, marquerPaye, marquerRembourse }) {
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
  if (type === 'charge.refunded' && marquerRembourse) {
    const marque = await marquerRembourse(evenement.data?.object);
    return { statut: 200, json: { recu: true, marque } };
  }
  return { statut: 200, json: { recu: true, ignore: type || null } };
}
