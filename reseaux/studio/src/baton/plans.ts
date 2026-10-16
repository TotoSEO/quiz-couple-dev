// Les plans d'une recette du bonhomme bâton : ceux qu'elle écrit (plans),
// ou ceux que le réalisateur tire de son histoire (histoire). Calculés une
// fois par recette.
import type { PlanBaton, RecetteBaton } from './recette';
import { realiser } from './realisateur.mjs';

const memo = new WeakMap<RecetteBaton, PlanBaton[]>();

export const plansDe = (r: RecetteBaton): PlanBaton[] => {
  if (r.plans) return r.plans;
  const deja = memo.get(r);
  if (deja) return deja;
  const { plans, fautes } = realiser(r);
  if (fautes.length) throw new Error(`Histoire refusée par le réalisateur : ${fautes.join(' ; ')}`);
  memo.set(r, plans);
  return plans;
};
