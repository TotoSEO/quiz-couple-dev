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
