import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: max 5 attempts per IP per 15 minutes
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Les essais ratés comptés en base (11 octobre 2026), dans la table fermée
// admin_connexions_ratees (migration 20261011120000). La limite en mémoire
// ci-dessus repart de zéro à chaque redémarrage de la fonction, et chaque
// instance a la sienne : à elle seule, elle ne freinait pas grand-chose.
// Cinq essais ratés par adresse en quinze minutes, et cent en tout sur la
// même fenêtre, toutes adresses confondues (l'adresse se falsifie). Une
// connexion réussie efface les essais ratés de son adresse. Si la table
// manque ou ne répond pas, la limite en mémoire reste seule, comme avant.
const MAX_RATES_PAR_IP = 5;
const MAX_RATES_EN_TOUT = 100;

function entetesService(cle: string): Record<string, string> {
  return { apikey: cle, Authorization: `Bearer ${cle}` };
}

async function tropDEssaisRates(base: string, cle: string, ip: string): Promise<boolean> {
  try {
    const depuis = encodeURIComponent(new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString());
    const compte = async (filtre: string): Promise<number> => {
      const r = await fetch(`${base}/rest/v1/admin_connexions_ratees?select=id&le=gte.${depuis}${filtre}`, {
        method: 'HEAD',
        headers: { ...entetesService(cle), Prefer: 'count=exact' },
      });
      if (!r.ok) throw new Error(`comptage refusé (${r.status})`);
      const m = /\/(\d+)$/.exec(r.headers.get('content-range') || '');
      if (!m) throw new Error('comptage sans total');
      return parseInt(m[1], 10);
    };
    const [parIp, enTout] = await Promise.all([compte(`&ip=eq.${encodeURIComponent(ip)}`), compte('')]);
    return parIp >= MAX_RATES_PAR_IP || enTout >= MAX_RATES_EN_TOUT;
  } catch (e) {
    console.warn('[verify-admin] essais en base indisponibles :', e instanceof Error ? e.message : e);
    return false;
  }
}

async function noterEssaiRate(base: string, cle: string, ip: string): Promise<void> {
  try {
    const r = await fetch(`${base}/rest/v1/admin_connexions_ratees`, {
      method: 'POST',
      headers: { ...entetesService(cle), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ ip: ip.slice(0, 64) }),
    });
    await r.body?.cancel();
    // Le ménage : rien de plus vieux qu'un jour.
    const veille = encodeURIComponent(new Date(Date.now() - 86400 * 1000).toISOString());
    const m = await fetch(`${base}/rest/v1/admin_connexions_ratees?le=lt.${veille}`, { method: 'DELETE', headers: entetesService(cle) });
    await m.body?.cancel();
  } catch (e) {
    console.warn('[verify-admin] essai raté non noté :', e instanceof Error ? e.message : e);
  }
}

async function effacerEssaisRates(base: string, cle: string, ip: string): Promise<void> {
  try {
    const r = await fetch(`${base}/rest/v1/admin_connexions_ratees?ip=eq.${encodeURIComponent(ip.slice(0, 64))}`, {
      method: 'DELETE',
      headers: entetesService(cle),
    });
    await r.body?.cancel();
  } catch (_) { /* la connexion réussit quand même */ }
}

// Generate HMAC-signed admin token: "timestampHex.signatureHex"
async function generateAdminToken(secret: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp));
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${timestamp}.${signatureHex}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit check
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Trop de tentatives. Reessayez dans 15 minutes.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { password } = await req.json();

    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Mot de passe requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminPassword = Deno.env.get('ADMIN_PASSWORD');

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration serveur manquante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const base = Deno.env.get('SUPABASE_URL');
    const cleService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (base && cleService && await tropDEssaisRates(base, cleService, clientIp)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Trop de tentatives. Reessayez dans 15 minutes.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Constant-time comparison to prevent timing attacks
    const encoder = new TextEncoder();
    const a = encoder.encode(password);
    const b = encoder.encode(adminPassword);

    let isValid = a.length === b.length;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) {
        isValid = false;
      }
    }

    if (isValid) {
      if (base && cleService) await effacerEssaisRates(base, cleService, clientIp);
      // Generate HMAC-signed session token (validated by other edge functions)
      const sessionToken = await generateAdminToken(adminPassword);

      return new Response(
        JSON.stringify({ success: true, token: sessionToken }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      if (base && cleService) await noterEssaiRate(base, cleService, clientIp);
      return new Response(
        JSON.stringify({ success: false, error: 'Mot de passe incorrect' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
