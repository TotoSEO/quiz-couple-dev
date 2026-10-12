import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const TOKEN_MAX_AGE = 86400; // 24 hours

// La liste de l'onglet Avis se lit par pages (dix par défaut, « Charger plus
// d'avis » demande les suivantes) : avant le 12 octobre 2026, chaque
// ouverture de l'admin et chaque action rechargeaient tous les avis, IP et
// commentaires compris.
const PAGE_MAX = 50;
const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;
const FORMAT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function verifyAdminToken(token: string): Promise<boolean> {
  const secret = Deno.env.get('ADMIN_PASSWORD');
  if (!secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [timestampHex, signatureHex] = parts;
  const timestamp = parseInt(timestampHex, 16);
  if (isNaN(timestamp) || Math.floor(Date.now() / 1000) - timestamp > TOKEN_MAX_AGE) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(timestampHex));
  const expectedHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return expectedHex === signatureHex;
}

function json(corps: unknown, status = 200): Response {
  return new Response(JSON.stringify(corps), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function messageDe(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message);
  return String(e);
}

// Les chiffres du haut de l'onglet, sans lire un seul avis : chaque requête
// ne rend que son nombre de lignes. La note moyenne porte sur les avis
// approuvés, ceux que le site affiche (le compte par note suffit à la
// calculer exactement).
async function resume(supabase: SupabaseClient) {
  const compte = async (filtre: (q: any) => any) => {
    const { count, error } = await filtre(supabase.from('reviews').select('id', { count: 'exact', head: true }));
    if (error) throw error;
    return count ?? 0;
  };
  const [total, attente, ...parNote] = await Promise.all([
    compte((q) => q),
    compte((q) => q.not('is_approved', 'is', true)),
    ...[1, 2, 3, 4, 5].map((n) => compte((q) => q.eq('is_approved', true).eq('rating', n))),
  ]);
  const approuves = parNote.reduce((a, b) => a + b, 0);
  const somme = parNote.reduce((a, b, i) => a + b * (i + 1), 0);
  return { total, attente, approuves, moyenne: approuves ? somme / approuves : null };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify HMAC-signed admin token
    const adminToken = req.headers.get('x-admin-token');

    if (!adminToken || !(await verifyAdminToken(adminToken))) {
      return json({ success: false, error: 'Token admin invalide' }, 401);
    }

    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (req.method === 'GET') {
      // Le classement des pages par nombre d'avis, toutes langues confondues
      // (admin_avis_par_test, migration 20261012160000). Sans la migration,
      // l'admin dit pourquoi le classement manque au lieu de rester vide.
      if (url.searchParams.get('classement') === '1') {
        const { data, error } = await supabase.rpc('admin_avis_par_test');
        if (error) return json({ success: true, classement: null, erreur: error.message });
        return json({ success: true, classement: data ?? [] });
      }

      // Une page de la liste : `limite` avis du filtre choisi, plus anciens
      // que `avant` (la date du dernier affiché), et `suite` dit s'il en
      // reste. Un admin encore ouvert sur l'ancienne version ne passe pas
      // `limite` : il reçoit tout, comme avant.
      if (url.searchParams.has('limite')) {
        const limite = Math.min(PAGE_MAX, Math.max(1, parseInt(url.searchParams.get('limite') || '', 10) || 10));
        let q = supabase.from('reviews').select('*')
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .limit(limite + 1);
        const filtre = url.searchParams.get('filtre');
        if (filtre === 'attente') q = q.not('is_approved', 'is', true);
        else if (filtre === 'approuves') q = q.eq('is_approved', true);
        const avant = url.searchParams.get('avant') || '';
        if (FORMAT_DATE.test(avant)) q = q.lt('created_at', avant);
        const { data, error } = await q;
        if (error) throw error;
        const lignes = data ?? [];
        const corps: Record<string, unknown> = {
          success: true,
          reviews: lignes.slice(0, limite),
          suite: lignes.length > limite,
        };
        if (url.searchParams.get('resume') === '1') corps.resume = await resume(supabase);
        return json(corps);
      }

      // Fetch all reviews (including non-approved)
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return json({ success: true, reviews });
    }

    if (req.method === 'POST') {
      const { reviewId, action: bodyAction } = await req.json();
      const reviewAction = action || bodyAction;

      if (!reviewId || !FORMAT_ID.test(String(reviewId))) {
        return json({ success: false, error: 'ID de l\'avis requis' }, 400);
      }

      // Chaque action rend les nouveaux chiffres du haut de l'onglet : l'admin
      // met sa liste à jour sur place, sans tout relire.
      const avecResume = async (corps: Record<string, unknown>) => {
        try { corps.resume = await resume(supabase); } catch (_) { /* les chiffres attendront */ }
        return json(corps);
      };

      if (reviewAction === 'approve' || reviewAction === 'reject') {
        const { error, count } = await supabase
          .from('reviews')
          .update({ is_approved: reviewAction === 'approve' }, { count: 'exact' })
          .eq('id', reviewId);

        if (error) throw error;

        return avecResume({
          success: true,
          message: reviewAction === 'approve' ? 'Avis approuvé' : 'Avis rejeté',
          modifies: count ?? null,
        });
      }

      if (reviewAction === 'delete') {
        const { error, count } = await supabase
          .from('reviews')
          .delete({ count: 'exact' })
          .eq('id', reviewId);

        if (error) throw error;

        return avecResume({ success: true, message: 'Avis supprimé', supprimes: count ?? null });
      }

      return json({ success: false, error: 'Action non reconnue' }, 400);
    }

    return json({ success: false, error: 'Méthode non autorisée' }, 405);
  } catch (error) {
    console.error('Error:', error);
    // L'admin affiche la cause : un échec ne passe plus inaperçu.
    return json({ success: false, error: 'Erreur serveur', detail: messageDe(error) }, 500);
  }
});
