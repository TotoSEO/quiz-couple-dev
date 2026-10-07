declare module '*mascottes.js' {
  export type OptionsMascotte = {
    vue?: 'face' | 'profil' | 'dos';
    bras?: [number, number];
    jambes?: 'debout' | 'marche';
    jambesAngles?: [number, number];
    devant?: [boolean, boolean];
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
