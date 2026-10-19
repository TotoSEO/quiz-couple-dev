// Stripe sans bibliothèque : deux appels HTTP (créer une session de paiement,
// la relire) et la vérification de la signature des webhooks. JavaScript pur,
// pour tourner dans les fonctions Supabase (Deno) comme dans les tests (Node).

const API = 'https://api.stripe.com/v1';

// { a: { b: 1 }, c: [ { d: 2 } ] } → a[b]=1&c[0][d]=2 (le format de Stripe)
export function encoderFormulaire(obj) {
  const morceaux = [];
  const ajoute = (cle, valeur) => {
    if (valeur === undefined || valeur === null) return;
    if (Array.isArray(valeur)) {
      valeur.forEach((v, i) => ajoute(`${cle}[${i}]`, v));
    } else if (typeof valeur === 'object') {
      for (const [k, v] of Object.entries(valeur)) ajoute(`${cle}[${k}]`, v);
    } else {
      morceaux.push(encodeURIComponent(cle) + '=' + encodeURIComponent(String(valeur)));
    }
  };
  for (const [k, v] of Object.entries(obj)) ajoute(k, v);
  return morceaux.join('&');
}

export function creerStripe({ cle, fetch: f = fetch }) {
  async function appel(methode, chemin, params) {
    const options = {
      method: methode,
      headers: { Authorization: 'Bearer ' + cle },
    };
    if (params) {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.body = encoderFormulaire(params);
    }
    const r = await f(API + chemin, options);
    let json = null;
    try { json = await r.json(); } catch { json = null; }
    if (!r.ok) {
      const message = json?.error?.message || ('HTTP ' + r.status);
      const e = new Error('stripe: ' + message);
      e.statut = r.status;
      throw e;
    }
    return json;
  }
  return {
    creerSession: (params) => appel('POST', '/checkout/sessions', params),
    lireSession: (id) => appel('GET', '/checkout/sessions/' + encodeURIComponent(id)),
  };
}

function hex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function egaux(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// En-tête Stripe-Signature : « t=1700000000,v1=abc...,v1=def... ». La
// signature est un HMAC-SHA256 de « t.corps » avec la clé du webhook ; on
// refuse un horodatage à plus de `tolerance` secondes (rejeu).
export async function verifierSignature(corps, entete, secret, maintenantSec, tolerance = 300) {
  if (!entete || !secret) return false;
  const parts = String(entete).split(',').map((x) => x.trim().split('='));
  const t = parts.find(([k]) => k === 't')?.[1];
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || !signatures.length || !/^\d+$/.test(t)) return false;
  const maintenant = maintenantSec ?? Math.floor(Date.now() / 1000);
  if (Math.abs(maintenant - Number(t)) > tolerance) return false;
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const attendu = hex(await crypto.subtle.sign('HMAC', k, enc.encode(t + '.' + corps)));
  return signatures.some((s) => egaux(s, attendu));
}

// Pour les tests : l'en-tête qu'enverrait Stripe pour ce corps.
export async function signer(corps, secret, t) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return 't=' + t + ',v1=' + hex(await crypto.subtle.sign('HMAC', k, enc.encode(t + '.' + corps)));
}
