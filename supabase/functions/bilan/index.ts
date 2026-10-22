// Le bilan de couple : création, réponses, rapport, paiement, envoi du PDF,
// suppression. Toute la logique est dans ../_shared/bilan/serveur.mjs
// (testée en Node) ; ce fichier ne fait que brancher la base, Stripe, Resend
// et les en-têtes HTTP. Conception : docs/bilan/CONCEPTION.md. Secrets :
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (fournis par Supabase),
// STRIPE_SECRET_KEY (sans lui, tout marche sauf le paiement, qui répond
// « paiement_ferme »), RESEND_API_KEY (déjà là pour l'ebook ; sans lui le PDF
// n'est pas envoyé, il reste téléchargeable), et BILAN_SEL, facultatif, pour
// l'empreinte des adresses IP.
//
// La fabrique du PDF (bilan/fabrique.mjs) appelle l'action interne
// `envoyer_rapport` avec la clé de service en Authorization et en
// x-cle-service, et bilan/relance.mjs l'action `relancer` de la même façon.
// L'admin appelle `apercu_paiement` avec son jeton en x-admin-token (le même
// que verify-admin fabrique et que admin-stats vérifie).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore module JavaScript partagé avec les tests Node
import { creerServeur } from "../_shared/bilan/serveur.mjs";
// @ts-ignore
import { creerStockageRest } from "../_shared/bilan/stockage-rest.mjs";
// @ts-ignore
import { creerStripe } from "../_shared/bilan/stripe.mjs";
// @ts-ignore
import { creerCourriel } from "../_shared/bilan/courriel.mjs";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const RESEND_KEY = Deno.env.get('RESEND_API_KEY') || '';
const SEL = Deno.env.get('BILAN_SEL') || SERVICE_KEY.slice(-16);

const serveur = creerServeur({
  stockage: creerStockageRest({ url: SUPABASE_URL, cle: SERVICE_KEY, fetch }),
  stripe: STRIPE_KEY ? creerStripe({ cle: STRIPE_KEY, fetch }) : null,
  stripeTest: STRIPE_KEY.startsWith('sk_test_'),
  courriel: RESEND_KEY ? creerCourriel({ cle: RESEND_KEY, fetch }) : null,
  sel: SEL,
});

// La clé de service, comparée en temps constant. La fabrique et la relance
// l'envoient en Authorization et dans l'en-tête x-cle-service : selon les clés
// du projet, la passerelle de Supabase peut réécrire Authorization, l'en-tête
// dédié arrive tel quel. Sont acceptées SUPABASE_SERVICE_ROLE_KEY et, quand
// Supabase la fournit, chaque clé de SUPABASE_SECRET_KEYS (objet JSON nom →
// clé). Jusqu'au 22 octobre 2026, seule Authorization comparée à la clé de
// service : chaque passage de la relance répondait 403 « interne ».
const CLES_INTERNES: string[] = (() => {
  const l = [SERVICE_KEY];
  try {
    const brut = Deno.env.get('SUPABASE_SECRET_KEYS');
    if (brut) for (const v of Object.values(JSON.parse(brut))) if (typeof v === 'string') l.push(v);
  } catch { /* format inattendu : la clé de service seule */ }
  return l.filter(Boolean);
})();

async function empreinte(s: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
}

async function estInterne(req: Request): Promise<boolean> {
  const auth = req.headers.get('authorization') || '';
  const recues = [auth.startsWith('Bearer ') ? auth.slice(7) : '', req.headers.get('x-cle-service') || ''].filter(Boolean);
  if (!recues.length || !CLES_INTERNES.length) return false;
  const attendues = await Promise.all(CLES_INTERNES.map(empreinte));
  let ok = false;
  for (const r of recues) {
    const x = await empreinte(r);
    for (const y of attendues) {
      let diff = 0;
      for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
      if (diff === 0) ok = true;
    }
  }
  return ok;
}

// Le jeton de l'admin : « horodatageHex.signatureHex », HMAC-SHA256 de
// l'horodatage avec ADMIN_PASSWORD, valable 24 heures, comme dans
// admin-stats. crypto.subtle.verify compare en temps constant.
async function estAdmin(req: Request): Promise<boolean> {
  const jeton = req.headers.get('x-admin-token') || '';
  const secret = Deno.env.get('ADMIN_PASSWORD');
  if (!jeton || !secret) return false;
  const parts = jeton.split('.');
  if (parts.length !== 2) return false;
  const [horodatageHex, signatureHex] = parts;
  if (!/^[0-9a-f]{1,12}$/i.test(horodatageHex) || !/^[0-9a-f]{64}$/i.test(signatureHex)) return false;
  const age = Math.floor(Date.now() / 1000) - parseInt(horodatageHex, 16);
  if (!(age >= -300 && age <= 86400)) return false;
  const signature = new Uint8Array(32);
  for (let i = 0; i < 32; i++) signature[i] = parseInt(signatureHex.slice(i * 2, i * 2 + 2), 16);
  const enc = new TextEncoder();
  const cle = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('HMAC', cle, signature, enc.encode(horodatageHex));
}

// Une page qui enregistre chaque réponse fait une centaine d'appels pour un
// bilan : 240 par minute et par adresse IP laissent toute la marge, et
// arrêtent un script qui tournerait en boucle.
const LIMITE = 240;
const FENETRE_MS = 60 * 1000;
const TAILLE_MAX = 30000;
const appels = new Map<string, { n: number; fin: number }>();

function autorise(ip: string): boolean {
  const t = Date.now();
  const e = appels.get(ip);
  if (!e || t > e.fin) {
    if (appels.size > 5000) appels.clear();
    appels.set(ip, { n: 1, fin: t + FENETRE_MS });
    return true;
  }
  if (e.n >= LIMITE) return false;
  e.n++;
  return true;
}

function reponse(statut: number, json: unknown) {
  return new Response(JSON.stringify(json), {
    status: statut,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reponse(405, { erreur: 'methode' });
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'inconnue';
  if (!autorise(ip)) return reponse(429, { erreur: 'trop' });
  const texte = await req.text();
  if (texte.length > TAILLE_MAX) return reponse(413, { erreur: 'taille' });
  let corps: unknown;
  try { corps = JSON.parse(texte); } catch { return reponse(400, { erreur: 'json' }); }
  try {
    const r = await serveur.traiter(corps, { ip, interne: await estInterne(req), admin: await estAdmin(req) });
    return reponse(r.statut, r.json);
  } catch (e) {
    console.error('[bilan]', e);
    return reponse(500, { erreur: 'serveur' });
  }
});
