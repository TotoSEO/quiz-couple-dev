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
                <!DOCTYPE html>
                <html lang="fr">
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
                <body style="margin:0;padding:0;background:#f8f7fc;font-family:Inter,system-ui,-apple-system,sans-serif;">
                  <div style="max-width:600px;margin:0 auto;padding:2rem 1rem;">
                    <!-- Header -->
                    <div style="text-align:center;margin-bottom:2rem;">
                      <img src="https://annuaire.quiz-couple.com/assets/logo-annuaire.png" alt="Quiz Couple Annuaire" width="40" height="42" style="display:inline-block;">
                      <span style="font-size:1.25rem;font-weight:700;vertical-align:middle;margin-left:0.5rem;color:#1a1625;">Annuaire</span>
                    </div>

                    <!-- Main content -->
                    <div style="background:white;border-radius:1rem;padding:2rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                      <h1 style="color:#d6336c;font-size:1.5rem;margin:0 0 1rem;">Bonne nouvelle, ${escapeHtml(data.first_name || '')} !</h1>
                      <p style="font-size:1rem;line-height:1.6;color:#333;margin:0 0 1rem;">
                        Votre fiche professionnelle a été validée par notre équipe et est désormais <strong>visible dans l'annuaire</strong>.
                      </p>
                      <p style="font-size:1rem;line-height:1.6;color:#333;margin:0 0 1.5rem;">
                        Les patients peuvent maintenant vous trouver et vous contacter directement.
                      </p>
                      <div style="text-align:center;margin:1.5rem 0;">
                        <a href="https://annuaire.quiz-couple.com/${data.specialty}/${data.city}/${data.slug}/"
                           style="display:inline-block;padding:0.875rem 2rem;background:#d6336c;color:white;text-decoration:none;border-radius:0.5rem;font-weight:600;font-size:1rem;">
                          Voir ma fiche en ligne
                        </a>
                      </div>
                      <p style="font-size:0.875rem;color:#666;margin:0;">
                        Vous pouvez modifier vos informations à tout moment depuis votre
                        <a href="https://annuaire.quiz-couple.com/dashboard/" style="color:#d6336c;">espace professionnel</a>.
                      </p>
                    </div>

                    <!-- Promo section -->
                    <div style="background:linear-gradient(135deg,#d6336c 0%,#a61e4d 100%);border-radius:1rem;padding:2rem;margin-top:1.5rem;text-align:center;color:white;">
                      <div style="font-size:1.5rem;margin-bottom:0.5rem;">&#9889;</div>
                      <h2 style="font-size:1.125rem;margin:0 0 0.75rem;font-weight:700;">Améliorez la visibilité de votre fiche</h2>
                      <p style="font-size:0.9375rem;line-height:1.6;margin:0 0 1.25rem;opacity:0.95;">
                        Démarquez-vous auprès de milliers de patients avec nos offres à prix bas : badge certifié, position prioritaire, avis Google et bien plus.
                      </p>
                      <a href="https://annuaire.quiz-couple.com/tarifs/"
                         style="display:inline-block;padding:0.75rem 2rem;background:white;color:#d6336c;text-decoration:none;border-radius:0.5rem;font-weight:700;font-size:0.9375rem;">
                        Découvrir les offres
                      </a>
                      <p style="font-size:0.75rem;margin:0.75rem 0 0;opacity:0.8;">À partir de 4,99€ HT/mois &middot; Sans engagement</p>
                    </div>

                    <!-- Footer -->
                    <div style="text-align:center;margin-top:2rem;padding:1rem;">
                      <p style="font-size:0.75rem;color:#999;margin:0;">Quiz Couple — Annuaire des professionnels du couple en France</p>
                      <p style="font-size:0.75rem;color:#bbb;margin:0.5rem 0 0;"><a href="https://annuaire.quiz-couple.com" style="color:#bbb;">annuaire.quiz-couple.com</a></p>
                    </div>
                  </div>
                </body>
                </html>
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
                <!DOCTYPE html>
                <html lang="fr">
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
                <body style="margin:0;padding:0;background:#f8f7fc;font-family:Inter,system-ui,-apple-system,sans-serif;">
                  <div style="max-width:600px;margin:0 auto;padding:2rem 1rem;">
                    <div style="text-align:center;margin-bottom:2rem;">
                      <img src="https://annuaire.quiz-couple.com/assets/logo-annuaire.png" alt="Quiz Couple Annuaire" width="40" height="42" style="display:inline-block;">
                      <span style="font-size:1.25rem;font-weight:700;vertical-align:middle;margin-left:0.5rem;color:#1a1625;">Annuaire</span>
                    </div>
                    <div style="background:white;border-radius:1rem;padding:2rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                      <h1 style="color:#d6336c;font-size:1.5rem;margin:0 0 1rem;">Bonjour ${escapeHtml(profile.first_name || '')},</h1>
                      <p style="font-size:1rem;line-height:1.6;color:#333;margin:0 0 1rem;">
                        Après vérification, votre fiche nécessite quelques modifications avant de pouvoir être publiée.
                      </p>
                      ${reason ? `
                      <div style="margin:1rem 0;padding:1rem;background:#fff3cd;border-radius:0.5rem;border:1px solid #ffc107;">
                        <p style="font-size:0.9375rem;color:#333;margin:0;"><strong>Motif :</strong> ${escapeHtml(reason)}</p>
                      </div>
                      ` : ''}
                      <p style="font-size:1rem;line-height:1.6;color:#333;margin:0 0 1.5rem;">
                        Connectez-vous à votre espace professionnel pour mettre à jour vos informations. Votre fiche sera automatiquement re-soumise pour validation.
                      </p>
                      <div style="text-align:center;margin:1.5rem 0;">
                        <a href="https://annuaire.quiz-couple.com/dashboard/"
                           style="display:inline-block;padding:0.875rem 2rem;background:#d6336c;color:white;text-decoration:none;border-radius:0.5rem;font-weight:600;font-size:1rem;">
                          Modifier ma fiche
                        </a>
                      </div>
                    </div>
                    <div style="text-align:center;margin-top:2rem;padding:1rem;">
                      <p style="font-size:0.75rem;color:#999;margin:0;">Quiz Couple — Annuaire des professionnels du couple en France</p>
                      <p style="font-size:0.75rem;color:#bbb;margin:0.5rem 0 0;"><a href="https://annuaire.quiz-couple.com" style="color:#bbb;">annuaire.quiz-couple.com</a></p>
                    </div>
                  </div>
                </body>
                </html>
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
