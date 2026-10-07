// Le rendu d'un plan d'animation à un instant donné : le décor, les
// personnages et ce qu'ils tiennent, les objets, les effets, la caméra.
// Les textes (titre, légende, messages, bulles) sont dans Textes.tsx.
import React from 'react';
import { mainsMascotte, mascotte } from '../charte/Mascotte';
import { dessinDecor } from './decors';
import { dessinObjet, svgObjet, coeurChemin } from './objets';
import type { ObjetPov, PlanPov } from './scenario';
import vocabulaire from './vocabulaire.json';
import { aLEcran, bordCouette, camera, etatPerso, forceCouette, GABARITS, hautDeTete, placer, TAILLE, type Camera, type EffetActif, type EtatPerso } from './temps';

const PI2 = Math.PI * 2;
const bornes = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ressort = (p: number) => {
  const q = bornes(p);
  const c = 2.2;
  return 1 + (c + 1) * (q - 1) ** 3 + c * (q - 1) ** 2;
};
// Pseudo-hasard stable : la même image donne toujours le même dessin.
const hasard = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const pleinCadre: React.CSSProperties = { position: 'absolute', left: 0, top: 0, width: 1080, height: 1920 };
const Svg: React.FC<{ contenu: string }> = ({ contenu }) =>
  contenu ? <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={pleinCadre} dangerouslySetInnerHTML={{ __html: contenu }} /> : null;

// ── Personnage ─────────────────────────────────────────────────────────

const Tenu: React.FC<{ e: EtatPerso; t: number; quoi: EtatPerso['tenus'][number] }> = ({ e, t, quoi }) => {
  const k = e.taille;
  const mains = mainsMascotte(e.qui, e.options);
  const [mx, my] = mains[quoi.main];
  const d = dessinObjet(quoi.objet, t);
  const largeur = (vocabulaire.objets[quoi.objet].largeur * quoi.echelle * k) / TAILLE;
  const r = largeur / d.vb[0];
  return (
    <div
      style={{
        position: 'absolute',
        left: mx * k + (quoi.dx ?? 0) - d.prise[0] * r,
        top: my * k + (quoi.dy ?? 0) - d.prise[1] * r,
        width: largeur,
        transformOrigin: `${d.prise[0] * r}px ${d.prise[1] * r}px`,
        transform: `rotate(${quoi.rot}deg)`,
      }}
      dangerouslySetInnerHTML={{ __html: svgObjet(quoi.objet, t, largeur) }}
    />
  );
};

// tremble : la graine du trait tremblé (absente sur une scène fixe, qui passe par le filtre du calque)
export const PersoDessin: React.FC<{ e: EtatPerso; t: number; tremble?: number }> = ({ e, t, tremble }) => {
  if (e.opacite <= 0) return null;
  const g = GABARITS[e.qui];
  const k = e.taille;
  const flip = e.options.vue === 'profil' ? e.sens : 1;
  const derriere = e.tenus.filter((x) => !x.devant);
  const devant = e.tenus.filter((x) => x.devant);
  let bonnet: React.ReactNode = null;
  if (e.porte) {
    const d = dessinObjet(e.porte, t);
    const largeur = (g.bas - g.haut) * 0.95 * k;
    const h = (largeur * d.vb[1]) / d.vb[0];
    bonnet = (
      <div
        style={{ position: 'absolute', left: g.centre * k - largeur / 2, top: (g.haut + 22) * k - h - (e.options.saut ?? 0) * k, width: largeur, transform: `rotate(${(e.options.penche ?? 0) - 6}deg)` }}
        dangerouslySetInnerHTML={{ __html: svgObjet(e.porte, t, largeur) }}
      />
    );
  }
  return (
    <div
      className="pov-perso"
      style={{
        position: 'absolute',
        left: e.x - g.centre * k,
        top: e.sol - g.sol * k,
        width: g.l * k,
        height: g.h * k,
        opacity: e.opacite,
        transformOrigin: `${g.centre * k}px ${g.sol * k}px`,
        transform: `translate(${e.dx}px, ${e.dy}px) rotate(${e.rot}deg) scale(${e.sx * e.echelle * flip}, ${e.sy * e.echelle})`,
      }}
    >
      {derriere.map((x, i) => (
        <Tenu key={'d' + i} e={e} t={t} quoi={x} />
      ))}
      {/* un bonnet sur la tête : la rose range son nœud */}
      <div style={{ position: 'absolute', inset: 0 }} dangerouslySetInnerHTML={{ __html: mascotte(e.qui, { ...e.options, noeud: !e.porte, tremble }).replace('<svg ', '<svg style="width:100%;height:100%;display:block;overflow:visible" ') }} />
      {bonnet}
      {devant.map((x, i) => (
        <Tenu key={'v' + i} e={e} t={t} quoi={x} />
      ))}
      {/* repère invisible des yeux, pour le contrôle (visage dans le cadre, jamais sous un texte) */}
      <div data-tete={e.qui} data-hors-champ={e.horsChamp ? '1' : undefined} style={{ position: 'absolute', left: g.yeux[0] * k - 1, top: (g.yeux[1] - (e.options.saut ?? 0)) * k - 1, width: 2, height: 2 }} />
    </div>
  );
};

