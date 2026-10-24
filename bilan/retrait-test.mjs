// Retirer une évaluation de test des chiffres de l'admin (24 octobre 2026,
// Thomas : « Dans mon admin y'a écrit 3 pdf générés, 3 ventes et tout mais la
// première vente c'était moi c'était un test donc tu peux retirer tout ça stp
// pour pas que ça fausse le reste »). Lancé à la main par bilan-retrait.yml :
//
//   node bilan/retrait-test.mjs lister          les évaluations payées, sans prénom ni adresse
//                                               (EMPREINTES : signale celles faites avec ces adresses)
//   node bilan/retrait-test.mjs essai <id8>     ce qui serait retiré, sans rien toucher
//   node bilan/retrait-test.mjs retirer <id8>   le retrait
//
// <id8> : le début de l'identifiant que donne « lister » (huit caractères au
// moins). Le retrait enlève ce que l'évaluation a compté dans bilan_compteurs
// (chaque compteur à son jour, comme le déclencheur bilans_compte et la
// fonction bilan les ont écrits), son PDF du stockage bilan-rapports, puis sa
// ligne de bilans. Les comptes dont le jour ne se lit pas dans la ligne (la
// situation, la première réponse, les domaines) ne sont retirés que si toute
// l'évaluation s'est faite le même jour, et jamais un compte ne descend sous
// zéro. Les visites de la page (vue, clic sur « Commencer », écrans vus) ne
// sont rattachées à aucune évaluation : elles restent.
//
// Secrets : SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF (la clé de service
// est demandée à l'API de gestion, comme pour la fabrique), ou SUPABASE_URL et
// SUPABASE_SERVICE_ROLE_KEY en local. Rien de personnel n'est écrit au journal.

import { createHash } from 'node:crypto';
import { etapes } from '../supabase/functions/_shared/bilan/coeur.mjs';

