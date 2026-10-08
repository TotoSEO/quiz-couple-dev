declare module '*mascottes.js' {
  export type OptionsMascotte = {
    vue?: 'face' | 'profil' | 'dos';
    bras?: [number, number];
    jambes?: 'debout' | 'marche';
    jambesAngles?: [number, number];
    devant?: [boolean, boolean];
    brasVisibles?: [boolean, boolean];
    yeux?: 'ouverts' | 'heureux' | 'coeur' | 'plats' | 'fermes' | 'clin' | 'brillants';
    regard?: [number, number];
    sourcils?: 'tristes' | 'faches' | 'hauts';
    bouche?: 'sourire' | 'o' | 'rire' | 'plate' | 'triste' | 'bisou' | 'chat' | 'grogne';
    larmes?: boolean | number;
    rougit?: boolean;
    noeud?: boolean;
    saut?: number;
    penche?: number;
    coeurs?: boolean;
    tremble?: number;
    couleurs?: 'jetons' | 'hex';
  };
  export function mascotte(nom: 'rose' | 'violet', options?: OptionsMascotte): string;
  export function mains(nom: 'rose' | 'violet', options?: OptionsMascotte): [[number, number], [number, number]];
  export function reperes(nom: 'rose' | 'violet'): { boite: number[]; sol: number; centre: number; yeux: [number, number]; haut: number };
  export const POSES: Record<string, OptionsMascotte>;
}

// Les mipaps : le rig du Gribouillou et de la Gribouillette
// (reseaux/mipaps/charte/gribouillou.mjs), des modules ESM sans types.
declare module '*gribouillou.mjs' {
  export type OptionsMipap = {
    perso?: 'lui' | 'elle';
    expression?: string;
    pose?: string;
    bras?: string;
    pattes?: string;
    angle?: number;
    dos?: boolean;
    vers?: -1 | 1;
    marqueur?: 'fleur' | 'noeud' | 'meche';
    signes?: string[];
    surcharge?: Record<string, unknown>;
    pancarte?: boolean;
    foulee?: number;
    seed?: number;
    id?: string;
  };
  export const COULEURS: { encre: string; lui: string; elle: string; joue: string; coeur: string; blanc: string };
  export const EXPRESSIONS: Record<string, { yeux: string | [string, string]; bouche: string; sourcils?: string; signes?: string[]; bras?: string; pose?: string; joues?: number; famille: string; libelle: string }>;
  export const FAMILLES_EXPRESSIONS: string[];
  export const LISTE_POSES: string[];
  export const LISTE_BRAS: string[];
  export const LISTE_PATTES: string[];
  export const LISTE_SIGNES: string[];
  export const LISTE_PROPS: string[];
  export const REPERES: { CX: number; CY: number; RX: number; RY: number; TOP: number; BAS: number; EY: number; MY: number };
  export const PROPS: Record<string, () => string>;
  export const COEUR: (x: number, y: number, s: number) => string;
  export function defs(id?: string, seed?: number): string;
  export function mipap(o?: OptionsMipap): { svg: string; defs: string; boite: { x: number; y: number; w: number; h: number } };
  export function prop(nom: string, x: number, y: number, echelle?: number, id?: string): string;
  export function document(contenu: string, o?: { w?: number; h?: number; defs?: string; fond?: string | false; viewBox?: string }): string;
  export function pose(o: OptionsMipap, x: number, y: number, taille?: number, miroir?: boolean): string;
}
declare module '*scenes.mjs' {
  export type ElementScene =
    | { perso: 'lui' | 'elle'; expression?: string; pose?: string; bras?: string; pattes?: string; vers?: -1 | 1; x: number; y: number; taille: number; miroir?: boolean }
    | { prop: string; x: number; y: number; echelle?: number }
    | { meuble: string };
  export const DUOS: Record<string, { titre: string; elements: ElementScene[] }>;
  export const MEUBLES: Record<string, () => string>;
  export function scene(nom: string, o?: { w?: number; h?: number; fond?: string; prefix?: string }): { svg: string; defs: string; titre: string; w: number; h: number; document: () => string };
}