// Couché sous la couette : seules la tête et les deux petites mains
// dépassent ; les mains tiennent le bord et suivent ses mouvements.
const MainsSurLaCouette: React.FC<{ e: EtatPerso; t: number; force: number }> = ({ e, t, force }) => {
  if (e.opacite <= 0 || e.mode !== 'couche') return null;
  const g = GABARITS[e.qui];
  const k = e.taille * e.echelle;
  // pendant qu'il sort de sous la couette, les mains arrivent en dernier
  const sortie = Math.max(0, Math.min(1, 1 - e.dy / 60));
  if (sortie <= 0) return null;
  const l = g.bras * k;
  const h = l * 1.15;
  const couleur = e.qui === 'rose' ? 'var(--rose-ombre)' : 'var(--violet-ombre)';
  // un bras de la mascotte qui sort de la couette (levé ou occupé) tient
  // lieu de main de ce côté : pas de petite main en plus
  const visibles = e.options.brasVisibles ?? [false, false];
  return (
    <>
      {[-1, 1].map((c) => {
        if (visibles[c === -1 ? 0 : 1]) return null;
        const x = e.x + e.dx + c * g.largeur * 0.3 * k;
        const y = bordCouette(x, t, force);
        return (
          <div
            key={c}
            style={{ position: 'absolute', left: x - l / 2, top: y - h * 0.55 + (1 - sortie) * h, width: l, height: h, borderRadius: l / 2, background: couleur, opacity: sortie, transform: `rotate(${c * 8}deg)` }}
          />
        );
      })}
    </>
  );
};

// ── Effets ─────────────────────────────────────────────────────────────

const Coeur: React.FC<{ x: number; y: number; taille: number; couleur: string; opacite: number; rot?: number }> = ({ x, y, taille, couleur, opacite, rot = 0 }) => (
  <svg
    viewBox="0 0 100 100"
    width={taille}
    height={taille}
    style={{ position: 'absolute', left: x - taille / 2, top: y - taille / 2, opacity: opacite, transform: `rotate(${rot}deg)`, overflow: 'visible' }}
  >
    <path d={coeurChemin(50, 50, 92)} fill={couleur} stroke="var(--decor-trait)" strokeWidth={5} strokeLinejoin="round" />
  </svg>
);

