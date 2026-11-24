// La conjonction devant un mot qui suit, dans les langues où elle change :
// en espagnol, « y » devient « e » devant un son « i » (« Lucía e Inés »,
// mais « y Hielo », « y Yolanda ») ; en italien, « e » devient « ed » devant
// un « e » (« Luca ed Elena »). Ailleurs, le mot tel quel. Module léger,
// partagé par rapport.mjs et courriel.mjs (que charge le webhook de Stripe).
export function conjonction(lang, mot, suivant) {
  const nu = String(suivant || '').normalize('NFD').replace(/\p{M}/gu, '');
  if (lang === 'es' && (mot === 'y' || mot === 'Y')) return /^h?i(?!e)/i.test(nu) ? (mot === 'Y' ? 'E' : 'e') : mot;
  if (lang === 'it' && (mot === 'e' || mot === 'E')) return /^e/i.test(nu) ? mot + 'd' : mot;
  return mot;
}

// En italien, l'article et les prépositions articulées s'élident devant les
// dates du 8 et du 11 (« l'8 marzo », « dall'11 aprile », « all'8 maggio »).
// Le texte écrit « il {{date}} », « dal {{du}} al {{au}} » : la règle passe
// après le remplacement. Recopiée dans js/astro-rapport.js.
const ELISIONS_IT = { il: "l'", Il: "L'", dal: "dall'", Dal: "Dall'", al: "all'", Al: "All'", del: "dell'", Del: "Dell'", nel: "nell'", Nel: "Nell'" };
export function eliderDates(lang, texte) {
  if (lang !== 'it') return texte;
  return String(texte).replace(/(^|[^\p{L}])(il|Il|dal|Dal|al|Al|del|Del|nel|Nel) (8|11)(?!\d)/gu, (t, avant, mot, n) => avant + ELISIONS_IT[mot] + n);
}
