// Le contrôle de mise en page d'un rapport, dans Chrome, avant l'impression.
// La page est mesurée en média « print » à la largeur utile d'une page A4
// (210 mm moins les marges) : les largeurs y sont celles du PDF. On cherche :
//   - un texte qui sort de sa boîte (à gauche, à droite, en haut, en bas) ;
//   - un élément qui sort de son parent ;
//   - deux éléments voisins d'une grille ou d'une ligne qui se chevauchent ;
//   - un bloc insécable plus haut qu'une page ;
//   - une accolade, « undefined », « NaN » ou un titre vide dans le texte ;
//   - une police qui n'a pas chargé.
// Le rapport n'est envoyé que si la liste revient vide.

export const LARGEUR_UTILE_MM = 178;
export const HAUTEUR_UTILE_MM = 263;
const PX_PAR_MM = 96 / 25.4;

// Exécutée dans la page (page.evaluate) : rien d'extérieur à la fonction.
export function verifierDansLaPage(hauteurPagePx) {
  const pbs = [];
  const tol = 0.75;
  const racine = document.querySelector('.rap');
  if (!racine) return [{ type: 'racine', detail: 'pas de .rap' }];

  const decrire = (el) => {
    const cl = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : el.tagName.toLowerCase();
    const texte = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    return cl + (texte ? ' « ' + texte + ' »' : '');
  };
  const contenu = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const n = (v) => parseFloat(v) || 0;
    return {
      left: r.left + n(cs.borderLeftWidth) + n(cs.paddingLeft),
      right: r.right - n(cs.borderRightWidth) - n(cs.paddingRight),
      top: r.top + n(cs.borderTopWidth) + n(cs.paddingTop),
      bottom: r.bottom - n(cs.borderBottomWidth) - n(cs.paddingBottom),
    };
  };
  const dansSvg = (el) => !!el.closest('svg');
  const estLigne = (el) => getComputedStyle(el).display.startsWith('inline') && getComputedStyle(el).display !== 'inline-block' && getComputedStyle(el).display !== 'inline-flex' && getComputedStyle(el).display !== 'inline-grid';

  // 1. Les textes restent dans leur boîte.
  const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
  while (marcheur.nextNode()) {
    const n = marcheur.currentNode;
    if (!n.textContent.trim()) continue;
    let boite = n.parentElement;
    if (!boite || dansSvg(boite)) continue;
    while (boite && boite !== racine && estLigne(boite)) boite = boite.parentElement;
    const c = contenu(boite);
    // En hauteur, le dessin des lettres dépasse la ligne quand l'interligne
    // est serré (titres en interligne 1) : on tolère un tiers de corps.
    const vtol = 0.35 * (parseFloat(getComputedStyle(n.parentElement).fontSize) || 16);
    const plage = document.createRange();
    plage.selectNodeContents(n);
    for (const r of plage.getClientRects()) {
      if (r.width < 0.5) continue;
      if (r.left < c.left - tol || r.right > c.right + tol || r.top < c.top - vtol || r.bottom > c.bottom + vtol) {
        pbs.push({ type: 'texte-deborde', ou: decrire(boite), texte: n.textContent.trim().slice(0, 60),
          ecart: Math.round(Math.max(c.left - r.left, r.right - c.right, c.top - r.top, r.bottom - c.bottom) * 10) / 10 });
        break;
      }
    }
  }

  // 2. Les éléments restent dans leur parent, sur la largeur.
  for (const el of racine.querySelectorAll('*')) {
    if (dansSvg(el) && el.tagName.toLowerCase() !== 'svg') continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.position === 'absolute' || cs.position === 'fixed') continue;
    if (el.classList.contains('rap-couv')) continue; // la couverture va jusqu'aux bords de la feuille
    const parent = el.parentElement;
    if (!parent || estLigne(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const p = contenu(parent);
    if (r.left < p.left - tol || r.right > p.right + tol) {
      pbs.push({ type: 'boite-deborde', ou: decrire(el), parent: decrire(parent),
        ecart: Math.round(Math.max(p.left - r.left, r.right - p.right) * 10) / 10 });
    }
  }

  // 3. Les voisins d'une grille ou d'une ligne flexible ne se chevauchent pas.
  for (const el of racine.querySelectorAll('*')) {
    if (dansSvg(el)) continue;
    const d = getComputedStyle(el).display;
    if (!/(grid|flex)$/.test(d)) continue;
    const enfants = [...el.children].filter((x) => {
      const cs = getComputedStyle(x);
      return cs.display !== 'none' && cs.position !== 'absolute';
    }).map((x) => ({ x, r: x.getBoundingClientRect() })).filter((o) => o.r.width > 0 && o.r.height > 0);
    for (let i = 0; i < enfants.length; i++) {
      for (let j = i + 1; j < enfants.length; j++) {
        const a = enfants[i].r;
        const b = enfants[j].r;
        const l = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (l > 1 && h > 1) {
          pbs.push({ type: 'chevauchement', ou: decrire(enfants[i].x), avec: decrire(enfants[j].x), surface: Math.round(l * h) });
        }
      }
    }
  }

  // 4. Un bloc insécable ne dépasse pas une page.
  if (hauteurPagePx) {
    for (const el of racine.querySelectorAll('*')) {
      if (el.classList.contains('rap-couv') || dansSvg(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.breakInside !== 'avoid' && cs.pageBreakInside !== 'avoid') continue;
      const h = el.getBoundingClientRect().height;
      if (h > hauteurPagePx) pbs.push({ type: 'bloc-trop-haut', ou: decrire(el), hauteur: Math.round(h) });
    }
  }

  // 5. Rien qui trahisse un texte manquant.
  const texte = racine.textContent;
  for (const [motif, nom] of [[/\{|\}/, 'accolade'], [/\bundefined\b/, 'undefined'], [/\bNaN\b/, 'NaN'], [/\[object /, 'objet'], [/\bnull\b/, 'null']]) {
    const m = texte.match(motif);
    if (m) pbs.push({ type: 'texte-suspect', motif: nom, autour: texte.slice(Math.max(0, m.index - 40), m.index + 40) });
  }
  for (const el of racine.querySelectorAll('h1, h2, h3, h4, [class*="-titre"], [class*="-lib"], .rap-tag, .rap-rep-texte, .rap-nom')) {
    if (dansSvg(el)) continue;
    if (!el.textContent.replace(/[\s­]/g, '')) pbs.push({ type: 'texte-vide', ou: decrire(el) + ' (' + (el.parentElement ? decrire(el.parentElement) : '') + ')' });
  }

  // 6. Les polices.
  for (const f of document.fonts) {
    if (f.status === 'error') pbs.push({ type: 'police', detail: f.family + ' ' + f.style + ' ' + f.weight });
  }
  if (!document.fonts.check('500 16px "QC Fraunces"') || !document.fonts.check('400 16px "QC Inter"')) {
    pbs.push({ type: 'police', detail: 'Fraunces ou Inter non chargée' });
  }
  return pbs;
}

// Prépare la page (média print, largeur utile) puis lance le contrôle.
export async function verifierMiseEnPage(page) {
  await page.emulateMedia({ media: 'print' });
  await page.setViewportSize({ width: Math.round(LARGEUR_UTILE_MM * PX_PAR_MM), height: 1200 });
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(verifierDansLaPage, Math.round(HAUTEUR_UTILE_MM * PX_PAR_MM));
}
