import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

const TOKEN_MAX_AGE = 86400; // 24 hours

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify HMAC-signed admin token
    const adminToken = req.headers.get('x-admin-token');

    if (!adminToken || !(await verifyAdminToken(adminToken))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token admin invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GET: list all leads
    if (req.method === 'GET') {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, leads }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST: update a lead (toggle is_closed)
    if (req.method === 'POST') {
      const { id, is_closed } = await req.json();

      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: 'ID du lead requis' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('leads')
        .update({ is_closed: !!is_closed })
        .eq('id', id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Méthode non autorisée' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
