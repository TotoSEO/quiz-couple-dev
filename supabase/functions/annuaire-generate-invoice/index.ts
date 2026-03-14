/**
 * annuaire-generate-invoice
 *
 * Called internally by annuaire-stripe-webhook after invoice.paid.
 * Generates a PDF invoice conforming to French regulations,
 * stores it in Supabase Storage, and sends it via email (Resend).
 *
 * Required env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY
 *   STRIPE_SECRET_KEY
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

// ── Company info (micro-entreprise) ──
const COMPANY = {
  name: 'Quiz Couple Annuaire',
  owner: 'Thomas Owaller',
  address: '4 rue de Bruges',
  city: '67000 Strasbourg',
  email: 'thomas.owaller@gmail.com',
  siret: '94010680000011',
  siren: '940106800',
  disclaimer: 'Dispensé d\'immatriculation au RCS ou RM',
};

const PLAN_LABELS: Record<string, string> = {
  pro: 'Professionnel',
  boost: 'Boost',
};

interface InvoiceData {
  stripe_invoice_id: string;
  professional_id: string;
  plan: string;
  period: string; // 'monthly' | 'annual'
  period_start: string; // ISO date
  period_end: string;   // ISO date
  amount_ht: number;    // cents
  amount_tva: number;   // cents
  amount_ttc: number;   // cents
  discount_amount: number; // cents (HT)
  discount_label: string | null;
  paid_at: string; // ISO date
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
    const invoiceData: InvoiceData = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check for duplicate (idempotency)
    const { data: existing } = await supabase
      .from('annuaire_invoices')
      .select('id, invoice_number')
      .eq('stripe_invoice_id', invoiceData.stripe_invoice_id)
      .maybeSingle();

    if (existing) {
      console.log(`[invoice] Already exists: ${existing.invoice_number}`);
      return new Response(JSON.stringify({ invoice_number: existing.invoice_number }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get professional profile (billing info)
    const { data: profile, error: profileError } = await supabase
      .from('annuaire_professionals')
      .select('id, email, first_name, last_name, billing_company_name, billing_siret, billing_tva_number, billing_address, billing_email')
      .eq('id', invoiceData.professional_id)
      .single();

    if (profileError || !profile) {
      console.error('[invoice] Profile not found:', invoiceData.professional_id);
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404 });
    }

    // Generate invoice number
    const { data: seqResult } = await supabase
      .rpc('generate_invoice_number');

    // Fallback if RPC doesn't work (use raw query)
    let invoiceNumber = seqResult;
    if (!invoiceNumber) {
      const { data: rawSeq } = await supabase
        .from('annuaire_invoices')
        .select('invoice_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const lastNum = rawSeq?.invoice_number
        ? parseInt(rawSeq.invoice_number.replace('ANNQUCO-', ''), 10)
        : 0;
      invoiceNumber = `ANNQUCO-${lastNum + 1}`;
    }

    const clientEmail = profile.billing_email || profile.email;
    const clientCompanyName = profile.billing_company_name || `${profile.first_name} ${profile.last_name}`;

    // Create invoice record
    const invoiceRecord = {
      professional_id: invoiceData.professional_id,
      invoice_number: invoiceNumber,
      stripe_invoice_id: invoiceData.stripe_invoice_id,
      amount_ht: invoiceData.amount_ht,
      amount_tva: invoiceData.amount_tva,
      amount_ttc: invoiceData.amount_ttc,
      discount_amount: invoiceData.discount_amount,
      discount_label: invoiceData.discount_label,
      plan: invoiceData.plan,
      period: invoiceData.period,
      period_start: invoiceData.period_start,
      period_end: invoiceData.period_end,
      client_company_name: clientCompanyName,
      client_siret: profile.billing_siret,
      client_tva_number: profile.billing_tva_number,
      client_address: profile.billing_address,
      client_email: clientEmail,
      paid_at: invoiceData.paid_at,
    };

    const { data: insertedInvoice, error: insertError } = await supabase
      .from('annuaire_invoices')
      .insert(invoiceRecord)
      .select()
      .single();

    if (insertError) {
      // Handle duplicate constraint (race condition)
      if (insertError.code === '23505') {
        console.log(`[invoice] Duplicate detected for ${invoiceData.stripe_invoice_id}`);
        return new Response(JSON.stringify({ invoice_number: invoiceNumber }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      console.error('[invoice] Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create invoice record' }), { status: 500 });
    }

    // Generate PDF
    const pdfBytes = await generateInvoicePdf({
      invoiceNumber,
      issuedAt: invoiceData.paid_at,
      company: COMPANY,
      client: {
        companyName: clientCompanyName,
        siret: profile.billing_siret,
        tva: profile.billing_tva_number,
        address: profile.billing_address,
      },
      period: {
        start: invoiceData.period_start,
        end: invoiceData.period_end,
      },
      plan: invoiceData.plan,
      periodType: invoiceData.period,
      amountHt: invoiceData.amount_ht,
      amountTva: invoiceData.amount_tva,
      amountTtc: invoiceData.amount_ttc,
      discountAmount: invoiceData.discount_amount,
      discountLabel: invoiceData.discount_label,
      paidAt: invoiceData.paid_at,
    });

    // Store PDF in Supabase Storage
    const storagePath = `${invoiceData.professional_id}/${invoiceNumber}.pdf`;
    const { error: storageError } = await supabase.storage
      .from('annuaire-invoices')
      .upload(storagePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (storageError) {
      console.error('[invoice] Storage upload error:', storageError);
    } else {
      // Update invoice record with storage path
      await supabase
        .from('annuaire_invoices')
        .update({ pdf_storage_path: storagePath })
        .eq('id', insertedInvoice.id);
    }

    // Send email with PDF attachment
    const pdfBase64 = base64Encode(pdfBytes);
    const periodLabel = invoiceData.period === 'annual' ? 'annuel' : 'mensuel';
    const planLabel = PLAN_LABELS[invoiceData.plan] || invoiceData.plan;

    await sendInvoiceEmail({
      to: clientEmail,
      invoiceNumber,
      planLabel,
      periodLabel,
      amountTtc: formatCents(invoiceData.amount_ttc),
      pdfBase64,
      pdfFilename: `${invoiceNumber}.pdf`,
    });

    console.log(`[invoice] Generated and sent: ${invoiceNumber} to ${clientEmail}`);

    return new Response(JSON.stringify({
      invoice_number: invoiceNumber,
      sent_to: clientEmail,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[invoice] Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

// ── PDF Generation ──

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  });
}

function formatDateLong(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  });
}

interface PdfData {
  invoiceNumber: string;
  issuedAt: string;
  company: typeof COMPANY;
  client: { companyName: string; siret: string; tva: string; address: string };
  period: { start: string; end: string };
  plan: string;
  periodType: string;
  amountHt: number;
  amountTva: number;
  amountTtc: number;
  discountAmount: number;
  discountLabel: string | null;
  paidAt: string;
}

async function generateInvoicePdf(data: PdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const black = rgb(0.1, 0.1, 0.12);
  const gray = rgb(0.45, 0.45, 0.5);
  const lightGray = rgb(0.92, 0.92, 0.94);
  const primary = rgb(0.84, 0.2, 0.42); // #d6336c
  const green = rgb(0.15, 0.65, 0.35);
  const white = rgb(1, 1, 1);

  const margin = 50;
  let y = height - margin;

  // Helper functions
  function text(str: string, x: number, yPos: number, opts: { font?: typeof fontRegular; size?: number; color?: typeof black } = {}) {
    page.drawText(str, {
      x,
      y: yPos,
      font: opts.font || fontRegular,
      size: opts.size || 10,
      color: opts.color || black,
    });
  }

  function textRight(str: string, yPos: number, opts: { font?: typeof fontRegular; size?: number; color?: typeof black } = {}) {
    const font = opts.font || fontRegular;
    const size = opts.size || 10;
    const w = font.widthOfTextAtSize(str, size);
    text(str, width - margin - w, yPos, opts);
  }

  function line(x1: number, yPos: number, x2: number, thickness = 0.5, color = lightGray) {
    page.drawLine({ start: { x: x1, y: yPos }, end: { x: x2, y: yPos }, thickness, color });
  }

  // ═══════════════════════════════════════════
  // SECTION 1: Header
  // ═══════════════════════════════════════════

  // Left: Company name
  text('Quiz Couple', margin, y, { font: fontBold, size: 18, color: primary });
  text('Annuaire', margin + fontBold.widthOfTextAtSize('Quiz Couple ', 18), y, { font: fontRegular, size: 18, color: black });

  // Right: FACTURE title
  textRight('FACTURE', y, { font: fontBold, size: 22, color: black });

  y -= 20;
  textRight(data.invoiceNumber, y, { font: fontRegular, size: 11, color: gray });
  y -= 15;
  textRight(formatDate(data.issuedAt), y, { font: fontRegular, size: 10, color: gray });

  y -= 30;
  line(margin, y, width - margin);
  y -= 25;

  // Left: Emitter info
  const emitterX = margin;
  text(data.company.owner, emitterX, y, { font: fontBold, size: 10 });
  y -= 14;
  text(data.company.address, emitterX, y, { size: 9, color: gray });
  y -= 13;
  text(data.company.city, emitterX, y, { size: 9, color: gray });
  y -= 13;
  text(data.company.email, emitterX, y, { size: 9, color: gray });
  y -= 16;
  text(`SIRET : ${data.company.siret}`, emitterX, y, { size: 9, color: gray });
  y -= 13;
  text(`SIREN : ${data.company.siren}`, emitterX, y, { size: 9, color: gray });
  y -= 16;
  text(data.company.disclaimer, emitterX, y, { size: 7, color: gray });

  y -= 35;
  line(margin, y, width - margin);
  y -= 30;

  // ═══════════════════════════════════════════
  // SECTION 2: Client + Period
  // ═══════════════════════════════════════════

  const clientX = margin;
  const periodX = width / 2 + 40;

  // Left: Client
  text('FACTURÉ À', clientX, y, { font: fontBold, size: 9, color: gray });
  y -= 18;
  text(data.client.companyName, clientX, y, { font: fontBold, size: 10 });
  y -= 14;
  text(`SIRET : ${data.client.siret}`, clientX, y, { size: 9, color: gray });
  y -= 13;
  text(`TVA : ${data.client.tva}`, clientX, y, { size: 9, color: gray });
  y -= 16;
  // Multi-line address
  const addressLines = data.client.address.split('\n');
  for (const addrLine of addressLines) {
    text(addrLine.trim(), clientX, y, { size: 9, color: gray });
    y -= 13;
  }

  // Right: Period (restore y for alignment)
  const periodY = y + 13 + (addressLines.length * 13) + 16 + 13 + 14 + 18; // back to section start
  text('PÉRIODE DE FACTURATION', periodX, periodY, { font: fontBold, size: 9, color: gray });
  text(`Du ${formatDate(data.period.start)}`, periodX, periodY - 18, { size: 10 });
  text(`Au ${formatDate(data.period.end)}`, periodX, periodY - 33, { size: 10 });

  y -= 20;
  line(margin, y, width - margin);
  y -= 10;

  // ═══════════════════════════════════════════
  // SECTION 3: Invoice table
  // ═══════════════════════════════════════════

  const colDesig = margin;
  const colQty = 340;
  const colHt = 400;
  const colTtc = 490;

  // Table header
  y -= 5;
  page.drawRectangle({ x: margin, y: y - 5, width: width - 2 * margin, height: 22, color: lightGray });
  text('Désignation', colDesig + 8, y, { font: fontBold, size: 9 });
  text('Qté', colQty, y, { font: fontBold, size: 9 });
  text('Prix HT', colHt, y, { font: fontBold, size: 9 });
  text('Prix TTC', colTtc, y, { font: fontBold, size: 9 });

  y -= 30;

  // Main line item
  const planLabel = PLAN_LABELS[data.plan] || data.plan;
  const periodLabel = data.periodType === 'annual' ? 'annuel' : 'mensuel';
  const designation = `Abonnement ${periodLabel} — ${planLabel}`;
  // amountHt is after discount; line item shows pre-discount price
  const lineHt = data.amountHt + data.discountAmount;
  const lineTtc = Math.round(lineHt * 1.2);

  text(designation, colDesig + 8, y, { font: fontBold, size: 10 });
  y -= 14;
  text(`Abonnement ${periodLabel} pour débloquer des fonctionnalités et une`, colDesig + 8, y, { size: 8, color: gray });
  y -= 11;
  text('meilleure mise en avant sur la plateforme.', colDesig + 8, y, { size: 8, color: gray });

  // Qty, HT, TTC on the first line
  const lineY = y + 25;
  text('1', colQty + 5, lineY, { size: 10 });
  text(`${formatCents(lineHt)} €`, colHt, lineY, { size: 10 });
  text(`${formatCents(lineTtc)} €`, colTtc, lineY, { size: 10 });

  y -= 15;
  line(margin, y, width - margin, 0.3);
  y -= 5;

  // Discount line (if applicable)
  if (data.discountAmount > 0 && data.discountLabel) {
    y -= 15;
    text(data.discountLabel, colDesig + 8, y, { size: 10, color: primary });
    text('1', colQty + 5, y, { size: 10 });
    text(`-${formatCents(data.discountAmount)} €`, colHt, y, { size: 10, color: primary });
    const discountTtc = Math.round(data.discountAmount * 1.2);
    text(`-${formatCents(discountTtc)} €`, colTtc, y, { size: 10, color: primary });
    y -= 15;
    line(margin, y, width - margin, 0.3);
    y -= 5;
  }

  // Sous-total HT (after discount)
  y -= 15;
  text('Sous-total HT', colDesig + 8, y, { size: 9, color: gray });
  text(`${formatCents(data.amountHt)} €`, colTtc, y, { size: 10 });

  // TVA line
  y -= 18;
  text('TVA (20%)', colDesig + 8, y, { size: 9, color: gray });
  text(`${formatCents(data.amountTva)} €`, colTtc, y, { size: 10 });

  y -= 20;
  line(margin, y, width - margin, 1, primary);
  y -= 5;

  // Total TTC — calculated from actual HT + TVA for consistency
  const verifiedTtc = data.amountHt + data.amountTva;
  y -= 15;
  page.drawRectangle({ x: colHt - 10, y: y - 8, width: width - margin - colHt + 10, height: 28, color: primary });
  text('TOTAL TTC', colHt, y, { font: fontBold, size: 11, color: white });
  const totalStr = `${formatCents(verifiedTtc)} €`;
  const totalWidth = fontBold.widthOfTextAtSize(totalStr, 12);
  text(totalStr, width - margin - totalWidth - 8, y, { font: fontBold, size: 12, color: white });

  y -= 45;

  // ═══════════════════════════════════════════
  // Payment confirmation
  // ═══════════════════════════════════════════

  page.drawRectangle({
    x: margin,
    y: y - 8,
    width: width - 2 * margin,
    height: 40,
    color: rgb(0.93, 0.98, 0.94),
    borderColor: rgb(0.75, 0.9, 0.78),
    borderWidth: 0.5,
  });

  text('✓  Paiement confirmé', margin + 15, y + 12, { font: fontBold, size: 10, color: green });
  text(`Cette facture a été réglée via Stripe le ${formatDateLong(data.paidAt)}.`, margin + 15, y - 2, { size: 9, color: gray });

  // ═══════════════════════════════════════════
  // Footer
  // ═══════════════════════════════════════════

  const footerY = 60;
  line(margin, footerY + 20, width - margin, 0.5, lightGray);

  const footerLine1 = 'Quiz Couple Annuaire : améliorez votre visibilité en ligne';
  const footerLine2 = 'annuaire.quiz-couple.com';
  const footerLine3 = 'En cas de question sur cette facture, contactez-nous.';

  const f1w = fontRegular.widthOfTextAtSize(footerLine1, 8);
  const f2w = fontRegular.widthOfTextAtSize(footerLine2, 8);
  const f3w = fontRegular.widthOfTextAtSize(footerLine3, 8);

  text(footerLine1, (width - f1w) / 2, footerY + 5, { size: 8, color: gray });
  text(footerLine2, (width - f2w) / 2, footerY - 7, { size: 8, color: primary });
  text(footerLine3, (width - f3w) / 2, footerY - 19, { size: 8, color: gray });

  return await doc.save();
}

// ── Email ──

interface EmailData {
  to: string;
  invoiceNumber: string;
  planLabel: string;
  periodLabel: string;
  amountTtc: string;
  pdfBase64: string;
  pdfFilename: string;
}

async function sendInvoiceEmail(data: EmailData): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f8f7fc;font-family:Inter,system-ui,-apple-system,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:2rem 1rem;">
        <div style="text-align:center;margin-bottom:2rem;">
          <img src="https://quiz-couple.com/assets/logo-quiz-couple.png" alt="Quiz Couple" width="40" height="42" style="display:inline-block;">
          <span style="font-size:1.25rem;font-weight:700;vertical-align:middle;margin-left:0.5rem;color:#1a1625;">Annuaire</span>
        </div>
        <div style="background:white;border-radius:1rem;padding:2rem;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <h1 style="color:#d6336c;font-size:1.5rem;margin:0 0 1rem;">Votre facture ${data.invoiceNumber}</h1>
          <p style="font-size:1rem;line-height:1.6;color:#333;margin:0 0 1rem;">
            Votre paiement pour l'abonnement <strong>${data.planLabel}</strong> (${data.periodLabel}) a bien été reçu.
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:0.5rem;padding:1rem;margin:1rem 0;">
            <p style="margin:0;font-size:0.9375rem;color:#166534;">
              <strong>Montant réglé :</strong> ${data.amountTtc} € TTC
            </p>
          </div>
          <p style="font-size:0.9375rem;line-height:1.6;color:#333;margin:1rem 0 0;">
            Votre facture est jointe à cet email au format PDF. Vous pouvez également la retrouver dans votre <a href="https://annuaire.quiz-couple.com/dashboard/" style="color:#d6336c;text-decoration:underline;">espace professionnel</a>.
          </p>
        </div>
        <div style="text-align:center;margin-top:2rem;padding:1rem;">
          <p style="font-size:0.75rem;color:#999;margin:0;">Quiz Couple — Annuaire des professionnels du couple en France</p>
          <p style="font-size:0.75rem;color:#bbb;margin:0.5rem 0 0;"><a href="https://annuaire.quiz-couple.com" style="color:#bbb;">annuaire.quiz-couple.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Annuaire Quiz Couple <annuaire@quiz-couple.com>',
      to: [data.to],
      subject: `Facture ${data.invoiceNumber} — Annuaire Quiz Couple`,
      html,
      attachments: [{
        filename: data.pdfFilename,
        content: data.pdfBase64,
      }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[invoice] Email send error:', res.status, errText);
    throw new Error(`Email send failed: ${res.status}`);
  }
}
