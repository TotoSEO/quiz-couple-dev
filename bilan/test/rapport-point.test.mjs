// Le gabarit du point sur ma relation (le seul(e) depuis le 4 novembre 2026),
// sans Chrome : textes complets dans chaque langue, rien qui trahisse un texte
// manquant, les chapitres dans l'ordre que demande l'analyse, et en cas
// d'alerte la sécurité d'abord, les numéros d'aide, aucun appel à le faire à
// deux. Les PDF eux-mêmes passent par bilan/exemples.mjs (bilan-controle.yml).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rapportPointHtml } from '../../supabase/functions/_shared/bilan/rapport-point.mjs';
import { couperPour } from '../cesure.mjs';
import { jeuxDEssai, point } from '../exemples.mjs';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LANGUES = ['fr', 'en', 'es', 'de', 'it', 'nl'];
const fichier = (lang) => path.join(RACINE, lang, 'bilan-point.json');
const lire = (lang) => JSON.parse(fs.readFileSync(fichier(lang), 'utf8'));
const cas = (lang) => jeuxDEssai(lang).filter((j) => j.d.formule === 'point');
const chapitresDe = (html) => [...html.matchAll(/data-chap="([a-z]+)"/g)].map((m) => m[1]);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

for (const lang of LANGUES) {
  test(`${lang} : aucun texte vide ni accolade restée, dans aucun cas`, { skip: !fs.existsSync(fichier(lang)) && 'pas encore traduit' }, () => {
    const TP = lire(lang);
    for (const { nom, d } of cas(lang)) {
      for (const format of ['pdf', 'ecran']) {
        const { html, analyse, chapitres } = rapportPointHtml(d, TP, { format, couper: format === 'pdf' ? couperPour(lang) : undefined, editeur: 'Quiz Couple' });
        const texte = html.replace(/<[^>]+>/g, ' ');
        assert.ok(!/[{}]/.test(texte), `${lang} ${nom} ${format} : accolade`);
        assert.ok(!/\b(undefined|NaN|null)\b|\[object/.test(texte), `${lang} ${nom} ${format}`);
        assert.ok(!/<(h1|h2|h3|p|li) class="[^"]*">\s*<\/\1>/.test(html), `${lang} ${nom} ${format} : bloc vide`);
        assert.ok(!/<li>\s*<\/li>/.test(html), `${lang} ${nom} ${format} : puce vide`);
        // Les prénoms, jamais coupés par la césure, et aucune marque oubliée.
        assert.ok(html.includes(esc(d.a.prenom)) && html.includes('<span class="rpt-nom">' + esc(d.b.prenom) + '</span>'), `${lang} ${nom} : prénoms`);
        assert.ok(!/[\uE000\uE001]/.test(html), `${lang} ${nom} : marque de prénom`);
        assert.deepEqual(chapitresDe(html), chapitres, `${lang} ${nom} : chapitres`);
        assert.deepEqual(chapitres.slice(1), analyse.chapitres, `${lang} ${nom}`);
      }
    }
  });
}

test('une alerte : la sécurité d\'abord, les numéros, et aucun appel à le faire à deux', () => {
  const TP = lire('fr');
  const d = cas('fr').find((j) => j.nom === 'point-secu').d;
  const { html, analyse } = rapportPointHtml(d, TP, { format: 'pdf' });
  assert.equal(analyse.securite.niveau, 'alerte');
  assert.equal(analyse.chapitres[0], 'securite');
  assert.ok(!analyse.chapitres.includes('deux'));
  assert.ok(!html.includes('data-chap="deux"'));
  assert.ok(html.includes('3919'));
  // Le plan devient trois choses à faire pour soi, pas trois conversations.
  assert.equal(analyse.plan.mode, 'securite');
  assert.ok(!html.includes(TP.rapport.plan.numero.replace('{{n}}', '1')));
});

test('sans alerte : le plan donne trois conversations et le chapitre à deux est là', () => {
  const TP = lire('fr');
  const d = cas('fr').find((j) => j.nom === 'point-tensions').d;
  const { html, analyse } = rapportPointHtml(d, TP, { format: 'ecran' });
  assert.notEqual(analyse.securite.niveau, 'alerte');
  assert.ok(analyse.chapitres.includes('deux'));
  assert.equal(analyse.plan.sujets.length, 3);
  for (let n = 1; n <= 3; n++) assert.ok(html.includes(TP.rapport.plan.numero.replace('{{n}}', String(n))), String(n));
});

test('un prénom avec des balises reste du texte', () => {
  const TP = lire('fr');
  const d = point({ lang: 'fr', prenoms: ['<img src=x onerror=alert(1)>', '<b>B</b>'] });
  const { html } = rapportPointHtml(d, TP, { format: 'pdf' });
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('<b>B</b>'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('le prénom de l\'autre n\'est jamais lu comme un accord', () => {
  const TP = lire('fr');
  const d = point({ lang: 'fr', prenoms: ['Camille', 'Jo{a|b}'], genres: ['f', null] });
  const { html } = rapportPointHtml(d, TP, { format: 'ecran' });
  assert.ok(html.includes('Jo{a|b}'));
});

test('la balance : ce qui retient, ce qui éloigne, et l\'envie que ça dure à part', () => {
  const TP = lire('fr');
  const d = point({ lang: 'fr', biais: 0.5, autres: { pv2: 3 } });
  const { html } = rapportPointHtml(d, TP, { format: 'ecran' });
  const balance = html.slice(html.indexOf('rpt-balance'), html.indexOf('rpt-resultat'));
  assert.ok(balance.includes(esc(TP.rapport.retient.mesures.partir)));
  assert.ok(!balance.includes(esc(TP.rapport.retient.mesures.engagement)));
  assert.match(balance, /<strong>100\s%<\/strong>/);
  const resultat = html.slice(html.indexOf('rpt-resultat'), html.indexOf('rpt-resultat') + 1200);
  assert.ok(resultat.includes(esc(TP.rapport.retient.mesures.engagement)));
});
