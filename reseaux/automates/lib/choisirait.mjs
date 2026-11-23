// « What would he/she choose? » (23 novembre 2026) : le contrôle d'une
// recette, appelé par controlerRecette (lib/controle.mjs), donc par la
// synchro comme par l'atelier. Trois questions, trois photos chacune ; chaque
// photo est un fichier de la banque du studio (reseaux/studio/public/
// choisirait/<famille>/<id>.webp), vérifié sur le disque : une photo absente
// arrêterait le rendu, mieux vaut refuser le post ici.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'studio', 'public');
const IMAGE = /^choisirait\/[a-z0-9-]+\/[a-z0-9-]+\.webp$/;
const CADRAGE = /^[a-z0-9% ]{1,30}$/;
const EMOJI = /\p{Extended_Pictographic}/u;
// la question parle de lui ou d'elle, comme la recette
const PRONOMS = { lui: /\b(he|him|his)\b/i, elle: /\b(she|her|hers)\b/i };
export const QUESTIONS_PAR_REEL = 3;
export const OPTIONS_PAR_QUESTION = 3;
export const QUESTION_MAX = 42;
export const OPTION_MAX = 22;

export const imagePresente = (image) => IMAGE.test(String(image ?? '')) && fs.existsSync(path.join(PUBLIC, image));

export function controlerChoisirait(r) {
  const f = [];
  if (!['lui', 'elle'].includes(r.pour)) f.push(`pour : « lui » ou « elle » (ici ${r.pour})`);
  const questions = Array.isArray(r.questions) ? r.questions : [];
  if (questions.length !== QUESTIONS_PAR_REEL) f.push(`${QUESTIONS_PAR_REEL} questions par reel (ici ${questions.length})`);
  const images = new Set();
  questions.forEach((q, i) => {
    const ou = `question ${i + 1}`;
    const texte = typeof q?.question === 'string' ? q.question.trim() : '';
    if (!texte) f.push(`${ou} : texte vide`);
    else {
      if (texte.length > QUESTION_MAX) f.push(`${ou} : ${QUESTION_MAX} signes au plus (deux lignes à l'écran), ici ${texte.length}`);
      if (!texte.endsWith('?')) f.push(`${ou} : une question finit par « ? »`);
      if (PRONOMS[r.pour] && !PRONOMS[r.pour].test(texte)) f.push(`${ou} : la question parle ${r.pour === 'lui' ? "de lui (he, him, his)" : "d'elle (she, her)"}, comme la recette`);
      if (EMOJI.test(texte)) f.push(`${ou} : pas d'emoji à l'écran`);
    }
    const options = Array.isArray(q?.options) ? q.options : [];
    if (options.length !== OPTIONS_PAR_QUESTION) f.push(`${ou} : ${OPTIONS_PAR_QUESTION} photos (ici ${options.length})`);
    const libelles = new Set();
    options.forEach((o, k) => {
      const ouO = `${ou}, photo ${'ABC'[k] ?? k + 1}`;
      const t = typeof o?.texte === 'string' ? o.texte.trim() : '';
      if (!t) f.push(`${ouO} : libellé vide`);
      else {
        if (t.length > OPTION_MAX) f.push(`${ouO} : ${OPTION_MAX} signes au plus (une ligne sur la photo), ici ${t.length}`);
        if (EMOJI.test(t)) f.push(`${ouO} : pas d'emoji à l'écran`);
        if (libelles.has(t.toLowerCase())) f.push(`${ouO} : libellé en double`);
        libelles.add(t.toLowerCase());
      }
      if (!IMAGE.test(String(o?.image ?? ''))) f.push(`${ouO} : image attendue sous choisirait/<famille>/<id>.webp`);
      else if (!imagePresente(o.image)) f.push(`${ouO} : photo absente de la banque du studio (${o.image})`);
      else if (images.has(o.image)) f.push(`${ouO} : la même photo deux fois dans le reel`);
      images.add(o?.image);
      if (o?.cadrage !== undefined && !CADRAGE.test(String(o.cadrage))) f.push(`${ouO} : cadrage « ${o.cadrage} » (ex. « center 30% »)`);
    });
  });
  return f;
}
