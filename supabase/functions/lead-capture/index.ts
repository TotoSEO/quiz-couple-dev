// La capture d'une adresse e-mail à la fin d'un test (19 octobre 2026) : la
// page floute le reste du résultat et le déverrouille dès que l'adresse est
// acceptée ici (capture.js). Et la désinscription, par le lien de chaque
// e-mail envoyé.
//
// POST { email, lang, source, page, consent, hp }
//   → 200 { ok: true, cle }       adresse enregistrée (ou déjà là : on compte) ;
//                                 `cle` sert une heure, une fois, à donner son prénom
// POST { action: 'prenom', email, cle, prenom }
//   → 200 { ok: true, prenom }    le prénom, facultatif, demandé après coup
//   → 400 { ok: false, code: 'prenom' } / 403 { ok: false, code: 'cle' }
//   → 400 { ok: false, code }     format, jetable, domaine, consentement, langue, source
//   → 429 { ok: false, code: 'trop' }
// GET  ?d=<jeton>[&lang=fr]      → la page de désinscription (HTML)
//
// Ce qui est contrôlé : la forme stricte de l'adresse, les fournisseurs
// jetables, le domaine (un enregistrement MX ou A, tolérant quand le DNS ne
// répond pas), le consentement coché, la langue parmi les cinq, la source
// (l'id de la page), trente envois par heure et par adresse IP (mémoire de la
// fonction, repart à zéro à chaque redémarrage), un pot de miel (`hp`,
// rempli seulement par les robots : on répond ok sans rien garder), et une
// taille de corps bornée. Pas de code de validation par e-mail (plan Resend
// de cent envois par jour) : voir _shared/abonnes/regles.mjs.
//
// La table abonnes est fermée à la clé publique : tout passe par la clé de
// service, ici. L'adresse IP n'est gardée qu'en empreinte salée.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  controleEmail, langueValide, sourceValide, pagePropre, hacheIp, pageDesinscription, prenomPropre, empreinte,
} from '../_shared/abonnes/regles.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SEL = Deno.env.get('ABONNES_SEL') || SERVICE_KEY.slice(-16);
const TAILLE_MAX = 2048;
// Trente par heure et par IP : derrière le NAT d'un opérateur mobile, une
// adresse IP sert des dizaines de personnes à la fois ; et au 429 la page
// s'ouvre quand même (capture.js), seule l'adresse n'est pas gardée.
const PAR_HEURE = 30;

const essais = new Map<string, number[]>();
function ipAutorisee(ip: string): boolean {
  const maintenant = Date.now();
  const liste = (essais.get(ip) || []).filter((t) => maintenant - t < 3600_000);
  if (liste.length >= PAR_HEURE) { essais.set(ip, liste); return false; }
  liste.push(maintenant); essais.set(ip, liste);
  if (essais.size > 5000) { for (const [k, v] of essais) if (!v.some((t) => maintenant - t < 3600_000)) essais.delete(k); }
  return true;
}

// Le prénom se donne juste après l'adresse, avec la clé que la réponse vient
// de rendre : sans elle, n'importe qui pourrait écrire un prénom (ou une
// insulte) sur l'adresse de quelqu'un d'autre, qui la lirait dans nos e-mails.
// La base ne garde que l'empreinte de la clé, une heure. Si les colonnes
// manquent (migration pas encore passée), l'adresse est gardée quand même,
// simplement sans clé.
const CLE_DUREE_MS = 3600_000;
async function poserCle(supabase: ReturnType<typeof createClient>, email: string): Promise<string | null> {
  const cle = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const { error } = await supabase.from('abonnes')
    .update({ prenom_cle: await empreinte(cle), prenom_cle_le: new Date().toISOString() })
    .eq('email', email);
  if (error) { console.warn('[lead-capture] clé du prénom :', error.message); return null; }
  return cle;
}

