// Le « 100 » du titre, dessiné en tracés (et non en texte) : Chromium écrit
// un texte détouré (-webkit-text-stroke) en police « Type 3 » dans le PDF,
// un tracé reste un dessin vectoriel net. Contours tirés de Fredoka Bold
// (livre/commun/fonts/statiques/Fredoka-700.woff2) avec fontTools, approche de
// -0,045 em comme sur la couverture ; 1 000 unités par cadratin, y vers le bas.
const D = 'M259 11Q209 11 189.0 -9.0Q169 -29 169 -80V-601Q169 -651 189.0 -671.0Q209 -691 260 -691Q310 -691 330.0 -670.5Q350 -650 350 -599V-79Q350 -29 330.0 -9.0Q310 11 259 11ZM159 -409Q125 -379 97.5 -380.0Q70 -381 38 -415Q5 -450 7.0 -481.0Q9 -512 49 -547L176 -661Q209 -691 237.5 -688.5Q266 -686 297 -652Q329 -618 326.5 -587.5Q324 -557 284 -521ZM620.0 22Q550.0 22 501.5 -2.5Q453.0 -27 423.0 -67.0Q393.0 -107 376.5 -155.0Q360.0 -203 354.0 -251.5Q348.0 -300 348.0 -340Q348.0 -376 354.0 -423.0Q360.0 -470 375.5 -518.5Q391.0 -567 421.0 -608.5Q451.0 -650 499.5 -675.5Q548.0 -701 618.0 -701Q686.0 -701 733.5 -676.0Q781.0 -651 810.5 -610.5Q840.0 -570 856.5 -521.5Q873.0 -473 879.0 -425.0Q885.0 -377 885.0 -339Q885.0 -299 878.5 -250.5Q872.0 -202 855.5 -154.0Q839.0 -106 809.5 -66.0Q780.0 -26 733.5 -2.0Q687.0 22 620.0 22ZM616.0 -162Q642.0 -162 658.0 -174.5Q674.0 -187 683.0 -207.0Q692.0 -227 696.0 -250.5Q700.0 -274 701.0 -296.5Q702.0 -319 702.0 -335V-340Q702.0 -398 692.5 -437.5Q683.0 -477 664.5 -497.5Q646.0 -518 617.0 -518Q587.0 -518 568.0 -498.0Q549.0 -478 540.0 -438.0Q531.0 -398 531.0 -339Q531.0 -282 540.5 -242.5Q550.0 -203 569.0 -182.5Q588.0 -162 616.0 -162ZM1140.0 22Q1070.0 22 1021.5 -2.5Q973.0 -27 943.0 -67.0Q913.0 -107 896.5 -155.0Q880.0 -203 874.0 -251.5Q868.0 -300 868.0 -340Q868.0 -376 874.0 -423.0Q880.0 -470 895.5 -518.5Q911.0 -567 941.0 -608.5Q971.0 -650 1019.5 -675.5Q1068.0 -701 1138.0 -701Q1206.0 -701 1253.5 -676.0Q1301.0 -651 1330.5 -610.5Q1360.0 -570 1376.5 -521.5Q1393.0 -473 1399.0 -425.0Q1405.0 -377 1405.0 -339Q1405.0 -299 1398.5 -250.5Q1392.0 -202 1375.5 -154.0Q1359.0 -106 1329.5 -66.0Q1300.0 -26 1253.5 -2.0Q1207.0 22 1140.0 22ZM1136.0 -162Q1162.0 -162 1178.0 -174.5Q1194.0 -187 1203.0 -207.0Q1212.0 -227 1216.0 -250.5Q1220.0 -274 1221.0 -296.5Q1222.0 -319 1222.0 -335V-340Q1222.0 -398 1212.5 -437.5Q1203.0 -477 1184.5 -497.5Q1166.0 -518 1137.0 -518Q1107.0 -518 1088.0 -498.0Q1069.0 -478 1060.0 -438.0Q1051.0 -398 1051.0 -339Q1051.0 -282 1060.5 -242.5Q1070.0 -203 1089.0 -182.5Q1108.0 -162 1136.0 -162Z';
const BORNES = { x0: 6.9, y0: -701, x1: 1405, y1: 22 };

// taille : la taille de police équivalente (pt) ; epaisseur : le trait, dont
// la moitié dépasse autour du chiffre ; ombre : décalage de l'ombre pleine (pt).
export function cent({ taille, fond = '#e17398', trait = '#2b1722', epaisseur = 5, ombre = 0, classe = '' }) {
  const k = 1000 / taille;
  const sw = epaisseur * k;
  const om = ombre * k;
  const m = sw / 2 + 2;
  const x0 = BORNES.x0 - m;
  const y0 = BORNES.y0 - m;
  const w = BORNES.x1 - BORNES.x0 + 2 * m + om;
  const h = BORNES.y1 - BORNES.y0 + 2 * m + om;
  const f = (n) => +n.toFixed(2);
  const ombreTrace = ombre ? `<path d="${D}" transform="translate(${f(om)} ${f(om)})" fill="${trait}" stroke="${trait}" stroke-width="${f(sw)}" stroke-linejoin="round"/>` : '';
  return `<svg class="cent ${classe}" viewBox="${f(x0)} ${f(y0)} ${f(w)} ${f(h)}" style="width:${f(w / k)}pt;height:${f(h / k)}pt;display:block;flex:none" aria-hidden="true">${ombreTrace}<path d="${D}" fill="${fond}" stroke="${trait}" stroke-width="${f(sw)}" stroke-linejoin="round" paint-order="stroke"/></svg>`;
}