const EffetPerso: React.FC<{ e: EtatPerso; effet: EffetActif; t: number }> = ({ e, effet, t }) => {
  const [hx, hy] = hautDeTete(e);
  const k = e.taille / TAILLE;
  const age = t - effet.depuis;
  if (age < 0) return null;
  switch (effet.effet) {
    case 'coeurs': {
      const n = Math.floor(age / 0.35) + 1;
      const out: React.ReactNode[] = [];
      for (let i = Math.max(0, n - 5); i < n; i++) {
        const a = age - i * 0.35;
        if (a < 0 || a > 1.4) continue;
        out.push(
          <Coeur
            key={i}
            x={hx + (60 * (hasard(i) - 0.5) + 18 * Math.sin(a * 4 + i)) * k}
            y={hy - (30 + a * 120) * k}
            taille={(36 + 26 * hasard(i + 9)) * k * ressort(a / 0.3)}
            couleur={i % 2 ? 'var(--rose)' : 'var(--rose-ombre)'}
            opacite={1 - (a / 1.4) ** 2}
            rot={20 * (hasard(i + 3) - 0.5)}
          />,
        );
      }
      return <>{out}</>;
    }
    case 'zzz': {
      const n = Math.floor(age / 0.8) + 1;
      const out: React.ReactNode[] = [];
      for (let i = Math.max(0, n - 3); i < n; i++) {
        const a = age - i * 0.8;
        if (a < 0 || a > 2) continue;
        out.push(
          <div
            key={i}
            style={{
              position: 'absolute',
              left: hx + (50 + a * 70) * k,
              top: hy - (40 + a * 120) * k,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: (48 + a * 24) * k,
              color: 'var(--violet-texte)',
              opacity: 1 - (a / 2) ** 2,
              transform: `rotate(${-12 + a * 8}deg)`,
            }}
          >
            Z
          </div>,
        );
      }
      return <>{out}</>;
    }
    case 'etincelles':
      return (
        <>
          {[0, 1, 2, 3].map((i) => {
            const ang = (i / 4) * PI2 + 0.4;
            const s = (0.5 + 0.5 * Math.sin(age * 6 + i * 1.7)) * 34 * k;
            const x = hx + Math.cos(ang) * 150 * k;
            const y = hy + 40 * k + Math.sin(ang) * 110 * k;
            return (
              <svg key={i} viewBox="-10 -10 20 20" width={s} height={s} style={{ position: 'absolute', left: x - s / 2, top: y - s / 2 }}>
                <path d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z" fill="var(--decor-jaune)" />
              </svg>
            );
          })}
        </>
      );
    case 'notes': {
      const n = Math.floor(age / 0.6) + 1;
      const out: React.ReactNode[] = [];
      for (let i = Math.max(0, n - 4); i < n; i++) {
        const a = age - i * 0.6;
        if (a < 0 || a > 1.8) continue;
        const s = 60 * k;
        out.push(
          <svg key={i} viewBox="0 0 40 50" width={s} height={s * 1.25} style={{ position: 'absolute', left: hx + ((i % 2 ? 1 : -1) * 90 + Math.sin(a * 3) * 20) * k, top: hy - (20 + a * 140) * k, opacity: 1 - (a / 1.8) ** 2 }}>
            <path d="M14 38 C14 46 2 48 2 42 C2 36 12 34 14 38 L14 6 L36 2 L36 32 C36 40 24 42 24 36 C24 30 34 28 36 32" fill="var(--violet)" stroke="var(--decor-trait)" strokeWidth={3} />
          </svg>,
        );
      }
      return <>{out}</>;
    }
    case 'goutte': {
      const g = GABARITS[e.qui];
      const s = 46 * k;
      const x = e.x + e.dx + ((g.bas - g.haut) * 0.42 * e.taille) / 1;
      const y = hy + (50 + Math.min(1, age / 1.2) * 40) * k;
      return (
        <svg viewBox="0 0 40 56" width={s} height={s * 1.4} style={{ position: 'absolute', left: x - s / 2, top: y, opacity: bornes(age / 0.2) }}>
          <path d="M20 2 C26 16 36 26 36 38 C36 48 28 54 20 54 C12 54 4 48 4 38 C4 26 14 16 20 2 Z" fill="var(--decor-ciel)" stroke="var(--decor-trait)" strokeWidth={3} />
        </svg>
      );
    }
    case 'exclamation':
    case 'question':
    case 'points': {
      const pop = ressort(bornes(age / 0.3));
      const pouls = 1 + 0.06 * Math.max(0, Math.sin(age * PI2));
      const signe = effet.effet === 'exclamation' ? '!' : effet.effet === 'question' ? '?' : '...';
      return (
        <div
          className={'qc-bulle is-exclamation' + (e.qui === 'violet' ? ' is-violet' : '')}
          style={{
            left: hx + 70 * k - 36,
            top: hy - 90 * k - 36,
            width: signe === '...' ? 110 : 72,
            transform: `scale(${pop * pouls * k * 1.3})`,
            fontSize: signe === '...' ? 44 : 52,
          }}
        >
          {signe}
        </div>
      );
    }
    default:
      return null;
  }
};

// Un effet de personnage posé en un point du décor : on lui prête un
// personnage invisible dont le haut de la tête est ce point.
const fantome = (x: number, y: number): EtatPerso => ({
  qui: 'rose', mode: 'debout', x, sol: y + (GABARITS.rose.sol - GABARITS.rose.haut) * TAILLE, taille: TAILLE, couche: 'devant', premier: false,
  dx: 0, dy: 0, rot: 0, sx: 1, sy: 1, echelle: 1, sens: 1, opacite: 1, options: {}, tenus: [], effets: [], horsChamp: false,
});

