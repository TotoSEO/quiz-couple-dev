// Contrôle n° 1 du guide : la recette. Appelé par la routine Claude avant de
// pousser un post, puis par la synchro avant de l'écrire dans Supabase.
// Renvoie la liste des fautes (vide si tout va bien).

import { controlerPov } from './pov.mjs';
import { AMBIANCES, BIBLIOTHEQUE } from './musique.mjs';
import { AMBIANCES_SON } from './son.mjs';

const CRENEAUX = ['matin', 'midi', 'soir'];
const FORMAT_DU_GABARIT = { citation: 'reel', 'quiz-chrono': 'reel', 'connais-tu': 'reel', 'tu-preferes': 'reel', pov: 'reel', image: 'image', carrousel: 'carrousel' };
// Les catégories de la ligne éditoriale (reseaux/atelier/LIGNE-EDITORIALE.md)
// et le gabarit qui les fabrique.
export const CATEGORIES = {
  pov: 'pov',
  coquin: 'pov',
  statique: 'pov',
  'connais-tu': 'connais-tu',
  'tu-preferes': 'tu-preferes',
  phrase: 'citation',
  post: 'image',
  carrousel: 'carrousel',
};
// Les jeux renvoient vers le site ; les animations et les phrases jamais
// (seule la mention quiz-couple.com dans l'image).
const RENVOI_AU_SITE = /quiz-couple\.com|link in bio|lien en bio/i;
const SANS_RENVOI = ['pov', 'coquin', 'statique', 'phrase'];
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
  if (['quiz-chrono', 'connais-tu', 'tu-preferes'].includes(r.gabarit)) return [r.etiquette, r.accroche, r.fin?.question];
  if (r.gabarit === 'pov') return [r.titre, ...(r.plans ?? []).map((p) => p.legende)];
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
  if (r.ambiance !== undefined && !AMBIANCES.includes(r.ambiance)) f.push(`ambiance musicale inconnue : ${r.ambiance} (${AMBIANCES.join(', ')})`);
  // Le son Instagram du reel : une ambiance de la liste, ou une recherche en
  // deux ou trois mots. Le reste (id, titre, artiste) est écrit par la
  // publication, pas par l'atelier.
  if (r.son !== undefined) {
    if (!r.son || typeof r.son !== 'object' || Array.isArray(r.son)) f.push('son : un objet { ambiance } ou { recherche } attendu');
    else {
      if (r.son.ambiance !== undefined && !(r.son.ambiance in AMBIANCES_SON)) f.push(`ambiance de son inconnue : ${r.son.ambiance} (${Object.keys(AMBIANCES_SON).join(', ')})`);
      if (r.son.recherche !== undefined && (typeof r.son.recherche !== 'string' || !r.son.recherche.trim() || r.son.recherche.length > 40)) f.push('son.recherche : deux ou trois mots anglais, 40 signes au plus');
    }
  }
  if (r.musique !== undefined && !BIBLIOTHEQUE.morceaux.some((m) => m.fichier === r.musique)) f.push(`morceau absent de la bibliothèque : ${r.musique}`);
  if (r.gabarit === 'image' && !['citation', 'phrase'].includes(r.style)) f.push(`style d'image inconnu : ${r.style}`);
  if (['quiz-chrono', 'connais-tu', 'tu-preferes'].includes(r.gabarit)) {
    if (!r.etiquette?.trim() || !r.accroche?.trim() || !r.consigne?.trim()) f.push('intro incomplète (etiquette, accroche, consigne)');
    if (!r.fin?.question || !r.fin?.bouton || !r.fin?.signature) f.push('écran de fin incomplet');
    if (r.secondes && (r.secondes < 3 || r.secondes > 10)) f.push('chrono de 3 à 10 secondes');
  }
  if (r.gabarit === 'connais-tu') {
    if (!Array.isArray(r.questions) || r.questions.length < 4 || r.questions.length > 10) f.push('de 4 à 10 questions');
    (r.questions || []).forEach((q, i) => {
      if (typeof q !== 'string' || !q.trim()) f.push(`question ${i + 1} vide`);
      else if (q.length > 70) f.push(`question ${i + 1} : 70 signes au plus`);
    });
  }
  if (r.gabarit === 'tu-preferes') {
    if (!r.amorce?.trim()) f.push("l'amorce (« Would you rather... ») manque");
    if (!Array.isArray(r.dilemmes) || r.dilemmes.length < 3 || r.dilemmes.length > 8) f.push('de 3 à 8 dilemmes');
    (r.dilemmes || []).forEach((d, i) => {
      if (!d?.a?.trim() || !d?.b?.trim()) f.push(`dilemme ${i + 1} : deux choix`);
      else if (d.a.length > 45 || d.b.length > 45) f.push(`dilemme ${i + 1} : 45 signes au plus par choix`);
    });
  }
  if (r.gabarit === 'pov') f.push(...controlerPov(r));
  if (r.gabarit === 'quiz-chrono') {
    if (!Array.isArray(r.questions) || r.questions.length < 4 || r.questions.length > 8) f.push('un quiz chrono a de 4 à 8 questions');
    (r.questions || []).forEach((q, i) => {
      if (!q.question?.trim()) f.push(`question ${i + 1} vide`);
      if (!Array.isArray(q.reponses) || q.reponses.length < 2 || q.reponses.length > 4) f.push(`question ${i + 1} : 2 à 4 réponses`);
      if (!(Number.isInteger(q.bonne) && q.bonne >= 0 && q.bonne < (q.reponses || []).length)) f.push(`question ${i + 1} : bonne réponse invalide`);
    });
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
  if (post.publier_a !== undefined && (typeof post.publier_a !== 'string' || Number.isNaN(Date.parse(post.publier_a)) || !/(Z|[+-]\d{2}:?\d{2})$/.test(post.publier_a))) {
    f.push(`publier_a invalide : ${post.publier_a} (date ISO avec fuseau, ex. 2026-10-07T19:45:00Z)`);
  }
  if (FORMAT_DU_GABARIT[post.gabarit] !== post.format) f.push(`le gabarit ${post.gabarit} ne donne pas un ${post.format}`);
  if (!CATEGORIES[post.categorie]) f.push(`catégorie inconnue : ${post.categorie} (${Object.keys(CATEGORIES).join(', ')})`);
  else if (CATEGORIES[post.categorie] !== post.gabarit) f.push(`la catégorie ${post.categorie} se fait avec le gabarit ${CATEGORIES[post.categorie]}`);
  if (post.categorie === 'statique' && post.variantes) {
    for (const v of Object.values(post.variantes)) if ((v.recette?.plans ?? []).length !== 1) f.push('un reel statique a un seul plan');
  }
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
    if (SANS_RENVOI.includes(post.categorie) && RENVOI_AU_SITE.test(legende)) f.push(`${langue} : pas de renvoi vers le site dans un post « ${post.categorie} » (seulement dans les jeux)`);
  }
  return f;
}

// Ce qui part réellement sur Instagram : la légende, une ligne vide, les hashtags.
export const legendeFinale = (v) => `${(v.legende || '').trim()}\n\n${(v.hashtags || []).join(' ')}`.trim();
