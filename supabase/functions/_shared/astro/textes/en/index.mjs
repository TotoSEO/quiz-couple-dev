// The English texts of the couple's birth chart report, together.
import base from './base.mjs';
import planetes from './planetes.mjs';
import liens from './liens.mjs';
import couple from './couple.mjs';
import ailleurs from './ailleurs.mjs';
import annee from './annee.mjs';

export default { ...base, ...planetes, liens, ...couple, ...ailleurs, ...annee };
