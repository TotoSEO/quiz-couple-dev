// La charte vient du design system « Quiz Couple Social » : reseaux/charte/tokens.json
// et reseaux/charte/qc.css en sont des copies. On ne recopie aucune valeur ici.
import { loadFont } from '@remotion/fonts';
import { Easing, staticFile } from 'remotion';
import tokens from '../../../charte/tokens.json';
import '../../../charte/qc.css';

type Jeton = { name: string; value: string | Record<string, string> };

const themes = tokens.color.themes.map((t) => t.id);
const valeur = (t: Jeton, theme: string) => {
  const v = typeof t.value === 'string' ? t.value : t.value[theme] ?? t.value[themes[0]];
  const alias = /^\{(.+)\}$/.exec(v);
  return alias ? `var(--${alias[1]})` : v;
};

const familles = Object.keys(tokens).filter(
  (k) => !['name', 'version', 'color', 'type'].includes(k),
) as (keyof typeof tokens)[];

export const CSS_JETONS = [
  ...themes.map(
    (theme, i) =>
      `${i === 0 ? `:root, [data-theme="${theme}"]` : `[data-theme="${theme}"]`} {\n` +
      (tokens.color.tokens as Jeton[]).map((t) => `  --${t.name}: ${valeur(t, theme)};`).join('\n') +
      '\n}',
  ),
  ':root {\n' +
    familles
      .flatMap((f) => ((tokens[f] as { tokens: Jeton[] }).tokens ?? []).map((t) => `  --${t.name}: ${t.value};`))
      .join('\n') +
    '\n' +
    Object.entries(tokens.type.families)
      .map(([k, v]) => `  --font-${k}: ${v};`)
      .join('\n') +
    '\n}',
].join('\n');

// Polices : chargées une fois, le rendu attend qu'elles soient prêtes.
for (const f of tokens.type.fonts) {
  loadFont({
    family: f.family,
    url: staticFile(f.file),
    weight: f.weight,
    style: f.style,
  });
}

export const jeton = (nom: string): string => {
  for (const f of familles) {
    const t = ((tokens[f] as { tokens: Jeton[] }).tokens ?? []).find((x) => x.name === nom);
    if (t) return String(t.value);
  }
  throw new Error(`Jeton inconnu : ${nom}`);
};

const ms = (nom: string) => parseFloat(jeton(nom));
const courbe = (nom: string) => {
  const [a, b, c, d] = (/\(([^)]*)\)/.exec(jeton(nom))?.[1] ?? '').split(',').map(Number);
  return Easing.bezier(a, b, c, d);
};

export const FPS = 30;
export const enImages = (millisecondes: number) => Math.round((millisecondes / 1000) * FPS);
export const TEMPO = {
  court: enImages(ms('tempo-court')),
  moyen: enImages(ms('tempo-moyen')),
  long: enImages(ms('tempo-long')),
  lectureParMot: ms('tempo-lecture'),
};
export const COURBE = { douce: courbe('courbe-douce'), rebond: courbe('courbe-rebond') };
export const OPACITE_FLEURS = parseFloat(jeton('opacite-fleurs'));
// La zone utile d'un reel, en pixels (zones de tokens.json).
export const ZONE = {
  haut: parseFloat(jeton('zone-reel-haut')),
  bas: parseFloat(jeton('zone-reel-bas')),
  gauche: parseFloat(jeton('zone-reel-gauche')),
  droite: parseFloat(jeton('zone-reel-droite')),
};
