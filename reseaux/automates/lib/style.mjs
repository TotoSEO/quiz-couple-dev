// Le style des textes : ce qui sonne « écrit par une machine », relevé par
// Thomas le 9 octobre 2026 sur les deux comptes (« les chutes sont nulles,
// c'est de l'humour à l'IA »). Les tics, mécaniquement repérables :
//  - la phrase de fin qui commente ce qu'on vient de voir (« c'est tout »,
//    « je note », « et ça repart », « c'était parfait »...) : un humain
//    s'arrête sur l'image, la chute est dans le dessin ;
//  - la légende qui répète un texte de l'image au lieu d'ajouter un détail ;
//  - l'appel inventé (« envoie ça à celui qui court vers toi ») à la place
//    des appels courts que tout le monde écrit ;
//  - le « <3 » collé à la fin d'un texte de reel, et plus d'un par post ;
//  - la parenthèse qui explique (« (il gérait pas) ») ;
//  - trois phrases courtes à la suite (« il arrive. elle dort. il reste. »).
// Ce contrôle garde la porte de l'atelier (controler.mjs, avant de pousser) :
// il n'est pas un verrou de production, la synchro ne le passe pas.

export const APPELS = {
  fr: [
    'envoie-lui ça', 'envoie ça sans rien dire', 'envoie ça à ta personne', 'envoie ça à ta personne sans rien dire',
    'tague-le', 'tague-la', 'tague ta personne',
    "c'est qui chez vous ?", "c'est quoi chez vous ?", "c'est laquelle chez vous ?", "c'est lequel chez vous ?", 'tu fais ça aussi ?',
    'tague ton amoureux', 'tague ton amoureuse',
    'garde ça pour un soir où ça va pas', 'garde ça pour la prochaine dispute', 'garde ça pour votre prochaine soirée',
  ],
  en: [
    'send this to them', 'send this to him', 'send this to her', 'send this to your partner', 'send this with no context',
    'tag your partner', 'tag them', 'tag him', 'tag her',
    'comment yours', 'comment your score', 'comment your number', 'comment your answer', 'comment your a or b', 'comment your a and b', 'which one are you?', 'who is it in your couple?',
    'finish it in the comments', 'who got pointed at the most?',
    'save this for later', 'save this for date night', 'save this for your next date night',
    'more quizzes: link in bio', 'more questions: link in bio',
  ],
};

// Les fins interdites : un texte ou une ligne de légende ne se termine pas
// par un commentaire sur la scène.
const FINS = {
  fr: ["c'est tout", 'voilà', "voilà c'est tout", 'je note', "c'est pardonné", 'et ça repart', 'tout le monde est content', "c'était parfait", "comme d'hab", "comme d'habitude", 'évidemment', 'forcément', 'bien sûr', 'spoiler', 'plot twist', 'moralité', "c'est beaucoup", "c'est ça l'amour", "c'est ça nous", "c'est très bien comme ça", 'ça marche à tous les coups', 'aucun regret', 'on recommence demain', 'et demain pareil', 'je dis ça je dis rien'],
  en: ["that's it", "that's all", "that's love", "that's us", 'spoiler', 'plot twist', 'narrator', 'moral of the story', 'the end', 'he knew better', 'she knew better', 'every single time', "and that's okay", "and that's fine", 'nothing else matters', "that's the whole point", 'and honestly', 'no regrets', 'works every time', 'same time tomorrow'],
};
// Les fins interdites seulement quand elles font toute la dernière phrase
// (« même équipe. », « et pourtant. ») : dans une vraie phrase (« on est
// dans la même équipe. ») elles ne gênent pas.
const FINS_SEULES = { fr: ['même équipe', 'et pourtant'], en: ['same team', 'and yet'] };
// « c'est ça, rentrer », « c'est ça, nous » : la morale en fin de texte
const MORALE = { fr: /(^|[.!?]\s*)c'est ça,? [^.!?]{2,30}$/i, en: /(^|[.!?]\s*)(and )?that's (what|how|the) [^.!?]{2,30}$/i };
const APPEL_INVENTE = { fr: /^(envoie(-lui)? ça|tague(-le|-la)?|garde ça)\b.*\b(qui|celle|celui|ceux)\b/i, en: /^(send this|tag)\b.*\b(who|that)\b/i };

