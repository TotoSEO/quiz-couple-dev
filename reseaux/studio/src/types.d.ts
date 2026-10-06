declare module '*mascottes.js' {
  export type OptionsMascotte = {
    vue?: 'face' | 'profil' | 'dos';
    bras?: [number, number];
    jambes?: 'debout' | 'marche';
    yeux?: 'ouverts' | 'heureux' | 'coeur' | 'plats' | 'fermes';
    regard?: [number, number];
    bouche?: 'sourire' | 'o' | 'rire' | 'plate' | 'triste';
    saut?: number;
    penche?: number;
    coeurs?: boolean;
    couleurs?: 'jetons' | 'hex';
  };
  export function mascotte(nom: 'rose' | 'violet', options?: OptionsMascotte): string;
  export const POSES: Record<string, OptionsMascotte>;
}
