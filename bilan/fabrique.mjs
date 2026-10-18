// La fabrique des rapports PDF du bilan de couple, lancée par le workflow
// bilan-rapport.yml (déclenché par la base dès qu'un bilan payé est fini des
// deux côtés, et par pg_cron en filet de sécurité).
//
// Pour chaque rapport « à faire » : le document HTML (gabarit partagé avec la
// page), le contrôle de mise en page dans Chrome, l'impression A4, le
// contrôle du PDF ; puis le fichier part dans le stockage privé
// bilan-rapports et la fonction `bilan` l'envoie par e-mail (action interne
// envoyer_rapport). Un rapport qui ne passe pas les contrôles n'est jamais
// envoyé : il passe en « erreur » (onglet Bilan de l'admin), le workflow
// échoue (GitHub prévient par e-mail), et la page continue d'afficher le
// rapport à l'écran.
//
// Au passage, les fichiers des bilans qui n'existent plus (supprimés ou
// effacés par le ménage) sont effacés du stockage.
//
// Secrets : SUPABASE_ACCESS_TOKEN et SUPABASE_PROJECT_REF (la clé de service
// est demandée à l'API de gestion), ou SUPABASE_URL et
// SUPABASE_SERVICE_ROLE_KEY en local.

import crypto from 'node:crypto';
import { lancer } from './navigateur.mjs';
import { fabriquerPdf } from './pdf.mjs';

const BUCKET = 'bilan-rapports';
const ESSAIS_MAX = 3;
const PAR_PASSAGE = 25;

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
    const service = cles.find((k) => k.name === 'service_role') || cles.find((k) => k.type === 'secret');
    if (!service?.api_key) throw new Error('pas de clé service dans le projet');
    cle = service.api_key;
    url = url || `https://${ref}.supabase.co`;
  }
  masquer(cle);
  return { url: url.replace(/\/$/, ''), cle };
}

function client({ url, cle }) {
  const entetes = (plus) => ({ apikey: cle, Authorization: `Bearer ${cle}`, ...(plus || {}) });
  async function appel(chemin, options = {}) {
    const r = await fetch(url + chemin, { ...options, headers: entetes(options.headers) });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      throw new Error(`${options.method || 'GET'} ${chemin.split('?')[0]} : ${r.status} ${t.slice(0, 300)}`);
    }
    return r;
  }
  const json = async (chemin, options) => (await appel(chemin, options)).json();
  return { appel, json, url, cle };
}

const iso = (ms) => new Date(Date.now() - ms).toISOString();

async function aFaire(db) {
  const vingt = encodeURIComponent(iso(20 * 60e3));
  const trente = encodeURIComponent(iso(30 * 60e3));
  const filtre = `or=(rapport_statut.eq.a_faire,and(rapport_statut.eq.en_cours,rapport_maj.lt.${vingt}),and(rapport_statut.eq.erreur,rapport_essais.lt.${ESSAIS_MAX},rapport_maj.lt.${trente}))`;
  return db.json(`/rest/v1/bilans?select=*&paye_le=not.is.null&a_fini=not.is.null&b_fini=not.is.null&${filtre}&order=paye_le.asc&limit=${PAR_PASSAGE}`);
}

// Prend la main sur un rapport, sauf si un autre passage l'a pris entre-temps.
async function prendre(db, ligne) {
  const r = await db.json(`/rest/v1/bilans?id=eq.${ligne.id}&rapport_statut=eq.${ligne.rapport_statut}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ rapport_statut: 'en_cours', rapport_maj: new Date().toISOString(), rapport_essais: (ligne.rapport_essais || 0) + 1 }),
  });
  return r.length === 1;
}

async function maj(db, id, champs) {
  await db.appel(`/rest/v1/bilans?id=eq.${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ ...champs, rapport_maj: new Date().toISOString() }),
  });
}

function donneesDe(ligne) {
  return {
    lang: ligne.lang,
    situation: ligne.situation,
    finiLe: ligne.a_fini > ligne.b_fini ? ligne.a_fini : ligne.b_fini,
    a: { prenom: ligne.a_prenom, genre: ligne.a_genre, reponses: ligne.a_reponses || {}, nn: ligne.a_nn || [] },
    b: { prenom: ligne.b_prenom, genre: ligne.b_genre, reponses: ligne.b_reponses || {}, nn: ligne.b_nn || [] },
  };
}

async function deposer(db, id, pdf) {
  const chemin = `${id}/${crypto.randomBytes(12).toString('hex')}.pdf`;
  await db.appel(`/storage/v1/object/${BUCKET}/${chemin}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/pdf', 'x-upsert': 'true', 'cache-control': 'no-store' },
    body: pdf,
  });
  return chemin;
}

async function effacer(db, chemins) {
  if (!chemins.length) return;
  await db.appel(`/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: chemins }),
  });
}

