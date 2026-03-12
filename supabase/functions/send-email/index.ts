/**
 * Send Email via Resend API
 *
 * This edge function handles transactional emails for the annuaire:
 * - Signup confirmation (called directly after signUp, bypasses Auth Hooks)
 * - Password reset emails
 * - Profile approval/rejection notifications (called from admin-annuaire)
 *
 * Required env vars:
 *   RESEND_API_KEY - Your Resend API key
 *   SITE_URL - e.g. https://annuaire.quiz-couple.com
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY - for admin.generateLink
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') || 'https://annuaire.quiz-couple.com';
const FROM_EMAIL = 'Annuaire Quiz Couple <annuaire@quiz-couple.com>';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendWithResend(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend API error:', res.status, err);
      return { success: false, error: `Resend API error: ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    console.error('Resend send failed:', err);
    return { success: false, error: err.message };
  }
}

function wrapInTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f8f7fc;font-family:Inter,system-ui,-apple-system,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:2rem 1rem;">
        <!-- Header -->
        <div style="text-align:center;margin-bottom:2rem;">
          <img src="https://quiz-couple.com/assets/logo-quiz-couple.png" alt="Quiz Couple" width="40" height="42" style="display:inline-block;">
          <span style="font-size:1.25rem;font-weight:700;vertical-align:middle;margin-left:0.5rem;color:#1a1625;">Annuaire</span>
        </div>

        <!-- Content -->
        <div style="background:white;border-radius:1rem;padding:2rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          ${content}
        </div>

        <!-- Footer -->
        <div style="text-align:center;margin-top:2rem;padding:1rem;">
          <p style="font-size:0.75rem;color:#999;margin:0;">
            Quiz Couple — Annuaire des professionnels du couple en France
          </p>
          <p style="font-size:0.75rem;color:#bbb;margin:0.5rem 0 0;">
            <a href="${SITE_URL}" style="color:#bbb;">annuaire.quiz-couple.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ── Email templates ──

function confirmationEmail(email: string, confirmUrl: string): EmailPayload {
  return {
    to: email,
    subject: 'Confirmez votre adresse email — Annuaire Quiz Couple',
    html: wrapInTemplate(`
      <h1 style="color:#d6336c;font-size:1.5rem;margin:0 0 1rem;">Confirmez votre email</h1>
      <p style="font-size:1rem;line-height:1.6;color:#333;margin:0 0 1rem;">
        Bienvenue sur l'Annuaire Quiz Couple ! Pour finaliser votre inscription, confirmez votre adresse email en cliquant sur le bouton ci-dessous.
      </p>
      <div style="text-align:center;margin:2rem 0;">
        <a href="${confirmUrl}" style="display:inline-block;padding:0.875rem 2rem;background:#d6336c;color:white;text-decoration:none;border-radius:0.5rem;font-weight:600;font-size:1rem;">
          Confirmer mon email
        </a>
      </div>
      <p style="font-size:0.875rem;color:#666;margin:0;">
        Ce lien est valable 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:1.5rem 0;">
      <p style="font-size:0.8125rem;color:#999;margin:0;">
        <strong>Et ensuite ?</strong> Après confirmation, notre équipe vérifiera votre fiche (24h à 72h). Vous recevrez un email dès qu'elle sera en ligne.
      </p>
    `),
  };
}

function passwordResetEmail(email: string, resetUrl: string): EmailPayload {
  return {
    to: email,
    subject: 'Réinitialisation du mot de passe — Annuaire Quiz Couple',
    html: wrapInTemplate(`
      <h1 style="color:#d6336c;font-size:1.5rem;margin:0 0 1rem;">Réinitialisation du mot de passe</h1>
      <p style="font-size:1rem;line-height:1.6;color:#333;margin:0 0 1rem;">
        Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
      </p>
      <div style="text-align:center;margin:2rem 0;">
        <a href="${resetUrl}" style="display:inline-block;padding:0.875rem 2rem;background:#d6336c;color:white;text-decoration:none;border-radius:0.5rem;font-weight:600;font-size:1rem;">
          Réinitialiser mon mot de passe
        </a>
      </div>
      <p style="font-size:0.875rem;color:#666;margin:0;">
        Ce lien est valable 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
      </p>
    `),
  };
}

function magicLinkEmail(email: string, magicUrl: string): EmailPayload {
  return {
    to: email,
    subject: 'Lien de connexion — Annuaire Quiz Couple',
    html: wrapInTemplate(`
      <h1 style="color:#d6336c;font-size:1.5rem;margin:0 0 1rem;">Connexion à votre espace</h1>
      <p style="font-size:1rem;line-height:1.6;color:#333;margin:0 0 1rem;">
        Cliquez sur le bouton ci-dessous pour vous connecter à votre espace professionnel.
      </p>
      <div style="text-align:center;margin:2rem 0;">
        <a href="${magicUrl}" style="display:inline-block;padding:0.875rem 2rem;background:#d6336c;color:white;text-decoration:none;border-radius:0.5rem;font-weight:600;font-size:1rem;">
          Se connecter
        </a>
      </div>
      <p style="font-size:0.875rem;color:#666;margin:0;">
        Ce lien est à usage unique et expire dans 1 heure.
      </p>
    `),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();

    // ── Signup confirmation (called from client after signUp) ──
    // Uses admin.generateLink to create a magic link that confirms email + logs in.
    // This bypasses Auth Hooks entirely.
    if (body.action === 'send-signup-confirmation' && body.email) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseUrl || !serviceRoleKey) {
        console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured');
        return new Response(JSON.stringify({ error: 'Server configuration error' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      const redirectTo = body.redirect_to || `${SITE_URL}/dashboard/`;

      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: body.email,
        options: { redirectTo },
      });

      if (linkError) {
        console.error('generateLink error:', linkError);
        return new Response(JSON.stringify({ error: linkError.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Build verification URL from the returned token
      const tokenHash = linkData.properties.hashed_token;
      const actionUrl = `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=magiclink&redirect_to=${encodeURIComponent(redirectTo)}`;

      const emailPayload = confirmationEmail(body.email, actionUrl);
      const result = await sendWithResend(emailPayload);

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Password reset (called from client) ──
    if (body.action === 'send-password-reset' && body.email) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseUrl || !serviceRoleKey) {
        return new Response(JSON.stringify({ error: 'Server configuration error' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      const redirectTo = body.redirect_to || `${SITE_URL}/dashboard/`;

      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: body.email,
        options: { redirectTo },
      });

      if (linkError) {
        console.error('generateLink error:', linkError);
        return new Response(JSON.stringify({ error: linkError.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const tokenHash = linkData.properties.hashed_token;
      const actionUrl = `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=recovery&redirect_to=${encodeURIComponent(redirectTo)}`;

      const emailPayload = passwordResetEmail(body.email, actionUrl);
      const result = await sendWithResend(emailPayload);

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Direct email sending (internal use only — requires service role key) ──
    if (body.to && body.subject && body.html) {
      const authHeader = req.headers.get('authorization') || '';
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const result = await sendWithResend({
        to: body.to,
        subject: body.subject,
        html: wrapInTemplate(body.html),
      });

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid request format' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('send-email error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
