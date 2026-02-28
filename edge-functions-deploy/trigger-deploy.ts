import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin token
    const adminToken = req.headers.get('x-admin-token');
    if (!adminToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token admin requis' }),
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
