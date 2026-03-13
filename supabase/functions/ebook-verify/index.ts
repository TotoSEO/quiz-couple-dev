import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SITE_URL = Deno.env.get('SITE_URL') || 'https://quiz-couple.com';

// PDF hosted on the static site (copied during build from assets/)
const EBOOK_PDF_URL = SITE_URL + '/assets/ebook-astrologie.pdf';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // ── POST: Submit email → insert lead + send verification email ──
    if (req.method === 'POST' && action === 'submit') {
      const { first_name, email } = await req.json();

      if (!first_name || !email) {
        return new Response(
          JSON.stringify({ success: false, error: 'Prénom et email requis' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if this email already has a verified lead
      const { data: existing } = await supabase
        .from('leads')
        .select('id, email_verified')
        .eq('email', email.toLowerCase().trim())
        .eq('subject', 'Ebook Astro')
        .maybeSingle();

      if (existing?.email_verified) {
        return new Response(
          JSON.stringify({ success: true, already_verified: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert or update lead with new verification token
      let leadId: string;
      let token: string;

      if (existing) {
        // Re-send verification for existing unverified lead
        const { data, error } = await supabase
          .from('leads')
          .update({
            first_name: first_name.trim(),
            verification_token: crypto.randomUUID(),
          })
          .eq('id', existing.id)
          .select('id, verification_token')
          .single();
        if (error) throw error;
        leadId = data.id;
        token = data.verification_token;
      } else {
        // New lead
        const { data, error } = await supabase
          .from('leads')
          .insert({
            first_name: first_name.trim(),
            email: email.toLowerCase().trim(),
            subject: 'Ebook Astro',
            verification_token: crypto.randomUUID(),
          })
          .select('id, verification_token')
          .single();
        if (error) throw error;
        leadId = data.id;
        token = data.verification_token;
      }

      // Send verification email via Resend
      if (!RESEND_API_KEY) {
        console.warn('[ebook-verify] RESEND_API_KEY not set');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const verifyUrl = `${SITE_URL}/confirmation-ebook/?token=${token}`;

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Quiz Couple <noreply@quiz-couple.com>',
          to: [email.toLowerCase().trim()],
          subject: 'Confirmez votre e-mail pour recevoir votre E-Book gratuit',
          html: `
            <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:2rem;">
              <div style="text-align:center;margin-bottom:2rem;">
                <img src="${SITE_URL}/assets/logo-quiz-couple.png" alt="Quiz Couple" style="height:40px;">
              </div>
              <h1 style="color:#d6336c;font-size:1.5rem;text-align:center;">Plus qu'une étape, ${escapeHtml(first_name.trim())} !</h1>
              <p style="font-size:1rem;line-height:1.6;color:#333;text-align:center;">
                Cliquez sur le bouton ci-dessous pour confirmer votre adresse e-mail et recevoir immédiatement votre E-Book gratuit sur l'astrologie.
              </p>
              <div style="text-align:center;margin:2rem 0;">
                <a href="${verifyUrl}"
                   style="display:inline-block;padding:0.875rem 2rem;background:linear-gradient(135deg,#d6336c,#e8590c);color:white;text-decoration:none;border-radius:0.5rem;font-weight:700;font-size:1rem;">
                  Confirmer et recevoir mon E-Book
                </a>
              </div>
              <p style="font-size:0.875rem;color:#666;text-align:center;">
                Si vous n'avez pas demandé cet e-book, ignorez simplement ce message.
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:2rem 0;">
              <p style="font-size:0.75rem;color:#999;text-align:center;">
                Quiz Couple — quiz-couple.com
              </p>
            </div>
          `,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error('[ebook-verify] Resend error:', errText);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── POST/GET: Confirm email → mark verified + send ebook ──
    if ((req.method === 'GET' || req.method === 'POST') && action === 'confirm') {
      const token = url.searchParams.get('token');

      if (!token) {
        if (req.method === 'POST') {
          return new Response(
            JSON.stringify({ error: 'Token manquant.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response('Lien invalide.', {
          status: 400,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      // Find lead by token
      const { data: lead, error } = await supabase
        .from('leads')
        .select('id, first_name, email, email_verified')
        .eq('verification_token', token)
        .maybeSingle();

      if (error || !lead) {
        if (req.method === 'POST') {
          return new Response(
            JSON.stringify({ error: 'Ce lien est invalide ou a expiré.' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(buildResultPage('error', 'Ce lien est invalide ou a expiré.'), {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      if (lead.email_verified) {
        if (req.method === 'POST') {
          return new Response(
            JSON.stringify({ success: true, already_verified: true, first_name: lead.first_name }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(buildResultPage('already', lead.first_name), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      // Mark as verified + closed
      await supabase
        .from('leads')
        .update({
          email_verified: true,
          verified_at: new Date().toISOString(),
          is_closed: true,
        })
        .eq('id', lead.id);

      // Send ebook email with PDF attachment
      if (RESEND_API_KEY) {
        try {
          const pdfRes = await fetch(EBOOK_PDF_URL);
          if (!pdfRes.ok) throw new Error(`PDF fetch failed: ${pdfRes.status}`);
          const pdfBuffer = await pdfRes.arrayBuffer();
          const pdfBase64 = btoa(
            new Uint8Array(pdfBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Quiz Couple <noreply@quiz-couple.com>',
              to: [lead.email],
              subject: 'Votre E-Book gratuit : Apprendre les bases de l\'astrologie',
              html: `
                <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:2rem;">
                  <div style="text-align:center;margin-bottom:2rem;">
                    <img src="${SITE_URL}/assets/logo-quiz-couple.png" alt="Quiz Couple" style="height:40px;">
                  </div>
                  <h1 style="color:#d6336c;font-size:1.5rem;text-align:center;">Voici votre E-Book, ${escapeHtml(lead.first_name)} !</h1>
                  <p style="font-size:1rem;line-height:1.6;color:#333;text-align:center;">
                    Merci d'avoir confirmé votre adresse e-mail. Vous trouverez votre E-Book <strong>"Apprendre les bases de l'astrologie"</strong> en pièce jointe de cet e-mail.
                  </p>
                  <div style="text-align:center;margin:2rem 0;padding:1.5rem;background:#f8f9fa;border-radius:0.75rem;">
                    <p style="font-size:0.9375rem;color:#555;margin:0;">
                      📎 Le PDF est joint à cet e-mail.<br>
                      Si vous ne le voyez pas, vérifiez votre dossier spam.
                    </p>
                  </div>
                  <p style="font-size:1rem;line-height:1.6;color:#333;text-align:center;">
                    Bonne lecture et à bientôt sur Quiz Couple !
                  </p>
                  <hr style="border:none;border-top:1px solid #eee;margin:2rem 0;">
                  <p style="font-size:0.75rem;color:#999;text-align:center;">
                    Quiz Couple — quiz-couple.com
                  </p>
                </div>
              `,
              attachments: [
                {
                  filename: 'Apprendre-les-bases-de-l-Astrologie-QuizCouple.pdf',
                  content: pdfBase64,
                },
              ],
            }),
          });
          console.log(`[ebook-verify] Ebook sent to ${lead.email}`);
        } catch (emailErr) {
          console.error('[ebook-verify] Failed to send ebook email:', emailErr);
        }
      }

      if (req.method === 'POST') {
        return new Response(
          JSON.stringify({ success: true, first_name: lead.first_name }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(buildResultPage('success', lead.first_name), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Action inconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[ebook-verify] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Build a nice HTML confirmation page shown after clicking the verification link
 */
function buildResultPage(status: 'success' | 'already' | 'error', nameOrMessage: string): string {
  const titles: Record<string, string> = {
    success: 'E-mail confirmé !',
    already: 'Déjà confirmé !',
    error: 'Oups...',
  };

  const messages: Record<string, string> = {
    success: `Merci ${escapeHtml(nameOrMessage)} ! Votre E-Book a été envoyé à votre adresse e-mail. Vérifiez votre boîte de réception (et le dossier spam, au cas où).`,
    already: `${escapeHtml(nameOrMessage)}, votre e-mail a déjà été confirmé. L'E-Book a été envoyé précédemment. Si vous ne le retrouvez pas, vérifiez votre dossier spam.`,
    error: escapeHtml(nameOrMessage),
  };

  const colors: Record<string, string> = {
    success: '#22c55e',
    already: '#3b82f6',
    error: '#ef4444',
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${titles[status]} — Quiz Couple</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Inter, system-ui, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #fdf2f8, #fff7ed); padding: 1rem; }
    .card { max-width: 480px; width: 100%; background: white; border-radius: 1rem; padding: 2.5rem; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .icon { width: 4rem; height: 4rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; color: #1a1a2e; }
    p { font-size: 1rem; line-height: 1.6; color: #555; margin-bottom: 1.5rem; }
    .btn { display: inline-block; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #d6336c, #e8590c); color: white; text-decoration: none; border-radius: 0.5rem; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon" style="background:${colors[status]}15;color:${colors[status]}">
      ${status === 'success' ? '✅' : status === 'already' ? 'ℹ️' : '❌'}
    </div>
    <h1>${titles[status]}</h1>
    <p>${messages[status]}</p>
    <a href="https://quiz-couple.com" class="btn">Retourner sur Quiz Couple</a>
  </div>
</body>
</html>`;
}
