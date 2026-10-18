// L'e-mail du rapport : textes complets dans les cinq langues, rien du
// contenu du rapport dans le corps, pièce jointe en base64, adresses.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { messageRapport, emailPropre, masquerEmail, nomFichier, creerCourriel } from '../courriel.mjs';

test('le message dans les cinq langues, sans accolade restée', () => {
  for (const lang of ['fr', 'en', 'es', 'de', 'it']) {
    for (const pages of [24, null]) {
      const m = messageRapport({ lang, a: 'Léa', b: 'Thomas', pages });
      for (const champ of [m.sujet, m.html, m.texte]) {
        assert.ok(!/\{[a-z]+\}/i.test(champ), lang + ' : ' + champ.slice(0, 80));
        assert.ok(champ.includes('Léa') || champ.includes('L&#39;') || champ.includes('Léa'), lang);
      }
      assert.ok(m.html.includes('SIRET 940 106 800 00011'));
      if (pages) assert.ok(m.texte.includes('24'), lang);
    }
  }
});

test('un prénom avec des balises est échappé', () => {
  const m = messageRapport({ lang: 'fr', a: '<b>x</b>', b: 'Y', pages: 3 });
  assert.ok(!m.html.includes('<b>x</b>'));
  assert.ok(m.html.includes('&lt;b&gt;x&lt;/b&gt;'));
});

test('adresses : contrôle, masque, nom de fichier', () => {
  assert.equal(emailPropre(' Lea.Martin@Gmail.COM '), 'Lea.Martin@gmail.com');
  for (const faux of ['', 'a@b', 'a b@c.fr', 'x@y.c', '<a@b.fr>', 'a@@b.fr', 'a@b..fr', null, 3]) {
    assert.equal(emailPropre(faux), null, String(faux));
  }
  assert.equal(masquerEmail('lea@gmail.com'), 'l•••@gmail.com');
  assert.equal(nomFichier('fr', 'Léa', 'Thomas'), 'bilan-de-couple-lea-et-thomas.pdf');
  assert.equal(nomFichier('de', 'Jürgen', 'Anna-Maria Strauß'), 'beziehungs-check-jurgen-und-anna-maria-strauss.pdf');
  assert.equal(nomFichier('en', '李', '!!'), 'couple-check-up-x-and-x.pdf');
});

test('envoi par Resend : en-têtes, pièce jointe, erreur remontée', async () => {
  const appels = [];
  const f = async (url, options) => { appels.push({ url, ...options }); return new Response(JSON.stringify({ id: 'em_1' }), { status: 200 }); };
  const c = creerCourriel({ cle: 're_test', fetch: f });
  const r = await c.envoyer({ a: 'lea@gmail.com', sujet: 's', html: '<p>h</p>', texte: 't', pieces: [{ nom: 'r.pdf', octets: new Uint8Array([37, 80, 68, 70]) }] });
  assert.equal(r.id, 'em_1');
  const corps = JSON.parse(appels[0].body);
  assert.equal(appels[0].url, 'https://api.resend.com/emails');
  assert.equal(appels[0].headers.Authorization, 'Bearer re_test');
  assert.deepEqual(corps.to, ['lea@gmail.com']);
  assert.equal(corps.attachments[0].content, 'JVBERg==');
  assert.equal(corps.reply_to, 'infoquizcouple@gmail.com');
  const mauvais = creerCourriel({ cle: 'k', fetch: async () => new Response('{"message":"nope"}', { status: 422 }) });
  await assert.rejects(() => mauvais.envoyer({ a: 'x@y.fr', sujet: 's', html: 'h', texte: 't' }), /resend 422/);
});
