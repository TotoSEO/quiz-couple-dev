import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

const TOKEN_MAX_AGE = 86400; // 24 hours

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function verifyAdminToken(token: string): Promise<boolean> {
  const secret = (Deno.env.get('ANNUAIRE_ADMIN_PASSWORD') || '').trim();
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

async function queueDeploy(supabase: any, reason: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('annuaire_deploy_queue')
      .insert({ reason });
    if (error) throw error;
    console.log(`[deploy] Queued deploy: ${reason}`);
  } catch (err) {
    console.warn('[deploy] Failed to queue deploy:', err);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // ── LIST: Get all profiles (with filters) ──
    if (action === 'list') {
      const filter = url.searchParams.get('filter') || 'all';
      let query = supabase
        .from('annuaire_professionals')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('is_published', false);
      } else if (filter === 'approved') {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get counts
      const { count: totalCount } = await supabase
        .from('annuaire_professionals')
        .select('*', { count: 'exact', head: true });
      const { count: pendingCount } = await supabase
        .from('annuaire_professionals')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', false);
      const { count: approvedCount } = await supabase
        .from('annuaire_professionals')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      return new Response(JSON.stringify({
        success: true,
        profiles: data,
        stats: {
          total: totalCount || 0,
          pending: pendingCount || 0,
          approved: approvedCount || 0,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── APPROVE: Publish a profile ──
    if (action === 'approve' && req.method === 'POST') {
      const { id } = await req.json();
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'ID requis' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('annuaire_professionals')
        .update({ is_published: true, is_verified: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Send approval email via send-email function (fire and forget)
      try {
        const resendKey = Deno.env.get('RESEND_API_KEY');
        if (resendKey && data.email) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Annuaire Quiz Couple <annuaire@quiz-couple.com>',
              to: [data.email],
              subject: 'Votre fiche est en ligne !',
              html: `
                <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:2rem;">
                  <h1 style="color:#d6336c;font-size:1.5rem;">Bonne nouvelle, ${escapeHtml(data.first_name || '')} !</h1>
                  <p style="font-size:1rem;line-height:1.6;color:#333;">
                    Votre fiche professionnelle a été validée par notre équipe et est désormais <strong>visible dans l'annuaire</strong>.
                  </p>
                  <p style="font-size:1rem;line-height:1.6;color:#333;">
                    Les patients peuvent maintenant vous trouver et vous contacter directement.
                  </p>
                  <div style="margin:2rem 0;">
                    <a href="https://annuaire.quiz-couple.com/${data.specialty}/${data.city}/${data.slug}/"
                       style="display:inline-block;padding:0.75rem 1.5rem;background:#d6336c;color:white;text-decoration:none;border-radius:0.5rem;font-weight:600;">
                      Voir ma fiche en ligne
                    </a>
                  </div>
                  <p style="font-size:0.875rem;color:#666;">
                    Vous pouvez modifier vos informations à tout moment depuis votre
                    <a href="https://annuaire.quiz-couple.com/dashboard/" style="color:#d6336c;">espace professionnel</a>.
                  </p>
                  <hr style="border:none;border-top:1px solid #eee;margin:2rem 0;">
                  <p style="font-size:0.75rem;color:#999;">
                    Quiz Couple — Annuaire des professionnels du couple en France
                  </p>
                </div>
              `,
            }),
          });
        }
      } catch (emailErr) {
        console.warn('Approval email failed:', emailErr);
      }

      // Queue deploy to rebuild static pages with new profile
      await queueDeploy(supabase, 'approve: ' + data.slug);

      return new Response(JSON.stringify({ success: true, profile: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── REJECT: Unpublish / reject a profile ──
    if (action === 'reject' && req.method === 'POST') {
      const { id, reason } = await req.json();
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'ID requis' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get profile email before unpublishing
      const { data: profile } = await supabase
        .from('annuaire_professionals')
        .select('email, first_name')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('annuaire_professionals')
        .update({ is_published: false, is_verified: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Send rejection email
      try {
        const resendKey = Deno.env.get('RESEND_API_KEY');
        if (resendKey && profile?.email) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Annuaire Quiz Couple <annuaire@quiz-couple.com>',
              to: [profile.email],
              subject: 'Votre fiche nécessite des modifications',
              html: `
                <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:2rem;">
                  <h1 style="color:#d6336c;font-size:1.5rem;">Bonjour ${escapeHtml(profile.first_name || '')},</h1>
                  <p style="font-size:1rem;line-height:1.6;color:#333;">
                    Après vérification, votre fiche nécessite quelques modifications avant de pouvoir être publiée.
                  </p>
                  ${reason ? `
                  <div style="margin:1.5rem 0;padding:1rem;background:#fff3cd;border-radius:0.5rem;border:1px solid #ffc107;">
                    <p style="font-size:0.9375rem;color:#333;margin:0;"><strong>Motif :</strong> ${escapeHtml(reason)}</p>
                  </div>
                  ` : ''}
                  <p style="font-size:1rem;line-height:1.6;color:#333;">
                    Connectez-vous à votre espace professionnel pour mettre à jour vos informations. Votre fiche sera automatiquement re-soumise pour validation.
                  </p>
                  <div style="margin:2rem 0;">
                    <a href="https://annuaire.quiz-couple.com/dashboard/"
                       style="display:inline-block;padding:0.75rem 1.5rem;background:#d6336c;color:white;text-decoration:none;border-radius:0.5rem;font-weight:600;">
                      Modifier ma fiche
                    </a>
                  </div>
                  <hr style="border:none;border-top:1px solid #eee;margin:2rem 0;">
                  <p style="font-size:0.75rem;color:#999;">
                    Quiz Couple — Annuaire des professionnels du couple en France
                  </p>
                </div>
              `,
            }),
          });
        }
      } catch (emailErr) {
        console.warn('Rejection email failed:', emailErr);
      }

      // Queue deploy to rebuild static pages (remove unpublished profile)
      await queueDeploy(supabase, 'reject: ' + (data.slug || id));

      return new Response(JSON.stringify({ success: true, profile: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── DELETE: Remove a profile entirely ──
    if (action === 'delete' && req.method === 'POST') {
      const { id } = await req.json();
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'ID requis' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase
        .from('annuaire_professionals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Deploy is triggered by Postgres AFTER DELETE trigger (via deploy queue)
      // No need to queue here — the DB trigger handles it

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Action inconnue' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('admin-annuaire error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Erreur serveur' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
