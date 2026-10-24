// La carte commune des e-mails envoyés par Resend (évaluation, e-book).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carte, texteCarte, EDITEUR } from '../carte.mjs';

const base = {
  lang: 'fr', sujet: 'Sujet', bonjour: 'Bonjour <b>Léa</b> !', alt: 'Les mascottes', titre: 'Titre : test',
  phrase: 'Une phrase.', signature: ['À très vite,', 'Thomas'], pied: 'Le pied.',
};

test('la carte : personnages, bulle échappée, insécables, éditeur, pas de lien d\'arrêt par défaut', () => {
  const html = carte({ ...base, bouton: 'Aller', url: 'https://quiz-couple.com/x/?a=1&b=2' });
  assert.ok(html.includes('https://quiz-couple.com/email/mascottes-coucou.png'));
  assert.ok(html.includes('Bonjour &lt;b&gt;Léa&lt;/b&gt; !'), 'la bulle est échappée');
  assert.ok(html.includes('Titre : test'));
  assert.ok(html.includes('href="https://quiz-couple.com/x/?a=1&amp;b=2"'));
  assert.ok(html.includes(EDITEUR));
  assert.ok(!html.includes('arret'), 'aucun lien d\'arrêt sans arretUrl');
  assert.ok(!html.includes('display:none;font-size:1px'), 'pas de texte d\'aperçu sans `avant`');
});

test('la carte : lien secondaire, adresse en clair, plusieurs boutons, bloc légal avec son lien', () => {
  const cgv = 'https://quiz-couple.com/conditions-generales-de-vente/';
  const o = {
    ...base, bouton: 'PDF', url: 'https://q.fr/a#t=1&pdf=1', brut: true, lien2: { texte: 'En ligne', url: 'https://q.fr/a#t=1' },
    legal: { texte: 'Confirmation. Conditions de vente : ' + cgv, lien: cgv }, arret: 'Stop', arretUrl: 'https://q.fr/a#arret=1',
  };
  const html = carte(o);
  assert.ok(html.includes('href="https://q.fr/a#t=1"') && html.includes('>En ligne</a>'));
  assert.ok(html.includes('>https://q.fr/a#t=1&amp;pdf=1</div>'), 'l\'adresse en clair sous le bouton');
  assert.ok(html.includes(`<a href="${cgv}" target="_blank"`), 'le lien des CGV');
  assert.ok(html.includes('href="https://q.fr/a#arret=1"'));
  const texte = texteCarte(o);
  assert.ok(texte.startsWith('Bonjour <b>Léa</b> !\n\nTitre : test'));
  assert.ok(texte.includes('PDF : https://q.fr/a#t=1&pdf=1') && texte.includes('En ligne : https://q.fr/a#t=1'));
  assert.ok(texte.includes('Conditions de vente : ' + cgv) && texte.includes('Stop : https://q.fr/a#arret=1'));
  assert.ok(texte.trim().endsWith(EDITEUR));
  const plusieurs = { ...base, blocs: [{ libelle: 'Léa et Tom', bouton: 'Reprendre', url: 'https://q.fr/1' }, { libelle: 'Léa, seule', bouton: 'Reprendre', url: 'https://q.fr/2' }] };
  const h2 = carte(plusieurs);
  assert.equal((h2.match(/>Reprendre<\/a>/g) || []).length, 2);
  assert.ok(h2.includes('>https://q.fr/2</div>'));
  const t2 = texteCarte(plusieurs);
  assert.ok(t2.includes('Léa et Tom : https://q.fr/1') && t2.includes('Léa, seule : https://q.fr/2'));
});
