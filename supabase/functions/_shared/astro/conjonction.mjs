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
