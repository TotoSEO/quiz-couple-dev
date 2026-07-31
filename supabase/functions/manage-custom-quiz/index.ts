import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ── Limits ───────────────────────────────────────────────────────────
const MAX_QUESTIONS = 30;
const MAX_ANSWERS = 4;
const MIN_ANSWERS = 2;
const MAX_TITLE = 100;
const MAX_DESC = 300;
const MAX_Q_LEN = 160;
const MAX_A_LEN = 100;
const MAX_PTS = 100;
const MAX_EXP = 200;
const RATE_LIMIT_PER_DAY = 15;
const PRIVATE_TTL_DAYS = 7;
const LIST_PAGE_SIZE = 24;
const QUIZ_TYPES = ['points', 'truefalse', 'fun', 'wyr'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ── Profanity filter (fr / en / es / de / it) ────────────────────────
// Normalised, leetspeak-aware substring match. Not exhaustive, but blocks
// the obvious slurs and insults across the five site languages.
const BAD_WORDS = [
  // fr
  'encule', 'encule', 'enculer', 'connard', 'connasse', 'salope', 'pute', 'putain',
  'bite', 'couille', 'salaud', 'batard', 'niquer', 'nique', 'ntm', 'pd', 'tapette',
  'pedale', 'bougnoul', 'negre', 'negresse', 'youpin', 'bamboula', 'chinetoque',
  'fdp', 'ferme ta gueule', 'gros con', 'sale pute', 'trisomique', 'mongol',
  // en
  'fuck', 'fucker', 'motherfucker', 'shit', 'bitch', 'asshole', 'cunt', 'dick',
  'pussy', 'whore', 'slut', 'faggot', 'fag', 'nigger', 'nigga', 'retard', 'rape',
  'chink', 'spic', 'kike', 'coon',
  // es
  'joder', 'puta', 'puto', 'cabron', 'gilipollas', 'polla', 'coño', 'cono',
  'maricon', 'mierda', 'zorra', 'pendejo', 'verga', 'negrata', 'sudaca',
  // de
  'fick', 'ficken', 'arschloch', 'scheisse', 'scheiss', 'hurensohn', 'fotze',
  'schlampe', 'wichser', 'nutte', 'neger', 'schwuchtel', 'missgeburt',
  // it
  'cazzo', 'stronzo', 'stronza', 'puttana', 'troia', 'vaffanculo', 'merda',
  'figa', 'coglione', 'frocio', 'negro', 'ricchione', 'mongoloide',
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[4@]/g, 'a')
    .replace(/[3€]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/0/g, 'o')
    .replace(/[5$]/g, 's')
    .replace(/7/g, 't')
    .replace(/[^a-z ]+/g, ' ') // keep letters + spaces
    .replace(/\s+/g, ' ')
    .trim();
}

function containsProfanity(text: string): boolean {
  if (!text) return false;
  const norm = normalize(text);
  const collapsed = norm.replace(/ /g, ''); // catch spaced-out insults
  for (const w of BAD_WORDS) {
    const nw = normalize(w);
    if (!nw) continue;
    if (nw.includes(' ')) {
      if (norm.includes(nw)) return true;
    } else {
      if (norm.split(' ').includes(nw)) return true; // whole word
      if (nw.length >= 5 && collapsed.includes(nw)) return true; // catch l e t t e r s
    }
  }
  return false;
}

function sanitizeText(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v
    .replace(/<[^>]*>/g, '') // strip any HTML tags
    .replace(/[\u0000-\u001F\u007F]/g, '') // control chars
    .trim()
    .slice(0, max);
}

function randomShareId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint8Array(22);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

