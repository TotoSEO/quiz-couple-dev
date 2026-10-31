// Les césures du PDF, calculées d'avance : Chrome sans écran n'a pas de
// dictionnaire et ne coupe jamais un mot de lui-même (essayé le 18 octobre
// 2026 : « Kommunikationsschwierigkeiten » sortait de sa boîte). On insère
// des tirets conditionnels (U+00AD) avec les motifs de Liang (paquet
// hyphen) ; la feuille du rapport est en hyphens: manual.

import motifsFr from 'hyphen/fr/index.js';
import motifsEn from 'hyphen/en-us/index.js';
import motifsEs from 'hyphen/es/index.js';
import motifsDe from 'hyphen/de/index.js';
import motifsIt from 'hyphen/it/index.js';
import motifsNl from 'hyphen/nl/index.js';

// Le paquet est en CommonJS : chaque langue exporte un objet.
const PAR_LANGUE = {
  fr: motifsFr.hyphenateSync,
  en: motifsEn.hyphenateSync,
  es: motifsEs.hyphenateSync,
  de: motifsDe.hyphenateSync,
  it: motifsIt.hyphenateSync,
  nl: motifsNl.hyphenateSync,
};

// Un mot de moins de huit lettres ne se coupe pas : le gain est nul et le
// texte se lit moins bien.
const OPTIONS = { minWordLength: 8 };

export function couperPour(lang) {
  const f = PAR_LANGUE[lang] || PAR_LANGUE.fr;
  return (texte) => {
    const s = String(texte == null ? '' : texte);
    if (!s) return s;
    return f(s, OPTIONS);
  };
}
