// Les quelques mots que le studio écrit lui-même, dans la langue du compte.
// Tout le reste (questions, phrases, appels) vient de la recette.
export type Langue = 'en' | 'fr' | 'es' | 'de' | 'it';

export const LIBELLES: Record<Langue, { question: string; reponse: string; glisse: string; site: string; joie: string }> = {
  en: { question: 'Question {n} of {total}', reponse: 'Answer', glisse: 'Swipe →', site: 'quiz-couple.com', joie: 'Yay!' },
  fr: { question: 'Question {n} sur {total}', reponse: 'Réponse', glisse: 'Fais glisser →', site: 'quiz-couple.com', joie: 'Youpi\u202f!' },
  es: { question: 'Pregunta {n} de {total}', reponse: 'Respuesta', glisse: 'Desliza →', site: 'quiz-couple.com', joie: '¡Bien!' },
  de: { question: 'Frage {n} von {total}', reponse: 'Antwort', glisse: 'Wischen →', site: 'quiz-couple.com', joie: 'Juhu!' },
  it: { question: 'Domanda {n} di {total}', reponse: 'Risposta', glisse: 'Scorri →', site: 'quiz-couple.com', joie: 'Evviva!' },
};

export const remplir = (modele: string, valeurs: Record<string, string | number>) =>
  modele.replace(/\{(\w+)\}/g, (_, k) => String(valeurs[k] ?? ''));

// Typographie de chaque langue, appliquée à tout texte d'une recette :
// apostrophe courbe partout, guillemets et espaces propres à la langue.
const FINE = ' '; // espace fine insécable
const INSECABLE = ' ';

export const typographie = (texte: string, langue: Langue): string => {
  let t = texte.replace(/(\p{L})'(\p{L})/gu, '$1’$2').replace(/\s+/g, ' ').trim();
  if (langue === 'en') t = t.replace(/"([^"]*)"/g, '“$1”');
  if (langue === 'de') t = t.replace(/"([^"]*)"/g, '„$1“');
  if (langue === 'fr' || langue === 'it' || langue === 'es') {
    const [o, f] = langue === 'fr' ? [`«${INSECABLE}`, `${INSECABLE}»`] : ['«', '»'];
    t = t.replace(/"([^"]*)"/g, `${o}$1${f}`);
  }
  if (langue === 'fr') {
    t = t
      .replace(/\s*([?!;])/g, `${FINE}$1`)
      .replace(/(\S)\s*:(\s|$)/g, `$1${INSECABLE}:$2`)
      .replace(/«\s*/g, `«${INSECABLE}`)
      .replace(/\s*»/g, `${INSECABLE}»`);
  }
  return t;
};

// Applique la typographie à toutes les chaînes d'un objet (une recette).
export const typographier = <T,>(valeur: T, langue: Langue): T => {
  if (typeof valeur === 'string') return typographie(valeur, langue) as T;
  if (Array.isArray(valeur)) return valeur.map((v) => typographier(v, langue)) as T;
  if (valeur && typeof valeur === 'object') {
    return Object.fromEntries(Object.entries(valeur).map(([k, v]) => [k, k === 'langue' || k === 'gabarit' || k === 'theme' || k === 'type' || k === 'fleurs' || k === 'style' ? v : typographier(v, langue)])) as T;
  }
  return valeur;
};