// Validate + normalize the questions payload for a given quiz type.
// Returns { questions } or { error }.
function validateQuestions(quizType: string, raw: unknown): { questions?: unknown[]; error?: string } {
  if (!Array.isArray(raw) || raw.length === 0) return { error: 'no_questions' };
  if (raw.length > MAX_QUESTIONS) return { error: 'too_many_questions' };

  const out: unknown[] = [];
  const profanityTargets: string[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') return { error: 'invalid_question' };
    const q = sanitizeText((item as any).q, MAX_Q_LEN);
    if (!q) return { error: 'empty_question' };
    profanityTargets.push(q);

    if (quizType === 'truefalse') {
      const c = (item as any).c;
      if (typeof c !== 'boolean') return { error: 'invalid_truefalse' };
      const exp = sanitizeText((item as any).exp, MAX_EXP);
      if (exp) profanityTargets.push(exp);
      out.push(exp ? { q, c, exp } : { q, c });
      continue;
    }

    // points / fun / wyr: array of answers
    const rawAnswers = (item as any).a;
    if (!Array.isArray(rawAnswers)) return { error: 'invalid_answers' };
    if (quizType === 'wyr') {
      if (rawAnswers.length !== 2) return { error: 'bad_answer_count' };
    } else if (rawAnswers.length < MIN_ANSWERS || rawAnswers.length > MAX_ANSWERS) {
      return { error: 'bad_answer_count' };
    }
    const answers: unknown[] = [];
    let correctCount = 0;
    for (const a of rawAnswers) {
      if (!a || typeof a !== 'object') return { error: 'invalid_answer' };
      const t = sanitizeText((a as any).t, MAX_A_LEN);
      if (!t) return { error: 'empty_answer' };
      profanityTargets.push(t);
      if (quizType === 'points') {
        const c = !!(a as any).c;
        if (c) correctCount++;
        answers.push({ t, c });
      } else {
        answers.push({ t });
      }
    }
    if (quizType === 'points') {
      if (correctCount < 1) return { error: 'no_correct_answer' };
      let pts = Number((item as any).pts);
      if (!Number.isFinite(pts) || pts < 1) pts = 1;
      if (pts > MAX_PTS) pts = MAX_PTS;
      out.push({ q, a: answers, pts: Math.round(pts) });
    } else {
      out.push({ q, a: answers });
    }
  }

  for (const txt of profanityTargets) {
    if (containsProfanity(txt)) return { error: 'profanity' };
  }

  return { questions: out };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';

    // ── CREATE ───────────────────────────────────────────────────────
    if (action === 'create') {
      const quizType = String(body.quizType || '');
      if (!QUIZ_TYPES.includes(quizType)) return json({ error: 'invalid_type' }, 400);

      const lang = ['fr', 'en', 'es', 'de', 'it'].includes(body.lang) ? body.lang : 'fr';
      const title = sanitizeText(body.title, MAX_TITLE);
      const description = sanitizeText(body.description, MAX_DESC);
      if (!title) return json({ error: 'empty_title' }, 400);
      if (containsProfanity(title) || containsProfanity(description)) {
        return json({ error: 'profanity' }, 400);
      }

      const { questions, error } = validateQuestions(quizType, body.questions);
      if (error) return json({ error }, 400);

      // Rate limit per IP (last 24h)
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const { count } = await supabase
        .from('custom_quizzes')
        .select('id', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', since);
      if ((count ?? 0) >= RATE_LIMIT_PER_DAY) return json({ error: 'rate_limited' }, 429);

      const isPublic = body.isPublic === true;
      const expiresAt = isPublic
        ? null
        : new Date(Date.now() + PRIVATE_TTL_DAYS * 24 * 3600 * 1000).toISOString();

      // Insert with a unique share_id (retry on the rare collision)
      let shareId = '';
      let inserted = null;
      for (let attempt = 0; attempt < 4; attempt++) {
        shareId = randomShareId();
        const { data, error: insErr } = await supabase
          .from('custom_quizzes')
          .insert({
            share_id: shareId,
            title,
            description,
            quiz_type: quizType,
            lang,
            questions,
            question_count: (questions as unknown[]).length,
            is_public: isPublic,
            ip_address: ip,
            expires_at: expiresAt,
          })
          .select('share_id, is_public')
          .single();
        if (!insErr && data) { inserted = data; break; }
        if (insErr && !String(insErr.message || '').includes('duplicate')) {
          return json({ error: 'db_error' }, 500);
        }
      }
      if (!inserted) return json({ error: 'db_error' }, 500);

      return json({ ok: true, share_id: shareId, is_public: isPublic });
    }

    // ── GET (by share_id, for taking/managing) ───────────────────────
    if (action === 'get') {
      const shareId = String(body.shareId || '');
      if (!shareId) return json({ error: 'invalid_share_id' }, 400);
      const { data, error } = await supabase
        .from('custom_quizzes')
        .select('share_id, title, description, quiz_type, lang, questions, question_count, is_public, plays, created_at')
        .eq('share_id', shareId)
        .maybeSingle();
      if (error) return json({ error: 'db_error' }, 500);
      if (!data) return json({ error: 'not_found' }, 404);
      return json({ ok: true, quiz: data });
    }

    // ── LIST PUBLIC ──────────────────────────────────────────────────
    if (action === 'list_public') {
      const page = Math.max(0, parseInt(String(body.page ?? '0'), 10) || 0);
      const from = page * LIST_PAGE_SIZE;
      const to = from + LIST_PAGE_SIZE - 1;
      let query = supabase
        .from('custom_quizzes')
        .select('share_id, title, description, quiz_type, lang, question_count, plays, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (['fr', 'en', 'es', 'de', 'it'].includes(body.lang)) query = query.eq('lang', body.lang);
      const { data, error } = await query;
      if (error) return json({ error: 'db_error' }, 500);
      return json({ ok: true, quizzes: data ?? [], page });
    }

    // ── PLAY (increment counter) ─────────────────────────────────────
    if (action === 'play') {
      const shareId = String(body.shareId || '');
      if (!shareId) return json({ error: 'invalid_share_id' }, 400);
      await supabase.rpc('increment_quiz_plays', { p_share_id: shareId }).then(
        () => {},
        () => {},
      );
      return json({ ok: true });
    }

    return json({ error: 'unknown_action' }, 400);
  } catch (e) {
    return json({ error: 'server_error', detail: String((e as Error).message || e) }, 500);
  }
});