const EffetsGlobaux: React.FC<{ plan: PlanPov; t: number }> = ({ plan, t }) => {
  const out: React.ReactNode[] = [];
  (plan.effets ?? []).forEach((ef, j) => {
    if (t < ef.de || t >= ef.a) return;
    if (ef.x !== undefined && ef.y !== undefined) {
      out.push(<EffetPerso key={`p${j}`} e={fantome(ef.x, ef.y)} effet={{ effet: ef.effet, depuis: ef.de }} t={t} />);
      return;
    }
    const age = t - ef.de;
    const fin = bornes((ef.a - t) / 0.4);
    if (ef.effet === 'flocons') {
      for (let i = 0; i < 46; i++) {
        const v = 110 + 90 * hasard(i);
        const y = ((hasard(i + 50) * 2100 + age * v) % 2100) - 120;
        const x = hasard(i + 100) * 1080 + Math.sin(age * 1.4 + i) * 26;
        const r = 7 + 9 * hasard(i + 7);
        out.push(<div key={`f${j}-${i}`} style={{ position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: '#ffffff', opacity: 0.9 * fin, boxShadow: '0 0 0 2px rgba(74,53,64,0.15)' }} />);
      }
    } else if (ef.effet === 'confettis') {
      const couleurs = ['var(--rose)', 'var(--violet-lumiere)', 'var(--decor-jaune)', 'var(--decor-vert)', 'var(--decor-ciel)'];
      for (let i = 0; i < 70; i++) {
        const v = 260 + 200 * hasard(i);
        const y = -60 + age * v - hasard(i + 20) * 600;
        if (y < -80 || y > 1980) continue;
        const x = hasard(i + 300) * 1080 + Math.sin(age * 3 + i) * 30;
        out.push(
          <div key={`c${j}-${i}`} style={{ position: 'absolute', left: x, top: y, width: 18, height: 30, borderRadius: 4, background: couleurs[i % couleurs.length], opacity: fin, transform: `rotate(${age * 300 * (hasard(i + 5) - 0.5) + i * 40}deg) scaleX(${Math.cos(age * 8 + i)})` }} />,
        );
      }
    } else if (ef.effet === 'feux') {
      const couleurs = ['var(--rose)', 'var(--decor-jaune)', 'var(--violet-lumiere)', '#ffffff'];
      for (let b = 0; b < 8; b++) {
        const naissance = b * 0.55;
        const a = age - naissance;
        if (a < 0 || a > 1.4) continue;
        const cx = 180 + hasard(b + 40) * 720;
        const cy = 380 + hasard(b + 80) * 420;
        const r = 40 + a * 230;
        const o = (1 - a / 1.4) * fin;
        for (let i = 0; i < 14; i++) {
          const ang = (i / 14) * PI2;
          const x1 = cx + Math.cos(ang) * r * 0.55;
          const y1 = cy + Math.sin(ang) * r * 0.55 + a * a * 40;
          const x2 = cx + Math.cos(ang) * r;
          const y2 = cy + Math.sin(ang) * r + a * a * 40;
          out.push(
            <svg key={`x${j}-${b}-${i}`} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={couleurs[(b + i) % couleurs.length]} strokeWidth={9} strokeLinecap="round" opacity={o} />
            </svg>,
          );
        }
      }
    }
  });
  return <>{out}</>;
};

// ── Objets posés ───────────────────────────────────────────────────────

const ObjetScene: React.FC<{ o: ObjetPov; t: number }> = ({ o, t }) => {
  const meta = vocabulaire.objets[o.objet];
  const d = dessinObjet(o.objet, t);
  const largeur = meta.largeur * (o.taille ?? 1);
  const h = (largeur * d.vb[1]) / d.vb[0];
  const pose = 'pose' in meta && meta.pose;
  let dx = 0;
  let dy = 0;
  let echelle = 1;
  let rot = o.rotation ?? 0;
  let opacite = 1;
  const de = o.de ?? 0;
  if (t < de) return null;
  if (o.a !== undefined && t >= o.a + 0.25) return null;
  const u = t - de;
  const entree = o.entree ?? (o.de ? 'pop' : 'aucune');
  if (entree === 'pop') echelle *= Math.max(0.001, ressort(u / 0.35));
  if (entree === 'glisse-gauche') dx -= (1 - ressort(u / 0.5)) * (o.x + largeur);
  if (entree === 'glisse-droite') dx += (1 - ressort(u / 0.5)) * (1080 - o.x + largeur);
  if (entree === 'tombe') dy -= (1 - bornes(u / 0.4) ** 2) * 900;
  if (o.a !== undefined && t >= o.a) {
    const q = bornes((t - o.a) / 0.25);
    echelle *= 1 - q;
    opacite = 1 - q;
  }
  if (o.vol && t >= o.vol.de) {
    const q = bornes((t - o.vol.de) / Math.max(0.01, o.vol.a - o.vol.de));
    dx += o.vol.dx * q;
    dy += o.vol.dy * q - 260 * Math.sin(Math.PI * q) * Math.sign(-o.vol.dy || 1) * 0;
    rot += 360 * (o.vol.tours ?? 1) * q;
  }
  const left = o.x - largeur / 2 + dx;
  const top = (pose ? o.y - h : o.y - h / 2) + dy;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: largeur,
        height: h,
        opacity: opacite,
        transformOrigin: pose ? '50% 100%' : '50% 50%',
        transform: `rotate(${rot}deg) scale(${echelle})`,
      }}
      dangerouslySetInnerHTML={{ __html: svgObjet(o.objet, t, largeur) }}
    />
  );
};