const BUCKET = 'bilan-rapports';
const fmt = (options) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', ...options });
export const jourParis = (iso) => fmt({ year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
const heureParis = (iso) => (iso ? `${jourParis(iso)} ${fmt({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso))}` : '-');
const vide = (o) => !o || (typeof o === 'object' && !Object.keys(o).length);

// Ce que l'évaluation a compté, compteur par compteur : { jour, evenement,
// cle, n, montant }. `surs` : le jour se lit dans la ligne ; `memeJour` : les
// comptes sans date, retirés seulement quand toute l'évaluation tient dans une
// journée (`unJour` dit si c'est le cas).
export function retraitsPour(ligne) {
  const s = ligne.src || 'direct';
  const solo = ligne.mode === 'solo';
  const surs = [];
  const ajoute = (liste, quand, evenement, cle = '', montant = 0) => {
    if (quand) liste.push({ jour: jourParis(quand), evenement, cle, n: 1, montant });
  };
  ajoute(surs, ligne.cree_le, 'cree', s);
  if (solo) ajoute(surs, ligne.cree_le, 'cree_solo', s);
  if (!solo) ajoute(surs, ligne.b_consent, 'rejoint', s);
  ajoute(surs, ligne.a_fini, 'fini_a', s);
  if (solo) ajoute(surs, ligne.a_fini, 'fini_a_solo', s);
  if (!solo) ajoute(surs, ligne.b_fini, 'fini_b', s);
  const finis = [ligne.a_fini, solo ? null : ligne.b_fini].filter(Boolean).sort();
  if (finis.length) ajoute(surs, finis[0], 'premier_fini', s);
  if (solo) ajoute(surs, ligne.a_fini, 'deux_finis', s);
  else if (ligne.a_fini && ligne.b_fini) ajoute(surs, finis[finis.length - 1], 'deux_finis', s);
  ajoute(surs, ligne.renonciation_le, 'paiement_ouvert', s);
  if (solo) ajoute(surs, ligne.renonciation_le, 'paiement_ouvert_solo', s);
  const montant = Number(ligne.paiement_montant) || 0;
  ajoute(surs, ligne.paye_le, 'paye', s, montant);
  if (solo) ajoute(surs, ligne.paye_le, 'paye_solo', s, montant);
  ajoute(surs, ligne.rembourse_le, 'rembourse', s, montant);
  if (ligne.rapport_statut === 'pret') ajoute(surs, ligne.rapport_maj, 'rapport_pret');
  for (const e of Array.isArray(ligne.envois) ? ligne.envois : []) ajoute(surs, e && e.le, e && e.ok ? 'envoi_ok' : 'envoi_echec');
  ajoute(surs, ligne.pret_mail_le, 'pret_envoye');
  ajoute(surs, ligne.relance_le, 'relance_envoye');
  for (const r of solo ? ['a'] : ['a', 'b']) {
    const le = ligne[r + '_reprise_le'];
    if (!le) continue;
    const fini = ligne[r + '_fini'];
    ajoute(surs, le, 'reprise_envoye', !fini || fini > le ? 'moi' : 'autre');
  }

  const memeJour = [];
  const situ = ligne.situation || {};
  if (!vide(situ)) {
    memeJour.push({ evenement: 'situation', cle: s });
    if (solo) memeJour.push({ evenement: 'situation_solo', cle: s });
  }
  for (const r of solo ? ['a'] : ['a', 'b']) {
    const rep = ligne[r + '_reponses'] || {};
    if (vide(rep)) continue;
    memeJour.push({ evenement: 'commence_' + r, cle: s });
    if (solo) memeJour.push({ evenement: 'commence_a_solo', cle: s });
    const { entres, finis: faits } = etapes(situ, rep);
    for (const d of entres) memeJour.push({ evenement: 'domaine_entre', cle: d });
    for (const d of faits) memeJour.push({ evenement: 'domaine_fini', cle: d });
  }
  const dates = [ligne.cree_le, ligne.b_consent, ligne.a_fini, solo ? null : ligne.b_fini].filter(Boolean).map(jourParis);
  const unJour = dates.length > 1 && dates.every((j) => j === dates[0]) && (solo || !!ligne.b_fini);
  return {
    surs,
    unJour,
    jour: unJour ? dates[0] : null,
    memeJour: memeJour.map((x) => ({ ...x, jour: unJour ? dates[0] : null, n: 1, montant: 0 })),
  };
}

// Les retraits regroupés par compteur (un même compteur peut revenir, deux
// envois du rapport le même jour par exemple).
export function regrouper(liste) {
  const m = new Map();
  for (const x of liste) {
    const k = `${x.jour}|${x.evenement}|${x.cle}`;
    const y = m.get(k) || { jour: x.jour, evenement: x.evenement, cle: x.cle, n: 0, montant: 0 };
    y.n += x.n;
    y.montant += x.montant;
    m.set(k, y);
  }
  return [...m.values()].sort((a, b) => (a.jour + a.evenement + a.cle).localeCompare(b.jour + b.evenement + b.cle));
}

const masquer = (v) => { if (v && process.env.GITHUB_ACTIONS) console.log(`::add-mask::${v}`); };

async function connexion(env = process.env) {
  let url = env.SUPABASE_URL;
  let cle = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!cle) {
    const ref = env.SUPABASE_PROJECT_REF;
    const jeton = env.SUPABASE_ACCESS_TOKEN;
    if (!ref || !jeton) throw new Error('ni clé service, ni SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF');
    const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys?reveal=true`, { headers: { Authorization: `Bearer ${jeton}` } });
    if (!r.ok) throw new Error(`clés introuvables (${r.status})`);
    const cles = await r.json();
    const k = cles.find((x) => x.name === 'service_role' && x.api_key) || cles.find((x) => x.type === 'secret' && x.api_key);
    if (!k) throw new Error('pas de clé service dans le projet');
    cle = k.api_key;
    url = url || `https://${ref}.supabase.co`;
  }
  masquer(cle);
  url = url.replace(/\/$/, '');
  async function appel(chemin, options = {}) {
    const r = await fetch(url + chemin, { ...options, headers: { apikey: cle, Authorization: `Bearer ${cle}`, ...(options.headers || {}) } });
    const t = await r.text();
    if (!r.ok) throw new Error(`${options.method || 'GET'} ${chemin.split('?')[0]} : ${r.status} ${t.slice(0, 300)}`);
    return t ? JSON.parse(t) : null;
  }
  return { appel };
}

const COLONNES = 'id,mode,lang,src,cree_le,b_consent,a_fini,b_fini,renonciation_le,paye_le,rembourse_le,paiement_montant,'
  + 'rapport_statut,rapport_maj,rapport_chemin,envois,pret_mail_le,relance_le,a_reprise_le,b_reprise_le,situation,a_reponses,b_reponses';

// L'empreinte SHA-256 d'une adresse en minuscules : « lister » signale les
// évaluations faites avec une adresse donnée (EMPREINTES, séparées par des
// virgules) sans que l'adresse elle-même passe par le workflow ni le journal.
export const empreinte = (email) => createHash('sha256').update(String(email || '').trim().toLowerCase()).digest('hex');

async function lister(db, empreintes) {
  const lignes = await db.appel(`/rest/v1/bilans?select=id,mode,lang,src,cree_le,paye_le,rembourse_le,paiement_montant,rapport_statut,a_email,b_email,paiement_email&paye_le=not.is.null&order=paye_le.asc`);
  console.log(`${lignes.length} évaluation(s) payée(s), de la plus ancienne à la plus récente :`);
  for (const l of lignes) {
    const marquee = [l.a_email, l.b_email, l.paiement_email].some((e) => e && empreintes.includes(empreinte(e)));
    console.log(`  ${l.id.slice(0, 8)} · ${l.mode} · ${l.lang} · source ${l.src || 'direct'} · créée ${heureParis(l.cree_le)} · payée ${heureParis(l.paye_le)}`
      + ` · ${((Number(l.paiement_montant) || 0) / 100).toFixed(2)} € · PDF ${l.rapport_statut || '-'}${l.rembourse_le ? ' · remboursée' : ''}`
      + (marquee ? ' · ★ adresse donnée' : ''));
  }
}

async function retirer(db, prefixe, appliquer) {
  if (!/^[0-9a-f]{8}(-[0-9a-f-]*)?$/.test(prefixe || '')) throw new Error('identifiant attendu : les huit premiers caractères donnés par « lister »');
  const bas = prefixe.toLowerCase();
  const tous = await db.appel(`/rest/v1/bilans?select=id&paye_le=not.is.null`);
  const ids = tous.map((x) => x.id).filter((id) => id.startsWith(bas));
  if (ids.length !== 1) throw new Error(`${ids.length} évaluation(s) payée(s) commencent par ${bas} : il en faut exactement une`);
  const [ligne] = await db.appel(`/rest/v1/bilans?select=${COLONNES}&id=eq.${ids[0]}`);
  const { surs, unJour, jour, memeJour } = retraitsPour(ligne);
  const plan = regrouper(unJour ? surs.concat(memeJour) : surs);
  console.log(`Évaluation ${bas} · ${ligne.mode} · payée ${heureParis(ligne.paye_le)} · PDF ${ligne.rapport_statut || '-'}`);
  console.log(unJour
    ? `Toute l'évaluation s'est faite le ${jour} : la situation, les premières réponses et les domaines sont retirés aussi.`
    : 'L\'évaluation s\'est étalée sur plusieurs jours : la situation, les premières réponses et les domaines restent comptés (leur jour ne se lit pas).');
  let retires = 0;
  for (const x of plan) {
    const filtre = `jour=eq.${x.jour}&evenement=eq.${encodeURIComponent(x.evenement)}&cle=eq.${encodeURIComponent(x.cle)}`;
    const [c] = await db.appel(`/rest/v1/bilan_compteurs?select=n,montant&${filtre}`);
    if (!c) {
      console.log(`  ${x.jour} ${x.evenement}${x.cle ? ' [' + x.cle + ']' : ''} : compteur introuvable, rien à retirer`);
      continue;
    }
    const n = Math.max(0, (Number(c.n) || 0) - x.n);
    const montant = Math.max(0, (Number(c.montant) || 0) - x.montant);
    console.log(`  ${x.jour} ${x.evenement}${x.cle ? ' [' + x.cle + ']' : ''} : ${c.n} → ${n}${x.montant ? ` · ${(c.montant / 100).toFixed(2)} € → ${(montant / 100).toFixed(2)} €` : ''}`);
    if (appliquer) {
      await db.appel(`/rest/v1/bilan_compteurs?${filtre}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ n, montant }),
      });
    }
    retires++;
  }
  if (!appliquer) {
    console.log(`Essai : ${retires} compteur(s) à corriger, le PDF et la ligne à effacer. Rien n'a été touché.`);
    return;
  }
  if (ligne.rapport_chemin) {
    await db.appel(`/storage/v1/object/${BUCKET}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: [ligne.rapport_chemin] }),
    });
    console.log('PDF effacé du stockage.');
  }
  await db.appel(`/rest/v1/bilans?id=eq.${ligne.id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
  console.log(`Retirée : ${retires} compteur(s) corrigé(s), l'évaluation et son PDF effacés.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [action, id] = process.argv.slice(2);
  try {
    const db = await connexion();
    if (action === 'lister') await lister(db, String(process.env.EMPREINTES || '').toLowerCase().split(',').map((x) => x.trim()).filter((x) => /^[0-9a-f]{64}$/.test(x)));
    else if (action === 'essai' || action === 'retirer') await retirer(db, id, action === 'retirer');
    else throw new Error('action : lister, essai ou retirer');
  } catch (e) {
    console.error(`Échec : ${e.message}`);
    process.exit(1);
  }
}
