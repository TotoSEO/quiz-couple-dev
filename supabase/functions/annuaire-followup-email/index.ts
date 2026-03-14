/**
 * annuaire-followup-email
 *
 * Called daily by cron (via process_annuaire_followup_emails).
 * Finds profiles validated > 21 days ago that are still on the free plan,
 * and sends a promotional email encouraging them to upgrade.
 *
 * Required env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Only allow internal calls (service role)
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader !== `Bearer ${SUPABASE_SERVICE_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Find profiles: published, free plan, no followup sent, created > 21 days ago
    const { data: profiles, error } = await supabase
      .from('annuaire_professionals')
      .select('id, email, first_name, slug, specialty, city')
      .eq('is_published', true)
      .is('followup_email_sent_at', null)
      .or('plan.is.null,plan.eq.gratuit')
      .lte('created_at', new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString())
      .limit(20);

    if (error) {
      console.error('[followup] Query error:', error);
      return new Response(JSON.stringify({ error: 'Query failed' }), { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      console.log('[followup] No profiles to process');
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let sent = 0;
    for (const profile of profiles) {
      // Mark as sent immediately (prevent re-processing)
      await supabase
        .from('annuaire_professionals')
        .update({ followup_email_sent_at: new Date().toISOString() })
        .eq('id', profile.id);

      try {
        const profileUrl = `https://annuaire.quiz-couple.com/${profile.specialty}/${profile.city}/${profile.slug}/`;
        const firstName = escapeHtml(profile.first_name || '');

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Annuaire Quiz Couple <annuaire@quiz-couple.com>',
            to: [profile.email],
            subject: 'Votre fiche génère des vues !',
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
                    <h1 style="color:#d6336c;font-size:1.5rem;margin:0 0 1rem;">Votre fiche génère des vues, ${firstName} !</h1>

                    <p style="font-size:1rem;line-height:1.6;color:#333;margin:0 0 1rem;">
                      Depuis sa publication, votre fiche sur l'Annuaire Quiz Couple est <strong>consultée par des patients</strong> à la recherche d'un professionnel du couple.
                    </p>

                    <p style="font-size:1rem;line-height:1.6;color:#333;margin:0 0 1.5rem;">
                      Bonne nouvelle : vous pouvez <strong>multiplier votre visibilité</strong> et renforcer votre image professionnelle en passant à une offre payante.
                    </p>

                    <!-- Benefits -->
                    <div style="background:#f8f7fc;border-radius:0.75rem;padding:1.5rem;margin:0 0 1.5rem;">
                      <p style="font-weight:700;color:#1a1625;margin:0 0 0.75rem;font-size:0.9375rem;">Ce que vous débloquez :</p>
                      <table style="width:100%;font-size:0.9375rem;line-height:1.8;color:#333;">
                        <tr><td style="padding:0.125rem 0;">&#10004;&#65039; Badge <strong>"Certifié"</strong> sur votre fiche</td></tr>
                        <tr><td style="padding:0.125rem 0;">&#10004;&#65039; <strong>Position prioritaire</strong> dans les résultats</td></tr>
                        <tr><td style="padding:0.125rem 0;">&#10004;&#65039; Plus de spécialités et méthodes affichées</td></tr>
                        <tr><td style="padding:0.125rem 0;">&#10004;&#65039; Lien vers votre site web <em>(Boost)</em></td></tr>
                        <tr><td style="padding:0.125rem 0;">&#10004;&#65039; Avis Google intégrés à votre fiche <em>(Boost)</em></td></tr>
                        <tr><td style="padding:0.125rem 0;">&#10004;&#65039; Statistiques de visites en temps réel <em>(Boost)</em></td></tr>
                      </table>
                    </div>

                    <div style="text-align:center;margin:1.5rem 0;">
                      <a href="https://annuaire.quiz-couple.com/tarifs/"
                         style="display:inline-block;padding:0.875rem 2rem;background:#d6336c;color:white;text-decoration:none;border-radius:0.5rem;font-weight:600;font-size:1rem;">
                        Voir les offres
                      </a>
                    </div>

                    <p style="font-size:0.875rem;color:#666;text-align:center;margin:0;">
                      À partir de <strong>4,99€/mois</strong> &middot; Sans engagement &middot; Annulable à tout moment
                    </p>
                  </div>

                  <!-- Secondary CTA -->
                  <div style="text-align:center;margin-top:1.5rem;">
                    <a href="${profileUrl}" style="font-size:0.875rem;color:#d6336c;text-decoration:underline;">Voir ma fiche en ligne</a>
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

        if (res.ok) {
          sent++;
          console.log(`[followup] Sent to ${profile.email}`);
        } else {
          const errText = await res.text();
          console.error(`[followup] Failed for ${profile.email}: ${res.status} ${errText}`);
        }
      } catch (emailErr) {
        console.error(`[followup] Email error for ${profile.email}:`, emailErr);
      }
    }

    console.log(`[followup] Processed ${profiles.length} profiles, sent ${sent} emails`);

    return new Response(JSON.stringify({
      processed: profiles.length,
      sent,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[followup] Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
