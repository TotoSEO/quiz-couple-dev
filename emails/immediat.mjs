// L'e-mail 1 envoyé dans la minute (29 octobre 2026, Thomas : « Vas-y et non
// pour brevo payant ») : ce que la base garde pour que lead-capture l'envoie
// (emails_modeles : le HTML de l'e1 par langue et par version, les phrases
// d'accroche, la salutation ; emails_reglages : REGLAGES.immediat et ce qui
// va avec), écrit à chaque passage du soir (emails/parcours.mjs) et par
// l'installation, et l'essai de l'envoi transactionnel vers une adresse
// (brevo-reglages.yml, action « essai-immediat »). Conception dans
// docs/emailing/CONCEPTION.md.
//
//   node emails/immediat.mjs essai <adresse> [langues=fr] [prenom=Thomas] [versions=a,b]

import { REGLAGES } from './reglages.mjs';
import { LANGUES, VERSIONS, ANGLES, campagne, textes, typo, intro, famillesDesSources } from './contenu.mjs';
import { adresseVariante } from './essai.mjs';
import { corpsBrevo } from '../supabase/functions/_shared/emails/immediat.mjs';

// Un modèle vaut 30 heures : refait chaque soir vers 19 h, il couvre le
// lendemain même quand le passage part une heure plus tard. Sans passage
// pour le refaire, plus rien ne part tout de suite et la file du soir
// reprend la main. La réduction n'est annoncée que si elle vaut encore le
// lendemain (prixDu), et le paiement la garde douze heures après sa fin.
export const VALIDITE_H = 30;

export const ETIQUETTE_ESSAI = 'essai-immediat';

// La mise en service (réglages écrits par « installer ») : avant, aucune
// adresse ne pouvait recevoir l'e1 tout de suite, et verif.mjs compte le
// premier jour à partir de là.
export const MISE_EN_SERVICE = Date.parse('2026-10-29T08:50:46Z');

// Les adresses laissées à une porte des résultats (abonnes : id, lang,
// source, statut, created_at) qui pouvaient recevoir l'e1 tout de suite
// (actives, dans une langue de l'envoi immédiat), et ce qu'il en est advenu
// d'après leurs lignes e1 (emails_envois : abonne_id, immediat) : parti tout
// de suite, parti un soir, encore dans la minute d'attente, ou rien. Une
// adresse sans rien est dans une évaluation, au-delà du plafond du jour, ou
// perdue en route : le journal de lead-capture dit laquelle (verif.mjs).
export function bilanArrivees(arrivees, envois, langues, maintenant = Date.now()) {
  const visees = arrivees.filter((x) => x.statut === 'actif' && x.source !== 'ebook' && langues.has(x.lang));
  const e1 = new Map(envois.map((x) => [x.abonne_id, x.immediat === true]));
  const b = { arrivees: arrivees.length, visees: visees.length, tout: 0, soir: 0, attente: 0, sans: 0, parLangue: {} };
  for (const x of arrivees) b.parLangue[x.lang] = (b.parLangue[x.lang] || 0) + 1;
  for (const x of visees) {
    if (e1.has(x.id)) b[e1.get(x.id) ? 'tout' : 'soir']++;
    // La minute laissée pour le prénom, l'envoi, et une marge.
    else if (maintenant - Date.parse(x.created_at) < 3 * 60e3) b.attente++;
    else b.sans++;
  }
  return b;
}

// Une ligne de emails_modeles par langue et par version de l'e1.
export function modeles(instant = new Date()) {
  const lignes = [];
  for (const lang of LANGUES) {
    const t = textes(lang);
    const intros = Object.fromEntries(ANGLES.map((a) => [a, intro('e1', lang, a)]));
    const salutations = { prenom: typo(t.salutation.prenom, lang), sans: typo(t.salutation.sans, lang) };
    for (const version of VERSIONS) {
      const c = campagne('e1', lang, instant, { version });
      lignes.push({
        type: 'e1', lang, version, sujet: c.sujet, html: c.html, expediteur: c.expediteur, promo: c.promo,
        intros, salutations,
        valide_jusqu_a: new Date(instant.getTime() + VALIDITE_H * 3600e3).toISOString(),
        maj_le: instant.toISOString(),
      });
    }
  }
  return lignes;
}

// Ce que la base lit sous la clé « immediat » de emails_reglages. L'envoi
// immédiat ne vaut qu'en mode « reel ».
export function reglagesImmediat(mode = REGLAGES.mode) {
  const i = REGLAGES.immediat || {};
  return {
    actif: !!i.actif && mode === 'reel',
    parJour: Number.isInteger(i.parJour) && i.parJour > 0 ? i.parJour : 0,
    langues: (Array.isArray(i.langues) ? i.langues : []).filter((l) => LANGUES.includes(l)),
    ab: !!REGLAGES.ab,
    version: REGLAGES.version,
    expediteur: REGLAGES.expediteur,
    repondreA: REGLAGES.repondreA,
    angles: famillesDesSources(),
  };
}