const normaliser = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/<3/g, ' ')
    .replace(/[«»"“”‘’'`]/g, "'")
    .replace(/[.,;:!?…()\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const finDe = (s) => normaliser(s).replace(/^.*?(?=(?:\S+\s?){1,5}$)/, '');

const phrases = (s) => String(s ?? '').split(/[.!?…]+/).map((x) => x.trim()).filter(Boolean);

// Un texte affiché ou une ligne de légende : les tics de fin.
export function controlerFin(texte, langue, ou, f) {
  const t = String(texte ?? '').trim();
  if (!t) return;
  const n = normaliser(t);
  const fins = FINS[langue] || FINS.fr;
  // la dernière phrase seule (après le dernier point), pour ne pas condamner
  // « c'est pas grave » au milieu d'une réplique
  const derniere = normaliser(phrases(t).at(-1) || t);
  for (const fin of fins) {
    const nf = normaliser(fin);
    if (derniere === nf || derniere.endsWith(' ' + nf)) return void f.push(`${ou} : la fin commente la scène (« ${fin} ») ; on s'arrête sur l'image`);
  }
  for (const fin of FINS_SEULES[langue] || FINS_SEULES.fr) {
    if (derniere === normaliser(fin)) return void f.push(`${ou} : la fin commente la scène (« ${fin} ») ; on s'arrête sur l'image`);
  }
  const morale = MORALE[langue] || MORALE.fr;
  if (morale.test(t)) f.push(`${ou} : la morale en fin de texte (« c'est ça, ... ») ; on s'arrête sur l'image`);
  const courtes = phrases(t);
  let suite = 0;
  for (const p of courtes) {
    suite = normaliser(p).split(' ').filter(Boolean).length <= 3 ? suite + 1 : 0;
    if (suite >= 3) return void f.push(`${ou} : trois phrases courtes à la suite (« ${t.slice(0, 50)} ») ; on raconte, on ne scande pas`);
  }
  void n;
}

// Tout le style d'un post : ses textes affichés, sa légende, son appel.
//  textes : les textes à l'écran (reel, post, pages) ; legende : la légende
//  entière ; appel : l'appel écrit sur la dernière page d'une histoire ;
//  reel : vrai pour une animation (pas de <3 en fin de texte) ;
//  coeurs : le nombre de « <3 » admis dans le post (1 par défaut).
export function controlerStyle({ textes = [], legende = '', appel, langue = 'fr', reel = false, coeurs = 1 } = {}) {
  const f = [];
  const L = APPELS[langue] ? langue : 'fr';
  textes.filter((t) => typeof t === 'string' && t.trim()).forEach((t, i) => {
    const ou = `texte ${i + 1}`;
    controlerFin(t, L, ou, f);
    if (reel && /<3\s*$/.test(t.trim())) f.push(`${ou} : pas de « <3 » à la fin d'un texte de reel ; l'image fait la chute`);
    if (/^\(.*\)$/.test(t.trim())) f.push(`${ou} : un texte entier entre parenthèses, c'est le narrateur qui explique`);
  });
  const lignes = String(legende || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const appelLegende = lignes.at(-1) || '';
  const corps = lignes.slice(0, -1);
  // l'appel : un de la liste, tel quel
  const estAppel = (s) => (APPELS[L] || []).some((a) => normaliser(a) === normaliser(s));
  if (lignes.length) {
    if ((APPEL_INVENTE[L] || APPEL_INVENTE.fr).test(appelLegende)) f.push(`légende : appel inventé (« ${appelLegende} ») ; on écrit un appel de la liste, court, sans « celui qui »`);
    else if (!estAppel(appelLegende)) f.push(`légende : la dernière ligne doit être un appel de la liste (${(APPELS[L] || []).slice(0, 4).join(' / ')}...), pas « ${appelLegende} »`);
  }
  if (appel !== undefined && appel !== null && !estAppel(appel)) f.push(`appel de la dernière page : pas dans la liste (« ${appel} »)`);
  // la légende : un détail en plus, jamais l'image répétée, jamais une parenthèse
  const normTextes = textes.filter((t) => typeof t === 'string').map(normaliser).filter(Boolean);
  corps.forEach((ligne, i) => {
    const ou = `légende, ligne ${i + 1}`;
    controlerFin(ligne, L, ou, f);
    if (/^\(.*\)$/.test(ligne)) f.push(`${ou} : la légende explique entre parenthèses (« ${ligne} ») ; soit un détail vrai, soit rien`);
    for (const p of phrases(ligne)) {
      const np = normaliser(p);
      if (np.length < 10) continue;
      if (normTextes.some((t) => t === np || t.includes(np) || (np.includes(t) && t.length >= 10))) {
        f.push(`${ou} : la légende répète l'image (« ${p} ») ; elle ajoute un détail vrai ou se tait`);
        break;
      }
    }
  });
  const nbCoeurs = [...textes, legende].join(' ').split('<3').length - 1;
  if (nbCoeurs > coeurs) f.push(`${nbCoeurs} « <3 » dans le post : ${coeurs} au plus`);
  return f;
}

// Les textes affichés d'une recette, pour les deux ateliers : ce que le
// lecteur voit à l'écran (pas les descriptions ni les réglages).
export function textesAffiches(r) {
  const out = [];
  if (!r || typeof r !== 'object') return out;
  for (const k of ['texte', 'titre', 'accroche', 'phrase']) if (typeof r[k] === 'string') out.push(r[k]);
  for (const pl of r.plans ?? []) {
    for (const t of pl.textes ?? []) if (typeof t?.texte === 'string') out.push(t.texte);
    for (const b of pl.bulles ?? []) out.push(typeof b === 'string' ? b : b?.texte);
  }
  for (const pg of r.pages ?? []) {
    if (!pg || typeof pg !== 'object') continue;
    for (const k of ['texte', 'accroche', 'question']) if (typeof pg[k] === 'string') out.push(pg[k]);
  }
  for (const c of r.cases ?? []) for (const b of c?.bulles ?? []) out.push(typeof b === 'string' ? b : b?.texte);
  if (typeof r.schema?.titre === 'string') out.push(r.schema.titre);
  return out.filter((t) => typeof t === 'string' && t.trim());
}

const REELS = new Set(['mipaps-reel', 'pov', 'coquin']);
const SANS_COEUR_LIMITE = new Set(['mipaps-statique', 'statique', 'citation', 'phrase']);

// Le style d'un post complet (fichier d'atelier) : chaque déclinaison.
export function controlerStylePost(post) {
  const f = [];
  for (const [langue, v] of Object.entries(post?.variantes ?? {})) {
    const r = v?.recette ?? {};
    const textes = textesAffiches(r);
    const appel = (r.pages ?? []).map((p) => p?.appel).filter((a) => a !== undefined).at(-1);
    const fautes = controlerStyle({
      textes,
      legende: v?.legende ?? '',
      appel,
      langue: ['fr', 'en'].includes(langue) ? langue : 'en',
      reel: REELS.has(r.gabarit),
      coeurs: SANS_COEUR_LIMITE.has(r.gabarit) || r.style === 'declaration' ? 2 : 1,
    });
    f.push(...fautes.map((x) => `style (${langue}) : ${x}`));
  }
  return f;
}
