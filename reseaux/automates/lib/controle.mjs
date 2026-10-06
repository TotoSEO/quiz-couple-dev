// Contrôle n° 1 du guide : la recette. Appelé par la routine Claude avant de
// pousser un post, puis par la synchro avant de l'écrire dans Supabase.
// Renvoie la liste des fautes (vide si tout va bien).

const CRENEAUX = ['matin', 'midi', 'soir'];
const FORMAT_DU_GABARIT = { citation: 'reel', 'quiz-chrono': 'reel', image: 'image', carrousel: 'carrousel' };
const THEMES = ['light', 'dark', 'marque'];
const LANGUES = ['en', 'fr', 'es', 'de', 'it'];

// Mots interdits dans les titres (CLAUDE.md, « Les mots interdits dans les titres »).
const INTERDITS_TITRES = {
  en: [/\breally\b/i, /\bactually\b/i, /\bin short\b/i],
  fr: [/\bvraiment\b/i, /\bconcrètement\b/i, /\ben bref\b/i, /\bau fait\b/i],
  es: [/\brealmente\b/i, /\bde verdad\b/i, /\bconcretamente\b/i, /\ben resumen\b/i],
  de: [/\bwirklich\b/i, /\bkonkret gesagt\b/i, /\bkurz gesagt\b/i],
  it: [/\bdavvero\b/i, /\bveramente\b/i, /\bconcretamente\b/i, /\bin breve\b/i],
};

const chaines = (v, out = []) => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => chaines(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => chaines(x, out));
  return out;
};

const titres = (r) => {
  if (r.gabarit === 'quiz-chrono') return [r.etiquette, r.accroche, r.fin?.question];
  if (r.gabarit === 'carrousel') return r.pages.flatMap((p) => [p.etiquette, p.accroche, p.question]);
  return [];
};

export function controlerRecette(r, langue) {
  const f = [];
  if (!r || typeof r !== 'object') return ['recette absente'];
  if (!FORMAT_DU_GABARIT[r.gabarit]) f.push(`gabarit inconnu : ${r.gabarit}`);
  if (r.langue !== langue) f.push(`langue de la recette (${r.langue}) différente de la déclinaison (${langue})`);
  if (!THEMES.includes(r.theme)) f.push(`thème inconnu : ${r.theme}`);
  for (const t of chaines(r)) {
    if (t.includes('\u2014')) f.push(`tiret cadratin interdit : « ${t.slice(0, 40)} »`);
  }
  for (const t of titres(r).filter(Boolean)) {
    for (const re of INTERDITS_TITRES[langue] || []) if (re.test(t)) f.push(`mot interdit dans un titre : « ${t} »`);
  }
  if (r.gabarit === 'citation' || r.gabarit === 'image') {
    if (!r.texte?.trim()) f.push('texte vide');
    if (r.texte && r.texte.length > 220) f.push('texte trop long (220 signes au plus)');
  }
  if (r.gabarit === 'image' && !['citation', 'phrase'].includes(r.style)) f.push(`style d'image inconnu : ${r.style}`);
  if (r.gabarit === 'quiz-chrono') {
    if (!Array.isArray(r.questions) || r.questions.length < 4 || r.questions.length > 8) f.push('un quiz chrono a de 4 à 8 questions');
    (r.questions || []).forEach((q, i) => {
      if (!q.question?.trim()) f.push(`question ${i + 1} vide`);
      if (!Array.isArray(q.reponses) || q.reponses.length < 2 || q.reponses.length > 4) f.push(`question ${i + 1} : 2 à 4 réponses`);
      if (!(Number.isInteger(q.bonne) && q.bonne >= 0 && q.bonne < (q.reponses || []).length)) f.push(`question ${i + 1} : bonne réponse invalide`);
    });
    if (!r.fin?.question || !r.fin?.bouton || !r.fin?.signature) f.push('écran de fin incomplet');
    if (r.secondes && (r.secondes < 3 || r.secondes > 10)) f.push('chrono de 3 à 10 secondes');
  }
  if (r.gabarit === 'carrousel') {
    const p = r.pages || [];
    if (p.length < 3 || p.length > 10) f.push('un carrousel a de 3 à 10 pages');
    if (p[0]?.type !== 'couverture') f.push('la première page est la couverture');
    if (p[p.length - 1]?.type !== 'fin') f.push('la dernière page est la page finale');
  }
  return f;
}

export function controlerPost(post) {
  const f = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.jour || '')) f.push(`jour invalide : ${post.jour}`);
  if (!CRENEAUX.includes(post.creneau)) f.push(`créneau invalide : ${post.creneau}`);
  if (FORMAT_DU_GABARIT[post.gabarit] !== post.format) f.push(`le gabarit ${post.gabarit} ne donne pas un ${post.format}`);
  const variantes = Object.entries(post.variantes || {});
  if (!variantes.length) f.push('aucune déclinaison');
  for (const [langue, v] of variantes) {
    if (!LANGUES.includes(langue)) f.push(`langue inconnue : ${langue}`);
    if (v.recette?.gabarit !== post.gabarit) f.push(`${langue} : gabarit de la recette différent du post`);
    f.push(...controlerRecette(v.recette, langue).map((x) => `${langue} : ${x}`));
    const legende = v.legende || '';
    const hashtags = v.hashtags || [];
    if (!legende.trim()) f.push(`${langue} : légende vide`);
    if (legende.includes('\u2014')) f.push(`${langue} : tiret cadratin dans la légende`);
    if (/#\w/.test(legende)) f.push(`${langue} : les hashtags vont dans « hashtags », pas dans la légende`);
    if (hashtags.length < 1 || hashtags.length > 5) f.push(`${langue} : 1 à 5 hashtags`);
    for (const h of hashtags) if (!/^#[\p{L}\p{N}_]+$/u.test(h)) f.push(`${langue} : hashtag invalide « ${h} »`);
    if (legendeFinale(v).length > 2200) f.push(`${langue} : légende de plus de 2 200 signes`);
  }
  return f;
}

// Ce qui part réellement sur Instagram : la légende, une ligne vide, les hashtags.
export const legendeFinale = (v) => `${(v.legende || '').trim()}\n\n${(v.hashtags || []).join(' ')}`.trim();
