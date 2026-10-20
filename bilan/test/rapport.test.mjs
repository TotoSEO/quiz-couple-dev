// Le gabarit du rapport, sans Chrome : textes complets dans les cinq langues,
// rien qui trahisse un texte manquant, couleurs des deux personnes, césures.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rapportHtml, couleurs, styleDePage } from '../../supabase/functions/_shared/bilan/rapport.mjs';
import { couperPour } from '../cesure.mjs';
import { jeuxDEssai } from '../exemples.mjs';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LANGUES = ['fr', 'en', 'es', 'de', 'it'];
const lire = (lang, f) => JSON.parse(fs.readFileSync(path.join(RACINE, lang, f), 'utf8'));

function cles(o, p = '') {
  if (Array.isArray(o)) return [p + '[' + o.length + ']'];
  if (o && typeof o === 'object') return Object.keys(o).sort().flatMap((k) => cles(o[k], p ? p + '.' + k : k));
  return [p];
}

test('les textes du rapport ont les mêmes clés dans les cinq langues', () => {
  const ref = cles(lire('fr', 'bilan.json').app.rapport);
  for (const lang of LANGUES.slice(1)) {
    assert.deepEqual(cles(lire(lang, 'bilan.json').app.rapport), ref, lang);
  }
});

test('aucun texte vide ni accolade restée, dans aucune langue ni aucun cas', () => {
  for (const lang of LANGUES) {
    const T = lire(lang, 'bilan.json').app;
    const Q = lire(lang, 'bilan-questions.json');
    for (const { nom, d } of jeuxDEssai(lang)) {
      for (const format of ['pdf', 'ecran']) {
        const { html } = rapportHtml(d, T, Q, { format, couper: format === 'pdf' ? couperPour(lang) : undefined });
        const texte = html.replace(/<[^>]+>/g, ' ');
        assert.ok(!/[{}]/.test(texte), `${lang} ${nom} ${format} : accolade`);
        assert.ok(!/\b(undefined|NaN|null)\b|\[object/.test(texte), `${lang} ${nom} ${format}`);
        assert.ok(!/<(h2|h3|p) class="[^"]*-titre">\s*<\//.test(html), `${lang} ${nom} : titre vide`);
        assert.ok(html.includes(d.a.prenom.replace(/&/g, '&amp;')) && html.includes(d.b.prenom), `${lang} ${nom} : prénoms`);
      }
    }
  }
});

test('un prénom avec des balises reste du texte', () => {
  const T = lire('fr', 'bilan.json').app;
  const Q = lire('fr', 'bilan-questions.json');
  const d = jeuxDEssai('fr')[0].d;
  const { html } = rapportHtml({ ...d, a: { ...d.a, prenom: '<img src=x onerror=alert(1)>' } }, T, Q, { format: 'pdf' });
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('couleurs : une femme est la rose, un homme le violet', () => {
  assert.deepEqual(couleurs('f', 'h'), ['rose', 'violet']);
  assert.deepEqual(couleurs('h', 'f'), ['violet', 'rose']);
  assert.deepEqual(couleurs('h', null), ['violet', 'rose']);
  assert.deepEqual(couleurs(null, 'f'), ['violet', 'rose']);
  assert.deepEqual(couleurs(null, 'h'), ['rose', 'violet']);
  assert.deepEqual(couleurs('h', 'h'), ['rose', 'violet']);
  assert.deepEqual(couleurs(null, null), ['rose', 'violet']);
});

test('césures : les mots longs reçoivent des tirets conditionnels', () => {
  const de = couperPour('de')('Kommunikationsschwierigkeiten');
  assert.ok(de.includes('­'));
  assert.equal(de.replace(/­/g, ''), 'Kommunikationsschwierigkeiten');
  assert.equal(couperPour('fr')('court'), 'court');
});

test('le pied de page échappe les guillemets', () => {
  assert.equal(styleDePage({ rapport: { pied: 'a "b" \\ c' } }), '@page { @bottom-left { content: "a \\"b\\" \\\\ c"; } }');
});
