import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

const TOKEN_MAX_AGE = 86400; // 24 hours

async function verifyAdminToken(token: string): Promise<boolean> {
  const secret = (Deno.env.get('ADMIN_PASSWORD') || '').trim();
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: accept either HMAC admin token OR service_role key (for Postgres triggers)
    const adminToken = req.headers.get('x-admin-token');
    const authHeader = req.headers.get('authorization') || '';
    const bearerToken = authHeader.replace('Bearer ', '');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const isAdminAuth = adminToken && (await verifyAdminToken(adminToken));
    const isServiceRoleAuth = serviceRoleKey && bearerToken === serviceRoleKey;

    if (!isAdminAuth && !isServiceRoleAuth) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token admin invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GITHUB_TOKEN = Deno.env.get('GITHUB_DEPLOY_TOKEN');
    if (!GITHUB_TOKEN) {
      return new Response(
        JSON.stringify({ success: false, error: 'GITHUB_DEPLOY_TOKEN non configuré. Ajoutez-le dans Supabase > Settings > Edge Functions > Secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const REPO_OWNER = Deno.env.get('GITHUB_REPO_OWNER') || 'TotoSEO';
    const REPO_NAME = Deno.env.get('GITHUB_REPO_NAME') || 'quiz-couple-dev';
    const WORKFLOW_FILE = 'deploy-pages.yml';
    const BRANCH = 'main';

    // Trigger workflow_dispatch via GitHub API
    const ghRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'quiz-couple-admin',
        },
        body: JSON.stringify({ ref: BRANCH }),
      }
    );

    if (ghRes.status === 204) {
      return new Response(
        JSON.stringify({ success: true, message: 'Déploiement lancé ! Le site sera mis à jour dans 1-2 minutes.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const errorText = await ghRes.text();
    throw new Error(`GitHub API error ${ghRes.status}: ${errorText}`);
  } catch (error) {
    console.error('Deploy trigger error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
