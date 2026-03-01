import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CODE_WORDS = ['ROSE', 'LUNA', 'STAR', 'LOVE', 'BLEU', 'FIRE', 'GOLD', 'JADE', 'RUBY', 'AQUA', 'SAGE', 'AURA', 'NEON', 'COZY', 'PURE', 'GLOW'];

function generateCode(): string {
  const word = CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)];
  const num = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return word + num;
}

function pickRandomQuestions(count: number, total: number): number[] {
  const indices = Array.from({ length: total }, (_, i) => i + 1);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, count);
}

function sanitizeName(name: string): string {
  return name.trim().replace(/[<>"'&]/g, '').slice(0, 30);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { action } = body;

    // Cleanup action — delete session after results
    if (action === 'cleanup') {
      const { sessionId } = body;
      if (!sessionId || typeof sessionId !== 'string') {
        return new Response(JSON.stringify({ error: 'invalid_session_id' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await supabase
        .from('quiz_ado_sessions')
        .delete()
        .eq('id', sessionId);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { playerName, code: joinCode } = body;

    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0 || playerName.trim().length > 30) {
      return new Response(JSON.stringify({ error: 'invalid_name' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanName = sanitizeName(playerName);

    if (action === 'create') {
      const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('quiz_ado_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', clientIP)
        .gte('created_at', oneHourAgo);

      if ((count || 0) >= 5) {
        return new Response(JSON.stringify({ error: 'rate_limit' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate unique code
      let code = generateCode();
      for (let i = 0; i < 10; i++) {
        const { data: existing } = await supabase
          .from('quiz_ado_sessions')
          .select('id')
          .eq('code', code)
          .eq('status', 'waiting')
          .maybeSingle();
        if (!existing) break;
        code = generateCode();
      }

      const questionIndices = pickRandomQuestions(20, 80);

      const { data: session, error } = await supabase
        .from('quiz_ado_sessions')
        .insert({
          code,
          player1_name: cleanName,
          question_indices: questionIndices,
          ip_address: clientIP,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ session }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'join') {
      if (!joinCode || typeof joinCode !== 'string' || joinCode.trim().length < 4) {
        return new Response(JSON.stringify({ error: 'invalid_code' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: session, error: findError } = await supabase
        .from('quiz_ado_sessions')
        .select('*')
        .eq('code', joinCode.toUpperCase().trim())
        .eq('status', 'waiting')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (!session) {
        return new Response(JSON.stringify({ error: 'session_not_found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: updated, error: updateError } = await supabase
        .from('quiz_ado_sessions')
        .update({
          player2_name: cleanName,
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        })
        .eq('id', session.id)
        .eq('status', 'waiting')
        .select()
        .single();

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ session: updated }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'invalid_action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
