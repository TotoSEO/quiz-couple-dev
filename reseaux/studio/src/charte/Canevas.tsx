import React, { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill, cancelRender, continueRender, delayRender, Img, staticFile, useCurrentFrame } from 'remotion';
import type { Theme } from '../recette';
import { CSS_JETONS } from './charte';

// Contrôle n° 2 du guide : en mode vérification, chaque texte marqué
// data-verif doit tenir dans la zone utile, ne pas déborder, ne pas finir
// sur un mot seul et ne pas descendre sous 34 px. Une faute arrête le rendu.
const verifier = (racine: HTMLElement): string[] | null => {
  const fautes: string[] = [];
  const cadre = racine.getBoundingClientRect();
  // la mise en page n'est pas encore posée : on mesurera à l'image suivante
  if (cadre.width < 1000 || Math.abs(cadre.top) > 10) return null;
  racine.querySelectorAll<HTMLElement>('[data-verif]').forEach((el) => {
    const nom = el.dataset.verif || el.className;
    const r = el.getBoundingClientRect();
    const zone = el.closest('.qc-utile');
    const utile = zone ? zone.getBoundingClientRect() : null;
    if (utile && (r.left < utile.left - 1 || r.right > utile.right + 1 || r.top < utile.top - 1 || r.bottom > utile.bottom + 1)) {
      fautes.push(`${nom} : sort de la zone utile (${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)} hors ${Math.round(utile.left)},${Math.round(utile.top)},${Math.round(utile.right)},${Math.round(utile.bottom)})`);
    }
    if (el.scrollWidth > el.clientWidth + 1) fautes.push(`${nom} : déborde en largeur`);
    if (el.hasAttribute('data-sans-lignes')) return;
    if (parseFloat(getComputedStyle(el).fontSize) < 34) fautes.push(`${nom} : texte sous 34 px`);
    // lignes : position de chaque mot
    const mots: { haut: number }[] = [];
    const parcours = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = parcours.nextNode(); n; n = parcours.nextNode()) {
      const texte = n.textContent || '';
      const re = /\S+/g;
      for (let m = re.exec(texte); m; m = re.exec(texte)) {
        const plage = document.createRange();
        plage.setStart(n, m.index);
        plage.setEnd(n, m.index + m[0].length);
        const rects = plage.getClientRects();
        if (rects.length) mots.push({ haut: Math.round(rects[0].top) });
      }
    }
    const lignes = [...new Set(mots.map((m) => m.haut))].sort((a, b) => a - b);
    if (lignes.length > 1) {
      const derniere = lignes[lignes.length - 1];
      if (mots.filter((m) => Math.abs(m.haut - derniere) < 4).length === 1) fautes.push(`${nom} : mot seul en dernière ligne`);
    }
    const max = Number(el.dataset.lignesMax || 0);
    if (max && lignes.length > max) fautes.push(`${nom} : ${lignes.length} lignes pour ${max} au plus`);
  });
  // animations : chaque visage reste dans l'image (hors des bandeaux
  // d'Instagram) et n'est jamais caché par un texte
  const textes = [...racine.querySelectorAll<HTMLElement>('[data-verif]')].filter((el) => !el.hasAttribute('data-sans-lignes'));
  racine.querySelectorAll<HTMLElement>('[data-tete]').forEach((el) => {
    if (el.dataset.horsChamp) return;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2 - cadre.left;
    const y = r.top + r.height / 2 - cadre.top;
    if (x < 30 || x > 1050 || y < 220 || y > 1500) fautes.push(`visage de ${el.dataset.tete} hors de l'image (${Math.round(x)}, ${Math.round(y)})`);
    for (const t of textes) {
      const b = t.getBoundingClientRect();
      if (x > b.left - cadre.left && x < b.right - cadre.left && y > b.top - cadre.top && y < b.bottom - cadre.top) {
        fautes.push(`visage de ${el.dataset.tete} sous le texte « ${t.dataset.verif} »`);
      }
    }
  });
  const separes = [...racine.querySelectorAll<HTMLElement>('[data-sans-chevauchement]')].map((el) => ({ nom: el.dataset.verif, r: el.getBoundingClientRect() }));
  for (let i = 0; i < separes.length; i++) {
    for (let j = i + 1; j < separes.length; j++) {
      const a = separes[i].r;
      const b = separes[j].r;
      if (a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2) fautes.push(`« ${separes[i].nom} » et « ${separes[j].nom} » se chevauchent`);
    }
  }
  return fautes;
};

export const Canevas: React.FC<{
  theme: Theme;
  format: 'reel' | 'post';
  verification?: boolean;
  classes?: string;
  children: React.ReactNode;
}> = ({ theme, format, verification, classes: autres = '', children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();
  useLayoutEffect(() => {
    if (!verification) return;
    const attente = delayRender('vérification de la mise en page');
    let essais = 0;
    const mesurer = () => {
      const fautes = ref.current ? verifier(ref.current) : null;
      // setTimeout et pas requestAnimationFrame : un navigateur sans écran ralentit ce dernier
      if (fautes === null && essais++ < 120) return setTimeout(mesurer, 16);
      if (fautes === null) cancelRender(new Error('Contrôle de mise en page : le canevas ne s\'est jamais affiché'));
      else if (fautes.length) cancelRender(new Error('Contrôle de mise en page, image ' + frame + ' : ' + fautes.join(' ; ')));
      else continueRender(attente);
    };
    document.fonts.ready.then(() => setTimeout(mesurer, 0));
  }, [verification, frame]);
  const classes = ['qc-canevas', format === 'post' ? 'is-post' : '', theme === 'marque' ? 'is-marque' : '', autres].join(' ');
  return (
    <AbsoluteFill>
      <style>{CSS_JETONS}</style>
      <div ref={ref} className={classes} data-theme={theme === 'dark' ? 'dark' : 'light'}>
        {/* le trait tremblé d'une scène fixe (posts, carrousels) : un filtre
            partagé, filter: url(#qc-tremble) sur le calque de la scène, jamais
            sur un texte. En vidéo, trop lent plein cadre : seules les
            mascottes tremblent, par leur option tremble */}
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <filter id="qc-tremble" x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed={Math.floor(frame / 4) % 1000} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        {children}
      </div>
    </AbsoluteFill>
  );
};

export const Signature: React.FC<{ texte: string; style?: React.CSSProperties }> = ({ texte, style }) => (
  <div className="qc-signature" style={style} data-verif="signature">
    <Img src={staticFile('marque/logo-quiz-couple-180.png')} alt="" />
    {texte}
  </div>
);
