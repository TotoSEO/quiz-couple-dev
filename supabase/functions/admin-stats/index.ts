import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Les statistiques de l'admin (11 octobre 2026). Jusque-là, admin.js appelait
// les fonctions SQL get_trafic_*, get_quiz_daily*, get_salon_*... avec la clé
// publique : n'importe qui pouvait lire le trafic du site, ses pages et ses
// sources. Elles passent désormais par ici : le jeton admin est vérifié, puis
// l'appel part vers PostgREST avec la clé de service, et la réponse revient
// telle quelle (corps, code, en-tête Content-Range de la pagination). La
// migration 20261011130000 retire ensuite ces fonctions à la clé publique.
//
// ?sante=1, sans jeton : la fonction fabrique un jeton comme verify-admin, le
// vérifie comme pour une vraie demande, puis lit get_instagram_clics par le
// même relais. securite-base.yml s'en sert avant de fermer les statistiques à
// la clé publique : si l'un des trois maillons casse, l'admin perdrait ses
// chiffres, et rien n'est fermé. La réponse ne dit que oui ou non, et à quelle
// étape.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token, prefer',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  // admin.js lit la pagination dans Content-Range, et reconnaît une réponse
  // de cette fonction (et pas une erreur de la passerelle) à x-admin-stats.
  'Access-Control-Expose-Headers': 'content-range, x-admin-stats',
};

const TOKEN_MAX_AGE = 86400; // 24 heures, comme les autres fonctions admin-*

// Les seules fonctions qu'on peut lire par ici : celles de l'admin (onglets
// Trafic, Parties, À distance, Réseaux, Bilan, et l'export).
const FONCTIONS = new Set([
  'get_bilan_tableau',
  'get_instagram_clics',
  'get_quiz_counts',
  'get_quiz_daily',
  'get_quiz_daily_par_quiz',
  'get_quiz_daily_total',
  'get_quiz_starts_counts',
  'get_quiz_starts_daily_par_quiz',
  'get_quiz_starts_total',
  'get_quiz_total',
  'get_salon_counts',
  'get_salon_counts_depuis',
  'get_salon_daily',
  'get_source_pref_clics',
  'get_source_pref_daily',
  'get_trafic_daily',
  'get_trafic_entonnoir',
  'get_trafic_pages',
  'get_trafic_profondeur',
  'get_trafic_resume',
  'get_trafic_sources',
]);

function hexEnOctets(hex: string): ArrayBuffer | null {
  if (!/^[0-9a-f]{64}$/i.test(hex)) return null;
  const tampon = new ArrayBuffer(32);
  const octets = new Uint8Array(tampon);
  for (let i = 0; i < 32; i++) octets[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return tampon;
}

// Même jeton que verify-admin : « horodatageHex.signatureHex », signature
// HMAC-SHA256 de l'horodatage avec ADMIN_PASSWORD. crypto.subtle.verify
// compare en temps constant.
async function jetonValide(jeton: string): Promise<boolean> {
  const secret = Deno.env.get('ADMIN_PASSWORD');
  if (!secret) return false;
  const parts = jeton.split('.');
  if (parts.length !== 2) return false;
  const [horodatageHex, signatureHex] = parts;
  if (!/^[0-9a-f]{1,12}$/i.test(horodatageHex)) return false;
  const age = Math.floor(Date.now() / 1000) - parseInt(horodatageHex, 16);
  if (!(age >= -300 && age <= TOKEN_MAX_AGE)) return false;
  const signature = hexEnOctets(signatureHex);
  if (!signature) return false;
  const encodeur = new TextEncoder();
  const cle = await crypto.subtle.importKey('raw', encodeur.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('HMAC', cle, signature, encodeur.encode(horodatageHex));
}

// Le jeton tel que verify-admin le fabrique, pour le contrôle de santé.
async function jetonDeControle(secret: string): Promise<string> {
  const horodatageHex = Math.floor(Date.now() / 1000).toString(16);
  const encodeur = new TextEncoder();
  const cle = await crypto.subtle.importKey('raw', encodeur.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', cle, encodeur.encode(horodatageHex));
  const hex = Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${horodatageHex}.${hex}`;
}

function reponse(corps: string, statut: number, enPlus: Record<string, string> = {}): Response {
  return new Response(corps, {
    status: statut,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-admin-stats': '1', ...enPlus },
  });
}

function erreur(code: string, message: string, statut: number): Response {
  return reponse(JSON.stringify({ code, message }), statut);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== 'POST') return erreur('methode', 'POST seulement', 405);

  const base = Deno.env.get('SUPABASE_URL');
  const cleService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!base || !cleService) return erreur('configuration', 'Configuration serveur manquante', 500);
  const entetesService: Record<string, string> = {
    apikey: cleService,
    Authorization: `Bearer ${cleService}`,
    'Content-Type': 'application/json',
  };

  try {
    const url = new URL(req.url);

    if (url.searchParams.has('sante')) {
      const secret = Deno.env.get('ADMIN_PASSWORD');
      if (!secret || !(await jetonValide(await jetonDeControle(secret)))) {
        return reponse(JSON.stringify({ sante: 'ko', etape: 'jeton' }), 503);
      }
      const r = await fetch(`${base}/rest/v1/rpc/get_instagram_clics`, { method: 'POST', headers: entetesService, body: '{}' });
      await r.body?.cancel();
      return reponse(JSON.stringify(r.ok ? { sante: 'ok' } : { sante: 'ko', etape: 'relais', statut: r.status }), r.ok ? 200 : 503);
    }

    const jeton = req.headers.get('x-admin-token') || '';
    if (!jeton || !(await jetonValide(jeton))) return erreur('jeton', 'Token admin invalide', 401);

    const fn = url.searchParams.get('fn') || '';
    if (!FONCTIONS.has(fn)) return erreur('fonction', `Fonction non autorisée : ${fn.slice(0, 60)}`, 400);

    const cible = new URL(`${base}/rest/v1/rpc/${fn}`);
    for (const p of ['limit', 'offset']) {
      const v = url.searchParams.get(p);
      if (v === null) continue;
      if (!/^\d{1,7}$/.test(v)) return erreur('pagination', `${p} invalide`, 400);
      cible.searchParams.set(p, v);
    }

    const texte = await req.text();
    if (texte.length > 4000) return erreur('corps', 'Paramètres trop longs', 413);
    let args: unknown = {};
    if (texte.trim()) {
      try { args = JSON.parse(texte); } catch { return erreur('corps', 'JSON invalide', 400); }
    }
    if (!args || typeof args !== 'object' || Array.isArray(args)) return erreur('corps', 'Les paramètres doivent être un objet', 400);

    const entetes = { ...entetesService };
    const prefer = (req.headers.get('prefer') || '').trim();
    if (/^count=(exact|planned|estimated)$/.test(prefer)) entetes['Prefer'] = prefer;

    const r = await fetch(cible, { method: 'POST', headers: entetes, body: JSON.stringify(args) });
    const corps = await r.text();
    const enPlus: Record<string, string> = {};
    const plage = r.headers.get('content-range');
    if (plage) enPlus['Content-Range'] = plage;
    return reponse(corps, r.status, enPlus);
  } catch (e) {
    console.error('[admin-stats]', e);
    return erreur('serveur', 'Erreur serveur', 500);
  }
});