// Écrit les réglages, et les modèles quand l'envoi immédiat est actif.
export async function publierImmediat(base, { instant = new Date(), mode = REGLAGES.mode } = {}) {
  const valeur = reglagesImmediat(mode);
  let n = 0;
  if (valeur.actif) {
    const lignes = modeles(instant);
    await base.insert('emails_modeles', lignes, { conflit: 'type,lang,version' });
    n = lignes.length;
  }
  await base.insert('emails_reglages', [{ cle: 'immediat', valeur, maj_le: instant.toISOString() }], { conflit: 'cle' });
  return { actif: valeur.actif, modeles: n };
}

// Ce que emails_immediat_prendre rendrait pour une personne : de quoi
// essayer l'envoi sans passer par la base.
export function pourEssai(ligne, { email, prenom = null, angle = 'score' } = {}) {
  const p = prenom ? String(prenom).trim().slice(0, 40) : '';
  return {
    email,
    lang: ligne.lang,
    version: ligne.version,
    sujet: ligne.sujet,
    html: ligne.html,
    expediteur: ligne.expediteur || REGLAGES.expediteur.name,
    adresse: REGLAGES.expediteur.email,
    repondre_a: REGLAGES.repondreA,
    intro: ligne.intros[angle] || ligne.intros.general,
    salutation: p ? ligne.salutations.prenom.replace('[[prenom]]', p) : ligne.salutations.sans,
  };
}

// L'essai : l'e1 immédiat de chaque langue et version, par l'API
// transactionnelle, vers une adresse « +immediat-... » de la même boîte, le
// sujet marqué « [Essai immédiat] ». Le lien de désinscription mène à la page
// de lead-capture sans jeton : il ne désinscrit personne. Son étiquette n'est
// pas celle d'une version (ETIQUETTE_ESSAI) : les chiffres du test A/B que
// lit verif.mjs ne comptent pas les essais.
export async function essaiImmediat({ brevo, adresse, langues, prenom, versions, fonctions, maintenant = new Date(), journal = (m) => console.log(m) }) {
  if (!/^[^\s@+]+(\+[^\s@]*)?@[^\s@]+\.[^\s@]+$/.test(String(adresse || ''))) throw new Error('adresse d\'essai invalide');
  const lignes = modeles(maintenant);
  let n = 0;
  for (const lang of langues) {
    for (const version of versions) {
      const ligne = lignes.find((l) => l.lang === lang && l.version === version);
      const d = pourEssai(ligne, { email: adresseVariante(adresse, 'immediat', lang, 'score', version), prenom });
      d.sujet = `[Essai immédiat ${lang} ${version}] ${d.sujet}`;
      const r = await brevo.envoyerTransactionnel({ ...corpsBrevo(d, `${fonctions}/lead-capture?d=essai&lang=${lang}`), tags: [ETIQUETTE_ESSAI] });
      journal(`${lang} ${version} : parti${r && r.messageId ? ', identifiant du message reçu' : ', SANS identifiant de message'}${ligne.promo ? ', avec la réduction' : ''}.`);
      n++;
    }
  }
  return n;
}

const liste = (texte, permis, defaut) => {
  const v = String(texte || '').split(',').map((s) => s.trim()).filter(Boolean);
  const choisis = v.length ? v : defaut;
  for (const x of choisis) if (!permis.includes(x)) throw new Error(`valeur inconnue : ${x} (${permis.join(', ')})`);
  return choisis;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const [action, adresse, langues, prenom, versions] = process.argv.slice(2);
  try {
    if (action !== 'essai') throw new Error('usage : node emails/immediat.mjs essai <adresse> [langues] [prenom] [versions]');
    const ref = process.env.SUPABASE_PROJECT_REF;
    if (!ref) throw new Error('SUPABASE_PROJECT_REF manquant');
    const { clientBrevo } = await import('./brevo.mjs');
    const n = await essaiImmediat({
      brevo: clientBrevo(process.env.BREVO_API_KEY),
      adresse,
      langues: liste(langues, LANGUES, ['fr']),
      prenom: (prenom || '').trim() || null,
      versions: liste(versions, VERSIONS, ['a', 'b']),
      fonctions: `https://${ref}.supabase.co/functions/v1`,
    });
    console.log(`${n} e-mail(s) d'essai envoyé(s) par l'API transactionnelle.`);
  } catch (e) {
    console.error(`Échec de l'essai : ${e.message}`);
    process.exit(1);
  }
}
