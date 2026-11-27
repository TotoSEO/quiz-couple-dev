// Les paiements reçus chez Stripe, pour le livre des recettes (27 novembre
// 2026, Thomas : « recense tous les paiements que j'ai reçu sur stripe »).
//
// Réservée à la clé de service, comme les actions internes de la fonction
// `bilan` : le workflow « Comptabilité · paiements Stripe »
// (compta-paiements.yml, compta/paiements.mjs) l'appelle, puis chiffre la
// réponse avant de l'écrire dans son journal, qui est public. Elle ne fait
// que lire chez Stripe, depuis une date : les sessions de paiement
// terminées (avec les métadonnées que posent nos pages de paiement, qui
// disent ce qui a été vendu, et la remise d'un code de promotion), les
// paiements (le moyen de paiement, les frais) et les remboursements. Rien
// n'est écrit, ni chez Stripe ni dans la base. Aucune adresse e-mail ne
// sort : seulement une empreinte, pour reconnaître les achats faits par
// Thomas pour essayer.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const API = 'https://api.stripe.com/v1';

// La clé de service, comparée en temps constant, en Authorization ou dans
// l'en-tête x-cle-service : SUPABASE_SERVICE_ROLE_KEY et, quand Supabase la
// fournit, chaque clé de SUPABASE_SECRET_KEYS (la même règle que bilan).
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

// Les seize premiers caractères hexadécimaux du SHA-256 de l'adresse en
// minuscules : de quoi reconnaître une adresse qu'on connaît déjà, sans
// jamais la transporter.
async function empreinteEmail(e: unknown): Promise<string | null> {
  if (typeof e !== 'string' || !e.includes('@')) return null;
  const o = await empreinte(e.trim().toLowerCase());
  return Array.from(o.slice(0, 8)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Les métadonnées que posent nos pages de paiement (bilan/serveur.mjs,
// astro/serveur.mjs) : rien d'autre ne sort.
const META = ['bilan', 'astro', 'role', 'mode', 'formule', 'zone', 'apercu'];
function meta(m: unknown): Record<string, string> {
  const r: Record<string, string> = {};
  if (m && typeof m === 'object') {
    for (const k of META) {
      const v = (m as Record<string, unknown>)[k];
      if (typeof v === 'string') r[k] = v.slice(0, 80);
    }
  }
  return r;
}

// Une liste de Stripe, page par page (100 lignes par page, 40 pages au plus).
async function liste(chemin: string, params: Record<string, string>): Promise<any[]> {
  const tout: any[] = [];
  let apres = '';
  for (let page = 0; page < 40; page++) {
    const q = new URLSearchParams({ limit: '100', ...params });
    if (apres) q.set('starting_after', apres);
    const r = await fetch(`${API}/${chemin}?${q}`, { headers: { Authorization: 'Bearer ' + STRIPE_KEY } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`${chemin} ${r.status} ${String(j?.error?.message || '').slice(0, 200)}`);
    const data = Array.isArray(j.data) ? j.data : [];
    tout.push(...data);
    if (!j.has_more || !data.length) return tout;
    apres = data[data.length - 1].id;
  }
  throw new Error(`${chemin} : plus de 4 000 lignes, prendre une date plus récente`);
}

const idDe = (x: unknown): string | null =>
  typeof x === 'string' ? x : (x && typeof x === 'object' && typeof (x as any).id === 'string' ? (x as any).id : null);

function reponse(statut: number, json: unknown) {
  return new Response(JSON.stringify(json), {
    status: statut,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

serve(async (req: Request) => {
  if (req.method !== 'POST') return reponse(405, { erreur: 'methode' });
  if (!(await estInterne(req))) return reponse(403, { erreur: 'interne' });
  if (!STRIPE_KEY) return reponse(503, { erreur: 'stripe_absent' });
  let corps: any = {};
  try { corps = JSON.parse((await req.text()).slice(0, 2000) || '{}'); } catch { return reponse(400, { erreur: 'json' }); }
  const depuis = typeof corps.depuis === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(corps.depuis) ? corps.depuis : '2026-10-01';
  // Minuit à Paris est au plus tard 22 h UTC la veille : on lit deux heures
  // plus tôt, le script range ensuite chaque paiement à son jour de Paris.
  const gte = String(Math.floor(Date.parse(depuis + 'T00:00:00Z') / 1000) - 7200);
  try {
    const [sessions, charges, remboursements] = await Promise.all([
      liste('checkout/sessions', { 'created[gte]': gte, status: 'complete' }),
      liste('charges', { 'created[gte]': gte, 'expand[]': 'data.balance_transaction' }),
      liste('refunds', { 'created[gte]': gte }),
    ]);
    return reponse(200, {
      compte: STRIPE_KEY.startsWith('sk_live_') ? 'live' : 'test',
      depuis,
      lu_le: new Date().toISOString(),
      sessions: await Promise.all(sessions.map(async (s) => ({
        id: s.id,
        cree: s.created,
        statut: s.status,
        paiement: s.payment_status,
        montant: s.amount_total,
        avant_remise: s.amount_subtotal,
        remise: s.total_details?.amount_discount ?? 0,
        devise: s.currency,
        intent: idDe(s.payment_intent),
        meta: meta(s.metadata),
        pays: s.customer_details?.address?.country ?? null,
        email: await empreinteEmail(s.customer_details?.email || s.customer_email),
      }))),
      charges: await Promise.all(charges.map(async (c) => ({
        id: c.id,
        cree: c.created,
        statut: c.status,
        paye: c.paid,
        montant: c.amount,
        capture: c.amount_captured,
        rembourse: c.amount_refunded,
        devise: c.currency,
        intent: idDe(c.payment_intent),
        type: c.payment_method_details?.type ?? null,
        wallet: c.payment_method_details?.card?.wallet?.type ?? null,
        marque: c.payment_method_details?.card?.brand ?? null,
        pays: c.payment_method_details?.card?.country ?? null,
        frais: typeof c.balance_transaction === 'object' && c.balance_transaction ? c.balance_transaction.fee : null,
        net: typeof c.balance_transaction === 'object' && c.balance_transaction ? c.balance_transaction.net : null,
        meta: meta(c.metadata),
        email: await empreinteEmail(c.billing_details?.email || c.receipt_email),
      }))),
      remboursements: remboursements.map((r) => ({
        id: r.id,
        cree: r.created,
        statut: r.status,
        montant: r.amount,
        devise: r.currency,
        intent: idDe(r.payment_intent),
        charge: idDe(r.charge),
        raison: r.reason ?? null,
      })),
    });
  } catch (e) {
    // Le message de Stripe, jamais la clé.
    const m = String((e as Error)?.message || e).split(STRIPE_KEY).join('***').slice(0, 300);
    console.error('[recettes]', m);
    return reponse(502, { erreur: 'stripe', detail: m });
  }
});
