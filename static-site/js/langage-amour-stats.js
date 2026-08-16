/**
 * Répartition réelle des 5 langages de l'amour.
 *
 * La page annonce des chiffres que personne d'autre ne publie en français :
 * comment se répartissent les langages chez les gens qui ont passé le test
 * ici. Les agrégats viennent de get_profil_stats ; tant que la table n'est
 * pas déployée, ou tant qu'il y a trop peu de résultats pour qu'un
 * pourcentage veuille dire quelque chose, la section reste masquée. Un
 * chiffre inventé vaudrait moins que pas de chiffre du tout.
 */
(function () {
  var RACINE = document.getElementById('la-stats');
  if (!RACINE) return;

  var SUPABASE_URL = RACINE.dataset.supabaseUrl || '';
  var SUPABASE_KEY = RACINE.dataset.supabaseKey || '';
  var SLUG = RACINE.dataset.quizSlug || 'testLangageAmour';
  var MIN_ECHANTILLON = 40; // en dessous, une répartition ne veut rien dire
  var LANGUE = document.documentElement.lang || 'fr';
  var LOCALES = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', de: 'de-DE', it: 'it-IT' };

  // Ordre et habillage des cinq langages. Les libellés viennent du gabarit :
  // la page est traduite, le script ne doit pas porter de français en dur.
  var LANGAGES = ['words', 'acts', 'gifts', 'time', 'touch'];
  var COULEURS = {
    words: '#ec4899', acts: '#8b5cf6', gifts: '#f59e0b',
    time: '#06b6d4', touch: '#ef4444'
  };
  var EMOJIS = { words: '💬', acts: '🤝', gifts: '🎁', time: '⏳', touch: '🤗' };

  function nb(n) {
    try { return Number(n).toLocaleString(LOCALES[LANGUE] || 'fr-FR'); }
    catch (e) { return String(n); }
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var libelles = {};
  try { libelles = JSON.parse(RACINE.dataset.libelles || '{}'); } catch (e) {}
  var textes = {};
  try { textes = JSON.parse(RACINE.dataset.textes || '{}'); } catch (e) {}

  function fmt(modele, vals) {
    return String(modele || '').replace(/\{(\w+)\}/g, function (_, k) {
      return vals[k] != null ? vals[k] : '';
    });
  }

  if (!SUPABASE_URL) return;
  fetch(SUPABASE_URL + '/rest/v1/rpc/get_profil_stats', {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ p_quiz_slug: SLUG })
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (rows) {
      if (!Array.isArray(rows) || !rows.length) return;
      var total = Number(rows[0].total) || 0;
      if (total < MIN_ECHANTILLON) return;

      var parProfil = {};
      rows.forEach(function (r) { parProfil[r.profil] = Number(r.effectif) || 0; });

      // Classement par effectif : la page annonce « le langage le plus
      // répandu », il faut donc savoir lequel arrive en tête.
      var lignes = LANGAGES.map(function (id) {
        var n = parProfil[id] || 0;
        return { id: id, n: n, pct: Math.round((n / total) * 100) };
      }).sort(function (a, b) { return b.n - a.n; });

      var max = lignes[0].pct || 1;
      var corps = lignes.map(function (l, i) {
        return '<div class="la-stat' + (i === 0 ? ' est-premier' : '') + '">' +
          '<div class="la-stat-tete">' +
            '<span class="la-stat-nom"><span aria-hidden="true">' + EMOJIS[l.id] + '</span> ' +
              esc(libelles[l.id] || l.id) + '</span>' +
            '<span class="la-stat-pct">' + l.pct + ' %</span>' +
          '</div>' +
          '<div class="la-stat-piste"><span style="width:' + Math.round((l.pct / max) * 100) +
            '%;background:' + COULEURS[l.id] + '"></span></div>' +
        '</div>';
      }).join('');

      var tete = fmt(textes.intro || '', {
        n: '<strong>' + nb(total) + '</strong>',
        premier: '<strong>' + esc(libelles[lignes[0].id] || lignes[0].id) + '</strong>',
        pct: '<strong>' + lignes[0].pct + ' %</strong>'
      });
      var pied = fmt(textes.note || '', { n: nb(total) });

      RACINE.innerHTML =
        (tete ? '<p class="la-stats-intro">' + tete + '</p>' : '') +
        '<div class="la-stats-liste">' + corps + '</div>' +
        (pied ? '<p class="la-stats-note">' + esc(pied) + '</p>' : '');
      RACINE.hidden = false;
      // La phrase d'attente n'a plus lieu d'être : les chiffres sont là.
      var attente = document.getElementById('la-stats-attente');
      if (attente) attente.hidden = true;
    })
    .catch(function () {});
})();
