import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Réglages de l'admin rangés côté serveur (11 octobre 2026), dans la table
// fermée admin_reglages (migration 20261011120000), lus et écrits avec le
// jeton admin. Le premier est le jeton d'API Affilae de l'onglet Affiliation :
// il dormait dans le localStorage du domaine, que lit n'importe quel script
// chargé sur une page du site (régie publicitaire, mesure, consentement). Il
// est désormais ici, comme les jetons Instagram dans social_jetons, et l'admin
// ne le garde qu'en mémoire le temps de l'onglet.
//
//   GET    ?cle=affilae_jeton            → { valeur: "..." | null }
//   POST   { cle, valeur }               → { ok: true }
//   DELETE ?cle=affilae_jeton            → { ok: true }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  // admin-affiliation.js reconnaît une réponse de cette fonction (et pas une
  // erreur de la passerelle, fonction pas encore déployée) à cet en-tête.
  'Access-Control-Expose-Headers': 'x-admin-reglages',
};

const TOKEN_MAX_AGE = 86400; // 24 heures, comme les autres fonctions admin-*
const CLES = new Set(['affilae_jeton']);
const VALEUR_MAX = 4000;

function hexEnOctets(hex: string): ArrayBuffer | null {
  if (!/^[0-9a-f]{64}$/i.test(hex)) return null;
  const tampon = new ArrayBuffer(32);
  const octets = new Uint8Array(tampon);
  for (let i = 0; i < 32; i++) octets[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return tampon;
}

// Même jeton que verify-admin, vérifié en temps constant (voir admin-stats).
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

function json(corps: unknown, statut = 200): Response {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-admin-reglages': '1' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const base = Deno.env.get('SUPABASE_URL');
  const cleService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!base || !cleService) return json({ success: false, error: 'Configuration serveur manquante' }, 500);
  const entetes: Record<string, string> = {
    apikey: cleService,
    Authorization: `Bearer ${cleService}`,
    'Content-Type': 'application/json',
  };

  try {
    const jeton = req.headers.get('x-admin-token') || '';
    if (!jeton || !(await jetonValide(jeton))) return json({ success: false, error: 'Token admin invalide' }, 401);

    const url = new URL(req.url);
    let cle = url.searchParams.get('cle') || '';
    let valeur: unknown = undefined;
    if (req.method === 'POST') {
      const texte = await req.text();
      if (texte.length > VALEUR_MAX + 200) return json({ success: false, error: 'Valeur trop longue' }, 413);
      let corps: Record<string, unknown> = {};
      try { corps = JSON.parse(texte || '{}'); } catch { return json({ success: false, error: 'JSON invalide' }, 400); }
      cle = typeof corps.cle === 'string' ? corps.cle : cle;
      valeur = corps.valeur;
    }
    if (!CLES.has(cle)) return json({ success: false, error: 'Réglage inconnu' }, 400);
    const filtre = `cle=eq.${encodeURIComponent(cle)}`;

    if (req.method === 'GET') {
      const r = await fetch(`${base}/rest/v1/admin_reglages?select=valeur&${filtre}`, { headers: entetes });
      if (!r.ok) return json({ success: false, error: `Lecture refusée (${r.status})` }, 502);
      const lignes = await r.json();
      return json({ success: true, valeur: Array.isArray(lignes) && lignes[0] ? lignes[0].valeur : null });
    }

    if (req.method === 'POST') {
      if (typeof valeur !== 'string' || !valeur.trim() || valeur.length > VALEUR_MAX) {
        return json({ success: false, error: 'Valeur invalide' }, 400);
      }
      const r = await fetch(`${base}/rest/v1/admin_reglages?on_conflict=cle`, {
        method: 'POST',
        headers: { ...entetes, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify([{ cle, valeur: valeur.trim(), maj: new Date().toISOString() }]),
      });
      await r.body?.cancel();
      if (!r.ok) return json({ success: false, error: `Écriture refusée (${r.status})` }, 502);
      return json({ success: true, ok: true });
    }

    if (req.method === 'DELETE') {
      const r = await fetch(`${base}/rest/v1/admin_reglages?${filtre}`, { method: 'DELETE', headers: entetes });
      await r.body?.cancel();
      if (!r.ok) return json({ success: false, error: `Effacement refusé (${r.status})` }, 502);
      return json({ success: true, ok: true });
    }

    return json({ success: false, error: 'Méthode non prise en charge' }, 405);
  } catch (e) {
    console.error('[admin-reglages]', e);
    return json({ success: false, error: 'Erreur serveur' }, 500);
  }
});
