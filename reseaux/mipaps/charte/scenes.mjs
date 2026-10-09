// Les scènes à deux : le Gribouillou et la Gribouillette ensemble, avec au
// plus un objet, sur fond blanc. Chaque scène tient dans 640 x 420, le sol
// à 380. Un élément est un personnage ({ perso, expression, x, y, taille,
// miroir, vers, bras, pose }) ou un objet ({ prop, x, y, echelle }), dessinés
// dans l'ordre.
import { pose, prop, defs, document, COEUR, COULEURS } from './gribouillou.mjs';

const SOL = 380;
const E = COULEURS.encre, B = COULEURS.blanc;
const plein = (d, w = 5) => `<path d="${d}" fill="${B}" stroke="${E}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const trait = (d, w = 3.4) => `<path d="${d}" fill="none" stroke="${E}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
// Les meubles vus de trois quarts, un peu par-dessus : un bord proche plus
// large que le bord lointain, et une face avant. Dessinés dans la scène.
export const MEUBLES = {
  lit_fond: () => plein('M128,146 Q128,112 160,112 H480 Q512,112 512,146 V236 H128 Z') + trait('M160,140 V210 M320,132 V208 M480,140 V210', 3) +
    plein('M136,236 H504 L556,384 H84 Z') +
    plein('M186,232 Q190,214 212,212 L300,214 Q318,216 316,236 L312,262 Q302,274 284,272 L198,268 Q180,266 180,250 Z', 4.2) +
    plein('M332,232 Q336,214 358,212 L446,214 Q464,216 462,236 L458,262 Q448,274 430,272 L344,268 Q326,266 326,250 Z', 4.2),
  lit_couette: () => plein('M112,318 Q150,296 190,312 Q232,328 272,312 Q312,296 352,312 Q392,328 432,312 Q470,296 528,318 L560,386 H80 Z') +
    trait('M126,344 Q320,360 536,344 M110,370 Q320,384 548,370', 2.8) + trait('M86,386 V400 M556,386 V400', 5),
  canape_fond: () => plein('M120,176 Q120,152 144,152 H496 Q520,152 520,176 V270 H120 Z') + trait('M320,160 V262', 3) +
    plein('M62,236 Q62,218 80,218 H128 V300 H62 Z') + plein('M512,236 Q512,218 530,218 H578 V300 H512 Z') +
    plein('M110,268 H530 L562,306 H78 Z') + plein('M78,306 H562 V346 H78 Z') + trait('M320,268 L326,306', 3) + trait('M96,346 V362 M544,346 V362', 5),
};
export const DUOS = {
  calin: { titre: 'le câlin', elements: [
    { perso: 'lui', expression: 'calin', bras: 'tend_d', pose: 'penche_d', x: 262, y: SOL, taille: 270 },
    { perso: 'elle', expression: 'transi', bras: 'tend_g', pose: 'penche_g', x: 380, y: SOL, taille: 262 },
  ] },
  main_dans_la_main: { titre: 'main dans la main', elements: [
    { perso: 'lui', expression: 'content', bras: 'tend_d', x: 210, y: SOL, taille: 260 },
    { perso: 'elle', expression: 'joie', bras: 'tend_g', x: 430, y: SOL, taille: 260 },
    { prop: 'coeur', x: 320, y: 240, echelle: 0.4 },
  ] },
  dos_a_dos: { titre: 'fâchés, dos à dos', elements: [
    { perso: 'lui', expression: 'boude', bras: 'croises', pose: 'penche_g', vers: -1, x: 220, y: SOL, taille: 260 },
    { perso: 'elle', expression: 'boude', bras: 'croises', pose: 'penche_d', vers: 1, x: 420, y: SOL, taille: 260 },
  ] },
  bisou: { titre: 'le bisou sur la joue', elements: [
    { perso: 'elle', expression: 'transi', x: 392, y: SOL, taille: 262 },
    { perso: 'lui', expression: 'bisou', pose: 'penche_d', x: 258, y: SOL, taille: 262 },
  ] },
  sur_lui: { titre: 'elle, perchée', elements: [
    { perso: 'lui', expression: 'fatigue', x: 320, y: SOL, taille: 270 },
    { perso: 'elle', expression: 'joie', pose: 'assis', x: 330, y: 246, taille: 150 },
  ] },
  couette: { titre: 'sous la couette', elements: [
    { meuble: 'lit_fond' },
    { perso: 'lui', expression: 'dodo', pose: 'debout', bras: 'aucun', pattes: 'aucune', x: 248, y: 346, taille: 200 },
    { perso: 'elle', expression: 'amour', pose: 'debout', bras: 'aucun', pattes: 'aucune', x: 394, y: 346, taille: 200 },
    { meuble: 'lit_couette' },
  ] },
  canape: { titre: 'soirée canapé', elements: [
    { meuble: 'canape_fond' },
    { perso: 'lui', expression: 'rire', pose: 'assis', x: 226, y: 318, taille: 210 },
    { perso: 'elle', expression: 'blase', pose: 'assis', x: 414, y: 318, taille: 210 },
    { prop: 'popcorn', x: 320, y: 290, echelle: 0.8 },
  ] },
  frites: { titre: 'les frites', elements: [
    { perso: 'lui', expression: 'gourmand', x: 210, y: SOL, taille: 250 },
    { perso: 'elle', expression: 'miam', x: 430, y: SOL, taille: 250 },
    { prop: 'frites', x: 320, y: 320, echelle: 1.2 },
  ] },
  console: { titre: 'il la console', elements: [
    { perso: 'elle', expression: 'pleure', x: 400, y: SOL, taille: 258 },
    { perso: 'lui', expression: 'inquiet', bras: 'tend_d', pose: 'penche_d', x: 236, y: SOL, taille: 262 },
  ] },
  dispute: { titre: 'la dispute', elements: [
    { perso: 'lui', expression: 'colere', pose: 'penche_d', x: 220, y: SOL, taille: 256 },
    { perso: 'elle', expression: 'furieux', pose: 'penche_g', x: 424, y: SOL, taille: 256 },
  ] },
  pardon: { titre: 'pardon...', elements: [
    { perso: 'elle', expression: 'boude', vers: 1, pose: 'penche_d', x: 420, y: SOL, taille: 256 },
    { perso: 'lui', expression: 'supplie', x: 226, y: SOL, taille: 256 },
    { prop: 'coeur', x: 338, y: 236, echelle: 0.3 },
  ] },
  selfie: { titre: 'le selfie', elements: [
    { perso: 'elle', expression: 'clin', bras: 'bas', x: 392, y: SOL, taille: 250 },
    { prop: 'telephone', x: 364, y: 252, echelle: 0.6 },
    { perso: 'lui', expression: 'joie', bras: 'pointe', x: 262, y: SOL, taille: 250 },
  ] },
  danse: { titre: 'ils dansent', elements: [
    { perso: 'lui', expression: 'chante', pose: 'penche_g', x: 226, y: SOL, taille: 256 },
    { perso: 'elle', expression: 'joie', pose: 'penche_d', x: 420, y: SOL, taille: 256 },
  ] },
  porte: { titre: 'il la porte', elements: [
    { perso: 'lui', expression: 'determine', bras: 'leves', x: 320, y: SOL, taille: 270 },
    { perso: 'elle', expression: 'emerveille', pose: 'assis', x: 322, y: 258, taille: 150 },
  ] },
  cadeau: { titre: 'le cadeau', elements: [
    { perso: 'lui', expression: 'timide', bras: 'tient', x: 222, y: SOL, taille: 256 },
    { prop: 'cadeau', x: 262, y: 322, echelle: 0.8 },
    { perso: 'elle', expression: 'emerveille', x: 430, y: SOL, taille: 256 },
  ] },
  parapluie: { titre: 'sous la pluie', elements: [
    { prop: 'pluie', x: 540, y: 70, echelle: 0.9 },
    { prop: 'pluie', x: 100, y: 90, echelle: 0.7 },
    { perso: 'elle', expression: 'froid', bras: 'croises', pose: 'penche_g', x: 392, y: SOL, taille: 246 },
    { prop: 'parapluie', x: 351, y: 213, echelle: 2.2 },
    { perso: 'lui', expression: 'content', bras: 'tend_haut_d', x: 258, y: SOL, taille: 250 },
  ] },
  arrive_de_loin: { titre: 'il arrive de loin', elements: [
    { perso: 'elle', expression: 'attend', x: 440, y: SOL, taille: 250 },
    { perso: 'lui', expression: 'essouffle', pose: 'sprint', x: 150, y: 330, taille: 120 },
  ] },
  panneau: { titre: 'il plante un panneau', elements: [
    { perso: 'lui', expression: 'fier', pose: 'plante', x: 250, y: SOL, taille: 260 },
    { perso: 'elle', expression: 'perplexe', x: 470, y: SOL, taille: 240 },
  ] },
};

export function scene(nom, { w = 640, h = 420, fond = COULEURS.blanc, prefix = '' } = {}) {
  const sc = DUOS[nom];
  if (!sc) throw new Error(`scène inconnue : ${nom}`);
  let i = 0;
  let d = '';
  let contenu = '';
  for (const el of sc.elements) {
    const id = `${prefix}s${nom.length}${i++}`;
    if (el.meuble) {
      d += defs(id, 41 + i);
      contenu += `<g filter="url(#tr${id})">${MEUBLES[el.meuble]()}</g>`;
    } else if (el.prop) {
      d += defs(id, 31 + i);
      contenu += prop(el.prop, el.x, el.y, el.echelle, id);
    } else {
      d += defs(id, 7 + i * 3);
      contenu += pose({ ...el, id, seed: 7 + i * 3 }, el.x, el.y, el.taille, el.miroir);
    }
  }
  return { svg: contenu, defs: d, titre: sc.titre, w, h, document: () => document(contenu, { w, h, defs: d, fond }) };
}
