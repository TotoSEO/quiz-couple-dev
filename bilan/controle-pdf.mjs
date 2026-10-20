// Le contrôle du PDF imprimé, après Chrome : chaque morceau de texte est lu
// avec sa position (pdf.js) et doit tenir dans la feuille, dans les marges
// (sauf sur la couverture, qui va jusqu'au bord), sans en chevaucher un autre.
// C'est le second filet après le contrôle de mise en page : il voit ce que
// la pagination a fait.

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const PT_PAR_MM = 72 / 25.4;

// octets : Uint8Array du PDF ; marges en mm. Renvoie { pages, problemes }.
export async function controlerPdf(octets, { marges }) {
  const tache = getDocument({ data: new Uint8Array(octets), disableFontFace: true, useSystemFonts: false, verbosity: 0 });
  const doc = await tache.promise;
  const problemes = [];
  const tol = 1.5;
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const vue = page.getViewport({ scale: 1 });
    const W = vue.width;
    const H = vue.height;
    const contenu = await page.getTextContent();
    const boites = [];
    for (const it of contenu.items) {
      if (!it.str || !it.str.trim()) continue;
      const [a, , , d, x, y] = it.transform;
      const hauteur = Math.abs(d) || it.height || Math.abs(a);
      const b = { texte: it.str, x0: x, x1: x + it.width, y0: y - hauteur * 0.2, y1: y + hauteur * 0.8, base: y, hauteur };
      boites.push(b);
      const gauche = n === 1 ? 0 : marges.gauche * PT_PAR_MM;
      const droite = n === 1 ? W : W - marges.droite * PT_PAR_MM;
      if (b.x0 < gauche - tol || b.x1 > droite + tol || b.y0 < -tol || b.y1 > H + tol) {
        problemes.push({ type: 'hors-marges', page: n, texte: it.str.slice(0, 60), x0: Math.round(b.x0), x1: Math.round(b.x1), largeur: Math.round(W) });
      }
    }
    // Deux morceaux qui se recouvrent, sur des lignes différentes.
    for (let i = 0; i < boites.length; i++) {
      for (let j = i + 1; j < boites.length; j++) {
        const p = boites[i];
        const q = boites[j];
        if (Math.abs(p.base - q.base) < Math.min(p.hauteur, q.hauteur) * 0.5) continue;
        const l = Math.min(p.x1, q.x1) - Math.max(p.x0, q.x0);
        const h = Math.min(p.y1, q.y1) - Math.max(p.y0, q.y0);
        if (l > 1 && h > Math.min(p.hauteur, q.hauteur) * 0.35) {
          problemes.push({ type: 'texte-superpose', page: n, a: p.texte.slice(0, 40), b: q.texte.slice(0, 40) });
        }
      }
    }
    page.cleanup();
  }
  const pages = doc.numPages;
  await tache.destroy();
  return { pages, problemes };
}