async function envoyer(db, id) {
  const r = await fetch(`${db.url}/functions/v1/bilan`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${db.cle}`, apikey: db.cle, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'envoyer_rapport', id }),
  });
  const corps = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`envoi : ${r.status} ${JSON.stringify(corps).slice(0, 200)}`);
  return corps;
}

// Les fichiers dont le bilan n'existe plus.
async function menage(db) {
  const dossiers = await db.json(`/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: '', limit: 1000, offset: 0 }),
  });
  const ids = dossiers.map((d) => d.name).filter((n) => /^[0-9a-f-]{36}$/.test(n));
  if (!ids.length) return 0;
  const vivants = new Set();
  for (let i = 0; i < ids.length; i += 100) {
    const lot = ids.slice(i, i + 100);
    const rows = await db.json(`/rest/v1/bilans?select=id&id=in.(${lot.join(',')})`);
    rows.forEach((r) => vivants.add(r.id));
  }
  let n = 0;
  for (const id of ids.filter((x) => !vivants.has(x))) {
    const fichiers = await db.json(`/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: id + '/', limit: 100, offset: 0 }),
    });
    await effacer(db, fichiers.map((f) => `${id}/${f.name}`));
    n += fichiers.length;
  }
  return n;
}

// Les rapports prêts depuis moins de deux jours dont un destinataire n'a pas
// encore reçu le PDF (fonction en panne au premier essai, Resend refusé...).
async function envoisEnRetard(db) {
  const rows = await db.json(`/rest/v1/bilans?select=id,envois,a_email,b_email,paiement_email&rapport_statut=eq.pret&rapport_maj=gt.${encodeURIComponent(iso(2 * 86400e3))}&limit=100`);
  return rows.filter((l) => {
    const recus = new Set((l.envois || []).filter((e) => e.ok).map((e) => String(e.email).toLowerCase()));
    const essais = (l.envois || []).length;
    return essais < 8 && [l.a_email, l.b_email, l.paiement_email].filter(Boolean).some((e) => !recus.has(e.toLowerCase()));
  }).map((l) => l.id);
}

async function principal() {
  const db = client(await connexion());
  const lignes = await aFaire(db);
  console.log(`[fabrique] ${lignes.length} rapport(s) à faire`);
  let echecs = 0;
  if (lignes.length) {
    const navigateur = await lancer();
    try {
      for (const ligne of lignes) {
        const court = ligne.id.slice(0, 8);
        if (!(await prendre(db, ligne))) { console.log(`[fabrique] ${court} pris par un autre passage`); continue; }
        const t0 = Date.now();
        try {
          const r = await fabriquerPdf(navigateur, donneesDe(ligne));
          if (r.problemes.length) {
            echecs++;
            console.error(`[fabrique] ${court} REFUSÉ : ${r.problemes.length} problème(s) de mise en page`);
            for (const p of r.problemes.slice(0, 10)) console.error('   ', JSON.stringify(p));
            await maj(db, ligne.id, { rapport_statut: 'erreur', rapport_erreur: JSON.stringify(r.problemes.slice(0, 5)).slice(0, 1900) });
            continue;
          }
          const chemin = await deposer(db, ligne.id, r.pdf);
          if (ligne.rapport_chemin && ligne.rapport_chemin !== chemin) await effacer(db, [ligne.rapport_chemin]).catch(() => {});
          await maj(db, ligne.id, { rapport_statut: 'pret', rapport_chemin: chemin, rapport_pages: r.pages, rapport_erreur: null });
          console.log(`[fabrique] ${court} prêt : ${r.pages} pages, ${Math.round(r.pdf.length / 1024)} Ko, ${Date.now() - t0} ms`);
          try {
            const e = await envoyer(db, ligne.id);
            console.log(`[fabrique] ${court} envoyé à ${e.envoyes || 0} adresse(s)${e.echecs ? `, ${e.echecs} échec(s)` : ''}`);
          } catch (e) {
            console.error(`[fabrique] ${court} PDF prêt mais pas envoyé : ${e.message}`);
          }
        } catch (e) {
          echecs++;
          console.error(`[fabrique] ${court} ÉCHEC : ${e.stack || e.message}`);
          await maj(db, ligne.id, { rapport_statut: 'erreur', rapport_erreur: String(e.message || e).slice(0, 1900) }).catch(() => {});
        }
      }
    } finally {
      await navigateur.close();
    }
  }
  for (const id of await envoisEnRetard(db).catch(() => [])) {
    try {
      const e = await envoyer(db, id);
      console.log(`[fabrique] ${id.slice(0, 8)} renvoi : ${e.envoyes || 0} adresse(s)`);
    } catch (e) {
      console.error(`[fabrique] ${id.slice(0, 8)} renvoi impossible : ${e.message}`);
    }
  }
  try {
    const n = await menage(db);
    if (n) console.log(`[fabrique] ${n} fichier(s) de bilans supprimés effacés`);
  } catch (e) {
    console.error(`[fabrique] ménage du stockage : ${e.message}`);
  }
  if (echecs) process.exit(1);
}

principal().catch((e) => {
  console.error('[fabrique]', e.stack || e.message);
  process.exit(1);
});
