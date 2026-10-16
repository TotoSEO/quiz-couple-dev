// Les types du réalisateur (realisateur.mjs, JavaScript partagé avec les automates).
import type { Genre, PlanBaton, RecetteBaton } from './recette';

export const VERSION: number;
export const DECORS: Record<string, { sol: number; defile?: number; obstacles?: string[]; ouverture?: boolean; lieu?: boolean; plateforme?: number; interieur?: boolean; vol?: boolean; astre?: [number, number] }>;
export const INCIDENTS: string[];
export const EXPLOITS: string[];
export const CADEAUX: string[];
export const FINS: string[];
export const JEUX: string[];
export const LIEUX: string[];
export const EXPRESSIONS_EMOTION: string[];
export const TRAMES: Record<string, { incident: string; exploit: string; ambiance: string; sequences: string[]; resume: string }>;
export const SEQUENCES: Record<string, string>;
export function realiser(recette: RecetteBaton): { plans: PlanBaton[]; fautes: string[]; heros?: Genre };
