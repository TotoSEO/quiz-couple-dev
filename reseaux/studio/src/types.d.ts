declare module '*mascottes.js' {
  export type OptionsMascotte = {
    vue?: 'face' | 'profil' | 'dos';
    bras?: [number, number];
    jambes?: 'debout' | 'marche';
    jambesAngles?: [number, number];
    devant?: [boolean, boolean];
    yeux?: 'ouverts' | 'heureux' | 'coeur' | 'plats' | 'fermes' | 'clin';
    regard?: [number, number];
    bouche?: 'sourire' | 'o' | 'rire' | 'plate' | 'triste' | 'bisou';
    rougit?: boolean;
    saut?: number;
    penche?: number;
    coeurs?: boolean;
    couleurs?: 'jetons' | 'hex';
  };
  export function mascotte(nom: 'rose' | 'violet', options?: OptionsMascotte): string;
  export function mains(nom: 'rose' | 'violet', options?: OptionsMascotte): [[number, number], [number, number]];
  export const POSES: Record<string, OptionsMascotte>;
}
