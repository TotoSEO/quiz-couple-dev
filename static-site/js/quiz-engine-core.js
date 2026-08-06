/**
 * Quiz Couple - Core Quiz Engine (vanilla JS)
 * Complete engine with specialized quiz types:
 * - SoloTest: toxic, divorce, mariage, ado (single player, points-based)
 * - DuoMatchQuiz: tester-couple, common-points (2 players + gender, match answers)
 * - DistanceQuiz: distance (2 players, alternating turns, 0/1/2 points per option)
 * - CoquinQuiz: coquin (guess & reveal mechanic, 30 rounds)
 * - KnowledgeQuiz: knowledge (oral validation with check/cross buttons)
 * - DebateQuiz: amoureux (1-5 scale debate mode, played together)
 * - FunnyQuiz: marrant (discussion-only, "Question suivante" button)
 * - MostQuiz: most (2-8 players, vote for one player per question)
 * - HealthyQuiz: couple-sain (weighted scoring a=3 b=2 c=1 d=0, 2 players + gender)
 */

var QuizEngine = (function() {
  'use strict';

  var SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';

  // ─── Translation helper ───────────────────────────────────
  var gdTranslations = null;
  var gdFrTranslations = null;
  var gamesTranslations = null;

  // Prefix aliases: non-FR languages use different prefix names for some quizzes
  var PREFIX_ALIASES = {
    'couple': 'testerC',
    'commonPoints': 'cp',
    'coquin': 'coquinQ',
    'marrant': 'funny'
  };

  // Préfixes déjà chargés, pour qu'une page à deux moteurs (le test de
  // jalousie en compte deux) ne retélécharge pas ce qu'elle a déjà.
  var gdPrefixesCharges = {};

  function _fusionne(cible, donnees) {
    for (var k in donnees) if (Object.prototype.hasOwnProperty.call(donnees, k)) cible[k] = donnees[k];
  }

  // Charge un préfixe isolé dans les deux langues utiles. Un fragment absent
  // n'est pas une erreur : selon la langue, c'est le préfixe ou son alias qui
  // existe (couple/testerC, commonPoints/cp), et certains n'existent que d'un
  // seul côté (healthy hors FR, zamours en FR). C'est le contrôle « aucune
  // question trouvée » côté chargeur qui décide du repli complet.
  function _chargeFragment(prefix, lang) {
    function tente(url) {
      return fetch(url).then(function(r) { return r.ok ? r.json() : {}; }).catch(function() { return {}; });
    }
    var att = [tente('/js/data/gd/' + prefix + '-' + lang + '.json')];
    att.push(lang === 'fr' ? Promise.resolve({}) : tente('/js/data/gd/' + prefix + '-fr.json'));
    return Promise.all(att);
  }

  function _chargeComplet(lang) {
    return fetch('/js/data/gd-' + lang + '.json')
      .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function(d) {
        gdTranslations = d;
        if (lang === 'fr') { gdFrTranslations = d; return null; }
        return fetch('/js/data/gd-fr.json').then(function(r) { return r.json(); })
          .then(function(fr) { gdFrTranslations = fr; });
      })
      .catch(function() {
        return fetch('/js/data/gd-fr.json').then(function(r) { return r.json(); })
          .then(function(d) { gdTranslations = d; gdFrTranslations = d; })
          .catch(function() {});
      });
  }

  // prefixes : liste facultative des préfixes de données dont l'appelant a
  // besoin. Fournie, seuls ces fragments sont téléchargés au lieu des ~300 Ko
  // du fichier complet. Absente ou en cas d'échec, on charge tout comme avant.
  function loadTranslations(lang, callback, prefixes) {
    function fini() { if (callback) callback(); }

    var jeux = fetch('/js/data/games-' + lang + '.json').then(function(r) { return r.json(); })
      .then(function(d) { gamesTranslations = d; })
      .catch(function() {
        return fetch('/js/data/games-fr.json').then(function(r) { return r.json(); })
          .then(function(d) { gamesTranslations = d; }).catch(function() {});
      });

    var gd;
    if (prefixes && prefixes.length) {
      var manquants = [];
      for (var i = 0; i < prefixes.length; i++) {
        if (prefixes[i] && !gdPrefixesCharges[prefixes[i] + '|' + lang]) manquants.push(prefixes[i]);
      }
      if (!manquants.length && gdTranslations) {
        gd = Promise.resolve();
      } else {
        if (!gdTranslations) { gdTranslations = {}; gdFrTranslations = gdFrTranslations || (lang === 'fr' ? gdTranslations : {}); }
        gd = Promise.all(manquants.map(function(p) {
          return _chargeFragment(p, lang).then(function(res) {
            _fusionne(gdTranslations, res[0]);
            if (lang === 'fr') _fusionne(gdFrTranslations, res[0]);
            else if (res[1]) _fusionne(gdFrTranslations, res[1]);
            gdPrefixesCharges[p + '|' + lang] = true;
          });
        })).catch(function() {
          // Un fragment manque : on revient au fichier complet, donc le
          // comportement est strictement celui d'avant le découpage.
          gdTranslations = null; gdFrTranslations = null;
          return _chargeComplet(lang);
        });
      }
    } else {
      gd = _chargeComplet(lang);
    }

    Promise.all([gd, jeux]).then(fini, fini);
  }

  // Repli explicite, utilisé quand les fragments chargés ne suffisent pas.
  function loadAllTranslations(lang, callback) {
    gdPrefixesCharges = {};
    _chargeComplet(lang).then(function() { if (callback) callback(); }, function() { if (callback) callback(); });
  }

  function _lookup(data, key) {
    if (!data) return undefined;
    var parts = key.split('.');
    var val = data;
    for (var i = 0; i < parts.length; i++) {
      if (!val || typeof val !== 'object') return undefined;
      val = val[parts[i]];
    }
    return (val !== undefined && val !== null) ? val : undefined;
  }

  function _tryAllPrefixes(data, prefix, rest) {
    var val = _lookup(data, prefix + '.' + rest);
    if (val !== undefined) return val;
    if (PREFIX_ALIASES[prefix]) {
      val = _lookup(data, PREFIX_ALIASES[prefix] + '.' + rest);
      if (val !== undefined) return val;
    }
    return undefined;
  }

  function tgd(key, fallback, nativeOnly) {
    // 1. Try current language (exact key)
    var val = _lookup(gdTranslations, key);
    if (val !== undefined) return val;

    var dotIdx = key.indexOf('.');
    if (dotIdx > 0) {
      var prefix = key.substring(0, dotIdx);
      var rest = key.substring(dotIdx + 1);

      // 2. Try alias prefix in current language
      if (PREFIX_ALIASES[prefix]) {
        val = _lookup(gdTranslations, PREFIX_ALIASES[prefix] + '.' + rest);
        if (val !== undefined) return val;
      }

      // 3. Try numeric variant for question keys: q{N} → {N}
      var numMatch = rest.match(/^q(\d+)$/);
      if (numMatch) {
        val = _tryAllPrefixes(gdTranslations, prefix, numMatch[1]);
        if (val !== undefined) return val;
      }

      // 4. Try option pattern variants: q{N}a → q{N}o0 or q{N}A
      var optMatch = rest.match(/^q(\d+)([a-e])$/);
      if (optMatch) {
        var qNum = optMatch[1];
        var letterIdx = optMatch[2].charCodeAt(0) - 97; // a=0, b=1, c=2, d=3, e=4
        // Try o-pattern: q{N}o{idx}
        val = _tryAllPrefixes(gdTranslations, prefix, 'q' + qNum + 'o' + letterIdx);
        if (val !== undefined) return val;
        // Try uppercase pattern: q{N}A/B/C/D
        val = _tryAllPrefixes(gdTranslations, prefix, 'q' + qNum + optMatch[2].toUpperCase());
        if (val !== undefined) return val;
      }
    }

    // 5. Fallback to FR (skipped when nativeOnly, used during option discovery
    //    so a non-FR quiz never inherits FR-only options it doesn't actually have,
    //    e.g. the FR distance quiz has 4 options where non-FR natively has 3)
    if (!nativeOnly) {
      val = _lookup(gdFrTranslations, key);
      if (val !== undefined) return val;
    }

    return (fallback !== undefined && fallback !== null) ? fallback : key;
  }

  function tg(key, fallback) {
    if (!gamesTranslations) return fallback || key;
    var parts = key.split('.');
    var val = gamesTranslations;
    for (var i = 0; i < parts.length; i++) {
      if (!val || typeof val !== 'object') return fallback || key;
      val = val[parts[i]];
    }
    return (val !== undefined && val !== null) ? val : (fallback || key);
  }

  // ─── Utility ──────────────────────────────────────────────
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ── Phase C : partage + avis par quiz + compteur (ecran de resultat 2 colonnes) ──
  function pcLabels(lang) {
    var M = {
      fr: { share: 'Partager', rate: 'Votre avis sur ce test en 1 clic', more: "Plus que votre / vos prénom(s), et c'est en ligne !", name: 'Votre prénom (ou vos prénoms)', comment: 'Un mot (optionnel)', submit: 'Publier mon avis', thanks: 'Merci ! Votre avis sera visible après validation.', err: 'Erreur, réessayez.', doneT: 'Ce test a déjà été réalisé {n} fois', doneQ: 'Ce quiz a déjà été joué {n} fois' },
      en: { share: 'Share', rate: 'Rate this test in one click', more: 'Just your first name(s), and it goes live!', name: 'Your first name(s)', comment: 'A word (optional)', submit: 'Post my review', thanks: 'Thanks! Your review will show after moderation.', err: 'Error, please retry.', doneT: 'This test has been taken {n} times', doneQ: 'This quiz has been played {n} times' },
      es: { share: 'Compartir', rate: 'Tu opinión en 1 clic', more: '¡Solo tu(s) nombre(s) y se publica!', name: 'Tu nombre (o nombres)', comment: 'Una palabra (opcional)', submit: 'Publicar mi opinión', thanks: '¡Gracias! Se verá tras la validación.', err: 'Error, inténtalo de nuevo.', doneT: 'Este test se ha realizado {n} veces', doneQ: 'Este quiz se ha jugado {n} veces' },
      de: { share: 'Teilen', rate: 'Bewertung mit 1 Klick', more: 'Nur noch dein(e) Vorname(n), dann ist sie online!', name: 'Dein Vorname (oder Vornamen)', comment: 'Ein Wort (optional)', submit: 'Bewertung veröffentlichen', thanks: 'Danke! Erscheint nach der Prüfung.', err: 'Fehler, bitte erneut.', doneT: 'Dieser Test wurde {n} mal gemacht', doneQ: 'Dieses Quiz wurde {n} mal gespielt' },
      it: { share: 'Condividi', rate: 'La tua opinione in 1 clic', more: 'Solo il tuo/i vostri nome(i) e va online!', name: 'Il tuo nome (o i vostri nomi)', comment: 'Una parola (facoltativo)', submit: 'Pubblica', thanks: 'Grazie! Sarà visibile dopo la moderazione.', err: 'Errore, riprova.', doneT: 'Questo test è stato fatto {n} volte', doneQ: 'Questo quiz è stato giocato {n} volte' }
    };
    return M[lang] || M.fr;
  }
  function pcConfig() {
    var c = document.getElementById('reviews-config'), pq = document.getElementById('pq-reviews');
    if (!c || !pq || !c.dataset.url || !c.dataset.key) return null;
    return { url: c.dataset.url, key: c.dataset.key, slug: pq.dataset.quizSlug };
  }
  function pcShare(title) {
    var url = location.href;
    if (navigator.share) { navigator.share({ title: title, url: url }).catch(function () {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(url); }
  }
  function pcReviewForm(lang) {
    var box = el('div', 'qr-review');
    var cfg = pcConfig(); var L = pcLabels(lang);
    if (!cfg || !cfg.slug) return box;
    var starsHtml = '';
    for (var s = 1; s <= 5; s++) starsHtml += '<button type="button" class="pqx-star-btn" data-star="' + s + '" aria-label="' + s + '"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></button>';
    box.innerHTML = '<p class="qr-review-title">' + esc(L.rate) + '</p><div class="pqx-input-stars">' + starsHtml + '</div>'
      + '<form class="pqx-form"><div class="pqx-more" hidden><p class="pqx-more-msg">' + esc(L.more) + '</p>'
      + '<input type="text" class="pqx-name input" maxlength="60" placeholder="' + esc(L.name) + '" autocomplete="off">'
      + '<textarea class="pqx-comment textarea" rows="2" maxlength="200" placeholder="' + esc(L.comment) + '"></textarea>'
      + '<button type="submit" class="pqx-submit btn btn-cta">' + esc(L.submit) + '</button>'
      + '<p class="pqx-msg" aria-live="polite"></p></div></form>';
    var rating = 0;
    var starBtns = box.querySelectorAll('.pqx-star-btn');
    var starsWrap = box.querySelector('.pqx-input-stars');
    var more = box.querySelector('.pqx-more');
    var nameI = box.querySelector('.pqx-name');
    function paint(n) { starBtns.forEach(function (x) { x.classList.toggle('on', +x.dataset.star <= n); }); }
    starBtns.forEach(function (b) {
      b.addEventListener('mouseenter', function () { paint(+b.dataset.star); });
      b.addEventListener('click', function () {
        rating = +b.dataset.star;
        paint(rating);
        b.classList.remove('just-picked');
        void b.offsetWidth;
        b.classList.add('just-picked');
        // Reveal du formulaire court : une seule etape percue
        if (more.hidden) { more.hidden = false; more.classList.add('pqx-more-reveal'); }
        if (nameI) setTimeout(function () { nameI.focus({ preventScroll: true }); }, 80);
      });
    });
    if (starsWrap) starsWrap.addEventListener('mouseleave', function () { paint(rating); });
    box.querySelector('.pqx-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = box.querySelector('.pqx-msg');
      var name = nameI ? nameI.value.trim() : '';
      if (!rating || !name) { if (msg) { msg.textContent = L.err; msg.className = 'pqx-msg err'; } return; }
      var sub = box.querySelector('.pqx-submit'); if (sub) sub.disabled = true;
      var body = { author_name: name.substring(0, 60), rating: rating, quiz_slug: cfg.slug, is_approved: false };
      var cm = box.querySelector('.pqx-comment').value.trim(); if (cm) body.comment = cm.substring(0, 200);
      fetch(cfg.url + '/rest/v1/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': cfg.key, 'Authorization': 'Bearer ' + cfg.key, 'Prefer': 'return=minimal' }, body: JSON.stringify(body) })
        .then(function (r) { if (r.ok || r.status === 201) { box.querySelector('.pqx-form').innerHTML = '<p class="pqx-thanks">' + esc(L.thanks) + '</p>'; } else throw new Error('x'); })
        .catch(function () { if (msg) { msg.textContent = L.err; msg.className = 'pqx-msg err'; } if (sub) sub.disabled = false; });
    });
    return box;
  }
  function pcFillCounter(node, lang) {
    var cfg = pcConfig(); if (!cfg || !cfg.slug || !node) return;
    var isQuiz = /^quiz/i.test(cfg.slug);
    fetch(cfg.url + '/rest/v1/rpc/get_quiz_counts', { method: 'POST', headers: { 'apikey': cfg.key, 'Authorization': 'Bearer ' + cfg.key, 'Content-Type': 'application/json' }, body: '{}' })
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        if (!Array.isArray(rows)) return;
        var row = rows.filter(function (x) { return x.quiz_slug === cfg.slug; })[0];
        var n = row ? +row.total : 0;
        if (n > 0) { var L = pcLabels(lang); node.textContent = (isQuiz ? L.doneQ : L.doneT).replace('{n}', n); node.style.display = ''; }
      })
      .catch(function () {});
  }

  function shuffleArray(arr) {
    var shuffled = arr.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = temp;
    }
    return shuffled;
  }

  // ── Motion / accessibility helpers ────────────────────────
  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function smoothScroll(node, block) {
    if (!node) return;
    try { node.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: block || 'center' }); }
    catch (e) { try { node.scrollIntoView(); } catch (_) {} }
  }

  // Stabilise la position d'une question a l'autre : on ramene le haut du quiz
  // juste sous l'en-tete fixe UNIQUEMENT s'il est passe trop haut (l'utilisateur
  // a scrolle pour cliquer une reponse basse). On ne "grab" jamais vers le bas :
  // une question plus longue ou plus courte ne fait donc pas sauter l'ecran.
  function anchorQuizTop() {
    if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') return;
    requestAnimationFrame(function () {
      var host = document.getElementById('quiz-engine');
      if (!host) return;
      var header = document.getElementById('site-header');
      var offset = (header ? header.offsetHeight : 0) + 16;
      var top = host.getBoundingClientRect().top;
      if (top < offset - 2) {
        var y = window.pageYOffset + top - offset;
        window.scrollTo(0, y < 0 ? 0 : y);
      }
    });
  }

  // Tween a percentage value 0→target inside an element (count-up effect)
  function animateCountUp(elemId, target) {
    var node = document.getElementById(elemId);
    if (!node) return;
    if (prefersReducedMotion()) { node.textContent = target + '%'; return; }
    var startTs = null, duration = 900;
    function step(ts) {
      if (startTs === null) startTs = ts;
      var t = Math.min((ts - startTs) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      node.textContent = Math.round(target * eased) + '%';
      if (t < 1) requestAnimationFrame(step); else node.textContent = target + '%';
    }
    requestAnimationFrame(step);
  }

  var _scoreRingSeq = 0;


  // ─── SVG Icons ────────────────────────────────────────────
  var ICONS = {
    heart: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    mapPin: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    flame: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-3.6 0-8-2.4-8-8.3C4 8.4 9.5 3.2 11.1 1.6c.3-.3.8-.3 1.1-.1.3.2.5.5.4.9-.3 2.2.5 3.7 1.6 5.4 1 1.5 2.1 3.2 2.4 5.7.4 3.4-1 6.5-4.6 6.5z"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    cross: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    plus: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    trash: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
    share: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
  };

  // ── Message de partage ────────────────────────────────────
  // Le partage ne doit jamais se resumer a l'URL : on compose une phrase qui
  // porte le score, le nom du quiz, le verdict obtenu et une invitation.
  //   { type: 'solo' | 'duo' | 'profil' | 'fun',
  //     score, total, pct, verdict }
  // L'emoji vient du quiz et jamais du score : sur les tests ou un score eleve
  // est un mauvais signe (toxique, PN, divorce), un 🎉 serait deplace.
  function nomDuQuiz() {
    var quizEl = document.getElementById('quiz-engine');
    var cle = quizEl ? quizEl.dataset.quiz : '';
    var fiche = null;
    for (var i = 0; i < ALL_QUIZZES_LIST.length; i++) {
      if (ALL_QUIZZES_LIST[i].key === cle) { fiche = ALL_QUIZZES_LIST[i]; break; }
    }
    var nom = '';
    if (fiche) nom = tg('quizNames.' + fiche.route, '');
    if (!nom || nom.indexOf('quizNames.') === 0) {
      var h1 = document.querySelector('h1');
      nom = h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : document.title;
    }
    return { nom: nom, emoji: fiche ? fiche.icon : '💜' };
  }

  function messagePartage(o) {
    o = o || {};
    var q = nomDuQuiz();
    var type = o.type || 'fun';
    var phrase;
    if (type === 'solo' && o.total) phrase = tg('share.soloScore', 'J\'ai obtenu {{score}}/{{total}} au {{quiz}}');
    else if (type === 'solo') phrase = tg('share.soloPct', 'J\'ai obtenu {{pct}} % au {{quiz}}');
    else if (type === 'cartes') phrase = tg('share.duoCartes', 'On a relevé {{score}} cartes sur {{total}} au {{quiz}}');
    else if (type === 'duo' && o.points) phrase = tg('share.duoPoints', 'On a marqué {{score}} points au {{quiz}}');
    else if (type === 'duo') phrase = tg('share.duoPct', 'On a obtenu {{pct}} % au {{quiz}}');
    else if (type === 'profil') phrase = tg('share.profil', 'J\'ai fait le {{quiz}}');
    else phrase = tg('share.fun', 'On vient de faire le {{quiz}}');

    phrase = phrase
      .replace(/\{\{quiz\}\}/g, q.nom)
      .replace(/\{\{score\}\}/g, o.score)
      .replace(/\{\{total\}\}/g, o.total)
      .replace(/\{\{pct\}\}/g, o.pct);

    if (o.verdict) {
      phrase += tg('share.verdict', ' : « {{result}} »').replace(/\{\{result\}\}/g, o.verdict);
    }

    var appel = type === 'solo' ? tg('share.ctaSolo', 'Et vous, vous en êtes où ? Faites le test 👉')
      : (type === 'duo' || type === 'cartes') ? tg('share.ctaDuo', 'Et vous, vous faites combien ? Essayez 👉')
      : type === 'profil' ? tg('share.ctaProfil', 'Et vous, quel est le vôtre ? 👉')
      : tg('share.ctaFun', 'À votre tour 👉');

    return q.emoji + ' ' + phrase + '\n' + appel + ' ' + location.href;
  }

  // ── Share result (Web Share API with copy fallback) ──
  // `partage` est soit l'objet decrit ci-dessus, soit une chaine deja prete.
  function renderShareButton(wrap, partage) {
    var shareRow = el('div', 'result-share-row mt-6');
    var btn = el('button', 'result-share-btn');
    var label = tg('result.shareYourResult', 'Partagez votre résultat !');
    btn.innerHTML = ICONS.share + '<span>' + esc(label) + '</span>';

    function flashCopied() {
      var original = btn.innerHTML;
      btn.classList.add('result-share-btn--copied');
      btn.innerHTML = ICONS.check + '<span>' + esc(tg('share.messageCopied', 'Message copié ! 💜')) + '</span>';
      setTimeout(function() {
        btn.innerHTML = original;
        btn.classList.remove('result-share-btn--copied');
      }, 2200);
    }
    function fallbackCopy(text) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.focus(); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        flashCopied();
      } catch (e) {}
    }

    btn.addEventListener('click', function() {
      // Le message contient deja l'URL. On ne passe donc pas `url` a
      // navigator.share : plusieurs applications ne retiennent que ce champ et
      // laissent tomber le texte, ce qui ne partageait qu'un lien nu.
      var texte = typeof partage === 'string' ? partage + '\n' + location.href : messagePartage(partage);
      if (navigator.share) {
        navigator.share({ title: tg('share.titre', 'Quiz Couple'), text: texte }).catch(function() {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texte).then(flashCopied).catch(function() { fallbackCopy(texte); });
      } else {
        fallbackCopy(texte);
      }
    });

    shareRow.appendChild(btn);
    wrap.appendChild(shareRow);
  }

  // ─── Common UI Components ─────────────────────────────────

  // Les gestionnaires de réponse neutralisent les options via pointer-events,
  // ce qui ne bloque que la souris : deux « Entrée » rapprochés au clavier
  // rejouaient le gestionnaire, comptaient le point en double et sautaient la
  // question suivante. Ce verrou expire de lui-même, il ne peut donc jamais
  // figer un moteur si un chemin de code sort par une branche imprévue.
  function answerLock(obj, ms) {
    var now = Date.now();
    if (obj.__answerLockUntil && now < obj.__answerLockUntil) return false;
    obj.__answerLockUntil = now + (ms || 600);
    return true;
  }

  function renderProgressBar(wrap, current, total, label) {
    var progress = Math.round((current / total) * 100);
    var progressWrap = el('div', 'quiz-progress-wrapper');
    var header = el('div', 'quiz-progress-header');
    header.innerHTML = '<span class="quiz-progress-label">' + esc(label || (tg('question.question', 'Question') + ' ' + (current + 1) + '/' + total)) + '</span><span class="quiz-progress-pct">' + progress + '%</span>';
    var barOuter = el('div', 'quiz-progress-bar');
    barOuter.setAttribute('role', 'progressbar');
    barOuter.setAttribute('aria-valuenow', String(progress));
    barOuter.setAttribute('aria-valuemin', '0');
    barOuter.setAttribute('aria-valuemax', '100');
    barOuter.setAttribute('aria-label', tg('question.question', 'Question') + ' ' + (current + 1) + '/' + total);
    var barInner = el('div', 'quiz-progress-fill');
    barInner.style.width = progress + '%';
    barOuter.appendChild(barInner);
    progressWrap.appendChild(header);
    progressWrap.appendChild(barOuter);
    wrap.appendChild(progressWrap);
    anchorQuizTop();
    return progressWrap;
  }

  // SVG gradient definition (injected once for score rings)
  function ensureScoreGradient() {
    if (document.getElementById('scoreGradientSvg')) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'scoreGradientSvg';
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.innerHTML = '<defs><linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="hsl(340, 65%, 65%)"/><stop offset="100%" stop-color="hsl(270, 40%, 70%)"/></linearGradient></defs>';
    document.body.appendChild(svg);
  }

  // celebrate : force ou interdit les confettis. Sans lui, le seuil fixe de
  // 70 % arrose de confettis des paliers que le verdict, lui, ne celebre pas.
  function renderScoreRing(pct, size, celebrate) {
    ensureScoreGradient();
    var circumference = 283; // 2 * PI * 45
    var offset = circumference - (circumference * pct / 100);
    var sizeClass = size === 'sm' ? ' score-ring-wrap--sm' : '';
    var confetti = '';
    if ((celebrate === undefined ? pct >= 70 : celebrate) && size !== 'sm') {
      var colors = ['#ec4899','#a855f7','#f59e0b','#22c55e','#3b82f6','#ef4444','#8b5cf6','#06b6d4'];
      for (var i = 0; i < 8; i++) {
        var angle = (i / 8) * Math.PI * 2;
        var tx = Math.round(Math.cos(angle) * 60);
        var ty = Math.round(Math.sin(angle) * 60);
        confetti += '<span class="confetti-dot" style="background:' + colors[i] + ';--tx:' + tx + 'px;--ty:' + ty + 'px;animation-delay:' + (0.1 * i) + 's"></span>';
      }
    }
    var valId = 'scoreRingVal' + (++_scoreRingSeq);
    var startVal = prefersReducedMotion() ? pct : 0;
    // Count the value up after it's in the DOM
    setTimeout(function() { animateCountUp(valId, pct); }, 80);
    return '<div class="score-ring-wrap' + sizeClass + '">' +
      (confetti ? '<div class="confetti-container" aria-hidden="true">' + confetti + '</div>' : '') +
      '<svg viewBox="0 0 100 100" class="score-ring" aria-hidden="true">' +
        '<circle cx="50" cy="50" r="45" class="score-ring-bg"/>' +
        '<circle cx="50" cy="50" r="45" class="score-ring-fill" style="stroke-dashoffset:' + offset + '"/>' +
      '</svg>' +
      '<span class="score-ring-value" id="' + valId + '">' + startVal + '%</span>' +
    '</div>';
  }

  function renderPlayerBadge(wrap, name, color) {
    var badge = el('div', 'text-center mb-4');
    var colorClass = color || 'badge-primary';
    badge.innerHTML = '<span class="badge ' + colorClass + '">' + esc(name) + '</span>';
    wrap.appendChild(badge);
    return badge;
  }

  // ─── Related quizzes data ────────────────────────────────
  // `key` = valeur de data-quiz sur la page, `route` = cle de traduction et de
  // slug. Cette liste sert au bloc « Poursuivez avec d'autres tests » et au nom
  // du quiz dans le message de partage : une page absente d'ici n'etait jamais
  // proposee ailleurs et partageait un nom vide.
  var ALL_QUIZZES_LIST = [
    { type: 'test', key: 'tester-couple', icon: '💕', route: 'testCouple' },
    { type: 'test', key: 'common-points', icon: '🎯', route: 'testCommonPoints' },
    { type: 'test', key: 'compatibilite', icon: '💘', route: 'testCompatibilite' },
    { type: 'test', key: 'suis-je-amoureux', icon: '💗', route: 'testSuisJeAmoureux' },
    { type: 'test', key: 'distance', icon: '🌍', route: 'testDistance' },
    { type: 'test', key: 'toxic', icon: '⚠️', route: 'testToxic' },
    { type: 'test', key: 'pervers', icon: '🎭', route: 'testPervers' },
    { type: 'test', key: 'amour-habitude', icon: '☕', route: 'testAmourHabitude' },
    { type: 'test', key: 'sain', icon: '💚', route: 'testCoupleSain' },
    { type: 'test', key: 'mariage', icon: '💒', route: 'testMariage' },
    { type: 'test', key: 'divorce', icon: '⚖️', route: 'testDivorce' },
    { type: 'test', key: 'parentalite', icon: '👶', route: 'testParentalite' },
    { type: 'test', key: 'emmenager', icon: '🏠', route: 'testEmmenager' },
    { type: 'test', key: 'bebe', icon: '🍼', route: 'testBebe' },
    { type: 'test', key: 'karmique', icon: '🔮', route: 'testKarmique' },
    { type: 'test', key: 'jalousie1', icon: '🫣', route: 'testJalousie' },
    { type: 'test', key: 'jalousie2', icon: '🫣', route: 'testJalousie' },
    { type: 'test', key: 'infidelite', icon: '💔', route: 'testInfidelite' },
    { type: 'test', key: 'langage-amour', icon: '💬', route: 'testLangageAmour' },
    { type: 'test', key: 'attachement', icon: '🔗', route: 'testAttachement' },
    { type: 'test', key: 'confiance', icon: '🤝', route: 'testConfiance' },
    { type: 'quiz', key: 'amoureux', icon: '❤️', route: 'quizAmoureux' },
    { type: 'quiz', key: 'coquin', icon: '🔥', route: 'quizCoquin' },
    { type: 'quiz', key: 'marrant', icon: '😂', route: 'quizMarrant' },
    { type: 'quiz', key: 'knowledge', icon: '🧠', route: 'quizKnowledge' },
    { type: 'quiz', key: 'most', icon: '🏆', route: 'quizMost' },
    { type: 'quiz', key: 'ado', icon: '🌟', route: 'quizAdo' },
    { type: 'quiz', key: 'genant', icon: '😳', route: 'quizGenant' },
    { type: 'quiz', key: 'vrai-faux', icon: '✅', route: 'quizVraiFaux' },
    { type: 'quiz', key: 'zamours', icon: '📺', route: 'zamours' },
    { type: 'quiz', key: 'tentation', icon: '🏝️', route: 'quizTentation' },
    // Les jeux forment leur propre categorie, distincte des quiz.
    { type: 'jeu', key: 'tu-preferes', icon: '🤔', route: 'quizTuPreferes' },
    { type: 'jeu', key: 'action-ou-verite', icon: '🎲', route: 'jeuActionVerite' },
    { type: 'jeu', key: 'action-ou-verite-coquin', icon: '🌶️', route: 'jeuActionVeriteHot' },
  ];

  function getRelatedQuizUrl(routeKey, lang) {
    // Build localized URL from ROUTE_SLUGS-like data embedded in page
    var slugEl = document.querySelector('[data-route-slugs]');
    if (slugEl) {
      try {
        var slugs = JSON.parse(slugEl.dataset.routeSlugs);
        var slug = slugs[routeKey] && slugs[routeKey][lang];
        if (slug) return lang === 'fr' ? '/' + slug + '/' : '/' + lang + '/' + slug + '/';
      } catch(e) {}
    }
    // Fallback: just go home
    return '/';
  }

  function renderRelatedQuizzes(wrap, currentQuizKey, lang) {
    var courant = null;
    for (var c = 0; c < ALL_QUIZZES_LIST.length; c++) {
      if (ALL_QUIZZES_LIST[c].key === currentQuizKey) { courant = ALL_QUIZZES_LIST[c].route; break; }
    }
    // On ecarte la page courante, les doublons de route (les deux tests de
    // jalousie) et les pages qui n'existent pas dans cette langue (Z'Amours).
    var vues = {};
    var others = ALL_QUIZZES_LIST.filter(function(q) {
      if (q.route === courant || vues[q.route]) return false;
      if (getRelatedQuizUrl(q.route, lang) === '/') return false;
      vues[q.route] = true;
      return true;
    });
    var shuffled = shuffleArray(others).slice(0, 3);
    if (shuffled.length === 0) return;

    var section = el('div', 'result-related-section mt-10');
    var title = el('p', 'text-lg font-bold text-center mb-6', tg('result.relatedTitle', 'Poursuivez avec d\'autres tests / quiz !'));
    section.appendChild(title);

    var grid = el('div', 'result-related-grid');
    for (var i = 0; i < shuffled.length; i++) {
      var q = shuffled[i];
      var card = el('a', 'result-related-card');
      card.href = getRelatedQuizUrl(q.route, lang);
      var emoji = el('span', 'result-related-emoji', q.icon);
      var name = el('span', 'result-related-name', esc(tg('quizNames.' + q.route, q.key)));
      var typeLabel = el('span', 'result-related-type',
        q.type === 'test' ? tg('result.typeTest', 'Test')
        : q.type === 'jeu' ? tg('result.typeJeu', 'Jeu')
        : tg('result.typeQuiz', 'Quiz'));
      card.appendChild(emoji);
      card.appendChild(name);
      card.appendChild(typeLabel);
      grid.appendChild(card);
    }
    section.appendChild(grid);
    wrap.appendChild(section);
  }

  // Finisseur d'ecran de resultat, commun a tous les types (sauf SoloTest qui
  // a sa propre mise en page) : transforme le resultat en 2 colonnes.
  //   gauche = le resultat deja construit + avis sur CE quiz
  //   droite = "Poursuivez avec d'autres tests / quiz"
  //   pied   = UN partage + actions (recommencer, autres questions, joueurs)
  function renderActionButtons(wrap, opts) {
    var quizEl = document.getElementById('quiz-engine');
    var currentKey = quizEl ? quizEl.dataset.quiz : '';
    var currentLang = quizEl ? (quizEl.dataset.lang || 'fr') : 'fr';

    // Colonne gauche : contenu deja dans wrap + formulaire d'avis
    var left = el('div', 'qr-col qr-left-wide quiz-reveal-enter');
    while (wrap.firstChild) left.appendChild(wrap.firstChild);
    left.appendChild(pcReviewForm(currentLang));

    // Colonne droite : Poursuivez
    var right = el('div', 'qr-col qr-right quiz-reveal-enter');
    renderRelatedQuizzes(right, currentKey, currentLang);

    // Pied : partage + actions
    var footer = el('div', 'qr-footer');
    renderShareButton(footer, opts.share || opts.shareText);
    var actions = el('div', 'result-actions-grid');
    var hasPool = quizEl && quizEl.dataset.hasPool === '1';
    if (opts.newQuestions && hasPool) {
      var newQBtn = el('button', 'result-action-btn result-action-btn--primary');
      newQBtn.innerHTML = '<span class="result-action-icon">🎲</span><span class="result-action-label">' + esc(tg('result.restartOtherQuestions', 'Autres questions')) + '</span>';
      newQBtn.addEventListener('click', opts.newQuestions);
      actions.appendChild(newQBtn);
    }
    if (opts.restart) {
      var restartBtn = el('button', 'result-action-btn');
      restartBtn.innerHTML = '<span class="result-action-icon">🔄</span><span class="result-action-label">' + esc(tg('result.restartFromBeginning', 'Recommencer')) + '</span>';
      restartBtn.addEventListener('click', opts.restart);
      actions.appendChild(restartBtn);
    }
    if (opts.changePlayers) {
      var changeBtn = el('button', 'result-action-btn');
      changeBtn.innerHTML = '<span class="result-action-icon">👥</span><span class="result-action-label">' + esc(tg('result.changePlayers', 'Changer de joueurs')) + '</span>';
      changeBtn.addEventListener('click', opts.changePlayers);
      actions.appendChild(changeBtn);
    }
    footer.appendChild(actions);

    wrap.classList.add('quiz-result-2col', 'qr-decorated');
    wrap.appendChild(left);
    wrap.appendChild(right);
    wrap.appendChild(footer);
  }

  function renderGenderButtons(container, selectedGender, onSelect) {
    var genderWrap = el('div', 'flex gap-2 mt-2');
    var maleLbl = tg('playerSetup.male', 'Homme');
    var femaleLbl = tg('playerSetup.female', 'Femme');
    var maleBtn = el('button', 'gender-btn' + (selectedGender === 'homme' ? ' gender-btn-selected gender-btn-male' : ''));
    maleBtn.innerHTML = '👨<span class="gender-label">' + esc(maleLbl) + '</span>';
    maleBtn.setAttribute('aria-label', maleLbl);
    maleBtn.addEventListener('click', function() { onSelect('homme'); });
    var femaleBtn = el('button', 'gender-btn' + (selectedGender === 'femme' ? ' gender-btn-selected gender-btn-female' : ''));
    femaleBtn.innerHTML = '👩<span class="gender-label">' + esc(femaleLbl) + '</span>';
    femaleBtn.setAttribute('aria-label', femaleLbl);
    femaleBtn.addEventListener('click', function() { onSelect('femme'); });
    genderWrap.appendChild(maleBtn);
    genderWrap.appendChild(femaleBtn);
    container.appendChild(genderWrap);
    return genderWrap;
  }

  function getPlayerColor(player, otherPlayer, playerIndex) {
    if (!player || !player.gender) return { bg: '#ec4899', text: '#fff' };
    var sameGender = player.gender === (otherPlayer && otherPlayer.gender);
    if (player.gender === 'femme') {
      if (sameGender) return playerIndex === 0 ? { bg: '#ec4899', text: '#fff' } : { bg: '#be185d', text: '#fff' };
      return { bg: '#ec4899', text: '#fff' };
    }
    if (sameGender) return playerIndex === 0 ? { bg: '#3b82f6', text: '#fff' } : { bg: '#3730a3', text: '#fff' };
    return { bg: '#3b82f6', text: '#fff' };
  }

  // ═══════════════════════════════════════════════════════════
  // SOLO TEST - toxic, divorce, mariage, ado
  // Single player, points-based scoring
  // ═══════════════════════════════════════════════════════════
  function SoloTest(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.labels = config.labels || {};
    this.quizType = config.quizType || 'solo';
    this.hasSkip = config.hasSkip || false;
    this.hasLocalStorage = config.hasLocalStorage || false;
    this.needsName = config.needsName || false;
    this.phase = 'intro';
    this.currentQ = 0;
    this.answers = [];
    this.totalScore = 0;
    this.skippedCount = 0;
    this.playerName = '';
    // Restore from localStorage if applicable
    if (this.hasLocalStorage) {
      try {
        var saved = JSON.parse(localStorage.getItem('quiz-' + this.prefix) || 'null');
        if (saved && saved.currentQ > 0 && saved.questionCount === this.questions.length) {
          this.currentQ = saved.currentQ;
          this.answers = saved.answers;
          this.totalScore = saved.totalScore;
          this.skippedCount = saved.skippedCount || 0;
          this.phase = saved.isComplete ? 'results' : 'playing';
        } else if (saved) {
          localStorage.removeItem('quiz-' + this.prefix);
        }
      } catch(e) {}
    }
    this.render();
  }

  SoloTest.prototype.saveState = function() {
    if (!this.hasLocalStorage) return;
    try {
      localStorage.setItem('quiz-' + this.prefix, JSON.stringify({
        currentQ: this.currentQ, answers: this.answers,
        totalScore: this.totalScore, skippedCount: this.skippedCount,
        isComplete: this.phase === 'results',
        questionCount: this.questions.length
      }));
    } catch(e) {}
  };

  SoloTest.prototype.render = function() {
    this.container.innerHTML = '';
    document.body.classList.remove('quiz-has-result');
    if (this.phase === 'intro') this.renderIntro();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  SoloTest.prototype.renderIntro = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');

    var icon = el('div', 'text-5xl mb-4', this.labels.icon || '📝');
    var title = el('h2', 'text-2xl font-bold mb-3', tg('playerSetup.readyForTest', 'Prêt pour le test ?'));
    var desc = el('p', 'text-muted-foreground mb-2', this.questions.length + ' ' + tg('meta.questionsWord', 'questions'));
    var time = el('p', 'text-sm text-muted-foreground mb-6', '⏱ ' + tg('meta.duration', '5 min'));

    wrap.appendChild(icon);
    wrap.appendChild(title);
    wrap.appendChild(desc);
    wrap.appendChild(time);

    // Special toxic quiz intro
    if (this.quizType === 'toxic') {
      var introBox = el('div', 'glass-card rounded-xl p-5 mb-6 max-w-md mx-auto text-left');
      introBox.innerHTML = '<p class="text-sm text-muted-foreground mb-2">' + esc(tg('toxic.introQuestion', 'Vous vous posez la question :')) + '</p>' +
        '<p class="font-semibold text-foreground mb-3 italic">' + esc(tg('toxic.introQuote', '« Est-ce que mon couple est toxique… ou est-ce que je dramatise ? »')) + '</p>' +
        '<p class="text-sm text-muted-foreground">' + esc(tg('toxic.disclaimer', 'Ce test n\'est ni un diagnostic médical, ni un jugement.')) + '</p>';
      wrap.appendChild(introBox);
    }

    // Special pervers narcissique quiz intro (sensitive topic — reassure + disclaimer)
    if (this.quizType === 'pervers') {
      var pnBox = el('div', 'glass-card rounded-xl p-5 mb-6 max-w-md mx-auto text-left');
      pnBox.innerHTML = '<p class="text-sm text-muted-foreground mb-2">' + esc(tg('pervers.introQuestion', 'Vous vous posez la question :')) + '</p>' +
        '<p class="font-semibold text-foreground mb-3 italic">' + esc(tg('pervers.introQuote', '« Est-ce que je vis avec un pervers narcissique… ou est-ce que j\'exagère ? »')) + '</p>' +
        '<p class="text-sm text-muted-foreground">' + esc(tg('pervers.disclaimer', 'Ce test n\'est ni un diagnostic, ni un jugement. C\'est un outil de réflexion pour mettre des mots sur ce que vous vivez.')) + '</p>';
      wrap.appendChild(pnBox);
    }

    // Special divorce quiz intro
    if (this.quizType === 'divorce') {
      var disclaimerBox = el('div', 'glass-card rounded-xl p-5 mb-6 max-w-md mx-auto text-left');
      disclaimerBox.innerHTML = '<p class="text-sm text-muted-foreground">💡 ' + esc(tg('divorce.disclaimer', 'Ce test est un outil de réflexion personnel. Il ne remplace en aucun cas l\'avis d\'un professionnel.')) + '</p>';
      wrap.appendChild(disclaimerBox);
    }

    // Name input for ado quiz
    var nameInput = null;
    if (this.needsName) {
      var nameWrap = el('div', 'max-w-sm mx-auto mb-6');
      var nameLabel = el('label', 'block text-sm font-medium text-foreground mb-2');
      nameLabel.textContent = tg('ui.yourName', 'Prénom de ton/ta partenaire');
      nameInput = el('input', 'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-center text-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none');
      nameInput.type = 'text';
      nameInput.placeholder = tg('ui.namePlaceholder', 'Ex : Lucas');
      nameInput.maxLength = 30;
      nameWrap.appendChild(nameLabel);
      nameWrap.appendChild(nameInput);
      wrap.appendChild(nameWrap);
    }

    var startLabel = this.labels.start || tg('playerSetup.startTest', 'Commencer le test');
    var btn = el('button', 'btn btn-cta btn-lg', esc(startLabel));
    btn.addEventListener('click', function() {
      if (self.needsName && nameInput) {
        var name = nameInput.value.trim();
        if (!name) {
          nameInput.style.borderColor = '#ef4444';
          nameInput.focus();
          return;
        }
        self.playerName = name;
      }
      self.phase = 'playing';
      self.currentQ = 0;
      self.answers = [];
      self.totalScore = 0;
      self.skippedCount = 0;
      self.render();
    });

    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  SoloTest.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;

    var wrap = el('div', 'quiz-engine quiz-question-enter');

    // Progress bar
    renderProgressBar(wrap, this.currentQ, total);

    // Question text
    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    // Replace {{name}} placeholder
    if (this.playerName) qText = qText.replace(/\{\{name\}\}/g, this.playerName);
    var qEl = el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText));
    wrap.appendChild(qEl);

    // Remark/reassurance (divorce quiz)
    var remarkKey = this.prefix + '.q' + q.id + '_r';
    var remarkText = tgd(remarkKey, null);
    if (remarkText && remarkText !== remarkKey) {
      var remark = el('div', 'text-sm text-muted-foreground bg-secondary/10 border border-secondary/20 rounded-lg p-4 mb-6');
      remark.innerHTML = '💡 ' + esc(remarkText);
      wrap.appendChild(remark);
    }

    // Options
    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        if (!answerLock(self)) return;
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }

        self.answers[self.currentQ] = opt.points || 0;
        self.totalScore = self.answers.reduce(function(s, v) { return s + (typeof v === 'number' ? v : 0); }, 0);
        // Divorce: check conditional Q11 (Q10 answer 'b' = has children)
        if (self.quizType === 'divorce' && q.id === 10) {
          self.hasChildren = (opt.id === 'b');
        }
        self.saveState();
        setTimeout(function() {
          if (self.currentQ < total - 1) { self.currentQ++; self.render(); }
          else { self.phase = 'results'; self.saveState(); self.render(); }
        }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);

    // Navigation: Back + Skip buttons
    var navWrap = el('div', 'flex justify-between items-center mt-6');
    if (this.currentQ > 0) {
      var backBtn = el('button', 'btn btn-ghost text-sm', '&larr; ' + tg('question.previousQuestion', 'Précédent'));
      backBtn.addEventListener('click', function() {
        self.currentQ--;
        var prevAnswer = self.answers[self.currentQ];
        if (prevAnswer === 'skip') self.skippedCount--;
        if (typeof prevAnswer === 'number') self.totalScore -= prevAnswer;
        delete self.answers[self.currentQ];
        self.saveState();
        self.render();
      });
      navWrap.appendChild(backBtn);
    } else {
      navWrap.appendChild(el('div'));
    }

    if (this.hasSkip) {
      var skipBtn = el('button', 'btn btn-ghost text-sm text-muted-foreground', tg('question.skipQuestion', 'Passer cette question') + ' →');
      skipBtn.addEventListener('click', function() {
        self.answers[self.currentQ] = 'skip';
        self.skippedCount++;
        self.saveState();
        if (self.currentQ < total - 1) { self.currentQ++; self.render(); }
        else { self.phase = 'results'; self.saveState(); self.render(); }
      });
      navWrap.appendChild(skipBtn);
    }

    wrap.appendChild(navWrap);
    this.container.appendChild(wrap);
  };

  SoloTest.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card quiz-result-2col');
    var result = null;
    for (var i = 0; i < this.results.length; i++) {
      var r = this.results[i];
      if (this.totalScore >= r.min && this.totalScore <= r.max) { result = r; break; }
    }
    if (!result && this.results.length > 0) result = this.results[this.results.length - 1];

    var maxScore = this.results.length > 0 ? this.results[this.results.length - 1].max : 100;
    var pct = Math.round((this.totalScore / maxScore) * 100);

    var quizEl = document.getElementById('quiz-engine');

    // ── Colonne GAUCHE : score + avis sur CE test ──
    var left = el('div', 'qr-col qr-left quiz-reveal-enter');
    var scoreDiv = el('div', 'qr-score');
    scoreDiv.innerHTML = renderScoreRing(pct);
    left.appendChild(scoreDiv);
    left.appendChild(el('p', 'qr-score-label', this.totalScore + '/' + maxScore + ' ' + esc(tg('meta.pointsWord', 'points'))));
    left.appendChild(pcReviewForm(this.lang));

    // ── Colonne DROITE : explication / conseil + Poursuivez ──
    var right = el('div', 'qr-col qr-right quiz-reveal-enter');
    if (result) {
      right.appendChild(el('h3', 'qr-title', esc(result.title)));
      right.appendChild(el('p', 'qr-desc', result.description));
      if (result.advice) {
        var advice = el('div', 'qr-advice');
        advice.innerHTML = '<strong>' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(result.advice);
        right.appendChild(advice);
      }
    }
    renderRelatedQuizzes(right, quizEl ? quizEl.dataset.quiz : '', quizEl ? (quizEl.dataset.lang || 'fr') : 'fr');

    // ── Pied pleine largeur : UN partage + recommencer ──
    var footer = el('div', 'qr-footer');
    renderShareButton(footer, { type: 'solo', score: this.totalScore, total: maxScore, pct: pct, verdict: result ? result.title : '' });
    var restartBtn = el('button', 'result-action-btn');
    restartBtn.innerHTML = '<span class="result-action-icon">🔄</span><span class="result-action-label">' + esc(tg('result.restartFromBeginning', 'Recommencer')) + '</span>';
    restartBtn.addEventListener('click', function() { if (self.hasLocalStorage) { try { localStorage.removeItem('quiz-' + self.prefix); } catch(e) {} } self.phase = 'intro'; self.render(); });
    footer.appendChild(restartBtn);

    wrap.appendChild(left);
    wrap.appendChild(right);
    wrap.appendChild(footer);
    this.container.appendChild(wrap);
    document.body.classList.add('quiz-has-result');
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // DUO MATCH QUIZ - tester-couple, common-points
  // 2 players (optionally with gender), answer matching
  // ═══════════════════════════════════════════════════════════
  function DuoMatchQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.needsGender = config.needsGender || false;
    this.useScoring = config.useScoring || false;
    this.setupTitle = config.setupTitle || '';
    this.setupDesc = config.setupDesc || '';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.currentPlayer = 0;
    this.answers = { p1: [], p2: [] };
    this.render();
  }

  DuoMatchQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'handoff') this.renderHandoff();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  DuoMatchQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');

    // Icon in gradient circle
    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-6');
    iconWrap.innerHTML = ICONS.users;
    wrap.appendChild(iconWrap);

    var title = el('h2', 'text-2xl font-bold mb-3 text-center', this.setupTitle || tg('playerSetup.readyToPlay', 'Prêts à jouer ensemble ?'));
    var desc = el('p', 'text-muted-foreground mb-8 text-center', this.setupDesc || tg('playerSetup.enterNames', 'Entrez vos prénoms et commencez le quiz à deux !'));

    var form = el('div', 'quiz-setup-grid max-w-lg mx-auto');

    var genders = ['', ''];

    function createPlayerCard(idx) {
      var card = el('div', 'quiz-player-card');
      var numCircle = el('div', 'quiz-player-number');
      numCircle.textContent = (idx + 1);
      card.appendChild(numCircle);
      var label = el('label', 'block text-sm font-semibold mb-2 text-center', tg('playerSetup.player' + (idx + 1), 'Joueur ' + (idx + 1)));
      var input = el('input', 'input w-full');
      input.type = 'text';
      input.placeholder = tg('playerSetup.firstName', 'Prénom');
      input.maxLength = 20;
      input.id = 'player-input-' + idx;
      card.appendChild(label);
      card.appendChild(input);

      if (self.needsGender) {
        var gLabel = el('label', 'block text-sm font-semibold mt-4 mb-2 text-center', tg('playerSetup.gender', 'Genre'));
        card.appendChild(gLabel);
        var gWrap = el('div', 'flex gap-3 justify-center');
        var maleLabel = tg('playerSetup.male', 'Homme');
        var femaleLabel = tg('playerSetup.female', 'Femme');
        var maleBtn = el('button', 'gender-btn', '👨<span class="gender-label">' + esc(maleLabel) + '</span>');
        maleBtn.setAttribute('aria-label', maleLabel);
        var femaleBtn = el('button', 'gender-btn', '👩<span class="gender-label">' + esc(femaleLabel) + '</span>');
        femaleBtn.setAttribute('aria-label', femaleLabel);
        maleBtn.addEventListener('click', function() {
          genders[idx] = 'homme';
          maleBtn.className = 'gender-btn gender-btn-selected gender-btn-male';
          femaleBtn.className = 'gender-btn';
        });
        femaleBtn.addEventListener('click', function() {
          genders[idx] = 'femme';
          femaleBtn.className = 'gender-btn gender-btn-selected gender-btn-female';
          maleBtn.className = 'gender-btn';
        });
        gWrap.appendChild(maleBtn);
        gWrap.appendChild(femaleBtn);
        card.appendChild(gWrap);
      }
      return card;
    }

    form.appendChild(createPlayerCard(0));
    form.appendChild(createPlayerCard(1));

    var info = el('div', 'quiz-setup-meta', '📝 ' + this.questions.length + ' questions &bull; ⏱ ' + tg('meta.duration', '5 min'));

    var startBtn = el('button', 'btn btn-cta btn-gradient quiz-setup-start-btn', tg('playerSetup.startQuiz', 'Commencer le quiz'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('player-input-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('player-input-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [
        { name: n1, gender: genders[0] || null },
        { name: n2, gender: genders[1] || null }
      ];
      self.phase = 'handoff';
      self.currentQ = 0;
      self.currentPlayer = 0;
      var total = self.questions.length;
      self.answers = { p1: new Array(total).fill(null), p2: new Array(total).fill(null) };
      self.render();
    });

    wrap.appendChild(title);
    wrap.appendChild(desc);
    wrap.appendChild(form);
    wrap.appendChild(info);
    wrap.appendChild(startBtn);
    this.container.appendChild(wrap);
  };

  DuoMatchQuiz.prototype.renderHandoff = function() {
    var self = this;
    var player = this.players[this.currentPlayer];
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');

    var icon = el('div', 'text-5xl mb-4', '📱');
    var title = el('h2', 'text-xl font-bold mb-3');
    title.textContent = tg('question.itsTurnOf', 'C\'est au tour de') + ' ' + player.name + ' !';
    var desc = el('p', 'text-muted-foreground mb-6', tg('question.passPhoneOrLookAway', 'Passez le téléphone ou détournez le regard'));

    var btn = el('button', 'btn btn-cta', tg('question.chooseAnswer', 'Choisir ma réponse'));
    btn.addEventListener('click', function() { self.phase = 'playing'; self.render(); });

    wrap.appendChild(icon);
    wrap.appendChild(title);
    wrap.appendChild(desc);
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  DuoMatchQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var totalNeeded = total * 2;
    var answered = this.answers.p1.filter(function(a) { return a !== null; }).length + this.answers.p2.filter(function(a) { return a !== null; }).length;
    var player = this.players[this.currentPlayer];
    var color = this.needsGender ? getPlayerColor(player, this.players[this.currentPlayer === 0 ? 1 : 0], this.currentPlayer) : null;

    var wrap = el('div', 'quiz-engine quiz-question-enter');

    renderProgressBar(wrap, answered, totalNeeded, tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + total);

    // Player indicator with color
    var badge = el('div', 'text-center mb-4');
    if (color) {
      badge.innerHTML = '<span class="badge" style="background:' + color.bg + ';color:' + color.text + '">' + esc(player.name) + '</span>';
    } else {
      badge.innerHTML = '<span class="badge badge-primary">' + esc(player.name) + '</span>';
    }
    wrap.appendChild(badge);

    // Question
    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText)));

    // Options
    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        if (!answerLock(self)) return;
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }
        setTimeout(function() {
          if (self.currentPlayer === 0) {
            self.answers.p1[self.currentQ] = opt.id;
            self.currentPlayer = 1;
            self.phase = 'handoff';
          } else {
            self.answers.p2[self.currentQ] = opt.id;
            if (self.currentQ < total - 1) {
              self.currentQ++;
              self.currentPlayer = 0;
              self.phase = 'handoff';
            } else {
              self.phase = 'results';
            }
          }
          self.render();
        }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);
    this.container.appendChild(wrap);
  };

  // Bandes de niveau de couple (fallback FR ; surcharge via games-*.json → result.coupleLevel)
  var COUPLE_LEVEL_FALLBACK = {
    heading: 'Niveau de votre couple',
    yourScore: 'Score de {name}',
    globalScore: 'Score du couple',
    bands: [
      { min: 0, max: 39, tag: 'Fragile', title: 'Un couple à protéger', desc: "Plusieurs fondations (communication, confiance, projets communs) demandent de l'attention. Rien n'est perdu : ce sont justement les sujets à ouvrir ensemble, sans se juger." },
      { min: 40, max: 59, tag: 'À consolider', title: 'Une belle base à renforcer', desc: "Votre couple tient sur de vraies fondations, avec quelques zones à muscler. Identifiez les points où vos réponses divergent, ce sont vos prochains chantiers à deux." },
      { min: 60, max: 79, tag: 'Solide', title: 'Un couple solide', desc: "Vous avez construit une relation stable et équilibrée. Continuez à entretenir ce qui marche et à parler de ce qui coince avant que ça ne s'installe." },
      { min: 80, max: 100, tag: 'Très solide', title: 'Un couple très solide', desc: "Communication, confiance et complicité sont au rendez-vous. Une base rare et précieuse : cultivez-la, elle vous portera loin." }
    ]
  };

  DuoMatchQuiz.prototype.renderResults = function() {
    if (this.useScoring) { return this.renderScoringResults(); }
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var total = this.questions.length;
    var matchCount = 0;
    for (var i = 0; i < total; i++) {
      if (this.answers.p1[i] && this.answers.p2[i] && this.answers.p1[i] === this.answers.p2[i]) matchCount++;
    }
    var pct = Math.round((matchCount / total) * 100);

    var result = null;
    for (var j = 0; j < this.results.length; j++) {
      var r = this.results[j];
      if (matchCount >= (r.minScore || r.min || 0) && matchCount <= (r.maxScore || r.max || 999)) { result = r; break; }
    }

    // Self-contained, centered "hero" so the result stays centered and styled
    // once renderActionButtons moves it into the 2-column results layout.
    // Le palier visuel suit le verdict retenu, pas un seuil de pourcentage
    // parallele : les deux grilles ne coincidaient pas et un score de 7/20
    // (35 %) affichait un titre positif sous l'emoji dubitatif du palier bas.
    var ri = result ? this.results.indexOf(result) : -1;
    var tier = ri < 0
      ? (pct >= 70 ? 'high' : pct >= 40 ? 'mid' : 'low')
      : (ri >= this.results.length - 1 ? 'high' : ri === 0 ? 'low' : 'mid');
    var hero = el('div', 'duo-result-hero duo-result-hero--' + tier);
    hero.appendChild(el('div', 'duo-result-emoji', tier === 'high' ? '🎉' : tier === 'mid' ? '😊' : '🤔'));
    var ringWrap = el('div', 'duo-result-ring');
    ringWrap.innerHTML = renderScoreRing(pct, null, tier === 'high');
    hero.appendChild(ringWrap);
    hero.appendChild(el('div', 'duo-result-match', matchCount + '/' + total + ' ' + tg('result.identicalAnswers', 'réponses identiques')));
    if (result) {
      hero.appendChild(el('h3', 'duo-result-title', esc(result.title || '')));
      if (result.description) hero.appendChild(el('p', 'duo-result-desc', result.description));
    }
    wrap.appendChild(hero);
    if (result && result.advice) {
      var advice = el('div', 'duo-result-advice');
      advice.innerHTML = '<strong>' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(result.advice);
      wrap.appendChild(advice);
    }

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: pct, verdict: result ? result.title : '' },
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });

    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // Resultat scoring (tester-couple) : score par joueur + score global, 3 blocs.
  DuoMatchQuiz.prototype.renderScoringResults = function() {
    var self = this;
    var total = this.questions.length;

    function ptsFor(qi, optId) {
      var opts = self.questions[qi].options || [];
      for (var k = 0; k < opts.length; k++) { if (opts[k].id === optId) return (opts[k].points || 0); }
      return 0;
    }
    var scoreA = 0, scoreB = 0, maxTotal = 0;
    for (var i = 0; i < total; i++) {
      var opts = this.questions[i].options || [];
      var qMax = 0;
      for (var k = 0; k < opts.length; k++) { if ((opts[k].points || 0) > qMax) qMax = opts[k].points || 0; }
      maxTotal += qMax;
      scoreA += ptsFor(i, this.answers.p1[i]);
      scoreB += ptsFor(i, this.answers.p2[i]);
    }
    if (maxTotal <= 0) maxTotal = 1;
    var pctA = Math.round(scoreA / maxTotal * 100);
    var pctB = Math.round(scoreB / maxTotal * 100);
    var pctG = Math.round((scoreA + scoreB) / (2 * maxTotal) * 100);

    var cl = tg('coupleLevel', null);
    if (!cl || !cl.bands || !cl.bands.length) cl = COUPLE_LEVEL_FALLBACK;
    function bandFor(pct) {
      for (var j = 0; j < cl.bands.length; j++) { if (pct >= cl.bands[j].min && pct <= cl.bands[j].max) return cl.bands[j]; }
      return cl.bands[cl.bands.length - 1];
    }
    var bG = bandFor(pctG), bA = bandFor(pctA), bB = bandFor(pctB);
    var nameA = (this.players[0] && this.players[0].name) || tg('playerSetup.player1', 'Joueur 1');
    var nameB = (this.players[1] && this.players[1].name) || tg('playerSetup.player2', 'Joueur 2');
    var colorA = this.needsGender ? getPlayerColor(this.players[0], this.players[1], 0) : null;
    var colorB = this.needsGender ? getPlayerColor(this.players[1], this.players[0], 1) : null;

    var wrap = el('div', 'quiz-engine quiz-result-card');
    var box = el('div', 'duo-score');

    // Bloc verdict global (commun)
    var verdict = el('div', 'duo-verdict');
    verdict.appendChild(el('p', 'duo-verdict-label', esc(cl.heading || 'Niveau de votre couple')));
    var gRing = el('div', 'duo-verdict-ring');
    gRing.innerHTML = renderScoreRing(pctG);
    verdict.appendChild(gRing);
    verdict.appendChild(el('span', 'duo-tag duo-tag--global', esc(bG.tag || '')));
    verdict.appendChild(el('h3', 'duo-verdict-title', esc(bG.title || '')));
    verdict.appendChild(el('p', 'duo-verdict-desc', bG.desc || ''));
    box.appendChild(verdict);

    // Bloc scores individuels
    var indivHead = el('p', 'duo-indiv-head', esc(tg('result.discoverScores', 'Découvrez vos scores individuels')));
    box.appendChild(indivHead);
    var row = el('div', 'duo-players-scores');
    function playerCard(name, pct, band, color) {
      var card = el('div', 'duo-pcard');
      var nm = el('span', 'duo-pcard-name', esc(name));
      if (color) nm.style.color = color.bg;
      card.appendChild(nm);
      var r = el('div', 'duo-pcard-ring');
      r.innerHTML = renderScoreRing(pct, 'sm');
      card.appendChild(r);
      card.appendChild(el('span', 'duo-tag', esc(band.tag || '')));
      return card;
    }
    row.appendChild(playerCard(nameA, pctA, bA, colorA));
    row.appendChild(playerCard(nameB, pctB, bB, colorB));
    box.appendChild(row);

    wrap.appendChild(box);

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: pctG, verdict: (bG && bG.title) || '' },
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });

    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // DISTANCE QUIZ - 2 players, alternating turns, 0/1/2 points
  // ═══════════════════════════════════════════════════════════
  function DistanceQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.currentPlayer = 0;
    this.p1Score = 0;
    this.p2Score = 0;
    // Compute real max from actual question points
    var realMax = 0;
    for (var i = 0; i < this.questions.length; i++) {
      var qMax = 0;
      for (var j = 0; j < this.questions[i].options.length; j++) {
        if (this.questions[i].options[j].points > qMax) qMax = this.questions[i].options[j].points;
      }
      realMax += qMax;
    }
    this.maxScorePerPlayer = realMax;
    this.render();
  }

  DistanceQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'privacy') this.renderPrivacy();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  DistanceQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-4');
    iconWrap.innerHTML = ICONS.mapPin;
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('playerSetup.readyForTest', 'Prêts pour le test ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6 text-center', tg('playerSetup.discoverCompatibility', 'Découvrez si vous êtes faits pour la distance')));

    var form = el('div', 'space-y-4 max-w-md mx-auto');

    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'glass-card rounded-xl p-4');
        var labelWrap = el('div', 'flex items-center gap-2 mb-2');
        var heartSpan = el('span', idx === 0 ? 'text-pink-500' : 'text-blue-500');
        heartSpan.innerHTML = ICONS.heart;
        labelWrap.appendChild(heartSpan);
        labelWrap.appendChild(el('span', 'text-sm font-medium', tg('playerSetup.player' + (idx + 1), 'Joueur ' + (idx + 1))));
        card.appendChild(labelWrap);
        var input = el('input', 'input w-full');
        input.type = 'text';
        input.placeholder = tg('playerSetup.firstName', 'Prénom');
        input.maxLength = 20;
        input.id = 'distance-player-' + idx;
        card.appendChild(input);
        form.appendChild(card);
      })(i);
    }

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-4', tg('playerSetup.startTest', 'Commencer le test'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('distance-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('distance-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.currentQ = 0; self.currentPlayer = 0; self.p1Score = 0; self.p2Score = 0;
      self.phase = 'privacy'; self.render();
    });
    form.appendChild(startBtn);
    wrap.appendChild(form);
    this.container.appendChild(wrap);
  };

  DistanceQuiz.prototype.renderPrivacy = function() {
    var self = this;
    var player = this.players[this.currentPlayer];
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '🔒'));
    wrap.appendChild(el('h2', 'text-xl font-bold mb-3', tg('question.itsTurnOf', 'C\'est au tour de') + ' ' + esc(player.name) + ' !'));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6', tg('question.passPhoneOrLookAway', 'Passez le téléphone ou détournez le regard')));

    var btn = el('button', 'btn btn-cta', tg('question.chooseAnswer', 'Répondre'));
    btn.addEventListener('click', function() { self.phase = 'playing'; self.render(); });
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  DistanceQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var totalAnswers = total * 2;
    var currentAnswerNum = this.currentQ * 2 + this.currentPlayer;
    var player = this.players[this.currentPlayer];

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, currentAnswerNum, totalAnswers, tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + total);
    renderPlayerBadge(wrap, player.name, this.currentPlayer === 0 ? 'badge-pink' : 'badge-blue');

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText)));

    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        if (!answerLock(self)) return;
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }
        var points = opt.points || 0;
        if (self.currentPlayer === 0) self.p1Score += points;
        else self.p2Score += points;

        setTimeout(function() {
          if (self.currentPlayer === 0) {
            self.currentPlayer = 1;
            self.phase = 'privacy';
          } else {
            if (self.currentQ < total - 1) {
              self.currentQ++;
              self.currentPlayer = 0;
              self.phase = 'privacy';
            } else {
              self.phase = 'results';
            }
          }
          self.render();
        }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);
    this.container.appendChild(wrap);
  };

  DistanceQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card');

    wrap.appendChild(el('h2', 'text-2xl font-bold text-center mb-6', tg('result.quizResults', 'Résultats du quiz')));

    // Individual scores
    var scoresGrid = el('div', 'grid grid-cols-2 gap-4 mb-6');
    for (var i = 0; i < 2; i++) {
      var score = i === 0 ? this.p1Score : this.p2Score;
      var pct = Math.round((score / this.maxScorePerPlayer) * 100);
      var scorePct = score / self.maxScorePerPlayer;
      var vKey = scorePct >= 0.8 ? 'h' : scorePct >= 0.6 ? 'm' : scorePct >= 0.4 ? 'l' : 'vl';
      var verdict = tgd(this.prefix + '.pv_' + vKey, '');
      verdict = verdict.replace('{{name}}', this.players[i].name);

      var card = el('div', 'glass-card rounded-xl p-4 text-center');
      card.appendChild(el('p', 'font-semibold mb-2', esc(this.players[i].name)));
      var ringDiv = el('div', '');
      ringDiv.innerHTML = renderScoreRing(pct, 'sm');
      card.appendChild(ringDiv);
      card.appendChild(el('p', 'text-xs text-muted-foreground', score + '/' + this.maxScorePerPlayer));
      if (verdict) card.appendChild(el('p', 'text-sm mt-2', esc(verdict)));
      scoresGrid.appendChild(card);
    }
    wrap.appendChild(scoresGrid);

    // Couple verdict
    var avg = (this.p1Score + this.p2Score) / 2;
    var avgPct = avg / this.maxScorePerPlayer;
    var cvKey = avgPct >= 0.7 ? 'h' : avgPct >= 0.5 ? 'm' : avgPct >= 0.3 ? 'l' : 'vl';
    var coupleVerdict = tgd(this.prefix + '.cv_' + cvKey, '');
    if (coupleVerdict) {
      var cvBox = el('div', 'glass-card rounded-xl p-5 text-center mb-4');
      cvBox.appendChild(el('h3', 'font-bold mb-2', tg('result.coupleVerdict', 'Verdict du couple')));
      cvBox.appendChild(el('p', 'text-muted-foreground', esc(coupleVerdict)));
      wrap.appendChild(cvBox);
    }

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: Math.round(((this.p1Score + this.p2Score) / (this.maxScorePerPlayer * 2)) * 100) },
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // COQUIN QUIZ - Guess & Reveal mechanic
  // Player A guesses what Player B would answer, then B reveals
  // 30 rounds (15 per player), alternating guesser/target
  // ═══════════════════════════════════════════════════════════
  function CoquinQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.rounds = [];
    this.currentRound = 0;
    // Adapt to however many questions we actually received: each player needs
    // a distinct set (p1 guesses about p2 and vice-versa), so half the pool
    // per player. Guards against passing fewer than 30 questions (would have
    // left half the rounds with an undefined question and crashed).
    this.questionsPerPlayer = Math.max(1, Math.min(15, Math.floor((this.questions.length || 0) / 2)));
    this.totalRounds = this.questionsPerPlayer * 2;
    this.render();
  }

  CoquinQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'guessing') this.renderGuessing();
    else if (this.phase === 'revealing') this.renderRevealing();
    else if (this.phase === 'feedback') this.renderFeedback();
    else if (this.phase === 'results') this.renderResults();
  };

  CoquinQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon quiz-setup-icon-coquin mx-auto mb-4');
    iconWrap.innerHTML = ICONS.flame;
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('coquin.readyToSpice', 'Prêts à pimenter ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6 text-center', tg('coquin.enterNamesSpicy', 'Entrez vos prénoms')));

    var form = el('div', 'space-y-4 max-w-md mx-auto');
    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'glass-card rounded-xl p-4');
        var labelWrap = el('div', 'flex items-center gap-2 mb-2');
        labelWrap.appendChild(el('span', 'text-sm font-medium', idx === 0 ? tg('coquin.firstName1', 'Premier prénom') : tg('coquin.firstName2', 'Deuxième prénom')));
        card.appendChild(labelWrap);
        var input = el('input', 'input w-full');
        input.type = 'text';
        input.placeholder = idx === 0 ? tg('coquin.yourFirstName', 'Votre prénom...') : tg('coquin.theirFirstName', 'Son prénom...');
        input.maxLength = 20;
        input.id = 'coquin-player-' + idx;
        card.appendChild(input);
        form.appendChild(card);
      })(i);
    }

    form.appendChild(el('p', 'text-xs text-muted-foreground text-center mt-2', tg('coquin.randomQuestions', '🎲 15 questions aléatoires parmi 30 à découvrir !')));

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-4', '🔥 ' + tg('coquin.lightTheFlame', 'Allumer la flamme'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('coquin-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('coquin-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.initRounds();
      self.phase = 'guessing'; self.render();
    });
    form.appendChild(startBtn);
    wrap.appendChild(form);
    this.container.appendChild(wrap);
  };

  CoquinQuiz.prototype.initRounds = function() {
    var allIndices = [];
    for (var i = 0; i < this.questions.length; i++) allIndices.push(i);
    var shuffled = shuffleArray(allIndices);
    var p1Questions = shuffled.slice(0, this.questionsPerPlayer);
    var p2Questions = shuffled.slice(this.questionsPerPlayer, this.questionsPerPlayer * 2);

    this.rounds = [];
    for (var j = 0; j < this.questionsPerPlayer; j++) {
      this.rounds.push({ qIdx: p1Questions[j], guesser: 0, target: 1, guess: null, actual: null, correct: null });
      this.rounds.push({ qIdx: p2Questions[j], guesser: 1, target: 0, guess: null, actual: null, correct: null });
    }
    this.currentRound = 0;
  };

  CoquinQuiz.prototype.renderGuessing = function() {
    var self = this;
    var round = this.rounds[this.currentRound];
    var q = this.questions[round.qIdx];
    var guesser = this.players[round.guesser];
    var target = this.players[round.target];

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentRound, this.totalRounds, tg('question.roundXofY', 'Manche {{current}} sur {{total}}').replace('{{current}}', this.currentRound + 1).replace('{{total}}', this.totalRounds));

    wrap.appendChild(el('div', 'text-center mb-2 text-sm text-muted-foreground', esc(guesser.name) + ' ' + tg('coquin.guessFor', 'devine pour') + ' ' + esc(target.name)));
    renderPlayerBadge(wrap, guesser.name + ' ' + tg('question.itsYourTurnToGuess', 'c\'est à toi de deviner !'));

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    // Replace NAME/{{name}} with target player's name
    qText = qText.replace(/\bNAME\b/g, target.name).replace(/\{\{name\}\}/g, target.name);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText)));

    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        if (!answerLock(self)) return;
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }
        round.guess = opt.id;
        setTimeout(function() { self.phase = 'revealing'; self.render(); }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);
    this.container.appendChild(wrap);
  };

  CoquinQuiz.prototype.renderRevealing = function() {
    var self = this;
    var round = this.rounds[this.currentRound];
    var q = this.questions[round.qIdx];
    var target = this.players[round.target];

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentRound, this.totalRounds, tg('question.roundXofY', 'Manche {{current}} sur {{total}}').replace('{{current}}', this.currentRound + 1).replace('{{total}}', this.totalRounds));

    wrap.appendChild(el('div', 'text-center mb-2', '📱 ' + tg('coquin.passPhone', 'Passez le téléphone à') + ' ' + esc(target.name)));
    renderPlayerBadge(wrap, target.name + ', ' + tg('coquin.revealAnswer', 'révèle ta vraie réponse !'));

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    qText = qText.replace(/\bNAME\b/g, target.name).replace(/\{\{name\}\}/g, target.name);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-4 text-center', esc(qText)));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground text-center mb-4', tg('coquin.beHonest', 'Soyez honnête, c\'est plus fun !')));

    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        if (!answerLock(self)) return;
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }
        round.actual = opt.id;
        round.correct = (round.guess === opt.id);
        setTimeout(function() { self.phase = 'feedback'; self.render(); }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);
    this.container.appendChild(wrap);
  };

  CoquinQuiz.prototype.renderFeedback = function() {
    var self = this;
    var round = this.rounds[this.currentRound];
    var q = this.questions[round.qIdx];
    var guesser = this.players[round.guesser];
    var target = this.players[round.target];
    var score = this.rounds.filter(function(r) { return r.correct === true; }).length;

    var wrap = el('div', 'quiz-engine animate-fade-in text-center');

    if (round.correct) {
      wrap.appendChild(el('div', 'text-5xl mb-4', '✅'));
      wrap.appendChild(el('h2', 'text-xl font-bold mb-3 text-green-500', tg('coquin.correctGuess', 'Bien deviné !')));
    } else {
      wrap.appendChild(el('div', 'text-5xl mb-4', '❌'));
      wrap.appendChild(el('h2', 'text-xl font-bold mb-3 text-red-500', tg('coquin.wrongGuess', 'Raté !')));
    }

    // Show what was guessed vs actual
    var guessOpt = q.options.find(function(o) { return o.id === round.guess; });
    var actualOpt = q.options.find(function(o) { return o.id === round.actual; });
    if (guessOpt) {
      var guessText = tgd(self.prefix + '.q' + q.id + guessOpt.id, guessOpt.text);
      wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-1', esc(guesser.name) + ' ' + tg('coquin.guessed', 'a deviné :') + ' ' + esc(guessText)));
    }
    if (actualOpt) {
      var actualText = tgd(self.prefix + '.q' + q.id + actualOpt.id, actualOpt.text);
      wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-4', tg('coquin.realAnswer', 'La vraie réponse de') + ' ' + esc(target.name) + ' : ' + esc(actualText)));
    }

    wrap.appendChild(el('p', 'text-sm font-medium mb-6', tg('coquin.currentScore', 'Score actuel') + ' : ' + score + ' ' + tg('coquin.correctAnswers', 'bonnes réponses')));

    var nextBtn = el('button', 'btn btn-cta', tg('coquin.nextRound', 'Manche suivante'));
    nextBtn.addEventListener('click', function() {
      if (self.currentRound + 1 >= self.totalRounds) { self.phase = 'results'; }
      else { self.currentRound++; self.phase = 'guessing'; }
      self.render();
    });
    wrap.appendChild(nextBtn);
    this.container.appendChild(wrap);
  };

  CoquinQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var score = this.rounds.filter(function(r) { return r.correct === true; }).length;
    var pct = Math.round((score / this.totalRounds) * 100);

    wrap.appendChild(el('div', 'text-5xl mb-4', '🔥'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2', tg('coquin.resultsOf', 'Résultats de') + ' ' + esc(this.players[0].name) + ' & ' + esc(this.players[1].name)));
    wrap.appendChild(el('div', 'quiz-score-circle mx-auto mb-4', pct + '%'));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6', score + '/' + this.totalRounds + ' ' + tg('coquin.goodGuesses', 'bonnes devinettes')));

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: pct },
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // KNOWLEDGE QUIZ - Oral validation with ✅/❌ buttons
  // Player A says answer out loud, Player B validates
  // 20 questions, alternating guesser
  // ═══════════════════════════════════════════════════════════
  function KnowledgeQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.scores = [0, 0];
    this.render();
  }

  KnowledgeQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'question') this.renderQuestion();
    else if (this.phase === 'transition') this.renderTransition();
    else if (this.phase === 'results') this.renderResults();
  };

  KnowledgeQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-4');
    iconWrap.innerHTML = ICONS.users;
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('playerSetup.whoKnowsBest', 'Qui connait l\'autre par cœur ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6 text-center', tg('playerSetup.discoverWhoKnows', 'Découvrez qui connait mieux l\'autre !')));

    var form = el('div', 'space-y-4 max-w-md mx-auto');
    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'glass-card rounded-xl p-4');
        var labelWrap = el('div', 'flex items-center gap-2 mb-2');
        var heartSpan = el('span', idx === 0 ? 'text-pink-500' : 'text-blue-500');
        heartSpan.innerHTML = ICONS.heart;
        labelWrap.appendChild(heartSpan);
        labelWrap.appendChild(el('span', 'text-sm font-medium', tg('playerSetup.player' + (idx + 1), 'Joueur ' + (idx + 1))));
        card.appendChild(labelWrap);
        var input = el('input', 'input w-full');
        input.type = 'text'; input.placeholder = tg('playerSetup.firstName', 'Prénom'); input.maxLength = 20;
        input.id = 'knowledge-player-' + idx;
        card.appendChild(input);
        form.appendChild(card);
      })(i);
    }

    var info = el('p', 'text-xs text-muted-foreground text-center mt-3', tg('playerSetup.questionsCount', '20 questions • Répondez chacun votre tour • Résultats individuels'));

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-4', tg('playerSetup.startQuiz', 'Commencer le quiz'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('knowledge-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('knowledge-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.currentQ = 0; self.scores = [0, 0];
      self.phase = 'question'; self.render();
    });
    form.appendChild(info);
    form.appendChild(startBtn);
    wrap.appendChild(form);
    this.container.appendChild(wrap);
  };

  KnowledgeQuiz.prototype.getGuesser = function() { return this.currentQ % 2; };
  KnowledgeQuiz.prototype.getTarget = function() { return (this.currentQ + 1) % 2; };

  KnowledgeQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var guesserIdx = this.getGuesser();
    var targetIdx = this.getTarget();
    var guesser = this.players[guesserIdx];
    var target = this.players[targetIdx];

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentQ, total);

    // Instructions
    wrap.appendChild(el('div', 'text-center mb-2 text-sm font-medium', esc(guesser.name) + ', ' + tg('question.sayAnswerOutLoud', 'dis ta réponse à voix haute,')));
    wrap.appendChild(el('div', 'text-center mb-4 text-sm text-muted-foreground', esc(target.name) + ' ' + tg('question.validates', 'valide !')));

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    // Replace NAME/{{name}} placeholder with target player's name
    qText = qText.replace(/\bNAME\b/g, target.name).replace(/\{\{name\}\}/g, target.name);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText)));

    // Show options as reference (read-only display)
    if (q.options && q.options.length > 0) {
      var optionsRef = el('div', 'space-y-1 mb-6');
      q.options.forEach(function(opt) {
        var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
        optionsRef.appendChild(el('div', 'text-sm text-muted-foreground text-center py-1', esc(optText)));
      });
      wrap.appendChild(optionsRef);
    }

    // ✅ / ❌ validation buttons
    var validationWrap = el('div', 'flex justify-center gap-4 mt-4');

    var correctBtn = el('button', 'quiz-validate-btn quiz-validate-correct');
    correctBtn.innerHTML = ICONS.check + ' <span>' + tg('question.found', 'a trouvé !') + '</span>';
    correctBtn.addEventListener('click', function() {
      self.scores[guesserIdx]++;
      self.advance();
    });

    var wrongBtn = el('button', 'quiz-validate-btn quiz-validate-wrong');
    wrongBtn.innerHTML = ICONS.cross + ' <span>' + tg('question.wasMistaken', 's\'est trompé(e) !') + '</span>';
    wrongBtn.addEventListener('click', function() {
      self.advance();
    });

    validationWrap.appendChild(correctBtn);
    validationWrap.appendChild(wrongBtn);
    wrap.appendChild(validationWrap);

    this.container.appendChild(wrap);
  };

  KnowledgeQuiz.prototype.advance = function() {
    if (this.currentQ >= this.questions.length - 1) {
      this.phase = 'results';
      this.render();
    } else {
      this.phase = 'transition';
      this.render();
    }
  };

  KnowledgeQuiz.prototype.renderTransition = function() {
    var self = this;
    var nextGuesserIdx = (this.currentQ + 1) % 2;
    var nextGuesser = this.players[nextGuesserIdx];

    var wrap = el('div', 'quiz-engine animate-fade-in text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '🎯'));
    wrap.appendChild(el('h2', 'text-xl font-bold mb-3', tg('question.itsTurnOf', 'C\'est au tour de') + ' ' + esc(nextGuesser.name) + ' !'));
    wrap.appendChild(el('p', 'text-muted-foreground mb-2', tg('question.getReadyToGuess', 'Préparez-vous à deviner !')));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6', tg('coquin.currentScore', 'Score') + ' : ' + esc(this.players[0].name) + ' ' + this.scores[0] + ' - ' + this.scores[1] + ' ' + esc(this.players[1].name)));

    // Auto-advance after 2.5s or click (but never both)
    var advanced = false;
    function advance() {
      if (advanced) return;
      advanced = true;
      clearTimeout(timer);
      self.currentQ++;
      self.phase = 'question';
      self.render();
    }
    var btn = el('button', 'btn btn-cta', tg('question.nextQuestionBtn', 'Question suivante !'));
    btn.addEventListener('click', advance);
    wrap.appendChild(btn);
    var timer = setTimeout(advance, 2500);

    this.container.appendChild(wrap);
  };

  KnowledgeQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-6', tg('result.quizResults', 'Résultats du quiz')));

    var scoresGrid = el('div', 'grid grid-cols-2 gap-4 mb-6');
    for (var i = 0; i < 2; i++) {
      var total = this.questions.length;
      var score = this.scores[i];
      var pct = Math.round((score / (total / 2)) * 100);
      var card = el('div', 'glass-card rounded-xl p-4 text-center');
      card.appendChild(el('p', 'font-semibold mb-2', esc(this.players[i].name)));
      card.appendChild(el('div', 'quiz-score-circle quiz-score-sm mx-auto mb-2', pct + '%'));
      card.appendChild(el('p', 'text-xs text-muted-foreground', score + '/' + Math.floor(total / 2) + ' ' + tg('coquin.correctAnswers', 'bonnes réponses')));
      scoresGrid.appendChild(card);
    }
    wrap.appendChild(scoresGrid);

    // Winner message
    var diff = this.scores[0] - this.scores[1];
    var msg = '';
    if (diff === 0) msg = tg('result.perfectTie', 'Égalité parfaite !');
    else if (Math.abs(diff) >= 5) msg = esc(this.players[diff > 0 ? 0 : 1].name) + ' ' + tg('result.knowsMuchBetter', 'connait beaucoup mieux') + ' ' + esc(this.players[diff > 0 ? 1 : 0].name) + ' !';
    else if (Math.abs(diff) >= 3) msg = esc(this.players[diff > 0 ? 0 : 1].name) + ' ' + tg('result.knowsSlightlyBetter', 'connait légèrement mieux') + ' ' + esc(this.players[diff > 0 ? 1 : 0].name);
    else msg = esc(this.players[diff > 0 ? 0 : 1].name) + ' ' + tg('result.knowsLittleBetter', 'connait un peu mieux') + ' ' + esc(this.players[diff > 0 ? 1 : 0].name);

    wrap.appendChild(el('p', 'text-lg font-medium mb-4', msg));

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: Math.round(((this.scores[0] + this.scores[1]) / this.questions.length) * 100) },
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // DEBATE QUIZ - amoureux (1-5 scale, played together)
  // Both players discuss and rate agreement together
  // ═══════════════════════════════════════════════════════════
  function DebateQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.scores = [];
    this.render();
  }

  DebateQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  DebateQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');

    wrap.appendChild(el('div', 'text-5xl mb-4 text-center', '💕'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('playerSetup.quizForTwo', 'Quiz à Faire en Couple')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-4 text-center', tg('playerSetup.quizTogetherDesc', 'Ce quiz se joue ensemble. Discutez et notez de 1 à 5.')));

    // How it works
    var howBox = el('div', 'glass-card rounded-xl p-5 mb-6 max-w-md mx-auto text-left');
    howBox.innerHTML = '<p class="font-semibold mb-3">' + esc(tg('playerSetup.howItWorks', 'Comment ça marche ?')) + '</p>' +
      '<ol class="space-y-2 text-sm text-muted-foreground">' +
      '<li>1️⃣ ' + esc(tg('playerSetup.step1', 'Lisez chaque affirmation ensemble')) + '</li>' +
      '<li>2️⃣ ' + esc(tg('playerSetup.step2', 'Discutez et débattez si nécessaire')) + '</li>' +
      '<li>3️⃣ ' + esc(tg('playerSetup.step3', 'Choisissez un score de 1 à 5')) + '</li>' +
      '<li>4️⃣ ' + esc(tg('playerSetup.step4', 'Découvrez votre score d\'amour !')) + '</li></ol>';
    wrap.appendChild(howBox);

    var form = el('div', 'space-y-4 max-w-md mx-auto');
    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'glass-card rounded-xl p-4');
        var labelWrap = el('div', 'flex items-center gap-2 mb-2');
        var heartSpan = el('span', idx === 0 ? 'text-pink-500' : 'text-blue-500');
        heartSpan.innerHTML = ICONS.heart;
        labelWrap.appendChild(heartSpan);
        labelWrap.appendChild(el('span', 'text-sm font-medium', idx === 0 ? tg('playerSetup.firstFirstName', 'Premier prénom') : tg('playerSetup.secondFirstName', 'Deuxième prénom')));
        card.appendChild(labelWrap);
        var input = el('input', 'input w-full');
        input.type = 'text'; input.placeholder = tg('playerSetup.firstName', 'Prénom'); input.maxLength = 20;
        input.id = 'debate-player-' + idx;
        card.appendChild(input);
        form.appendChild(card);
      })(i);
    }

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-4', tg('playerSetup.startQuiz', 'Commencer le quiz'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('debate-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('debate-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.currentQ = 0; self.scores = [];
      self.phase = 'playing'; self.render();
    });
    form.appendChild(startBtn);
    wrap.appendChild(form);
    this.container.appendChild(wrap);
  };

  DebateQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentQ, total);

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-2 text-center', esc(qText)));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6 text-center', tg('question.discussAndChoose', 'Discutez ensemble et choisissez votre niveau d\'accord')));

    // 1-5 Scale buttons
    var scaleLabels = [
      tg('question.stronglyDisagree', 'Pas du tout d\'accord'),
      tg('question.disagree', 'Plutôt pas d\'accord'),
      tg('question.neutral', 'Neutre'),
      tg('question.agree', 'Plutôt d\'accord'),
      tg('question.stronglyAgree', 'Tout à fait d\'accord')
    ];

    var scaleWrap = el('div', 'space-y-2');
    for (var s = 1; s <= 5; s++) {
      (function(score) {
        var scaleEmojis = ['😕', '😐', '🙂', '😊', '😍'];
        var scaleBtn = el('button', 'quiz-option quiz-scale-option');
        scaleBtn.innerHTML = '<span class="quiz-scale-number">' + score + '</span> <span class="quiz-scale-emoji">' + scaleEmojis[score - 1] + '</span> <span>' + esc(scaleLabels[score - 1]) + '</span>';
        scaleBtn.style.animationDelay = ((score - 1) * 60) + 'ms';
        scaleBtn.addEventListener('click', function() {
          if (!answerLock(self)) return;
          scaleBtn.classList.add('selected');
          var siblings = scaleWrap.querySelectorAll('.quiz-option');
          for (var s = 0; s < siblings.length; s++) {
            if (siblings[s] !== scaleBtn) siblings[s].style.opacity = '0.5';
            siblings[s].style.pointerEvents = 'none';
          }
          self.scores[self.currentQ] = score;
          setTimeout(function() {
            if (self.currentQ < total - 1) { self.currentQ++; self.render(); }
            else { self.phase = 'results'; self.render(); }
          }, 350);
        });
        scaleWrap.appendChild(scaleBtn);
      })(s);
    }
    wrap.appendChild(scaleWrap);

    // Back button
    if (this.currentQ > 0) {
      var navWrap = el('div', 'mt-4');
      var backBtn = el('button', 'btn btn-ghost text-sm', '&larr; ' + tg('question.previousQuestion', 'Précédent'));
      backBtn.addEventListener('click', function() { self.currentQ--; self.render(); });
      navWrap.appendChild(backBtn);
      wrap.appendChild(navWrap);
    }

    this.container.appendChild(wrap);
  };

  DebateQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var total = this.questions.length;
    var totalScore = this.scores.reduce(function(s, v) { return s + (v || 0); }, 0);
    var pct = Math.round((totalScore / (total * 5)) * 100);

    wrap.appendChild(el('div', 'text-5xl mb-4', '💕'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2', tg('result.loveScore', 'Score d\'amour')));
    wrap.appendChild(el('div', 'quiz-score-circle mx-auto mb-4', pct + '%'));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6', totalScore + '/' + (total * 5) + ' ' + esc(tg('meta.pointsWord', 'points'))));

    // Find matching result
    var result = null;
    for (var i = 0; i < this.results.length; i++) {
      var r = this.results[i];
      if (pct >= (r.minScore || r.min || 0) && pct <= (r.maxScore || r.max || 100)) { result = r; break; }
    }
    if (result) {
      wrap.appendChild(el('h3', 'text-xl font-bold mb-3', esc(result.title)));
      wrap.appendChild(el('p', 'text-muted-foreground leading-relaxed max-w-lg mx-auto mb-4', result.description));
      if (result.advice) {
        var advice = el('div', 'text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4 text-left max-w-lg mx-auto');
        advice.innerHTML = '<strong class="block mb-2">' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(result.advice);
        wrap.appendChild(advice);
      }
    }

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: pct, verdict: result ? result.title : '' },
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // FUNNY QUIZ - marrant (discussion only, no scoring)
  // Both players read question aloud, discuss, then "Next"
  // ═══════════════════════════════════════════════════════════
  function FunnyQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.render();
  }

  FunnyQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  FunnyQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');

    wrap.appendChild(el('div', 'text-5xl mb-4 text-center', '😂'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('playerSetup.readyToLaugh', 'Prêts à rire ensemble ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6 text-center', tg('playerSetup.enterNamesFun', 'Entrez vos prénoms pour commencer le quiz fun !')));

    var form = el('div', 'space-y-4 max-w-md mx-auto');
    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'glass-card rounded-xl p-4');
        var labelWrap = el('div', 'flex items-center gap-2 mb-2');
        var heartSpan = el('span', idx === 0 ? 'text-pink-500' : 'text-blue-500');
        heartSpan.innerHTML = ICONS.heart;
        labelWrap.appendChild(heartSpan);
        labelWrap.appendChild(el('span', 'text-sm font-medium', tg('playerSetup.player' + (idx + 1), 'Joueur ' + (idx + 1))));
        card.appendChild(labelWrap);
        var input = el('input', 'input w-full');
        input.type = 'text'; input.placeholder = tg('playerSetup.firstName', 'Prénom'); input.maxLength = 20;
        input.id = 'funny-player-' + idx;
        card.appendChild(input);
        form.appendChild(card);
      })(i);
    }

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-4', '😂 ' + tg('playerSetup.startQuiz', 'Commencer le quiz'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('funny-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('funny-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.currentQ = 0;
      self.phase = 'playing'; self.render();
    });
    form.appendChild(startBtn);
    wrap.appendChild(form);
    this.container.appendChild(wrap);
  };

  FunnyQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentQ, total);

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-4 text-center', esc(qText)));

    // Options displayed as conversation starters (read-only)
    var optionsWrap = el('div', 'space-y-2 mb-6');
    q.options.forEach(function(opt) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optEl = el('div', 'quiz-option-display');
      optEl.textContent = optText;
      optionsWrap.appendChild(optEl);
    });
    wrap.appendChild(optionsWrap);

    wrap.appendChild(el('p', 'text-sm text-muted-foreground text-center mb-4', tg('question.discussTogether', '💬 Discutez de vos réponses ensemble !')));

    // Navigation
    var navWrap = el('div', 'flex justify-between items-center mt-4');
    if (this.currentQ > 0) {
      var backBtn = el('button', 'btn btn-ghost text-sm', '&larr; ' + tg('question.previousQuestion', 'Précédent'));
      backBtn.addEventListener('click', function() { self.currentQ--; self.render(); });
      navWrap.appendChild(backBtn);
    } else {
      navWrap.appendChild(el('div'));
    }

    var nextBtn = el('button', 'btn btn-cta', tg('question.nextQuestionBtn', 'Question suivante !') + ' →');
    nextBtn.addEventListener('click', function() {
      if (self.currentQ < total - 1) { self.currentQ++; self.render(); }
      else { self.phase = 'results'; self.render(); }
    });
    navWrap.appendChild(nextBtn);
    wrap.appendChild(navWrap);

    this.container.appendChild(wrap);
  };

  FunnyQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '🎉'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-3', tg('result.bravo', 'Bravo') + ' ' + esc(this.players[0].name) + ' & ' + esc(this.players[1].name) + ' !'));
    wrap.appendChild(el('p', 'text-lg text-muted-foreground mb-2', tg('result.completedQuestions', 'Vous avez terminé les 20 questions !')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-4', tg('result.sharedMoment', 'Vous avez partagé un super moment ensemble !')));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6', tg('result.bestMemories', 'Les meilleurs souvenirs se construisent dans le rire et la complicité 💕')));

    renderActionButtons(wrap, {
      share: { type: 'fun' },
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // MOST QUIZ - "Qui est le plus..." (2-8 players, vote)
  // Players vote for who best matches each question
  // ═══════════════════════════════════════════════════════════
  function MostQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [];
    this.currentQ = 0;
    this.designations = {};
    this.render();
  }

  MostQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'question') this.renderQuestion();
    else if (this.phase === 'transition') this.renderTransition();
    else if (this.phase === 'results') this.renderResults();
  };

  MostQuiz.prototype.renderSetup = function() {
    var self = this;
    this.players = [{ name: '', letter: 'A' }, { name: '', letter: 'B' }];
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-4');
    iconWrap.innerHTML = ICONS.users;
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('playerSetup.whoParticipates', 'Qui participe au quiz ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6 text-center', tg('playerSetup.addPlayers', 'Ajoutez entre 2 et 8 joueurs')));

    var playersContainer = el('div', 'space-y-3 max-w-md mx-auto');
    playersContainer.id = 'most-players-list';

    function renderPlayersList() {
      playersContainer.innerHTML = '';
      self.players.forEach(function(p, idx) {
        var card = el('div', 'glass-card rounded-xl p-3 flex items-center gap-3');
        var letter = el('div', 'quiz-player-letter');
        letter.textContent = String.fromCharCode(65 + idx);
        card.appendChild(letter);
        var input = el('input', 'input flex-1');
        input.type = 'text';
        input.placeholder = tg('playerSetup.playerName', 'Prénom du joueur');
        input.maxLength = 20;
        input.value = p.name;
        input.addEventListener('input', function() { self.players[idx].name = this.value; });
        card.appendChild(input);
        if (self.players.length > 2) {
          var removeBtn = el('button', 'btn-icon text-red-400 hover:text-red-500');
          removeBtn.innerHTML = ICONS.trash;
          removeBtn.title = tg('playerSetup.removePlayer', 'Supprimer');
          removeBtn.addEventListener('click', function() {
            self.players.splice(idx, 1);
            renderPlayersList();
          });
          card.appendChild(removeBtn);
        }
        playersContainer.appendChild(card);
      });

      // Add player button
      if (self.players.length < 8) {
        var addBtn = el('button', 'quiz-add-player-btn');
        addBtn.innerHTML = ICONS.plus + ' <span>' + tg('playerSetup.addPlayer', 'Ajouter un joueur') + '</span> <span class="text-muted-foreground text-xs">(' + self.players.length + '/8)</span>';
        addBtn.addEventListener('click', function() {
          self.players.push({ name: '', letter: String.fromCharCode(65 + self.players.length) });
          renderPlayersList();
        });
        playersContainer.appendChild(addBtn);
      }
    }

    renderPlayersList();

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-8 max-w-md mx-auto');
    startBtn.id = 'most-start-btn';
    startBtn.textContent = tg('playerSetup.startQuiz', 'Commencer le quiz');
    startBtn.addEventListener('click', function() {
      // Validate all names filled
      var allFilled = self.players.every(function(p) { return p.name.trim().length > 0; });
      if (!allFilled) {
        var warn = document.getElementById('most-warning');
        if (!warn) {
          warn = el('p', 'text-sm text-red-500 text-center mt-2');
          warn.id = 'most-warning';
          warn.textContent = tg('playerSetup.fillAllNames', 'Remplissez tous les prénoms');
          startBtn.parentElement.insertBefore(warn, startBtn.nextSibling);
        }
        return;
      }
      self.players.forEach(function(p, i) {
        p.letter = String.fromCharCode(65 + i);
        p.name = p.name.trim();
      });
      self.designations = {};
      self.players.forEach(function(p) { self.designations[p.letter] = 0; });
      self.currentQ = 0;
      self.phase = 'question'; self.render();
    });

    wrap.appendChild(playersContainer);
    wrap.appendChild(startBtn);
    this.container.appendChild(wrap);
  };

  MostQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentQ, total);

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-2 text-center', esc(qText)));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6 text-center', tg('question.voteInstruction', 'Votez ensemble ! Qui correspond le mieux ?')));

    // Player buttons - dynamic based on actual players
    var playersWrap = el('div', 'quiz-most-players-grid');
    this.players.forEach(function(p) {
      var playerBtn = el('button', 'quiz-most-player-btn');
      playerBtn.innerHTML = '<span class="quiz-player-letter-sm">' + esc(p.letter) + '</span><span>' + esc(p.name) + '</span>';
      playerBtn.addEventListener('click', function() {
        if (!answerLock(self)) return;
        playerBtn.classList.add('selected');
        var siblings = playersWrap.querySelectorAll('.quiz-most-player-btn');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== playerBtn) { siblings[s].style.opacity = '0.5'; siblings[s].style.pointerEvents = 'none'; }
        }
        var nobodyBtn = playersWrap.querySelector('.quiz-most-nobody-btn');
        if (nobodyBtn) { nobodyBtn.style.opacity = '0.5'; nobodyBtn.style.pointerEvents = 'none'; }
        self.designations[p.letter] = (self.designations[p.letter] || 0) + 1;
        setTimeout(function() { self.advanceQuestion(); }, 400);
      });
      playersWrap.appendChild(playerBtn);
    });

    // "Personne" button
    var nobodyBtn = el('button', 'quiz-most-player-btn quiz-most-nobody-btn');
    nobodyBtn.innerHTML = '<span>🤷</span><span>' + tg('question.nobody', 'Personne') + '</span>';
    nobodyBtn.addEventListener('click', function() {
      // Ce bouton n'est jamais neutralisé par pointer-events : deux appuis
      // rapprochés planifiaient deux advanceQuestion() et faisaient sauter
      // une question entière du quiz.
      if (!answerLock(self)) return;
      nobodyBtn.classList.add('selected');
      var siblings = playersWrap.querySelectorAll('.quiz-most-player-btn');
      for (var s = 0; s < siblings.length; s++) {
        if (siblings[s] !== nobodyBtn) { siblings[s].style.opacity = '0.5'; siblings[s].style.pointerEvents = 'none'; }
      }
      setTimeout(function() { self.advanceQuestion(); }, 400);
    });
    playersWrap.appendChild(nobodyBtn);

    wrap.appendChild(playersWrap);
    this.container.appendChild(wrap);
  };

  MostQuiz.prototype.advanceQuestion = function() {
    if (this.currentQ >= this.questions.length - 1) {
      this.phase = 'results'; this.render();
    } else {
      this.phase = 'transition'; this.render();
    }
  };

  MostQuiz.prototype.renderTransition = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '🎯'));
    wrap.appendChild(el('h2', 'text-xl font-bold mb-6', tg('question.getReadyToVote', 'Préparez-vous à voter ! 🎯')));

    var timer = setTimeout(function() {
      self.currentQ++; self.phase = 'question'; self.render();
    }, 2000);

    var skipBtn = el('button', 'btn btn-ghost text-sm', tg('question.nextQuestionTransition', 'Question suivante !'));
    skipBtn.addEventListener('click', function() {
      clearTimeout(timer);
      self.currentQ++; self.phase = 'question'; self.render();
    });
    wrap.appendChild(skipBtn);
    this.container.appendChild(wrap);
  };

  MostQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-6', tg('result.quizResults', 'Résultats du quiz')));

    // Sort players by designation count
    var sorted = this.players.slice().sort(function(a, b) {
      return (self.designations[b.letter] || 0) - (self.designations[a.letter] || 0);
    });

    // Ranking
    var ranking = el('div', 'space-y-3 max-w-md mx-auto mb-6');
    sorted.forEach(function(p, idx) {
      var count = self.designations[p.letter] || 0;
      var podiumClass = idx === 0 ? 'quiz-podium-gold' : idx === 1 ? 'quiz-podium-silver' : idx === 2 ? 'quiz-podium-bronze' : '';
      var card = el('div', 'glass-card rounded-xl p-4 flex items-center gap-3 quiz-reveal-enter ' + podiumClass);
      card.style.animationDelay = (idx * 100) + 'ms';
      var medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (idx + 1) + '.';
      var barPct = sorted[0] && self.designations[sorted[0].letter] ? Math.round((count / self.designations[sorted[0].letter]) * 100) : 0;
      card.innerHTML = '<span class="text-2xl">' + medal + '</span>' +
        '<span class="quiz-player-letter-sm">' + esc(p.letter) + '</span>' +
        '<div class="flex-1"><span class="font-medium block">' + esc(p.name) + '</span>' +
        '<div class="quiz-podium-bar mt-1"><div class="quiz-podium-bar-fill" style="width:' + barPct + '%"></div></div></div>' +
        '<span class="text-muted-foreground font-semibold">' + count + ' ' + tg('result.times', 'fois') + '</span>';
      ranking.appendChild(card);
    });
    wrap.appendChild(ranking);

    // Winner message
    var topCount = self.designations[sorted[0].letter] || 0;
    var secondCount = sorted.length > 1 ? (self.designations[sorted[1].letter] || 0) : 0;
    var msg = '';
    if (topCount === 0) msg = tg('result.nobodyDominated', 'Personne n\'a vraiment dominé ce quiz !');
    else if (topCount - secondCount >= 5) msg = esc(sorted[0].name) + ' ' + tg('result.clearlyTheStar', 'est clairement la star !');
    else if (topCount > secondCount) msg = esc(sorted[0].name) + ' ' + tg('result.standsOut', 'se démarque du groupe !');
    else msg = tg('result.nobodyDominated', 'Égalité ! Vous êtes tous uniques !');
    wrap.appendChild(el('p', 'text-lg font-medium mb-4', msg));

    renderActionButtons(wrap, {
      share: { type: 'fun' },
      newQuestions: function() { location.reload(); },
      changePlayers: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // HEALTHY QUIZ - couple-sain (weighted scoring, 2 players + gender)
  // Each answer has weighted points: a=3, b=2, c=1, d=0
  // Both players answer each question, scores summed
  // ═══════════════════════════════════════════════════════════
  function HealthyQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    // 'couple' questions (FR) are authored a=healthiest→d=least, matching the
    // a=3..d=0 weights. Native 'healthy' questions (non-FR) are authored the
    // other way (a=least→d=healthiest), so their weights must be reversed.
    this.reverseScore = config.reverseScore || false;
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.currentPlayer = 0;
    this.scores = [[], []];
    this.maxScorePerPlayer = this.questions.length * 3;
    this.render();
  }

  HealthyQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'handoff') this.renderHandoff();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  HealthyQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-6');
    iconWrap.innerHTML = ICONS.users;
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-3 text-center', tg('playerSetup.readyForTest', 'Prêts pour le test ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-8 text-center', tg('playerSetup.enterNames', 'Entrez vos prénoms et commencez le test à deux !')));

    var form = el('div', 'quiz-setup-grid max-w-lg mx-auto');
    var genders = ['', ''];

    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'quiz-player-card');
        var numCircle = el('div', 'quiz-player-number');
        numCircle.textContent = (idx + 1);
        card.appendChild(numCircle);
        var label = el('label', 'block text-sm font-semibold mb-2 text-center', tg('playerSetup.player' + (idx + 1), 'Joueur ' + (idx + 1)));
        var input = el('input', 'input w-full');
        input.type = 'text'; input.placeholder = tg('playerSetup.firstName', 'Prénom'); input.maxLength = 20;
        input.id = 'healthy-player-' + idx;
        card.appendChild(label);
        card.appendChild(input);

        // Gender buttons
        var gLabel = el('label', 'block text-sm font-semibold mt-4 mb-2 text-center', tg('playerSetup.gender', 'Genre'));
        card.appendChild(gLabel);
        var gWrap = el('div', 'flex gap-3 justify-center');
        var maleLabel = tg('playerSetup.male', 'Homme');
        var femaleLabel = tg('playerSetup.female', 'Femme');
        var maleBtn = el('button', 'gender-btn', '👨<span class="gender-label">' + esc(maleLabel) + '</span>');
        maleBtn.setAttribute('aria-label', maleLabel);
        var femaleBtn = el('button', 'gender-btn', '👩<span class="gender-label">' + esc(femaleLabel) + '</span>');
        femaleBtn.setAttribute('aria-label', femaleLabel);
        maleBtn.addEventListener('click', function() {
          genders[idx] = 'homme';
          maleBtn.className = 'gender-btn gender-btn-selected gender-btn-male';
          femaleBtn.className = 'gender-btn';
        });
        femaleBtn.addEventListener('click', function() {
          genders[idx] = 'femme';
          femaleBtn.className = 'gender-btn gender-btn-selected gender-btn-female';
          maleBtn.className = 'gender-btn';
        });
        gWrap.appendChild(maleBtn);
        gWrap.appendChild(femaleBtn);
        card.appendChild(gWrap);
        form.appendChild(card);
      })(i);
    }

    var startBtn = el('button', 'btn btn-cta btn-gradient quiz-setup-start-btn', tg('playerSetup.startTest', 'Commencer le test'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('healthy-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('healthy-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [
        { name: n1, gender: genders[0] || 'homme' },
        { name: n2, gender: genders[1] || 'femme' }
      ];
      self.currentQ = 0; self.currentPlayer = 0; self.scores = [[], []];
      self.phase = 'handoff'; self.render();
    });

    wrap.appendChild(form);
    wrap.appendChild(startBtn);
    this.container.appendChild(wrap);
  };

  HealthyQuiz.prototype.renderHandoff = function() {
    var self = this;
    var player = this.players[this.currentPlayer];
    var color = getPlayerColor(player, this.players[this.currentPlayer === 0 ? 1 : 0], this.currentPlayer);
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '📱'));
    var t = el('h2', 'text-xl font-bold mb-3');
    t.textContent = tg('question.itsTurnOf', 'C\'est au tour de') + ' ' + player.name + ' !';
    wrap.appendChild(t);
    wrap.appendChild(el('p', 'text-muted-foreground mb-6', tg('question.passPhoneOrLookAway', 'Passez le téléphone ou détournez le regard')));

    var btn = el('button', 'btn btn-cta', tg('question.chooseAnswer', 'Répondre'));
    btn.style.background = color.bg;
    btn.addEventListener('click', function() { self.phase = 'playing'; self.render(); });
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  HealthyQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var totalAnswers = total * 2;
    var answeredCount = this.scores[0].length + this.scores[1].length;
    var player = this.players[this.currentPlayer];
    var color = getPlayerColor(player, this.players[this.currentPlayer === 0 ? 1 : 0], this.currentPlayer);

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, answeredCount, totalAnswers, tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + total);

    var badge = el('div', 'text-center mb-4');
    badge.innerHTML = '<span class="badge" style="background:' + color.bg + ';color:' + color.text + '">' + esc(player.name) + '</span>';
    wrap.appendChild(badge);

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText)));

    var OPTION_SCORES = this.reverseScore ? { a: 0, b: 1, c: 2, d: 3 } : { a: 3, b: 2, c: 1, d: 0 };
    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        if (!answerLock(self)) return;
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }
        var score = OPTION_SCORES[opt.id] || 0;
        self.scores[self.currentPlayer].push(score);

        setTimeout(function() {
          if (self.currentPlayer === 0) {
            self.currentPlayer = 1;
            self.phase = 'handoff';
          } else if (self.currentQ < total - 1) {
            self.currentQ++;
            self.currentPlayer = 0;
            self.phase = 'handoff';
          } else {
            self.phase = 'results';
          }
          self.render();
        }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);
    this.container.appendChild(wrap);
  };

  HealthyQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');

    var s1 = this.scores[0].reduce(function(s, v) { return s + v; }, 0);
    var s2 = this.scores[1].reduce(function(s, v) { return s + v; }, 0);
    var totalScore = s1 + s2;
    var maxTotal = this.maxScorePerPlayer * 2;
    var pct = Math.round((totalScore / maxTotal) * 100);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2', tg('result.totalCoupleScore', 'Score total du couple')));
    var mainRingDiv = el('div', '');
    mainRingDiv.innerHTML = renderScoreRing(pct);
    wrap.appendChild(mainRingDiv);
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6 quiz-reveal-enter', Math.round(totalScore) + '/' + maxTotal + ' ' + esc(tg('meta.pointsWord', 'points'))));

    // Individual scores
    var scoresGrid = el('div', 'grid grid-cols-2 gap-4 mb-6');
    for (var i = 0; i < 2; i++) {
      var score = i === 0 ? s1 : s2;
      var color = getPlayerColor(this.players[i], this.players[i === 0 ? 1 : 0], i);
      var iPct = Math.round((score / this.maxScorePerPlayer) * 100);
      var card = el('div', 'glass-card rounded-xl p-4 text-center');
      card.innerHTML = '<p class="font-semibold mb-2" style="color:' + color.bg + '">' + esc(this.players[i].name) + '</p>' +
        renderScoreRing(iPct, 'sm') +
        '<p class="text-xs text-muted-foreground">' + Math.round(score) + '/' + this.maxScorePerPlayer + '</p>';
      scoresGrid.appendChild(card);
    }
    wrap.appendChild(scoresGrid);

    // Alert if big gap
    if (Math.abs(s1 - s2) > 10) {
      var gapAlert = el('div', 'glass-card rounded-xl p-4 mb-4 border-l-4 border-orange-400');
      gapAlert.innerHTML = '<p class="text-sm">' + esc(tg('healthy.gapWarning', '⚠️ L\'écart entre vos scores est significatif. Prenez le temps de discuter de vos perceptions respectives.')) + '</p>';
      wrap.appendChild(gapAlert);
    }

    // Find matching result
    var result = null;
    for (var j = 0; j < this.results.length; j++) {
      var r = this.results[j];
      if (totalScore >= (r.min || r.minScore || 0) && totalScore <= (r.max || r.maxScore || 999)) { result = r; break; }
    }
    if (result) {
      wrap.appendChild(el('h3', 'text-xl font-bold mb-3', esc(result.title)));
      wrap.appendChild(el('p', 'text-muted-foreground leading-relaxed max-w-lg mx-auto mb-4', result.description));
      if (result.advice) {
        var adviceEl = el('div', 'text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4 text-left max-w-lg mx-auto');
        adviceEl.innerHTML = '<strong class="block mb-2">' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(result.advice);
        wrap.appendChild(adviceEl);
      }
    }

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: pct, verdict: result ? result.title : '' },
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // PARENTALITE QUIZ - 2 players, same questions, fixed point values per answer
  // Each answer has explicit points (0-3), both players answer all 20 questions
  // Individual scores + combined score, max 60 per player / 120 total
  // ═══════════════════════════════════════════════════════════
  function ParentaliteQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results || [];
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    this.players = [null, null];
    this.currentQ = 0;
    this.currentPlayer = 0;
    this.scores = [[], []];
    var maxPts = 0;
    for (var i = 0; i < this.questions.length; i++) {
      var qMax = 0;
      for (var j = 0; j < this.questions[i].options.length; j++) {
        if (this.questions[i].options[j].points > qMax) qMax = this.questions[i].options[j].points;
      }
      maxPts += qMax;
    }
    this.maxPerPlayer = maxPts || 60;
    this.render();
  }

  ParentaliteQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'handoff') this.renderHandoff();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  ParentaliteQuiz.prototype.renderSetup = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-4');
    iconWrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2 text-center', tg('playerSetup.readyForTest', 'Prêts pour le test ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-2 text-center', tg('parentalite.setupDesc', 'Répondez chacun de votre côté aux mêmes 20 questions.')));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6 text-center', '20 questions &bull; ' + tg('meta.duration', '10 min') + ' &bull; ' + tg('parentalite.scoreOn60', 'Score sur 60 par personne')));

    var form = el('div', 'quiz-setup-grid max-w-lg mx-auto');

    for (var i = 0; i < 2; i++) {
      (function(idx) {
        var card = el('div', 'glass-card rounded-xl p-5');
        var numCircle = el('div', 'quiz-player-number');
        numCircle.textContent = (idx + 1);
        card.appendChild(numCircle);
        var label = el('label', 'block text-sm font-medium mb-2', tg('playerSetup.player' + (idx + 1), 'Joueur ' + (idx + 1)));
        var input = el('input', 'input w-full');
        input.type = 'text'; input.placeholder = tg('playerSetup.firstName', 'Prénom'); input.maxLength = 20;
        input.id = 'parentalite-player-' + idx;
        card.appendChild(label);
        card.appendChild(input);
        form.appendChild(card);
      })(i);
    }

    var startBtn = el('button', 'btn btn-cta btn-gradient w-full mt-4', tg('playerSetup.startTest', 'Commencer le test'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('parentalite-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('parentalite-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.currentQ = 0; self.currentPlayer = 0; self.scores = [[], []];
      self.phase = 'handoff'; self.render();
    });

    wrap.appendChild(form);
    wrap.appendChild(startBtn);
    this.container.appendChild(wrap);
  };

  ParentaliteQuiz.prototype.renderHandoff = function() {
    var self = this;
    var player = this.players[this.currentPlayer];
    var colors = [{ bg: '#ec4899', text: '#fff' }, { bg: '#3b82f6', text: '#fff' }];
    var color = colors[this.currentPlayer];
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '📱'));
    var heading = el('h2', 'text-xl font-bold mb-3');
    heading.textContent = tg('question.itsTurnOf', 'C\'est au tour de') + ' ' + player.name + ' !';
    wrap.appendChild(heading);
    wrap.appendChild(el('p', 'text-muted-foreground mb-6', tg('question.passPhoneOrLookAway', 'Passez le téléphone ou détournez le regard')));

    var btn = el('button', 'btn btn-cta', tg('question.chooseAnswer', 'Répondre'));
    btn.style.background = color.bg;
    btn.addEventListener('click', function() { self.phase = 'playing'; self.render(); });
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  ParentaliteQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var totalAnswers = total * 2;
    var answeredCount = this.scores[0].length + this.scores[1].length;
    var player = this.players[this.currentPlayer];
    var colors = [{ bg: '#ec4899', text: '#fff' }, { bg: '#3b82f6', text: '#fff' }];
    var color = colors[this.currentPlayer];

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, answeredCount, totalAnswers, tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + total);

    var badge = el('div', 'text-center mb-4');
    badge.innerHTML = '<span class="badge" style="background:' + color.bg + ';color:' + color.text + '">' + esc(player.name) + '</span>';
    wrap.appendChild(badge);

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText)));

    var optionsWrap = el('div', 'space-y-2');
    q.options.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      var optLetters = ['A','B','C','D','E'];
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (optLetters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        if (!answerLock(self)) return;
        optBtn.classList.add('selected');
        var siblings = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < siblings.length; s++) {
          if (siblings[s] !== optBtn) siblings[s].style.opacity = '0.5';
          siblings[s].style.pointerEvents = 'none';
        }
        self.scores[self.currentPlayer].push(opt.points);

        setTimeout(function() {
          if (self.currentPlayer === 0) {
            self.currentPlayer = 1;
            self.phase = 'handoff';
          } else if (self.currentQ < total - 1) {
            self.currentQ++;
            self.currentPlayer = 0;
            self.phase = 'handoff';
          } else {
            self.phase = 'results';
          }
          self.render();
        }, 350);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);
    this.container.appendChild(wrap);
  };

  ParentaliteQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');

    var s1 = this.scores[0].reduce(function(s, v) { return s + v; }, 0);
    var s2 = this.scores[1].reduce(function(s, v) { return s + v; }, 0);
    var totalScore = s1 + s2;
    var maxTotal = this.maxPerPlayer * 2;
    var pct = Math.round((totalScore / maxTotal) * 100);

    // Combined score header
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2', tg('parentalite.combinedScore', 'Score global du couple')));
    var mainRingP = el('div', '');
    mainRingP.innerHTML = renderScoreRing(pct);
    wrap.appendChild(mainRingP);
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6 quiz-reveal-enter', totalScore + '/' + maxTotal));

    // Individual scores
    var scoresGrid = el('div', 'grid grid-cols-2 gap-4 mb-6');
    var colors = [{ bg: '#ec4899' }, { bg: '#3b82f6' }];
    for (var i = 0; i < 2; i++) {
      var score = i === 0 ? s1 : s2;
      var card = el('div', 'glass-card rounded-xl p-4 text-center');
      var iPctP = Math.round((score / this.maxPerPlayer) * 100);
      card.innerHTML = '<p class="font-semibold mb-2" style="color:' + colors[i].bg + '">' + esc(this.players[i].name) + '</p>' +
        renderScoreRing(iPctP, 'sm') +
        '<p class="text-xs text-muted-foreground">' + score + '/' + this.maxPerPlayer + '</p>';
      scoresGrid.appendChild(card);
    }
    wrap.appendChild(scoresGrid);

    // Alert if big gap between scores
    if (Math.abs(s1 - s2) > 15) {
      var gapAlert = el('div', 'glass-card rounded-xl p-4 mb-6 border-l-4 border-orange-400');
      gapAlert.innerHTML = '<p class="text-sm">' + esc(tg('parentalite.gapWarning', 'Il y a un écart significatif entre vos deux scores. C\'est souvent dans ces écarts que se trouvent les discussions les plus importantes à avoir.')) + '</p>';
      wrap.appendChild(gapAlert);
    }

    // Find matching result based on combined score
    var result = null;
    for (var j = 0; j < this.results.length; j++) {
      var r = this.results[j];
      // Use individual player score (average) to match results on 60-point scale
      var avgScore = totalScore / 2;
      if (avgScore >= (r.min || 0) && avgScore <= (r.max || 999)) { result = r; break; }
    }
    if (result) {
      var resultCard = el('div', 'glass-card rounded-xl p-6 mb-6 text-left max-w-lg mx-auto');
      resultCard.innerHTML = '<h3 class="text-xl font-bold mb-3 text-center">' + esc(result.title) + '</h3>' +
        '<p class="text-muted-foreground leading-relaxed mb-4">' + esc(result.description) + '</p>';
      if (result.advice) {
        resultCard.innerHTML += '<div class="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-3"><strong class="block mb-2">' +
          esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong><span class="text-sm text-muted-foreground">' + esc(result.advice) + '</span></div>';
      }
      wrap.appendChild(resultCard);
    }

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: pct, verdict: result ? result.title : '' },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // TRUE/FALSE QUIZ - vrai-faux (solo, correct answer reveal)
  // Single player: statement → Vrai/Faux → reveal correct + explanation
  // ═══════════════════════════════════════════════════════════
  function TruefalseQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.phase = 'intro';
    this.currentQ = 0;
    this.score = 0;
    this.answers = [];
    this.render();
  }

  TruefalseQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'intro') this.renderIntro();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'reveal') this.renderReveal();
    else if (this.phase === 'results') this.renderResults();
  };

  TruefalseQuiz.prototype.renderIntro = function() {
    var self = this;
    var svg = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; };
    var iCheck = svg('<path d="M20 6L9 17l-5-5"/>');
    var iList = svg('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>');
    var iClock = svg('<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>');
    var wrap = el('div', 'quiz-engine quiz-intro animate-fade-in');
    wrap.innerHTML =
      '<div class="quiz-intro-badge">' + iCheck + '</div>' +
      '<h2 class="quiz-intro-title">' + esc(tg('truefalse.ready', 'Prêt pour le vrai ou faux ?')) + '</h2>' +
      '<div class="quiz-intro-meta">' +
        '<span class="quiz-meta-chip">' + iList + '<span>' + this.questions.length + ' ' + esc(tg('truefalse.statements', 'affirmations')) + '</span></span>' +
        '<span class="quiz-meta-chip">' + iClock + '<span>' + esc(tg('meta.duration', '5 min')) + '</span></span>' +
      '</div>' +
      '<div class="quiz-intro-how">' +
        '<span class="quiz-intro-how-title">' + esc(tg('truefalse.howTitle', 'Comment ça marche ?')) + '</span>' +
        '<p>' + esc(tg('truefalse.howDesc', 'Pour chaque affirmation, choisissez Vrai ou Faux. La bonne réponse et une explication s\'affichent après chaque question.')) + '</p>' +
      '</div>';
    var btn = el('button', 'btn btn-cta btn-lg quiz-intro-start', esc(tg('playerSetup.startQuiz', 'Commencer le quiz')));
    btn.addEventListener('click', function() {
      self.phase = 'playing';
      self.currentQ = 0;
      self.score = 0;
      self.answers = [];
      self.render();
    });
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  TruefalseQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var wrap = el('div', 'quiz-engine quiz-question-enter');

    renderProgressBar(wrap, this.currentQ, total);

    // Score display
    var scoreDisp = el('div', 'text-center mb-4');
    scoreDisp.innerHTML = '<span class="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 rounded-full px-3 py-1">' +
      esc(tg('truefalse.score', 'Score')) + ': ' + this.score + '/' + this.currentQ + '</span>';
    wrap.appendChild(scoreDisp);

    // Statement
    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    var qEl = el('h3', 'text-xl font-semibold mb-8 text-center leading-relaxed', esc(qText));
    wrap.appendChild(qEl);

    // True / False buttons
    var btnWrap = el('div', 'grid grid-cols-2 gap-4 max-w-md mx-auto');

    var trueBtn = el('button', 'quiz-tf-btn quiz-tf-btn--true');
    trueBtn.innerHTML = '<span class="quiz-tf-icon">✓</span><span class="quiz-tf-label">' + esc(tg('truefalse.true', 'Vrai')) + '</span>';
    trueBtn.addEventListener('click', function() { self.handleAnswer('true'); });

    var falseBtn = el('button', 'quiz-tf-btn quiz-tf-btn--false');
    falseBtn.innerHTML = '<span class="quiz-tf-icon">✗</span><span class="quiz-tf-label">' + esc(tg('truefalse.false', 'Faux')) + '</span>';
    falseBtn.addEventListener('click', function() { self.handleAnswer('false'); });

    btnWrap.appendChild(trueBtn);
    btnWrap.appendChild(falseBtn);
    wrap.appendChild(btnWrap);

    // Back button
    if (this.currentQ > 0) {
      var navWrap = el('div', 'flex justify-center mt-6');
      var backBtn = el('button', 'btn btn-ghost text-sm', '&larr; ' + tg('question.previousQuestion', 'Précédent'));
      backBtn.addEventListener('click', function() {
        var prev = self.answers[self.currentQ - 1];
        if (prev && prev.correct) self.score--;
        self.answers.splice(self.currentQ - 1, 1);
        self.currentQ--;
        self.render();
      });
      navWrap.appendChild(backBtn);
      wrap.appendChild(navWrap);
    }

    this.container.appendChild(wrap);
  };

  TruefalseQuiz.prototype.handleAnswer = function(userAnswer) {
    var q = this.questions[this.currentQ];
    var correctAnswer = tgd(this.prefix + '.q' + q.id + 'answer', q.answer || 'true').trim().toLowerCase();
    var isCorrect = userAnswer === correctAnswer;
    if (isCorrect) this.score++;
    this.answers.push({ qId: q.id, userAnswer: userAnswer, correctAnswer: correctAnswer, correct: isCorrect });
    this.phase = 'reveal';
    this.render();
  };

  TruefalseQuiz.prototype.renderReveal = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var lastAnswer = this.answers[this.answers.length - 1];
    var isCorrect = lastAnswer.correct;
    var correctAnswer = lastAnswer.correctAnswer;
    var wrap = el('div', 'quiz-engine animate-fade-in');

    renderProgressBar(wrap, this.currentQ, total);

    // Result badge with revealSlide animation
    var badge = el('div', 'text-center mb-4 quiz-reveal-enter');
    if (isCorrect) {
      badge.innerHTML = '<span class="inline-flex items-center gap-2 text-base font-bold bg-green-500/15 text-green-600 dark:text-green-400 rounded-full px-5 py-2.5 shadow-sm">' +
        '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>' +
        esc(tg('truefalse.correct', 'Bonne réponse !')) + '</span>';
    } else {
      badge.innerHTML = '<span class="inline-flex items-center gap-2 text-base font-bold bg-red-500/15 text-red-600 dark:text-red-400 rounded-full px-5 py-2.5 shadow-sm">' +
        '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        esc(tg('truefalse.wrong', 'Mauvaise réponse')) + '</span>';
    }
    wrap.appendChild(badge);

    // Statement
    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    var qEl = el('h3', 'text-lg font-semibold mb-4 text-center', esc(qText));
    wrap.appendChild(qEl);

    // Correct answer display
    var answerLabel = correctAnswer === 'true' ? tg('truefalse.true', 'Vrai') : tg('truefalse.false', 'Faux');
    var answerBox = el('div', 'text-center mb-4');
    answerBox.innerHTML = '<span class="text-sm text-muted-foreground">' + esc(tg('truefalse.correctAnswer', 'La réponse :')) +
      '</span> <span class="font-bold text-primary">' + esc(answerLabel) + '</span>';
    wrap.appendChild(answerBox);

    // Explanation
    var expText = tgd(this.prefix + '.q' + q.id + 'exp', '');
    if (expText) {
      var expBox = el('div', 'glass-card rounded-xl p-5 mb-6 max-w-lg mx-auto text-left quiz-reveal-enter');
      expBox.style.animationDelay = '200ms';
      expBox.innerHTML = '<p class="text-sm text-muted-foreground leading-relaxed">' +
        '<strong class="text-foreground">' + esc(tg('truefalse.explanation', 'Explication')) + ' :</strong> ' + esc(expText) + '</p>';
      wrap.appendChild(expBox);
    }

    // Score tracker with pulse
    var scoreDisp = el('div', 'text-center mb-6 quiz-score-tracker');
    scoreDisp.innerHTML = '<span class="text-sm font-medium text-muted-foreground">' +
      esc(tg('truefalse.score', 'Score')) + ': <span class="text-primary font-bold quiz-score-pulse">' + this.score + '</span>/' + (this.currentQ + 1) + '</span>';
    wrap.appendChild(scoreDisp);

    // Next button
    var isLast = this.currentQ >= total - 1;
    var nextLabel = isLast ? tg('truefalse.seeResults', 'Voir les résultats') : tg('truefalse.next', 'Question suivante');
    var nextBtn = el('button', 'btn btn-cta btn-lg', esc(nextLabel) + ' &rarr;');
    nextBtn.addEventListener('click', function() {
      if (isLast) {
        self.phase = 'results';
      } else {
        self.currentQ++;
        self.phase = 'playing';
      }
      self.render();
    });
    var btnWrap = el('div', 'text-center');
    btnWrap.appendChild(nextBtn);
    wrap.appendChild(btnWrap);

    this.container.appendChild(wrap);
    smoothScroll(this.container, 'start');
  };

  TruefalseQuiz.prototype.renderResults = function() {
    var self = this;
    var total = this.questions.length;
    var pct = Math.round((this.score / total) * 100);
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');

    // Score ring
    var scoreRingTf = el('div', '');
    scoreRingTf.innerHTML = renderScoreRing(pct);
    wrap.appendChild(scoreRingTf);
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6 quiz-reveal-enter', this.score + '/' + total + ' ' + tg('truefalse.correctAnswers', 'bonnes réponses')));

    // Find matching result
    var result = null;
    for (var i = 0; i < this.results.length; i++) {
      var r = this.results[i];
      if (this.score >= r.min && this.score <= r.max) { result = r; break; }
    }
    if (!result && this.results.length > 0) result = this.results[this.results.length - 1];

    if (result) {
      wrap.appendChild(el('h3', 'text-2xl font-bold mb-3', esc(result.title)));
      wrap.appendChild(el('p', 'text-muted-foreground leading-relaxed mb-4 max-w-lg mx-auto', result.description));
      if (result.advice) {
        var advice = el('div', 'text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4 text-left max-w-lg mx-auto');
        advice.innerHTML = '<strong class="block mb-2">' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(result.advice);
        wrap.appendChild(advice);
      }
    }

    // Review answers summary
    var summaryWrap = el('div', 'mt-8 max-w-lg mx-auto text-left');
    summaryWrap.appendChild(el('h4', 'text-lg font-bold mb-4 text-center', esc(tg('truefalse.summary', 'Résumé de vos réponses'))));
    for (var j = 0; j < this.answers.length; j++) {
      var a = this.answers[j];
      var qObj = this.questions[j];
      var qTextSum = tgd(this.prefix + '.q' + qObj.id, qObj.text);
      var icon = a.correct ? '✅' : '❌';
      var row = el('div', 'flex items-start gap-2 py-2 border-b border-border last:border-0');
      row.innerHTML = '<span class="shrink-0 mt-0.5">' + icon + '</span>' +
        '<span class="text-sm text-muted-foreground">' + esc(qTextSum) + '</span>';
      summaryWrap.appendChild(row);
    }
    wrap.appendChild(summaryWrap);

    renderActionButtons(wrap, {
      share: { type: 'duo', score: this.score, total: total, pct: pct, verdict: result ? result.title : '' },
      newQuestions: function() { location.reload(); },
      restart: function() { self.phase = 'intro'; self.render(); }
    });

    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // PROFILE QUIZ - typologie (categorical, not a linear score)
  // Chaque option est rattachee a un axe ; l'axe dominant designe le
  // profil. Par defaut : les trois axes du test d'attachement
  // (secure/anxious/avoidant) et ses quatre styles, disorganized
  // couvrant le cas ou les deux axes insecures sont eleves.
  // Un quiz peut fournir ses propres axes (axes + axisLabels) et sa
  // propre regle de classement (classify), comme le test karmique.
  // ═══════════════════════════════════════════════════════════
  var PROFILE_AXES_DEFAUT = [
    { id: 'secure', color: '#22c55e' },
    { id: 'anxious', color: '#f59e0b' },
    { id: 'avoidant', color: '#6366f1' }
  ];

  function ProfileQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.labels = config.labels || {};
    this.categoryMap = config.categoryMap || { a: 'secure', b: 'secure', c: 'avoidant', d: 'anxious' };
    this.profiles = config.profiles || {};
    this.axes = config.axes || PROFILE_AXES_DEFAUT;
    this.axisLabels = config.axisLabels || { secure: 'Sécure', anxious: 'Anxieux', avoidant: 'Évitant' };
    this.classifier = typeof config.classify === 'function' ? config.classify : null;
    this.introTitle = config.introTitle || tg('attachment.introTitle', 'Quel est votre style d\'attachement ?');
    this.resultLabel = config.resultLabel || tg('attachment.yourStyle', 'Votre style d\'attachement');
    this.phase = 'intro';
    this.currentQ = 0;
    this.answers = [];
    this.tally = this.tallyVierge();
    this.render();
  }

  ProfileQuiz.prototype.tallyVierge = function() {
    var t = {};
    for (var i = 0; i < this.axes.length; i++) t[this.axes[i].id] = 0;
    return t;
  };

  ProfileQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'intro') this.renderIntro();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  ProfileQuiz.prototype.renderIntro = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', this.labels.icon || '🔗'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-3', this.introTitle));
    wrap.appendChild(el('p', 'text-muted-foreground mb-2', this.questions.length + ' ' + tg('meta.questionsWord', 'questions')));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-6', '⏱ ' + tg('meta.duration', '5 min')));
    var btn = el('button', 'btn btn-cta btn-lg', tg('playerSetup.startTest', 'Commencer le test'));
    btn.addEventListener('click', function() {
      self.phase = 'playing'; self.currentQ = 0; self.answers = [];
      self.tally = self.tallyVierge();
      self.render();
    });
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
  };

  ProfileQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentQ, total);

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(qText)));

    var optionsWrap = el('div', 'space-y-2');
    // Shuffle display order so users can't pattern-pick a fixed letter; the
    // category mapping keys off the option id, so order never affects scoring.
    var shown = shuffleArray(q.options);
    var letters = ['A', 'B', 'C', 'D', 'E'];
    shown.forEach(function(opt, idx) {
      var optText = tgd(self.prefix + '.q' + q.id + opt.id, opt.text);
      var optBtn = el('button', 'quiz-option');
      optBtn.innerHTML = '<span class="quiz-option-letter">' + (letters[idx] || '') + '</span><span>' + esc(optText) + '</span>';
      optBtn.style.animationDelay = (idx * 60) + 'ms';
      optBtn.addEventListener('mousemove', function(e) {
        var rect = optBtn.getBoundingClientRect();
        optBtn.style.setProperty('--ripple-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        optBtn.style.setProperty('--ripple-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      optBtn.addEventListener('click', function() {
        if (!answerLock(self)) return;
        optBtn.classList.add('selected');
        var sibs = optionsWrap.querySelectorAll('.quiz-option');
        for (var s = 0; s < sibs.length; s++) { if (sibs[s] !== optBtn) sibs[s].style.opacity = '0.5'; sibs[s].style.pointerEvents = 'none'; }
        var cat = self.categoryMap[opt.id];
        self.answers[self.currentQ] = cat;
        if (cat && self.tally[cat] !== undefined) self.tally[cat]++;
        setTimeout(function() {
          if (self.currentQ < total - 1) { self.currentQ++; self.render(); }
          else { self.phase = 'results'; self.render(); }
        }, 300);
      });
      optionsWrap.appendChild(optBtn);
    });
    wrap.appendChild(optionsWrap);

    if (this.currentQ > 0) {
      var navWrap = el('div', 'mt-6');
      var backBtn = el('button', 'btn btn-ghost text-sm', '&larr; ' + tg('question.previousQuestion', 'Précédent'));
      backBtn.addEventListener('click', function() {
        self.currentQ--;
        var prev = self.answers[self.currentQ];
        if (prev && self.tally[prev] !== undefined && self.tally[prev] > 0) self.tally[prev]--;
        self.answers[self.currentQ] = undefined;
        self.render();
      });
      navWrap.appendChild(backBtn);
      wrap.appendChild(navWrap);
    }

    this.container.appendChild(wrap);
  };

  ProfileQuiz.prototype.classify = function() {
    var n = this.questions.length || 1;
    if (this.classifier) return this.classifier(this.tally, n);
    var s = this.tally.secure, anx = this.tally.anxious, av = this.tally.avoidant;
    if (s >= Math.ceil(n * 0.45)) return 'secure';
    // Both insecure axes substantial → disorganized (fearful-avoidant)
    if (Math.min(anx, av) >= Math.ceil(n * 0.2)) return 'disorganized';
    return anx >= av ? 'anxious' : 'avoidant';
  };

  ProfileQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var key = this.classify();
    var profile = this.profiles[key] || {};
    var n = this.questions.length || 1;
    var pcts = {};
    for (var a = 0; a < this.axes.length; a++) {
      var idA = this.axes[a].id;
      pcts[idA] = Math.round((this.tally[idA] || 0) / n * 100);
    }

    wrap.appendChild(el('div', 'text-5xl mb-3', this.labels.icon || '🔗'));
    wrap.appendChild(el('p', 'text-sm text-muted-foreground mb-1', this.resultLabel));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-5 quiz-reveal-enter', esc(profile.title || key)));

    // ── Axis breakdown bars ──
    var breakdown = el('div', 'profile-breakdown max-w-md mx-auto mb-6');
    var axes = this.axes;
    axes.forEach(function(ax) {
      var pct = pcts[ax.id];
      var row = el('div', 'profile-axis-row');
      row.innerHTML =
        '<div class="profile-axis-head"><span>' + esc(self.axisLabels[ax.id] || ax.id) + '</span>' +
        '<span class="profile-axis-pct">' + pct + '%</span></div>' +
        '<div class="profile-axis-bar"><div class="profile-axis-fill" data-w="' + pct + '" style="width:0%;background:' + ax.color + '"></div></div>';
      breakdown.appendChild(row);
    });
    wrap.appendChild(breakdown);
    setTimeout(function() {
      var fills = wrap.querySelectorAll('.profile-axis-fill');
      for (var i = 0; i < fills.length; i++) fills[i].style.width = fills[i].getAttribute('data-w') + '%';
    }, 120);

    if (profile.description) wrap.appendChild(el('p', 'text-muted-foreground leading-relaxed mb-4 max-w-lg mx-auto quiz-reveal-enter', profile.description));
    if (profile.advice) {
      var advice = el('div', 'text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4 text-left max-w-lg mx-auto quiz-reveal-enter');
      advice.innerHTML = '<strong class="block mb-2">' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(profile.advice);
      wrap.appendChild(advice);
    }

    renderActionButtons(wrap, {
      share: { type: 'profil', verdict: profile.title || '' },
      restart: function() { self.phase = 'intro'; self.render(); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // LES Z'AMOURS - TV game-show engine
  // Faithful to the France 2 show: one partner secretly answers, the
  // other guesses; dramatic reveal, animated TV scoreboard, alternating
  // rounds ("manches") + a 45-second speed FINALE for the jackpot.
  // Draws a fresh random subset from the full bank every game.
  // ═══════════════════════════════════════════════════════════
  function ZamoursQuiz(config) {
    this.container = config.container;
    this.pool = config.questions || [];
    this.prefix = config.prefix || 'zamours';
    this.lang = config.lang || 'fr';
    this.perGame = config.perGame || 14;
    this.MAIN = 8;                 // main "manches"
    this.FINAL_MAX = 6;            // finale questions
    this.finalTarget = 4;          // correct guesses needed for the jackpot
    this.finalDuration = 45;       // seconds
    this.players = [null, null];
    this.phase = 'setup';
    this._timer = null;
    this.render();
  }

  ZamoursQuiz.prototype._clearTimer = function () {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  };

  ZamoursQuiz.prototype.initGame = function () {
    var idx = [];
    for (var i = 0; i < this.pool.length; i++) idx.push(i);
    idx = shuffleArray(idx).slice(0, this.perGame);
    var mainN = Math.min(this.MAIN, idx.length);
    this.rounds = [];
    for (var r = 0; r < mainN; r++) {
      var pts = r === 0 ? 10 : (r === mainN - 1 ? 15 : 5);
      var g = r % 2;
      this.rounds.push({ qIdx: idx[r], guesser: g, target: g === 0 ? 1 : 0, pts: pts, guess: null, actual: null, correct: null });
    }
    this.finalRounds = [];
    for (var f = mainN; f < idx.length && this.finalRounds.length < this.FINAL_MAX; f++) {
      var fg = this.finalRounds.length % 2;
      this.finalRounds.push({ qIdx: idx[f], guesser: fg, target: fg === 0 ? 1 : 0, guess: null, actual: null, correct: null });
    }
    this.roundIdx = 0; this.score = 0; this.correct = 0;
    this.finalIdx = 0; this.finalCorrect = 0; this.finalWon = false; this.finalPlayed = false;
  };

  ZamoursQuiz.prototype.qText = function (q, targetName) {
    var t = tgd(this.prefix + '.q' + q.id, q.text) || q.text;
    return String(t).replace(/\{\{name\}\}/g, targetName).replace(/\bNAME\b/g, targetName);
  };
  ZamoursQuiz.prototype.optText = function (q, opt) {
    return tgd(this.prefix + '.q' + q.id + opt.id, opt.text) || opt.text;
  };

  ZamoursQuiz.prototype.render = function () {
    this._clearTimer();
    this.container.innerHTML = '';
    if (this.phase === 'results') { this.renderResults(); return; }
    var stage = el('div', 'zamours-stage');
    stage.innerHTML = '<span class="zamours-lights" aria-hidden="true"></span>';
    this.stage = stage;
    this.container.appendChild(stage);
    var p = this.phase;
    if (p === 'setup') this.renderSetup();
    else if (p === 'guess') this.renderTurn(false);
    else if (p === 'reveal') this.renderTurn(true);
    else if (p === 'verdict') this.renderVerdict();
    else if (p === 'finalIntro') this.renderFinalIntro();
    else if (p === 'finalGuess') this.renderFinalTurn(false);
    else if (p === 'finalReveal') this.renderFinalTurn(true);
    else if (p === 'finalResult') this.renderFinalResult();
    else if (p === 'results') this.renderResults();
  };

  // Big TV title lockup
  ZamoursQuiz.prototype._marquee = function () {
    return '<div class="zamours-logo"><span class="zamours-logo-heart">💛</span>'
      + '<span class="zamours-logo-text">Les Z’Amours</span></div>';
  };

  ZamoursQuiz.prototype._scoreboard = function (roundLabel) {
    var nameA = esc(this.players[0].name), nameB = esc(this.players[1].name);
    var sb = el('div', 'zamours-scoreboard');
    sb.innerHTML =
      '<div class="zamours-couple"><span class="zamours-couple-name zamours--p1">' + nameA + '</span>'
      + '<span class="zamours-couple-amp">&amp;</span>'
      + '<span class="zamours-couple-name zamours--p2">' + nameB + '</span></div>'
      + '<div class="zamours-score-pill"><span class="zamours-score-num">' + this.score + '</span>'
      + '<span class="zamours-score-lbl">pts</span></div>'
      + (roundLabel ? '<div class="zamours-round-lbl">' + roundLabel + '</div>' : '');
    return sb;
  };

  ZamoursQuiz.prototype.renderSetup = function () {
    var self = this, stage = this.stage;
    stage.classList.add('zamours-stage--intro');
    var wrap = el('div', 'zamours-panel animate-fade-in');
    wrap.innerHTML = this._marquee()
      + '<p class="zamours-tagline">Le jeu culte de l’émission, version couple &mdash; en ligne, gratuit et sans inscription.</p>';

    var form = el('div', 'zamours-setup-form');
    for (var i = 0; i < 2; i++) {
      var pc = el('div', 'zamours-input-card zamours--p' + (i + 1));
      pc.innerHTML = '<label class="zamours-input-lbl">' + (i === 0 ? 'Joueur 1' : 'Joueur 2') + '</label>';
      var input = el('input', 'zamours-input');
      input.type = 'text'; input.maxLength = 18;
      input.placeholder = i === 0 ? 'Ton prénom…' : 'Son prénom…';
      input.id = 'zamours-p' + i;
      pc.appendChild(input);
      form.appendChild(pc);
    }
    wrap.appendChild(form);

    var howto = el('div', 'zamours-howto');
    howto.innerHTML = '<span class="zamours-howto-step">1. L’un devine</span>'
      + '<span class="zamours-howto-step">2. L’autre révèle</span>'
      + '<span class="zamours-howto-step">3. Le buzzer tranche 🔔</span>'
      + '<span class="zamours-howto-step">4. Finale &amp; jackpot 🏆</span>';
    wrap.appendChild(howto);

    var btn = el('button', 'zamours-btn zamours-btn--go', '🎬 Lancer la partie');
    btn.addEventListener('click', function () {
      var n1 = (document.getElementById('zamours-p0').value || '').trim() || 'Joueur 1';
      var n2 = (document.getElementById('zamours-p1').value || '').trim() || 'Joueur 2';
      self.players = [{ name: n1 }, { name: n2 }];
      self.initGame();
      self.phase = 'guess'; self.render();
    });
    wrap.appendChild(btn);
    stage.appendChild(wrap);
  };

  // Shared main-round screen. reveal=false → guesser predicts; reveal=true → target reveals.
  ZamoursQuiz.prototype.renderTurn = function (reveal) {
    var self = this;
    var round = this.rounds[this.roundIdx];
    var q = this.pool[round.qIdx];
    var guesser = this.players[round.guesser];
    var target = this.players[round.target];
    var actor = reveal ? target : guesser;
    var actorSide = reveal ? round.target : round.guesser;

    var wrap = el('div', 'zamours-panel zamours-question-enter');
    wrap.appendChild(this._scoreboard('Manche ' + (this.roundIdx + 1) + '/' + this.rounds.length
      + (round.pts === 15 ? ' &middot; BONUS ×15' : '')));

    var cue = el('div', 'zamours-cue zamours--p' + (actorSide + 1));
    if (reveal) {
      cue.innerHTML = '<span class="zamours-cue-pass">📱 Passe le téléphone à</span>'
        + '<span class="zamours-cue-name">' + esc(target.name) + '</span>'
        + '<span class="zamours-cue-sub">' + esc(guesser.name) + ', ne regarde pas ! 🙈</span>';
    } else {
      cue.innerHTML = '<span class="zamours-cue-pass">À toi de deviner</span>'
        + '<span class="zamours-cue-name">' + esc(guesser.name) + '</span>'
        + '<span class="zamours-cue-sub">Que va répondre <strong>' + esc(target.name) + '</strong> ?</span>';
    }
    wrap.appendChild(cue);

    wrap.appendChild(el('h3', 'zamours-question', esc(this.qText(q, target.name))));
    wrap.appendChild(this._options(q, function (opt) {
      if (reveal) {
        round.actual = opt.id;
        round.correct = (round.guess === opt.id);
        if (round.correct) { self.score += round.pts; self.correct++; }
        self.phase = 'verdict';
      } else {
        round.guess = opt.id;
        self.phase = 'reveal';
      }
      self.render();
    }));
    this.stage.appendChild(wrap);
  };

  // Build an options list; onPick(opt) fires after a short select animation.
  ZamoursQuiz.prototype._options = function (q, onPick) {
    var self = this;
    var box = el('div', 'zamours-options');
    var letters = ['A', 'B', 'C', 'D', 'E'];
    var done = false; // guard: a pick is final, ignore any further/duplicate taps
    q.options.forEach(function (opt, idx) {
      var b = el('button', 'zamours-opt');
      b.style.animationDelay = (idx * 55) + 'ms';
      b.innerHTML = '<span class="zamours-opt-letter">' + (letters[idx] || '') + '</span>'
        + '<span class="zamours-opt-text">' + esc(self.optText(q, opt)) + '</span>';
      b.addEventListener('click', function () {
        if (done) return; done = true;
        b.classList.add('is-picked');
        var sib = box.querySelectorAll('.zamours-opt');
        for (var s = 0; s < sib.length; s++) { sib[s].style.pointerEvents = 'none'; if (sib[s] !== b) sib[s].classList.add('is-dimmed'); }
        setTimeout(function () { onPick(opt); }, 300);
      });
      box.appendChild(b);
    });
    return box;
  };

  ZamoursQuiz.prototype.renderVerdict = function () {
    var self = this;
    var round = this.rounds[this.roundIdx];
    var q = this.pool[round.qIdx];
    var guesser = this.players[round.guesser];
    var target = this.players[round.target];
    var ok = round.correct;

    var wrap = el('div', 'zamours-panel zamours-verdict ' + (ok ? 'is-win' : 'is-miss'));
    wrap.appendChild(this._scoreboard(null));

    var badge = el('div', 'zamours-verdict-badge ' + (ok ? 'is-win' : 'is-miss'));
    badge.innerHTML = ok
      ? '<span class="zamours-verdict-emoji">🔔</span><span class="zamours-verdict-word">Dans le mille !</span><span class="zamours-verdict-pts">+' + round.pts + ' pts</span>'
      : '<span class="zamours-verdict-emoji">📛</span><span class="zamours-verdict-word">Raté&hellip;</span><span class="zamours-verdict-pts">+0</span>';
    wrap.appendChild(badge);
    if (ok) this._confetti(wrap);

    var gOpt = null, aOpt = null;
    q.options.forEach(function (o) { if (o.id === round.guess) gOpt = o; if (o.id === round.actual) aOpt = o; });
    var recap = el('div', 'zamours-recap');
    recap.innerHTML =
      '<div class="zamours-recap-row"><span class="zamours-recap-who zamours--p' + (round.guesser + 1) + '">' + esc(guesser.name) + ' a deviné</span>'
      + '<span class="zamours-recap-ans">' + esc(gOpt ? this.optText(q, gOpt) : '—') + '</span></div>'
      + '<div class="zamours-recap-row"><span class="zamours-recap-who zamours--p' + (round.target + 1) + '">' + esc(target.name) + ' a répondu</span>'
      + '<span class="zamours-recap-ans is-real">' + esc(aOpt ? this.optText(q, aOpt) : '—') + '</span></div>';
    wrap.appendChild(recap);

    var last = this.roundIdx + 1 >= this.rounds.length;
    var btn = el('button', 'zamours-btn', last ? '🏆 Passer à la FINALE' : 'Manche suivante →');
    btn.addEventListener('click', function () {
      if (last) { self.phase = 'finalIntro'; }
      else { self.roundIdx++; self.phase = 'guess'; }
      self.render();
    });
    wrap.appendChild(btn);
    this.stage.appendChild(wrap);
  };

  ZamoursQuiz.prototype.renderFinalIntro = function () {
    var self = this;
    var wrap = el('div', 'zamours-panel zamours-final-intro animate-fade-in');
    wrap.innerHTML = '<div class="zamours-final-badge">FINALE</div>'
      + '<h3 class="zamours-final-h">45 secondes pour décrocher le jackpot 🏆</h3>'
      + '<p class="zamours-final-p">Enchaînez les questions le plus vite possible. <strong>' + this.finalTarget
      + ' bonnes réponses</strong> avant la fin du chrono et vous partez (virtuellement) en week-end&nbsp;!</p>'
      + '<p class="zamours-final-mini">Score des manches : <strong>' + this.score + ' pts</strong></p>';
    if (!this.finalRounds || this.finalRounds.length === 0) {
      var skip = el('button', 'zamours-btn zamours-btn--go', 'Voir le résultat');
      skip.addEventListener('click', function () { self.phase = 'results'; self.render(); });
      wrap.appendChild(skip);
      this.stage.appendChild(wrap); return;
    }
    var btn = el('button', 'zamours-btn zamours-btn--go', '⏱️ C’est parti !');
    btn.addEventListener('click', function () {
      self.finalPlayed = true;
      self.finalEndTime = Date.now() + self.finalDuration * 1000;
      self.phase = 'finalGuess'; self.render();
    });
    wrap.appendChild(btn);
    this.stage.appendChild(wrap);
  };

  ZamoursQuiz.prototype.renderFinalTurn = function (reveal) {
    var self = this;
    if (this.finalIdx >= this.finalRounds.length) { this.phase = 'finalResult'; this.render(); return; }
    var round = this.finalRounds[this.finalIdx];
    var q = this.pool[round.qIdx];
    var guesser = this.players[round.guesser];
    var target = this.players[round.target];

    var wrap = el('div', 'zamours-panel zamours-final-play zamours-question-enter');

    var top = el('div', 'zamours-final-top');
    top.innerHTML = this._timerRingSVG()
      + '<div class="zamours-final-tally"><span class="zamours-final-tally-num">' + this.finalCorrect + '</span>'
      + '<span class="zamours-final-tally-lbl">/ ' + this.finalTarget + '</span></div>';
    wrap.appendChild(top);

    var actorSide = reveal ? round.target : round.guesser;
    var cue = el('div', 'zamours-cue zamours-cue--mini zamours--p' + (actorSide + 1));
    cue.innerHTML = reveal
      ? '<span class="zamours-cue-name">' + esc(target.name) + '</span><span class="zamours-cue-sub">ta vraie réponse, vite&nbsp;!</span>'
      : '<span class="zamours-cue-name">' + esc(guesser.name) + '</span><span class="zamours-cue-sub">devine pour ' + esc(target.name) + '</span>';
    wrap.appendChild(cue);

    wrap.appendChild(el('h3', 'zamours-question zamours-question--mini', esc(this.qText(q, target.name))));
    wrap.appendChild(this._options(q, function (opt) {
      if (reveal) {
        round.actual = opt.id;
        round.correct = (round.guess === opt.id);
        if (round.correct) self.finalCorrect++;
        self.finalIdx++;
        if (self.finalCorrect >= self.finalTarget) { self.finalWon = true; self.phase = 'finalResult'; }
        else if (self.finalIdx >= self.finalRounds.length) { self.phase = 'finalResult'; }
        else { self.phase = 'finalGuess'; }
      } else {
        round.guess = opt.id;
        self.phase = 'finalReveal';
      }
      self.render();
    }));
    this.stage.appendChild(wrap);
    this._startFinalTimer();
  };

  ZamoursQuiz.prototype._timerRingSVG = function () {
    var R = 34, C = 2 * Math.PI * R;
    return '<div class="zamours-timer"><svg viewBox="0 0 80 80" class="zamours-timer-svg">'
      + '<circle cx="40" cy="40" r="' + R + '" class="zamours-timer-track"/>'
      + '<circle cx="40" cy="40" r="' + R + '" class="zamours-timer-fill" '
      + 'style="stroke-dasharray:' + C.toFixed(1) + ';stroke-dashoffset:0"/></svg>'
      + '<span class="zamours-timer-num">' + this.finalDuration + '</span></div>';
  };

  ZamoursQuiz.prototype._startFinalTimer = function () {
    var self = this;
    var R = 34, C = 2 * Math.PI * R;
    var fill = this.stage.querySelector('.zamours-timer-fill');
    var num = this.stage.querySelector('.zamours-timer-num');
    var tick = function () {
      var remain = Math.max(0, self.finalEndTime - Date.now());
      var secs = Math.ceil(remain / 1000);
      if (num) { num.textContent = secs; if (secs <= 10) num.classList.add('is-urgent'); }
      if (fill) { var frac = remain / (self.finalDuration * 1000); fill.style.strokeDashoffset = ((1 - frac) * C).toFixed(1); }
      if (remain <= 0) { self._clearTimer(); self.phase = 'finalResult'; self.render(); }
    };
    tick();
    this._timer = setInterval(tick, 100);
  };

  ZamoursQuiz.prototype.renderFinalResult = function () {
    var self = this;
    var won = this.finalWon || this.finalCorrect >= this.finalTarget;
    var wrap = el('div', 'zamours-panel zamours-final-result animate-fade-in ' + (won ? 'is-win' : 'is-miss'));
    wrap.innerHTML = won
      ? '<div class="zamours-jackpot">🏆</div><h3 class="zamours-final-h">JACKPOT&nbsp;!</h3>'
        + '<p class="zamours-final-p">' + this.finalCorrect + ' bonnes réponses&nbsp;: vous décrochez le séjour en amoureux 🧳❤️</p>'
      : '<div class="zamours-jackpot">⏰</div><h3 class="zamours-final-h">Si près&nbsp;!</h3>'
        + '<p class="zamours-final-p">' + this.finalCorrect + '/' + this.finalTarget + ' bonnes réponses. Le séjour sera pour la prochaine&nbsp;!</p>';
    if (won) this._confetti(wrap);
    var btn = el('button', 'zamours-btn zamours-btn--go', 'Voir le score final →');
    btn.addEventListener('click', function () { self.phase = 'results'; self.render(); });
    wrap.appendChild(btn);
    this.stage.appendChild(wrap);
  };

  ZamoursQuiz.prototype._verdictTier = function () {
    var c = this.correct, n = this.rounds.length;
    var r = n ? c / n : 0;
    if (r >= 0.85) return { t: 'Couple en or 🥇', d: 'Vous vous connaissez par cœur. Les Z’Amours n’ont plus de secrets pour vous&nbsp;!' };
    if (r >= 0.6) return { t: 'Sacrée complicité 💞', d: 'Belle connexion&nbsp;: vous devinez presque tout l’un de l’autre.' };
    if (r >= 0.35) return { t: 'Encore des secrets 🤔', d: 'Vous vous connaissez bien, mais il reste de belles choses à découvrir.' };
    return { t: 'À la découverte 🌱', d: 'Le jeu ne fait que commencer&nbsp;: rejouez pour apprendre à mieux vous deviner&nbsp;!' };
  };

  ZamoursQuiz.prototype.renderResults = function () {
    var self = this;
    var tier = this._verdictTier();
    var wrap = el('div', 'quiz-engine zamours-results quiz-result-card');
    var jackpot = this.finalPlayed && (this.finalWon || this.finalCorrect >= this.finalTarget);

    // Self-contained dark "TV" hero so it stays readable once renderActionButtons
    // moves it into the light 2-column results layout.
    var hero = el('div', 'zamours-results-hero');
    hero.innerHTML = this._marquee()
      + '<div class="zamours-results-emoji">' + (jackpot ? '🏆' : '💛') + '</div>'
      + '<h2 class="zamours-results-title">' + esc(tier.t) + '</h2>'
      + '<p class="zamours-results-sub">' + tier.d + '</p>'
      + '<div class="zamours-results-stats">'
      + '<div class="zamours-stat"><span class="zamours-stat-num">' + this.score + '</span><span class="zamours-stat-lbl">points</span></div>'
      + '<div class="zamours-stat"><span class="zamours-stat-num">' + this.correct + '/' + this.rounds.length + '</span><span class="zamours-stat-lbl">bonnes manches</span></div>'
      + (this.finalPlayed ? '<div class="zamours-stat"><span class="zamours-stat-num">' + (jackpot ? '🏆' : this.finalCorrect + '/' + this.finalTarget) + '</span><span class="zamours-stat-lbl">finale</span></div>' : '')
      + '</div>'
      + '<p class="zamours-results-couple">Bravo <strong>' + esc(this.players[0].name) + '</strong> &amp; <strong>' + esc(this.players[1].name) + '</strong> !</p>';
    if (jackpot) this._confetti(hero);
    wrap.appendChild(hero);

    var quizEl = document.getElementById('quiz-engine');
    var hasPool = quizEl && quizEl.dataset.hasPool === '1';
    renderActionButtons(wrap, {
      share: { type: 'duo', points: true, score: this.score },
      newQuestions: hasPool ? function () { self.initGame(); self.phase = 'guess'; self.render(); smoothScroll(self.container, 'start'); } : null,
      restart: function () { self.phase = 'setup'; self.render(); smoothScroll(self.container, 'start'); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  ZamoursQuiz.prototype._confetti = function (node) {
    var colors = ['#ff4d94', '#a855f7', '#ffd23f', '#22c55e', '#38bdf8'];
    var html = '<div class="confetti-container" aria-hidden="true">';
    for (var i = 0; i < 26; i++) {
      var tx = (Math.random() * 300 - 150).toFixed(0);
      var ty = (Math.random() * -220 - 60).toFixed(0);
      html += '<span class="confetti-dot" style="background:' + colors[i % colors.length]
        + ';--tx:' + tx + 'px;--ty:' + ty + 'px;animation-delay:' + (0.04 * i).toFixed(2) + 's"></span>';
    }
    html += '</div>';
    var c = el('div', 'zamours-confetti', html);
    node.appendChild(c);
  };

  // ══════════════════════════════════════════════════════════
  //  TentationQuiz — "Survivrez-vous à l'île de la tentation ?"
  //  Solo immersive run that mirrors the show's structure: a 12-day stay
  //  on the island, one tempting situation per day, punctuated by the
  //  ritual "feu de camp" (bonfire) every 4 days, then a final bonfire
  //  verdict. Every option carries 0..3 temptation points; the lower the
  //  total, the better you resisted.
  //  All UI copy comes from quizGames.json (tentation.*) so the skin works
  //  in the 5 languages the show actually airs in.
  // ══════════════════════════════════════════════════════════
  function TentationQuiz(config) {
    this.container = config.container;
    this.pool = config.questions || [];
    this.results = config.results || [];
    this.prefix = config.prefix || 'tentation';
    this.lang = config.lang || 'fr';
    this.days = Math.min(config.days || 12, this.pool.length);
    this.bonfireEvery = 4;              // ritual bonfire cadence, as on the show
    this.phase = 'setup';
    this.render();
  }

  TentationQuiz.prototype.tt = function (key, fallback) {
    return tg('tentation.' + key, fallback);
  };

  TentationQuiz.prototype.initStay = function () {
    this.deck = shuffleArray(this.pool.slice()).slice(0, this.days);
    this.dayIdx = 0;
    this.score = 0;          // temptation points accumulated
    this.answers = [];
    this.maxScore = 0;
    for (var i = 0; i < this.deck.length; i++) {
      var best = 0;
      for (var j = 0; j < this.deck[i].options.length; j++) {
        if ((this.deck[i].options[j].points || 0) > best) best = this.deck[i].options[j].points || 0;
      }
      this.maxScore += best;
    }
  };

  TentationQuiz.prototype.qText = function (q) {
    var t = tgd(this.prefix + '.q' + q.id, q.text) || q.text;
    return String(t).replace(/\{\{name\}\}/g, this.partner || '');
  };
  TentationQuiz.prototype.optText = function (q, opt) {
    var t = tgd(this.prefix + '.q' + q.id + opt.id, opt.text) || opt.text;
    return String(t).replace(/\{\{name\}\}/g, this.partner || '');
  };

  TentationQuiz.prototype.render = function () {
    this.container.innerHTML = '';
    document.body.classList.remove('quiz-has-result');
    if (this.phase === 'results') { this.renderResults(); return; }
    var island = el('div', 'tentation-island');
    island.innerHTML =
      '<span class="tentation-sky" aria-hidden="true"></span>'
      + '<span class="tentation-moon" aria-hidden="true"></span>'
      + '<span class="tentation-sea" aria-hidden="true"></span>'
      + '<span class="tentation-palms" aria-hidden="true"></span>';
    this.island = island;
    this.container.appendChild(island);
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'day') this.renderDay();
    else if (this.phase === 'bonfire') this.renderBonfire();
  };

  TentationQuiz.prototype._logo = function () {
    return '<div class="tentation-logo">'
      + '<span class="tentation-logo-top">' + esc(this.tt('logoTop', "L'île de la")) + '</span>'
      + '<span class="tentation-logo-main">' + esc(this.tt('logoMain', 'TENTATION')) + '</span>'
      + '</div>';
  };

  // Small flame used both as decor and as the bonfire centrepiece.
  TentationQuiz.prototype._flame = function (cls) {
    return '<span class="tentation-flame ' + (cls || '') + '" aria-hidden="true">'
      + '<span class="tentation-flame-core"></span>'
      + '<span class="tentation-flame-glow"></span>'
      + '</span>';
  };

  TentationQuiz.prototype.renderSetup = function () {
    var self = this;
    this.island.classList.add('tentation-island--intro');
    var wrap = el('div', 'tentation-panel animate-fade-in');
    wrap.innerHTML = this._logo()
      + '<p class="tentation-tagline">' + esc(this.tt('tagline', '12 jours sur une île paradisiaque, entouré·e de tentations. Y résisterez-vous ?')) + '</p>';

    var form = el('div', 'tentation-setup-form');
    var fields = [
      { id: 'tentation-you', lbl: this.tt('yourName', 'Votre prénom'), ph: this.tt('yourNamePh', 'Ex : Camille') },
      { id: 'tentation-partner', lbl: this.tt('partnerName', 'Le prénom de votre partenaire'), ph: this.tt('partnerNamePh', 'Ex : Alex') }
    ];
    fields.forEach(function (f) {
      var card = el('div', 'tentation-input-card');
      card.innerHTML = '<label class="tentation-input-lbl" for="' + f.id + '">' + esc(f.lbl) + '</label>';
      var input = el('input', 'tentation-input');
      input.type = 'text'; input.maxLength = 18; input.id = f.id; input.placeholder = f.ph;
      card.appendChild(input);
      form.appendChild(card);
    });
    wrap.appendChild(form);

    var rules = el('div', 'tentation-rules');
    rules.innerHTML =
      '<div class="tentation-rule"><span class="tentation-rule-ico">🏝️</span><span>' + esc(this.tt('rule1', 'Vous partez seul·e, séparé·e de votre partenaire')) + '</span></div>'
      + '<div class="tentation-rule"><span class="tentation-rule-ico">😈</span><span>' + esc(this.tt('rule2', 'Chaque jour, une tentation vous met à l\'épreuve')) + '</span></div>'
      + '<div class="tentation-rule"><span class="tentation-rule-ico">🔥</span><span>' + esc(this.tt('rule3', 'Tous les 4 jours, le feu de camp révèle tout')) + '</span></div>'
      + '<div class="tentation-rule"><span class="tentation-rule-ico">💔</span><span>' + esc(this.tt('rule4', 'Au dernier feu de camp, le verdict tombe')) + '</span></div>';
    wrap.appendChild(rules);

    var btn = el('button', 'tentation-btn tentation-btn--go', '🏝️ ' + esc(this.tt('start', 'Partir sur l\'île')));
    btn.addEventListener('click', function () {
      var you = (document.getElementById('tentation-you').value || '').trim();
      var partner = (document.getElementById('tentation-partner').value || '').trim();
      self.you = you || self.tt('defaultYou', 'Vous');
      self.partner = partner || self.tt('defaultPartner', 'votre partenaire');
      self.initStay();
      self.phase = 'day';
      self.render();
      smoothScroll(self.container, 'start');
    });
    wrap.appendChild(btn);
    this.island.appendChild(wrap);
  };

  // Day counter + resistance meter shown above each situation.
  TentationQuiz.prototype._hud = function () {
    var hud = el('div', 'tentation-hud');
    var pct = this.maxScore > 0 ? Math.round(100 - (this.score / this.maxScore) * 100) : 100;
    hud.innerHTML =
      '<div class="tentation-day-badge">' + esc(this.tt('day', 'Jour')) + ' <strong>' + (this.dayIdx + 1) + '</strong>/' + this.deck.length + '</div>'
      + '<div class="tentation-meter" role="img" aria-label="' + esc(this.tt('resistance', 'Résistance')) + ' ' + pct + '%">'
      + '<span class="tentation-meter-fill" style="width:' + pct + '%"></span>'
      + '</div>'
      + '<div class="tentation-meter-lbl">' + esc(this.tt('resistance', 'Résistance')) + ' ' + pct + '%</div>';
    return hud;
  };

  TentationQuiz.prototype.renderDay = function () {
    var self = this;
    var q = this.deck[this.dayIdx];
    var wrap = el('div', 'tentation-panel tentation-panel--day animate-fade-in');
    wrap.appendChild(this._hud());

    var card = el('div', 'tentation-situation');
    card.innerHTML = '<span class="tentation-situation-tag">' + esc(this.tt('situation', 'La situation')) + '</span>'
      + '<h3 class="tentation-question">' + esc(this.qText(q)) + '</h3>';
    wrap.appendChild(card);

    var opts = el('div', 'tentation-options');
    q.options.forEach(function (opt, i) {
      var b = el('button', 'tentation-option');
      b.innerHTML = '<span class="tentation-option-letter">' + ['A', 'B', 'C', 'D', 'E'][i] + '</span>'
        + '<span class="tentation-option-text">' + esc(self.optText(q, opt)) + '</span>';
      b.style.animationDelay = (i * 70) + 'ms';
      b.addEventListener('click', function () {
        if (!answerLock(self)) return;
        if (wrap.dataset.done === '1') return;   // guard against double taps
        wrap.dataset.done = '1';
        b.classList.add('is-picked');
        var all = opts.querySelectorAll('.tentation-option');
        for (var k = 0; k < all.length; k++) { all[k].style.pointerEvents = 'none'; if (all[k] !== b) all[k].classList.add('is-dimmed'); }
        self.score += (opt.points || 0);
        self.answers.push({ id: q.id, points: opt.points || 0 });
        setTimeout(function () {
          var day = self.dayIdx + 1;
          if (day >= self.deck.length) { self.phase = 'bonfire'; self.isFinal = true; }
          else if (day % self.bonfireEvery === 0) { self.phase = 'bonfire'; self.isFinal = false; }
          else { self.dayIdx++; }
          self.render();
        }, 420);
      });
      opts.appendChild(b);
    });
    wrap.appendChild(opts);
    this.island.appendChild(wrap);
  };

  // The show's signature ritual: a night bonfire where the footage is revealed.
  TentationQuiz.prototype.renderBonfire = function () {
    var self = this;
    this.island.classList.add('tentation-island--night');
    var wrap = el('div', 'tentation-panel tentation-panel--bonfire animate-fade-in');

    // Temptation ratio so far → which reaction your partner has at the bonfire.
    var soFarMax = 0;
    for (var i = 0; i <= this.dayIdx && i < this.deck.length; i++) {
      var best = 0;
      for (var j = 0; j < this.deck[i].options.length; j++) {
        if ((this.deck[i].options[j].points || 0) > best) best = this.deck[i].options[j].points || 0;
      }
      soFarMax += best;
    }
    var ratio = soFarMax > 0 ? this.score / soFarMax : 0;
    var mood = ratio < 0.25 ? 'calm' : (ratio < 0.55 ? 'doubt' : 'burn');
    var moodCopy = {
      calm: this.tt('bonfireCalm', 'Les images tournent. {{name}} sourit : rien, dans ce que vous avez fait, ne l\'a blessé·e.'),
      doubt: this.tt('bonfireDoubt', 'Les images tournent. Le sourire de {{name}} se fige. Un doute vient de s\'installer.'),
      burn: this.tt('bonfireBurn', 'Les images tournent. {{name}} détourne le regard, les mâchoires serrées. Ça brûle.')
    }[mood];

    var isFinal = !!this.isFinal;
    wrap.innerHTML =
      '<div class="tentation-bonfire-head">'
      + '<span class="tentation-bonfire-kicker">' + esc(isFinal ? this.tt('finalBonfire', 'Dernier feu de camp') : this.tt('bonfire', 'Feu de camp')) + '</span>'
      + (isFinal ? '' : '<span class="tentation-bonfire-day">' + esc(this.tt('day', 'Jour')) + ' ' + (this.dayIdx + 1) + '</span>')
      + '</div>'
      + '<div class="tentation-fire">' + this._flame('tentation-flame--big') + '</div>'
      + '<p class="tentation-bonfire-text">' + esc(String(moodCopy).replace(/\{\{name\}\}/g, this.partner)) + '</p>';

    var btn = el('button', 'tentation-btn tentation-btn--fire');
    btn.innerHTML = isFinal
      ? '💔 ' + esc(this.tt('seeVerdict', 'Découvrir le verdict'))
      : '🔥 ' + esc(this.tt('continueStay', 'Continuer le séjour'));
    btn.addEventListener('click', function () {
      if (isFinal) { self.phase = 'results'; }
      else { self.dayIdx++; self.phase = 'day'; }
      self.isFinal = false;
      self.render();
      smoothScroll(self.container, 'start');
    });
    wrap.appendChild(btn);
    this.island.appendChild(wrap);
  };

  TentationQuiz.prototype.renderResults = function () {
    var self = this;
    var result = null;
    for (var i = 0; i < this.results.length; i++) {
      var r = this.results[i];
      if (this.score >= r.min && this.score <= r.max) { result = r; break; }
    }
    if (!result && this.results.length > 0) result = this.results[this.results.length - 1];
    var resistance = this.maxScore > 0 ? Math.round(100 - (this.score / this.maxScore) * 100) : 100;

    var wrap = el('div', 'quiz-engine tentation-results quiz-result-card');

    // Self-contained dark island hero: renderActionButtons moves these children
    // into the light 2-column layout, so the block must carry its own styling.
    var hero = el('div', 'tentation-results-hero');
    hero.innerHTML = this._logo()
      + '<div class="tentation-fire tentation-fire--result">' + this._flame('tentation-flame--big') + '</div>'
      + '<div class="tentation-results-ring"><span class="tentation-results-pct">' + resistance + '%</span>'
      + '<span class="tentation-results-ring-lbl">' + esc(this.tt('resistance', 'Résistance')) + '</span></div>'
      + '<h2 class="tentation-results-title">' + esc(result ? result.title : '') + '</h2>'
      + '<p class="tentation-results-sub">' + (result ? result.description : '') + '</p>'
      + (result && result.advice ? '<p class="tentation-results-advice">' + result.advice + '</p>' : '')
      + '<p class="tentation-results-couple">' + esc(this.tt('scoreLabel', 'Score de tentation')) + ' : <strong>'
      + this.score + '/' + this.maxScore + '</strong></p>';
    wrap.appendChild(hero);

    var quizEl = document.getElementById('quiz-engine');
    var hasPool = quizEl && quizEl.dataset.hasPool === '1';
    renderActionButtons(wrap, {
      share: { type: 'solo', pct: resistance },
      newQuestions: hasPool ? function () { self.initStay(); self.phase = 'day'; self.render(); smoothScroll(self.container, 'start'); } : null,
      restart: function () { self.phase = 'setup'; self.render(); smoothScroll(self.container, 'start'); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // PARTY GAME - le jeu de couple du hub
  // Aucun ecran de configuration : on choisit une ambiance et on joue. Chaque
  // tour tire une carte (question ou defi) dans l'ambiance retenue ; refuser
  // fait piocher un gage. Les cartes ne se repetent pas tant que la pioche
  // n'est pas epuisee, et la partie n'a pas de fin imposee : c'est le joueur
  // qui decide de s'arreter, ce qui donne le recapitulatif et le partage.
  // ═══════════════════════════════════════════════════════════
  function PartyGame(config) {
    this.container = config.container;
    this.prefix = config.prefix || 'jeu';
    this.lang = config.lang || 'fr';
    this.ambiances = config.ambiances || [];
    this.phase = 'choix';
    this.ambiance = null;
    this.pioche = [];
    this.gages = [];
    this.carte = null;
    this.tour = 0;
    this.releves = 0;
    this.passes = 0;
    this.render();
  }

  // Lit toutes les cartes d'un type pour une ambiance : jeu.doux_q1, _q2...
  PartyGame.prototype.cartes = function(ambiance, type) {
    var out = [];
    for (var i = 1; i <= 60; i++) {
      var cle = this.prefix + '.' + ambiance + '_' + type + i;
      var t = tgd(cle, null);
      if (!t || t === cle) { if (i > 3) break; else continue; }
      out.push({ type: type, texte: t });
    }
    return out;
  };

  PartyGame.prototype.remplirPioche = function() {
    var q = this.cartes(this.ambiance, 'q');
    var d = this.cartes(this.ambiance, 'd');
    this.pioche = shuffleArray(q.concat(d));
  };

  PartyGame.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'choix') this.renderChoix();
    else if (this.phase === 'carte') this.renderCarte();
    else this.renderRecap();
  };

  PartyGame.prototype.renderChoix = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine animate-fade-in text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '🎲'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2', tg('jeu.introTitle', 'Choisissez votre ambiance')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6', tg('jeu.introDesc', 'Pas d\'inscription, pas de préparation : choisissez une ambiance et la première carte tombe.')));

    var grille = el('div', 'party-ambiances');
    this.ambiances.forEach(function(a, idx) {
      var carte = el('button', 'party-ambiance party-ambiance--' + a.id);
      carte.innerHTML = '<span class="party-ambiance-emoji">' + a.emoji + '</span>' +
        '<span class="party-ambiance-nom">' + esc(tgd(self.prefix + '.amb_' + a.id, a.id)) + '</span>' +
        '<span class="party-ambiance-desc">' + esc(tgd(self.prefix + '.ambd_' + a.id, '')) + '</span>';
      carte.style.animationDelay = (idx * 70) + 'ms';
      carte.addEventListener('click', function() {
        self.ambiance = a.id;
        self.remplirPioche();
        self.gages = self.cartes(a.id, 'g');
        if (!self.pioche.length) return;
        self.releves = 0; self.passes = 0; self.tour = 0;
        self.piocher();
      });
      grille.appendChild(carte);
    });
    wrap.appendChild(grille);
    this.container.appendChild(wrap);
  };

  PartyGame.prototype.piocher = function() {
    if (!this.pioche.length) this.remplirPioche();
    this.carte = this.pioche.pop();
    this.phase = 'carte';
    this.render();
  };

  PartyGame.prototype.renderCarte = function() {
    var self = this;
    var c = this.carte;
    var wrap = el('div', 'quiz-engine quiz-question-enter');

    var entete = el('div', 'party-entete');
    entete.innerHTML = '<span class="party-tour">' + esc(tg('jeu.tourDe', 'Au tour de') + ' ' +
      tg('playerSetup.player' + (this.tour % 2 + 1), 'Joueur ' + (this.tour % 2 + 1))) + '</span>' +
      '<button class="party-changer" type="button">' + esc(tg('jeu.arreter', 'Terminer la partie')) + '</button>';
    wrap.appendChild(entete);

    var badge = c.type === 'q' ? { e: '💬', k: 'question' } : c.type === 'd' ? { e: '🎯', k: 'defi' } : { e: '😈', k: 'gage' };
    var carte = el('div', 'party-carte party-carte--' + badge.k);
    carte.innerHTML = '<span class="party-carte-type">' + badge.e + ' ' +
      esc(tg('jeu.type_' + badge.k, badge.k)) + '</span>' +
      '<p class="party-carte-texte">' + esc(c.texte) + '</p>';
    wrap.appendChild(carte);

    var actions = el('div', 'party-actions');
    if (c.type === 'g') {
      var fini = el('button', 'btn btn-cta btn-lg', tg('jeu.gageFait', 'Gage accompli !'));
      fini.addEventListener('click', function() { self.tour++; self.piocher(); });
      actions.appendChild(fini);
    } else {
      var fait = el('button', 'btn btn-cta btn-lg', tg('jeu.fait', 'C\'est fait !'));
      fait.addEventListener('click', function() { self.releves++; self.tour++; self.piocher(); });
      var passe = el('button', 'btn btn-outline btn-lg', tg('jeu.passe', 'Je passe'));
      passe.addEventListener('click', function() {
        self.passes++;
        if (!self.gages.length) { self.tour++; self.piocher(); return; }
        self.carte = shuffleArray(self.gages.slice())[0];
        self.render();
      });
      actions.appendChild(fait);
      actions.appendChild(passe);
    }
    wrap.appendChild(actions);

    var compteur = el('p', 'party-compteur', (this.releves + this.passes) + ' ' + tg('jeu.cartes', 'cartes jouées'));
    wrap.appendChild(compteur);

    this.container.appendChild(wrap);
    var arret = wrap.querySelector('.party-changer');
    if (arret) arret.addEventListener('click', function() { self.phase = 'recap'; self.render(); });
  };

  PartyGame.prototype.renderRecap = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var total = this.releves + this.passes;
    wrap.appendChild(el('div', 'text-5xl mb-3', '🎉'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-4', tg('jeu.recapTitre', 'Belle partie !')));
    wrap.appendChild(el('p', 'text-lg mb-2', esc(
      tg('jeu.recapTexte', 'Vous avez relevé {{releves}} cartes sur {{total}}.')
        .replace('{{releves}}', this.releves).replace('{{total}}', total))));
    if (this.passes > 0) {
      wrap.appendChild(el('p', 'text-muted-foreground mb-4', esc(
        tg('jeu.recapGages', '{{passes}} gage(s) au passage.').replace('{{passes}}', this.passes))));
    }
    var rejouer = el('button', 'btn btn-cta btn-lg mb-2', tg('jeu.rejouer', 'Rejouer'));
    rejouer.addEventListener('click', function() { self.phase = 'choix'; self.render(); smoothScroll(self.container, 'start'); });
    wrap.appendChild(rejouer);

    renderActionButtons(wrap, {
      share: { type: 'cartes', score: this.releves, total: total },
      restart: function() { self.phase = 'choix'; self.render(); smoothScroll(self.container, 'start'); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // WHEEL GAME - la roue des gages
  // Une roue a huit secteurs qu'on relance autant de fois qu'on veut. Chaque
  // secteur est une famille de gages ; le huitieme, surprise, pioche dans
  // toutes les autres. Un gage ne retombe pas tant que sa pioche n'est pas
  // vide. La partie n'a pas de fin : il n'y a que le bouton relancer.
  // ═══════════════════════════════════════════════════════════
  var ROUE_COULEURS = [
    '340 65% 62%', '270 45% 58%', '12 78% 56%', '190 60% 45%',
    '340 65% 72%', '270 45% 68%', '38 85% 55%', '160 50% 45%'
  ];

  function WheelGame(config) {
    this.container = config.container;
    this.prefix = config.prefix || 'gageRoue';
    this.lang = config.lang || 'fr';
    this.secteurs = (config.segments || []).map(function(id, i) {
      return { id: id, couleur: ROUE_COULEURS[i % ROUE_COULEURS.length] };
    });
    // le dernier secteur pioche dans tous les autres
    this.secteurs.push({ id: 'surprise', couleur: ROUE_COULEURS[this.secteurs.length % ROUE_COULEURS.length], joker: true });
    this.pioches = {};
    this.gage = null;
    this.secteurTire = null;
    this.tours = 0;
    this.dernier = -1;
    this.enCours = false;
    this.angle = 0;
    this.render();
  }

  // Lit les gages d'une famille : gageRoue.bisou1, bisou2...
  WheelGame.prototype.lireFamille = function(id) {
    var out = [];
    for (var i = 1; i <= 40; i++) {
      var cle = this.prefix + '.' + id + i;
      var t = tgd(cle, null);
      if (!t || t === cle) { if (i > 2) break; else continue; }
      out.push(t);
    }
    return out;
  };

  WheelGame.prototype.piocher = function(id) {
    // La case surprise n'a pas de pioche a elle : elle emprunte celle d'une
    // famille reelle, sinon le meme gage pourrait tomber deux fois, une fois
    // par sa famille et une fois par le joker.
    if (id === 'surprise') {
      var reelles = this.secteurs.filter(function(s) { return !s.joker; });
      if (!reelles.length) return null;
      var dispo = reelles.filter(function(s) {
        return !this.pioches[s.id] || this.pioches[s.id].length;
      }, this);
      var choix = (dispo.length ? dispo : reelles)[Math.floor(Math.random() * (dispo.length ? dispo.length : reelles.length))];
      return this.piocher(choix.id);
    }
    if (!this.pioches[id] || !this.pioches[id].length) {
      this.pioches[id] = shuffleArray(this.lireFamille(id));
    }
    return this.pioches[id].pop() || null;
  };

  WheelGame.prototype.nom = function(id) {
    return tgd(this.prefix + '.seg_' + id, id);
  };

  WheelGame.prototype.svg = function() {
    var n = this.secteurs.length;
    var pas = 360 / n, cx = 100, cy = 100, r = 96;
    var pt = function(a, rayon) {
      var rad = (a - 90) * Math.PI / 180;
      return [(cx + rayon * Math.cos(rad)).toFixed(2), (cy + rayon * Math.sin(rad)).toFixed(2)];
    };
    var s = '<svg viewBox="0 0 200 200" class="roue-svg" aria-hidden="true">';
    for (var i = 0; i < n; i++) {
      var a1 = i * pas, a2 = (i + 1) * pas, mid = a1 + pas / 2;
      var p1 = pt(a1, r), p2 = pt(a2, r);
      s += '<path d="M ' + cx + ' ' + cy + ' L ' + p1[0] + ' ' + p1[1] +
        ' A ' + r + ' ' + r + ' 0 0 1 ' + p2[0] + ' ' + p2[1] + ' Z" fill="hsl(' + this.secteurs[i].couleur + ')"/>';
      // Libelles radiaux : ils partent du moyeu vers la jante. C'est la seule
      // orientation qui reste lisible quelle que soit la rotation de la roue,
      // alors qu'un texte tangentiel se retrouve a l'envers une fois sur deux.
      var yEmoji = cy - r * 0.82, yLabel = cy - r * 0.22;
      s += '<g transform="rotate(' + mid.toFixed(2) + ' ' + cx + ' ' + cy + ')">' +
        '<text x="' + cx + '" y="' + yLabel.toFixed(2) + '" class="roue-label" text-anchor="start"' +
        ' transform="rotate(-90 ' + cx + ' ' + yLabel.toFixed(2) + ')">' +
        esc(this.nom(this.secteurs[i].id)) + '</text>' +
        '<text x="' + cx + '" y="' + yEmoji.toFixed(2) + '" class="roue-emoji" text-anchor="middle" dominant-baseline="middle">' +
        esc(SECTEUR_EMOJIS[this.secteurs[i].id] || '🎁') + '</text></g>';
    }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="14" class="roue-moyeu"/></svg>';
    return s;
  };

  WheelGame.prototype.render = function() {
    var self = this;
    this.container.innerHTML = '';
    var wrap = el('div', 'quiz-engine roue-jeu animate-fade-in text-center');

    var scene = el('div', 'roue-scene');
    scene.innerHTML = '<span class="roue-fleche" aria-hidden="true"></span>' +
      '<div class="roue-plateau">' + this.svg() + '</div>';
    wrap.appendChild(scene);

    var bouton = el('button', 'btn btn-cta btn-lg roue-bouton',
      this.tours === 0 ? tg('roue.lancer', 'Lancer la roue') : tg('roue.relancer', 'Relancer la roue'));
    bouton.type = 'button';
    wrap.appendChild(bouton);

    var zone = el('div', 'roue-resultat');
    zone.setAttribute('aria-live', 'polite');
    if (this.gage) {
      zone.innerHTML = '<span class="roue-resultat-famille">' +
        esc((SECTEUR_EMOJIS[this.secteurTire] || '🎁') + ' ' + this.nom(this.secteurTire)) + '</span>' +
        '<p class="roue-resultat-texte">' + esc(this.gage) + '</p>';
    } else {
      zone.innerHTML = '<p class="roue-invite">' + esc(tg('roue.intro', 'Appuyez sur le bouton : la roue choisit le gage à votre place.')) + '</p>';
    }
    wrap.appendChild(zone);

    if (this.tours > 0) {
      var compte = this.tours === 1
        ? tg('roue.compteur1', '1 gage tiré')
        : tg('roue.compteur', '{{n}} gages tirés').replace('{{n}}', this.tours);
      wrap.appendChild(el('p', 'roue-compteur', compte));
      // Pas de bloc « poursuivez avec » ici : la partie n'a pas de fin, il ne
      // faut pas transformer chaque tour en ecran de resultat.
      renderShareButton(wrap, { type: 'fun' });
    }

    this.container.appendChild(wrap);
    var plateau = wrap.querySelector('.roue-plateau');
    plateau.style.transform = 'rotate(' + this.angle + 'deg)';
    bouton.addEventListener('click', function() { self.lancer(plateau, bouton, zone); });
  };

  WheelGame.prototype.lancer = function(plateau, bouton, zone) {
    if (this.enCours) return;
    var self = this;
    var n = this.secteurs.length, pas = 360 / n;

    // on evite de retomber deux fois de suite sur le meme secteur
    var k = Math.floor(Math.random() * n);
    if (n > 1 && k === this.dernier) k = (k + 1 + Math.floor(Math.random() * (n - 1))) % n;
    this.dernier = k;

    var gage = this.piocher(this.secteurs[k].id);
    if (!gage) return;

    var doux = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cible = 360 - (k * pas + pas / 2) + (Math.random() * (pas * 0.6) - pas * 0.3);
    var base = this.angle - (this.angle % 360);
    var fin = base + 360 * (doux ? 1 : 5) + cible;
    if (fin <= this.angle) fin += 360;

    this.enCours = true;
    bouton.disabled = true;
    bouton.textContent = tg('roue.enCours', 'La roue tourne...');
    zone.innerHTML = '';

    var duree = doux ? 400 : 4200;
    plateau.style.transition = 'transform ' + duree + 'ms cubic-bezier(0.16, 0.84, 0.28, 1)';
    // force le navigateur a prendre en compte l'angle courant avant d'animer
    void plateau.offsetWidth;
    plateau.style.transform = 'rotate(' + fin + 'deg)';

    window.setTimeout(function() {
      self.angle = fin;
      self.gage = gage;
      self.secteurTire = self.secteurs[k].id;
      self.tours++;
      self.enCours = false;
      self.render();
    }, duree + 60);
  };

  var SECTEUR_EMOJIS = {
    bisou: '💋', massage: '💆', show: '🎤', aveu: '🤫',
    grimace: '😜', photo: '📸', douceur: '🍫', surprise: '🎁'
  };

  // ─── Public API ───────────────────────────────────────────
  return {
    loadTranslations: loadTranslations,
    loadAllTranslations: loadAllTranslations,
    tgd: tgd,
    tg: tg,
    SoloTest: SoloTest,
    DuoMatchQuiz: DuoMatchQuiz,
    DistanceQuiz: DistanceQuiz,
    CoquinQuiz: CoquinQuiz,
    KnowledgeQuiz: KnowledgeQuiz,
    DebateQuiz: DebateQuiz,
    FunnyQuiz: FunnyQuiz,
    MostQuiz: MostQuiz,
    HealthyQuiz: HealthyQuiz,
    ParentaliteQuiz: ParentaliteQuiz,
    TruefalseQuiz: TruefalseQuiz,
    ProfileQuiz: ProfileQuiz,
    ZamoursQuiz: ZamoursQuiz,
    TentationQuiz: TentationQuiz,
    PartyGame: PartyGame,
    WheelGame: WheelGame,
    el: el,
    esc: esc,
    shuffleArray: shuffleArray,
    SUPABASE_URL: SUPABASE_URL,
    SUPABASE_KEY: SUPABASE_KEY,
  };
})();