// ── Un plan à l'instant t ──────────────────────────────────────────────

export type ImagePlan = { etats: EtatPerso[]; cam: Camera };

export const calculer = (plan: PlanPov, t: number): ImagePlan => {
  const places = placer(plan);
  const etats = places.map((p) => etatPerso(plan, p, t, places));
  const cam = camera(plan, t, etats);
  // en gros plan, seul le personnage suivi doit rester dans le cadre
  if (cam.zoom > 1.15) for (const e of etats) if (e.qui !== cam.cible) e.horsChamp = true;
  return { etats, cam };
};

export const Etage: React.FC<{ plan: PlanPov; t: number; id: string; image: ImagePlan }> = ({ plan, t, id, image }) => {
  const { etats, cam } = image;
  const force = forceCouette(plan, t);
  const couches = dessinDecor(plan.decor, plan.moment ?? 'midi', t, id, { force });
  // ordre d'empilement : décor, objets, personnages derrière, devant du
  // décor, personnages devant ; à couche égale, « premier » passe dessus
  const tri = (a: EtatPerso, b: EtatPerso) => Number(a.premier) - Number(b.premier);
  const derriere = etats.filter((e) => e.couche === 'derriere').sort(tri);
  const devant = etats.filter((e) => e.couche === 'devant').sort(tri);
  const objets = plan.objets ?? [];
  // le trait des mascottes tremble (une graine toutes les quatre images) ;
  // un filtre sur tout le calque coûtait 1,3 s par image contre 0,45, donc
  // il ne sert que sur les scènes fixes des posts (SceneFixe)
  const tremble = id === 'fixe' ? undefined : Math.floor((t * 30) / 4);
  return (
    <div
      className="pov-etage"
      style={{
        ...pleinCadre,
        transformOrigin: '0 0',
        transform: `translate(${540 + cam.ox - cam.x * cam.zoom}px, ${960 + cam.oy - cam.y * cam.zoom}px) scale(${cam.zoom})`,
      }}
    >
      <Svg contenu={couches.fond} />
      {objets.filter((o) => !o.devant).map((o, i) => (
        <ObjetScene key={'o' + i} o={o} t={t} />
      ))}
      {derriere.map((e) => (
        <PersoDessin key={e.qui} e={e} t={t} tremble={tremble} />
      ))}
      <Svg contenu={couches.devant} />
      {derriere.map((e) => (
        <MainsSurLaCouette key={'m' + e.qui} e={e} t={t} force={force} />
      ))}
      {devant.map((e) => (
        <PersoDessin key={e.qui} e={e} t={t} tremble={tremble} />
      ))}
      {objets.filter((o) => o.devant).map((o, i) => (
        <ObjetScene key={'v' + i} o={o} t={t} />
      ))}
      {etats.flatMap((e) => (e.opacite > 0 ? e.effets.map((ef, i) => <EffetPerso key={e.qui + ef.effet + i} e={e} effet={ef} t={t} />) : []))}
      <EffetsGlobaux plan={plan} t={t} />
    </div>
  );
};

// Les décors où le texte se pose directement sur le fond ; ailleurs (une
// fenêtre, un cadre derrière), il prend une carte de papier.
export const DECORS_CALMES = new Set(['uni', 'ligne', 'mur', 'dehors']);

// Un plan figé à l'instant t, recadré pour une image 4:5 : on garde la
// bande du décor qui va de « haut » à haut + 1350.
export const SceneFixe: React.FC<{ plan: PlanPov; t?: number; haut?: number }> = ({ plan, t = 1.2, haut = 240 }) => (
  <div style={{ position: 'absolute', left: 0, top: -haut, width: 1080, height: 1920, filter: 'url(#qc-tremble)' }}>
    <Etage plan={plan} t={t} id="fixe" image={calculer(plan, t)} />
  </div>
);

export { aLEcran };