function json(code: number, corps: unknown): Response {
  return new Response(JSON.stringify(corps), { status: code, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

// Le domaine reçoit-il du courrier ? Un MX, ou à défaut un A (certains petits
// domaines n'ont que ça). Si le DNS ne répond pas (délai, panne), on accepte :
// une panne de notre côté ne doit pas bloquer la personne.
async function domaineJoignable(domaine: string): Promise<boolean | null> {
  const avecDelai = <T>(p: Promise<T>) => Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('delai')), 2500))]);
  try {
    const mx = await avecDelai(Deno.resolveDns(domaine, 'MX'));
    if (Array.isArray(mx) && mx.length) return true;
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) return null;
  }
  try {
    const a = await avecDelai(Deno.resolveDns(domaine, 'A'));
    return Array.isArray(a) && a.length > 0;
  } catch (e) {
    return e instanceof Deno.errors.NotFound ? false : null;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const url = new URL(req.url);

  // ── La désinscription ──
  if (req.method === 'GET') {
    const jeton = (url.searchParams.get('d') || '').trim();
    const lang = langueValide(url.searchParams.get('lang') || '') || 'fr';
    let trouve = false;
    if (/^[a-f0-9]{16,64}$/.test(jeton)) {
      const { data } = await supabase.from('abonnes').select('id, statut, lang').eq('jeton', jeton).maybeSingle();
      if (data) {
        trouve = data.statut !== 'desinscrit';
        if (trouve) {
          await supabase.from('abonnes').update({ statut: 'desinscrit', desinscrit_le: new Date().toISOString(), maj_le: new Date().toISOString() }).eq('id', data.id);
        }
        return new Response(pageDesinscription(data.lang || lang, trouve), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
      }
    }
    return new Response(pageDesinscription(lang, false), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
  }

  if (req.method !== 'POST') return json(405, { ok: false, code: 'methode' });
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('cf-connecting-ip') || 'inconnue';
  const texte = await req.text();
  if (texte.length > TAILLE_MAX) return json(413, { ok: false, code: 'taille' });
  let corps: Record<string, unknown> = {};
  try { corps = JSON.parse(texte || '{}'); } catch { return json(400, { ok: false, code: 'format' }); }

  // Le pot de miel : un champ invisible qu'une personne ne remplit jamais.
  if (typeof corps.hp === 'string' && corps.hp.trim()) return json(200, { ok: true });

  // ── Le prénom, après coup ──
  if (corps.action === 'prenom') {
    if (!ipAutorisee(ip)) return json(429, { ok: false, code: 'trop' });
    const ctrlP = controleEmail(corps.email);
    if (!ctrlP.ok) return json(400, { ok: false, code: 'format' });
    const prenom = prenomPropre(corps.prenom);
    if (!prenom) return json(400, { ok: false, code: 'prenom' });
    const cle = typeof corps.cle === 'string' && /^[a-f0-9]{32,64}$/.test(corps.cle) ? corps.cle : null;
    if (!cle) return json(403, { ok: false, code: 'cle' });
    const { data: ab } = await supabase.from('abonnes').select('id, prenom_cle, prenom_cle_le').eq('email', ctrlP.email).maybeSingle();
    const pose = ab && ab.prenom_cle_le ? Date.parse(ab.prenom_cle_le) : NaN;
    if (!ab || !ab.prenom_cle || ab.prenom_cle !== await empreinte(cle) || !(Date.now() - pose < CLE_DUREE_MS)) {
      return json(403, { ok: false, code: 'cle' });
    }
    const { error } = await supabase.from('abonnes')
      .update({ prenom, prenom_cle: null, prenom_cle_le: null, maj_le: new Date().toISOString() })
      .eq('id', ab.id);
    if (error) { console.error('[lead-capture] prénom :', error.message); return json(500, { ok: false, code: 'serveur' }); }
    return json(200, { ok: true, prenom });
  }

  const lang = langueValide(typeof corps.lang === 'string' ? corps.lang : '');
  const source = sourceValide(corps.source);
  if (!lang) return json(400, { ok: false, code: 'langue' });
  if (!source) return json(400, { ok: false, code: 'source' });
  if (corps.consent !== true) return json(400, { ok: false, code: 'consentement' });
  const ctrl = controleEmail(corps.email);
  if (!ctrl.ok) return json(400, { ok: false, code: ctrl.code });
  if (!ipAutorisee(ip)) return json(429, { ok: false, code: 'trop' });

  const joignable = await domaineJoignable(ctrl.domaine);
  if (joignable === false) return json(400, { ok: false, code: 'domaine' });

  const page = pagePropre(corps.page);
  const maintenant = new Date().toISOString();
  const ipHash = await hacheIp(ip, SEL);
  const { data: existant } = await supabase.from('abonnes').select('id, captures, statut').eq('email', ctrl.email).maybeSingle();
  if (existant) {
    // Déjà là : on compte, on note la dernière page, et une adresse qui
    // s'était désinscrite redit oui (c'est un nouveau consentement explicite).
    const champs: Record<string, unknown> = {
      captures: Math.min(100000, (Number(existant.captures) || 0) + 1), derniere_source: source, maj_le: maintenant, lang,
    };
    if (existant.statut === 'desinscrit') Object.assign(champs, { statut: 'actif', consent_at: maintenant, desinscrit_le: null });
    const { error } = await supabase.from('abonnes').update(champs).eq('id', existant.id);
    if (error) console.error('[lead-capture] maj :', error.message);
    return json(200, { ok: true, cle: await poserCle(supabase, ctrl.email) });
  }
  const { error } = await supabase.from('abonnes').insert({
    email: ctrl.email, lang, source, page, statut: 'actif', consent_at: maintenant, ip_hash: ipHash,
  });
  if (error) {
    // Une course entre deux envois de la même adresse : la seconde insertion
    // bute sur l'unicité, l'adresse est bien là.
    if (String(error.code) === '23505') return json(200, { ok: true });
    console.error('[lead-capture] insertion :', error.message);
    return json(500, { ok: false, code: 'serveur' });
  }
  return json(200, { ok: true, cle: await poserCle(supabase, ctrl.email) });
});
