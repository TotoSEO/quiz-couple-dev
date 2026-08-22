/**
 * Quiz Couple - Core Quiz Engine (vanilla JS)
 * Complete engine with specialized quiz types:
 * - SoloTest: toxic, divorce, mariage (single player, weighted points)
 * - DuoMatchQuiz: tester-couple, common-points (2 players + gender, match answers)
 * - CoquinQuiz: coquin (guess & reveal mechanic, 30 rounds)
 * - KnowledgeQuiz: knowledge (oral validation with check/cross buttons)
 * - FunnyQuiz: marrant (discussion-only, "Question suivante" button)
 * - MostQuiz: most (2-8 players, vote for one player per question)
 * - HealthyQuiz: couple-sain (weighted scoring, 2 players + gender)
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
    // 'couple' -> 'testerC' a ete retire : l'alias datait de l'epoque ou le
    // test de couple s'appelait 'couple' en francais et 'testerC' ailleurs.
    // 'testerC' est desormais le pool propre du test de couple dans les cinq
    // langues, et 'couple' celui du test sain en francais. Garder l'alias
    // faisait deborder l'un sur l'autre.
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

  // Empreinte de la construction, posée par le générateur dans l'en-tête de la
  // page. Les fichiers de questions sont demandés avec elle : un cache qui
  // garderait la version d'avant ne peut plus répondre à la place du serveur,
  // et une page dont le quiz vient de naître trouve toujours ses données.
  function _v(url) {
    var v = (typeof window !== 'undefined' && window.__QCV) || '';
    return v ? url + '?v=' + v : url;
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
    var att = [tente(_v('/js/data/gd/' + prefix + '-' + lang + '.json'))];
    att.push(lang === 'fr' ? Promise.resolve({}) : tente(_v('/js/data/gd/' + prefix + '-fr.json')));
    return Promise.all(att);
  }

  function _chargeComplet(lang) {
    return fetch(_v('/js/data/gd-' + lang + '.json'))
      .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function(d) {
        gdTranslations = d;
        if (lang === 'fr') { gdFrTranslations = d; return null; }
        return fetch(_v('/js/data/gd-fr.json')).then(function(r) { return r.json(); })
          .then(function(fr) { gdFrTranslations = fr; });
      })
      .catch(function() {
        return fetch(_v('/js/data/gd-fr.json')).then(function(r) { return r.json(); })
          .then(function(d) { gdTranslations = d; gdFrTranslations = d; })
          .catch(function() {});
      });
  }

  // prefixes : liste facultative des préfixes de données dont l'appelant a
  // besoin. Fournie, seuls ces fragments sont téléchargés au lieu des ~300 Ko
  // du fichier complet. Absente ou en cas d'échec, on charge tout comme avant.
  function loadTranslations(lang, callback, prefixes) {
    function fini() { if (callback) callback(); }

    var jeux = fetch(_v('/js/data/games-' + lang + '.json')).then(function(r) { return r.json(); })
      .then(function(d) { gamesTranslations = d; })
      .catch(function() {
        return fetch(_v('/js/data/games-fr.json')).then(function(r) { return r.json(); })
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

  // ─── Ecran de depart commun ───────────────────────────────
  // La direction artistique des tests a deux (badge en degrade, titre, pastille
  // d'informations, gros bouton pleine largeur) n'avait jamais ete reportee sur
  // les tests solo ni sur les jeux : ils gardaient une intro plate, un emoji nu
  // et un bouton de taille ordinaire. Ce constructeur donne le meme cadre a
  // tout le monde, chaque moteur n'apportant que son contenu.
  //   icone     : emoji affiche dans le badge (ignore si iconeSvg est fourni)
  //   iconeSvg  : markup SVG, pour les moteurs qui ont deja une icone dessinee
  //   titre     : titre de l'ecran
  //   desc      : sous-titre, facultatif
  //   corps     : noeuds inseres entre la description et la pastille
  //   meta      : contenu de la pastille, en HTML deja construit
  //   bouton    : libelle du bouton de depart
  //   onStart   : ce que fait ce bouton
  function ecranDepart(o) {
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');
    var badge = el('div', 'quiz-setup-icon' + (o.iconeSvg ? '' : ' quiz-setup-icon--emoji') + ' mx-auto mb-6');
    badge.innerHTML = o.iconeSvg || esc(o.icone || '📝');
    wrap.appendChild(badge);
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-3 text-center', esc(o.titre || '')));
    if (o.desc) wrap.appendChild(el('p', 'text-muted-foreground mb-6 text-center', esc(o.desc)));
    (o.corps || []).forEach(function(n) { if (n) wrap.appendChild(n); });
    if (o.meta) wrap.appendChild(el('div', 'quiz-setup-meta', o.meta));
    var btn = el('button', 'btn btn-cta btn-gradient quiz-setup-start-btn', esc(o.bouton || ''));
    btn.type = 'button';
    if (o.onStart) btn.addEventListener('click', o.onStart);
    wrap.appendChild(btn);
    // Les jeux saisissaient leurs prenoms dans un <form> : la touche Entree
    // lancait la partie. L'ecran commun n'a pas de formulaire, on rebranche
    // donc le raccourci sur chaque champ.
    wrap.querySelectorAll('input[type="text"]').forEach(function(champ) {
      champ.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); btn.click(); }
      });
    });
    return { wrap: wrap, bouton: btn };
  }

  // Pastille « N questions • 5 min », commune a tous les ecrans de depart.
  // La duree par defaut vaut pour les tests courts. Les jeux qui durent
  // vraiment plus longtemps passent la leur, pour ne pas annoncer cinq minutes
  // sur une page qui en promet dix juste en dessous.
  function pastilleMeta(n, mot, duree) {
    return '📝 ' + n + ' ' + esc(mot || tg('meta.questionsWord', 'questions')) +
      ' &bull; ⏱ ' + esc(duree || tg('meta.duration', '5 min'));
  }

  // ─── Prenom injecte dans le texte d'une question ──────────
  // Chaque langue a ete ecrite avec son propre jeton : NAME en anglais et en
  // allemand, NOMBRE en espagnol, NOME en italien. Le moteur ne remplacait que
  // NAME, si bien que l'espagnol et l'italien affichaient le mot du jeton en
  // clair au joueur, sur 160 questions chacun. On les traite tous au meme
  // endroit pour que le prochain jeton ajoute ne reparte pas dans l'oubli.
  // Le « s » optionnel est le genitif allemand : dix-huit questions sont
  // ecrites « NAMEs Lieblingsgericht », et une frontiere de mot apres NAME ne
  // les attrapait pas. On le capture pour le recoller derriere le prenom.
  var JETONS_PRENOM = /\{\{name\}\}|\b(?:NAME|NOMBRE|NOME|PRENOM|PRÉNOM)(s)?\b/g;
  function injecterPrenom(texte, prenom) {
    if (texte == null) return '';
    return String(texte).replace(JETONS_PRENOM, function(_, genitif) {
      return (prenom || '') + (genitif || '');
    });
  }

  // ─── Choix du format, quand une page en propose deux ──────
  // Certaines pages repondent a deux intentions differentes sous le meme mot.
  // « Quiz genant » par exemple : une partie des visiteurs veut savoir si son
  // couple est genant, l'autre veut se poser des questions genantes. Plutot que
  // de trancher pour tout le monde, on demande.
  //   titre / desc : l'accroche commune
  //   modes        : [{ id, emoji, titre, desc, meta }]
  //   onChoix      : recoit l'identifiant du mode retenu
  function ecranModes(o) {
    var wrap = el('div', 'quiz-engine quiz-setup-screen quiz-modes animate-fade-in');
    var badge = el('div', 'quiz-setup-icon quiz-setup-icon--emoji mx-auto mb-6');
    badge.innerHTML = esc(o.icone || '🎲');
    wrap.appendChild(badge);
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-3 text-center', esc(o.titre || '')));
    if (o.desc) wrap.appendChild(el('p', 'text-muted-foreground mb-6 text-center', esc(o.desc)));

    // Deux presentations : la liste horizontale, quand les formats ont des noms
    // longs a expliquer, et les grandes cartes, quand le nom du mode tient en un
    // mot et merite d'etre lu en premier.
    var grand = !!o.grand;
    // Trois formats tiennent sur une ligne au-dessus de la coupure mobile ;
    // en dessous, la grille repasse a une colonne comme pour deux.
    var trois = (o.modes || []).length > 2;
    var liste = el('div', grand ? ('choix-modes' + (trois ? ' choix-modes--trois' : '')) : 'quiz-modes-liste');
    (o.modes || []).forEach(function(m) {
      var carte = el('button', grand
        ? 'choix-mode choix-mode--' + m.id
        : 'quiz-mode-carte quiz-mode-carte--' + m.id);
      carte.type = 'button';
      if (grand) {
        carte.setAttribute('aria-label',
          (m.titre || '') + ' : ' + (m.desc || '') + (m.meta ? '. ' + m.meta : ''));
        carte.innerHTML =
          '<span class="choix-mode-nom">' + esc(m.titre || '') + '</span>' +
          '<span class="choix-mode-desc">' + esc(m.desc || '') + '</span>' +
          (m.meta ? '<span class="choix-mode-score">' + esc(m.meta) + '</span>' : '');
      } else {
        carte.innerHTML =
          '<span class="quiz-mode-emoji" aria-hidden="true">' + esc(m.emoji || '▶') + '</span>' +
          '<span class="quiz-mode-corps">' +
            '<span class="quiz-mode-titre">' + esc(m.titre || '') + '</span>' +
            '<span class="quiz-mode-desc">' + esc(m.desc || '') + '</span>' +
            (m.meta ? '<span class="quiz-mode-meta">' + esc(m.meta) + '</span>' : '') +
          '</span>' +
          '<span class="quiz-mode-fleche" aria-hidden="true">→</span>';
      }
      carte.addEventListener('click', function() { if (o.onChoix) o.onChoix(m.id); });
      liste.appendChild(carte);
    });
    wrap.appendChild(liste);
    return wrap;
  }

  // Les deux cartes de prenoms des tests a deux, reutilisees par les jeux qui
  // se contentaient de deux champs de saisie alignes.
  function cartesDeuxJoueurs(idPrefixe) {
    var grille = el('div', 'quiz-setup-grid max-w-lg mx-auto');
    [0, 1].forEach(function(i) {
      var carte = el('div', 'quiz-player-card');
      var numero = el('div', 'quiz-player-number', String(i + 1));
      carte.appendChild(numero);
      var libelle = el('label', 'block text-sm font-semibold mb-2 text-center',
        esc(tg('playerSetup.player' + (i + 1), 'Joueur ' + (i + 1))));
      libelle.setAttribute('for', idPrefixe + (i + 1));
      var champ = el('input', 'input w-full');
      champ.type = 'text';
      champ.id = idPrefixe + (i + 1);
      champ.maxLength = 20;
      champ.autocomplete = 'off';
      champ.placeholder = tg('playerSetup.firstName', 'Prénom');
      carte.appendChild(libelle);
      carte.appendChild(champ);
      grille.appendChild(carte);
    });
    return grille;
  }

  // Badge de tour partage par les jeux a deux. L'ancien libelle etait une
  // ligne grise de la taille du texte courant : sur un telephone pose entre
  // deux personnes, on ne voyait plus a qui c'etait. La pastille reprend la
  // couleur et l'initiale du pion, pour que le lien avec le plateau soit
  // immediat.
  function badgeDeTour(nom, phrase, indice) {
    return '<span class="party-tour party-tour--j' + (indice + 1) + '">' +
      '<span class="party-tour-pion" aria-hidden="true">' + esc(String(nom || '?').charAt(0).toUpperCase()) + '</span>' +
      '<span class="party-tour-texte">' + esc(phrase) + '</span></span>';
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

  // On ne déplace la page que si la cible est entièrement hors de l'écran.
  //
  // Avant, chaque réponse, chaque vote, chaque changement d'écran recollait le
  // haut du moteur en haut de la fenêtre. Le moteur était pourtant déjà sous
  // les yeux : la page sautait sans raison, à chaque clic, pendant toute la
  // partie. C'est désagréable au point de faire quitter la page, et sur les
  // jeux au moteur haut placé le bandeau venait mordre sur le texte au-dessus.
  //
  // La règle est donc simple : si on voit déjà ne serait-ce qu'un bout de la
  // cible, on ne touche à rien, l'écran reste strictement immobile. Le
  // défilement ne subsiste que comme filet de sécurité, quand ce qui vient
  // d'apparaître se trouve complètement en dehors du champ de vision.
  function smoothScroll(node, block) {
    if (!node) return;
    try {
      var r = node.getBoundingClientRect();
      var h = window.innerHeight || document.documentElement.clientHeight;
      var visible = r.bottom > 0 && r.top < h;
      if (visible) return;
      node.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: block || 'center' });
    } catch (e) { try { node.scrollIntoView(); } catch (_) {} }
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
    // Deux pages portent leur moteur dans un conteneur a elles : sans ce
    // repli, le partage retombait sur le H1 entier et sur l'emoji par defaut.
    var quizEl = document.getElementById('quiz-engine') || document.querySelector('[data-quiz]');
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
    else if (type === 'plateau') phrase = tg('share.plateau', '{{nom}} gagne la partie en {{score}} tours au {{quiz}}');
    else if (type === 'duo' && o.points) phrase = tg('share.duoPoints', 'On a marqué {{score}} points au {{quiz}}');
    else if (type === 'duo') phrase = tg('share.duoPct', 'On a obtenu {{pct}} % au {{quiz}}');
    else if (type === 'profil') phrase = tg('share.profil', 'J\'ai fait le {{quiz}}');
    else phrase = tg('share.fun', 'On vient de faire le {{quiz}}');

    phrase = phrase
      .replace(/\{\{quiz\}\}/g, q.nom)
      .replace(/\{\{nom\}\}/g, o.nom)
      .replace(/\{\{score\}\}/g, o.score)
      .replace(/\{\{total\}\}/g, o.total)
      .replace(/\{\{pct\}\}/g, o.pct);

    if (o.verdict) {
      phrase += tg('share.verdict', ' : « {{result}} »').replace(/\{\{result\}\}/g, o.verdict);
    }

    var appel = type === 'solo' ? tg('share.ctaSolo', 'Et vous, vous en êtes où ? Faites le test 👉')
      : (type === 'duo' || type === 'cartes' || type === 'plateau') ? tg('share.ctaDuo', 'Et vous, vous faites combien ? Essayez 👉')
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

  // ─── Relais entre les deux joueurs ────────────────────────────────────────
  // L'écran « passe le téléphone » demandait un clic sur « Répondre » avant
  // chaque question : quarante clics sur un quiz de vingt questions joué à
  // deux, pour une information que l'écran suivant redonne de toute façon
  // dans son bandeau de joueur. On garde l'annonce, on retire le clic : le
  // bandeau s'affiche, laisse le temps de tendre le téléphone, puis s'efface
  // seul. Un appui sur le bandeau coupe l'attente pour qui va plus vite.
  var RELAIS_DUREE = 1300;
  // Après le passage automatique, les options restent sourdes un court
  // instant : sans ce délai, un doigt déjà en route vers le bandeau retombe
  // sur une réponse et la valide à la place du joueur.
  var RELAIS_GARDE = 280;

  function relaisJoueur(moteur, options) {
    var opts = options || {};
    var suite = opts.suite || function () {};

    // Un relais chasse le précédent : sans cela, un retour arrière ou un
    // « rejouer » lancé pendant l'attente laisserait deux minuteries vivantes
    // et ferait sauter une question.
    if (moteur.__relaisTimer) { clearTimeout(moteur.__relaisTimer); moteur.__relaisTimer = null; }

    var carte = el('div', 'qc-relais');
    carte.setAttribute('role', 'status');
    carte.setAttribute('aria-live', 'polite');

    var macaron = el('div', 'qc-relais-macaron');
    macaron.innerHTML = '<span>' + (opts.emoji || '📱') + '</span>';
    macaron.setAttribute('aria-hidden', 'true');
    carte.appendChild(macaron);

    // Volontairement un paragraphe : la page a déjà sa hiérarchie de titres,
    // et ce bandeau vit moins de deux secondes.
    var annonce = el('p', 'qc-relais-annonce');
    annonce.innerHTML = tg('question.turnToAnswer', 'À {{name}} de répondre !')
      .replace('{{name}}', '<span class="qc-relais-nom">' + esc(opts.nom || '') + '</span>');
    carte.appendChild(annonce);

    carte.appendChild(el('p', 'qc-relais-note',
      esc(opts.note || tg('question.passPhoneOrLookAway', 'Passez le téléphone ou détournez le regard'))));

    if (opts.etape) carte.appendChild(el('p', 'qc-relais-etape', esc(opts.etape)));

    var piste = el('div', 'qc-relais-piste');
    var jauge = el('div', 'qc-relais-jauge');
    jauge.style.animationDuration = RELAIS_DUREE + 'ms';
    piste.appendChild(jauge);
    carte.appendChild(piste);

    // La couleur du joueur teinte le prénom et la jauge, pas le macaron : ce
    // dégradé est celui de la charte, et l'écran de question qui suit reprend
    // la même couleur sur son badge, donc l'association reste lisible.
    if (opts.couleur) {
      var nom = annonce.querySelector('.qc-relais-nom');
      if (nom) nom.style.color = opts.couleur;
      jauge.style.background = opts.couleur;
    }

    var parti = false;
    function partir() {
      if (parti) return;
      parti = true;
      if (moteur.__relaisTimer) { clearTimeout(moteur.__relaisTimer); moteur.__relaisTimer = null; }
      moteur.__answerLockUntil = Date.now() + RELAIS_GARDE;
      suite();
    }

    carte.addEventListener('click', partir);
    // Si un autre écran a pris la place entre-temps (résultats, rejouer), le
    // bandeau n'est plus dans la page et n'a plus rien à enchaîner.
    moteur.__relaisTimer = setTimeout(function() {
      if (carte.isConnected) partir();
    }, RELAIS_DUREE);

    return carte;
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
    { type: 'test', key: 'purete', icon: '🌡️', route: 'testPurete' },
    { type: 'test', key: 'tester-couple', icon: '💕', route: 'testCouple' },
    { type: 'test', key: 'common-points', icon: '🎯', route: 'testCommonPoints' },
    { type: 'test', key: 'compatibilite', icon: '💘', route: 'testCompatibilite' },
    { type: 'test', key: 'ame-soeur', icon: '💫', route: 'testAmeSoeur' },
    { type: 'test', key: 'suis-je-amoureux', icon: '💗', route: 'testSuisJeAmoureux' },
    { type: 'test', key: 'distance', icon: '🌍', route: 'testDistance' },
    { type: 'test', key: 'toxic', icon: '⚠️', route: 'testToxic' },
    { type: 'test', key: 'fin-couple', icon: '🪢', route: 'testFinCouple' },
    { type: 'test', key: 'amour-amitie', icon: '🧭', route: 'testAmourAmitie' },
    { type: 'test', key: 'pervers', icon: '🎭', route: 'testPervers' },
    { type: 'test', key: 'amour-habitude', icon: '☕', route: 'testAmourHabitude' },
    { type: 'test', key: 'sain', icon: '💚', route: 'testCoupleSain' },
    { type: 'test', key: 'mariage', icon: '💒', route: 'testMariage' },
    { type: 'test', key: 'divorce', icon: '⚖️', route: 'testDivorce' },
    { type: 'test', key: 'parentalite', icon: '👶', route: 'testParentalite' },
    { type: 'test', key: 'emmenager', icon: '🏠', route: 'testEmmenager' },
    { type: 'test', key: 'karmique', icon: '🔮', route: 'testKarmique' },
    { type: 'test', key: 'date-naissance', icon: '📅', route: 'testDateNaissance' },
    { type: 'test', key: 'dependance', icon: '⚓', route: 'testDependance' },
    { type: 'test', key: 'jalousie1', icon: '🫣', route: 'testJalousie' },
    { type: 'test', key: 'jalousie2', icon: '🫣', route: 'testJalousie' },
    { type: 'test', key: 'infidelite', icon: '💔', route: 'testInfidelite' },
    { type: 'test', key: 'couche', icon: '🛏️', route: 'testCouche' },
    { type: 'test', key: 'secret', icon: '💌', route: 'testSecret' },
    { type: 'test', key: 'distance-aime', icon: '📞', route: 'testDistanceAime' },
    { type: 'test', key: 'ex', icon: '🕰️', route: 'testEx' },
    { type: 'test', key: 'charge-mentale', icon: '🧠', route: 'testChargeMentale' },
    { type: 'quiz', key: 'rencontre', icon: '💬', route: 'quizRencontre' },
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
    { type: 'jeu', key: 'gage-couple', icon: '🎡', route: 'jeuGages' },
    { type: 'jeu', key: 'plateau-couple', icon: '🎲', route: 'jeuPlateau' },
    { type: 'jeu', key: 'qui-de-nous-deux', icon: '👀', route: 'jeuQuiDeNous' },
    { type: 'jeu', key: 'dilemmes', icon: '⚖️', route: 'jeuDilemmes' },
    { type: 'jeu', key: 'pour-contre', icon: '👍', route: 'pourContre' },
  ];

  // Suggestions de fin de partie, choisies une par une pour chaque page.
  //
  // Avant, on tirait trois pages au hasard dans la liste ci-dessus. Ça donnait
  // des enchaînements absurdes : le quiz coquin ne proposait jamais action ou
  // vérité coquin, et un test sur l'emprise pouvait enchaîner sur un jeu de
  // gages. Ici chaque liste répond à une seule question : ces personnes-là,
  // à cet instant précis, dans cet état d'esprit, ont envie de quoi ensuite ?
  //
  // Deux règles ont guidé tous les choix :
  //   1. Le nombre de joueurs doit suivre. Quelqu'un qui vient de faire seul
  //      un test sur l'infidélité n'a personne à côté de lui : lui proposer un
  //      jeu à deux, c'est lui proposer une porte fermée.
  //   2. Le ton doit suivre. Après un test lourd on enchaîne sur ce qui répond
  //      à la question suivante, jamais sur du divertissement.
  //
  // Les listes comptent parfois quatre entrées : on garde les trois premières
  // qui existent dans la langue affichée. Seul Les Z'Amours est limité au
  // français, d'où les doublures là où il apparaît.
  var SUGGESTIONS_PAR_QUIZ = {
    // ── Tests à deux, ambiance posée ────────────────────────────────────
    // Ils viennent de mesurer leur couple ensemble, le téléphone passe de
    // main en main. On reste à deux.
    'tester-couple':   ['testCompatibilite', 'quizKnowledge', 'testCoupleSain'],
    'common-points':   ['jeuQuiDeNous', 'quizKnowledge', 'testCompatibilite'],
    'compatibilite':   ['testCouple', 'testMariage', 'testEmmenager'],
    'sain':            ['testConfiance', 'testCouple', 'testCompatibilite'],
    'distance':        ['testDistanceAime', 'quizKnowledge', 'testCouple'],

    // ── Tests de projet de vie ──────────────────────────────────────────
    // Une étape validée donne envie de regarder la suivante.
    'mariage':         ['testEmmenager', 'testParentalite', 'testCompatibilite'],
    'emmenager':       ['testParentalite', 'testMariage', 'testCompatibilite'],
    'parentalite':     ['testEmmenager', 'testMariage'],

    // ── Tests d'alerte, faits seul ──────────────────────────────────────
    // Personne ne fait ces tests pour s'amuser. On enchaîne sur la question
    // d'après, jamais sur un jeu.
    'toxic':           ['testPervers', 'testDivorce', 'testCoupleSain'],
    'pervers':         ['testToxic', 'testJalousie', 'testDivorce'],
    'divorce':         ['testFinCouple', 'testAmourHabitude', 'testToxic'],
    'fin-couple':      ['testCouche', 'testToxic', 'testDivorce'],
    'amour-habitude':  ['testSuisJeAmoureux', 'testDivorce', 'testCoupleSain'],

    // ── Tests de doute et de soupçon, faits seul ────────────────────────
    // Le soupçon appelle toujours une deuxième vérification.
    'infidelite':      ['testCouche', 'testConfiance', 'testJalousie'],
    'couche':          ['testInfidelite', 'testFinCouple', 'testConfiance'],
    'jalousie1':       ['testConfiance', 'testInfidelite', 'testToxic'],
    'jalousie2':       ['testConfiance', 'testInfidelite', 'testToxic'],
    'confiance':       ['testJalousie', 'testCoupleSain', 'testInfidelite'],

    // ── Tests d'introspection, faits seul ───────────────────────────────
    // « Ce que je ressens » appelle « ce qu'il ou elle ressent ».
    'suis-je-amoureux': ['testAmourAmitie', 'testSecret', 'testAttachement'],
    'amour-amitie':    ['testSecret', 'testSuisJeAmoureux', 'testAmourHabitude'],
    'secret':          ['testSuisJeAmoureux', 'testLangageAmour', 'testAttachement'],
    'distance-aime':   ['testDistance', 'testSecret', 'testAttachement'],
    'langage-amour':   ['testAttachement', 'testCouple', 'quizKnowledge'],
    'attachement':     ['testLangageAmour', 'testConfiance', 'testSuisJeAmoureux'],

    // ── Tests à lecture symbolique ──────────────────────────────────────
    // On enchaîne sur l'autre lecture symbolique avant de revenir au concret.
    'karmique':        ['testDateNaissance', 'testAttachement', 'testSuisJeAmoureux'],
    'date-naissance':  ['testKarmique', 'testCompatibilite', 'testCouple'],

    // ── Quiz à deux, ambiance légère ────────────────────────────────────
    'amoureux':        ['jeuDilemmes', 'quizTuPreferes', 'quizKnowledge'],
    'marrant':         ['quizGenant', 'quizMost', 'jeuActionVerite'],
    'genant':          ['quizMarrant', 'jeuActionVerite', 'quizMost'],
    'knowledge':       ['jeuQuiDeNous', 'zamours', 'testCommonPoints', 'quizMost'],
    'most':            ['jeuActionVerite', 'quizMarrant', 'quizTuPreferes'],
    'vrai-faux':       ['quizKnowledge', 'zamours', 'quizMarrant', 'jeuDilemmes'],
    'zamours':         ['quizKnowledge', 'jeuQuiDeNous', 'quizMost'],
    'ado':             ['quizMarrant', 'quizTuPreferes', 'testCouple'],

    // ── Le fil chaud ────────────────────────────────────────────────────
    // Deux personnes seules, l'ambiance est montée d'un cran. C'est le
    // moment où elles sont le plus disposées à enchaîner : on garde le ton.
    'coquin':                  ['jeuActionVeriteHot', 'jeuGages', 'quizTentation'],
    'action-ou-verite-coquin': ['quizCoquin', 'jeuGages', 'quizTentation'],
    'tentation':               ['testInfidelite', 'quizCoquin', 'testConfiance'],

    // ── Jeux ────────────────────────────────────────────────────────────
    // Un jeu fini appelle un autre jeu, et surtout pas un test.
    'tu-preferes':      ['jeuDilemmes', 'pourContre', 'jeuActionVerite'],
    'action-ou-verite': ['jeuActionVeriteHot', 'jeuGages', 'jeuPlateau'],
    'gage-couple':      ['jeuActionVerite', 'jeuActionVeriteHot', 'jeuPlateau'],
    'plateau-couple':   ['jeuActionVerite', 'jeuQuiDeNous', 'jeuDilemmes'],
    'qui-de-nous-deux': ['quizKnowledge', 'jeuDilemmes', 'zamours', 'quizMost'],
    'dilemmes':         ['pourContre', 'quizTuPreferes', 'jeuQuiDeNous'],
    'pour-contre':      ['jeuDilemmes', 'quizTuPreferes', 'jeuQuiDeNous'],
  };

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

    function ficheParRoute(route) {
      for (var i = 0; i < ALL_QUIZZES_LIST.length; i++) {
        if (ALL_QUIZZES_LIST[i].route === route) return ALL_QUIZZES_LIST[i];
      }
      return null;
    }

    var choisis = [];
    var vues = {};
    var voulus = SUGGESTIONS_PAR_QUIZ[currentQuizKey];
    if (voulus) {
      for (var v = 0; v < voulus.length && choisis.length < 3; v++) {
        var route = voulus[v];
        // On ecarte la page courante, les doublons, et les pages qui n'existent
        // pas dans cette langue : Les Z'Amours n'a pas de version traduite.
        if (route === courant || vues[route]) continue;
        if (getRelatedQuizUrl(route, lang) === '/') continue;
        var fiche = ficheParRoute(route);
        if (!fiche) continue;
        vues[route] = true;
        choisis.push(fiche);
      }
    }
    // Filet de securite si une cle n'a pas encore sa liste : on complete au
    // hasard plutot que de n'afficher aucune suggestion.
    if (choisis.length < 3) {
      var restants = shuffleArray(ALL_QUIZZES_LIST.filter(function(q) {
        if (q.route === courant || vues[q.route]) return false;
        if (getRelatedQuizUrl(q.route, lang) === '/') return false;
        vues[q.route] = true;
        return true;
      }));
      choisis = choisis.concat(restants.slice(0, 3 - choisis.length));
    }
    var shuffled = choisis;
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
  // ─── Disposition commune des ecrans de resultat ───────────
  // L'ordre du DOM etait : resultat + formulaire d'avis, puis les autres quiz,
  // puis seulement le partage et le rejouer. Sur telephone, ou tout s'empile,
  // on demandait donc une note avant meme d'avoir lu son verdict, et les deux
  // actions qu'on veut vraiment faire apres un resultat arrivaient tout en bas,
  // derriere une liste de six autres tests.
  //
  // Un resultat se lit maintenant toujours dans le meme ordre : ce que j'ai
  // obtenu, ce que je peux en faire, ce que j'en pense, ou aller ensuite. Le
  // DOM suit cet ordre (donc le telephone aussi) et la mise en colonnes sur
  // grand ecran se fait par zones, sans reordonner quoi que ce soit.
  function dispositionResultat(wrap, zones) {
    wrap.classList.add('qr-plan');
    ['resultat', 'actions', 'avis', 'suite'].forEach(function(nom) {
      var z = zones[nom];
      if (!z) return;
      z.classList.add('qr-zone', 'qr-zone--' + nom);
      wrap.appendChild(z);
    });
    if (zones.resultat) alignerLaProse(zones.resultat);
    // Tous les moteurs finissent ici, y compris SoloTest et le jeu de
    // dilemmes qui ont leur propre mise en page : c'est donc le seul endroit
    // ou brancher le panneau d'avant-resultats pour qu'il couvre tout.
    panneauAvantResultats(wrap);
  }

  // Le resultat est deja construit derriere le panneau : il n'y a rien a
  // attendre ni a recalculer a la fermeture, on remonte juste dessus. Si le
  // fichier qui porte le panneau n'a pas ete charge, on ne fait rien et le
  // resultat s'affiche normalement.
  function panneauAvantResultats(wrap) {
    if (typeof window.qcPanneauAvantResultats !== 'function') return;
    var quizEl = document.getElementById('quiz-engine') || document.querySelector('[data-quiz]');
    window.qcPanneauAvantResultats({
      lang: quizEl ? (quizEl.dataset.lang || 'fr') : 'fr',
      onContinue: function () {
        if (wrap && wrap.scrollIntoView) {
          try { wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
          catch (e) { wrap.scrollIntoView(); }
        }
      },
    });
  }

  // Les verdicts sont centres, ce qui va tres bien a « Un couple tres solide »
  // et beaucoup moins a un paragraphe de douze lignes sur un telephone : le
  // bord gauche devient irregulier et l'oeil perd la ligne suivante. On ne
  // change donc l'alignement que des paragraphes reellement longs, quel que
  // soit le moteur qui les a produits.
  var PROSE_MIN = 160;
  function alignerLaProse(zone) {
    var blocs = zone.querySelectorAll('p, li');
    for (var i = 0; i < blocs.length; i++) {
      if ((blocs[i].textContent || '').trim().length >= PROSE_MIN) blocs[i].classList.add('qr-prose');
    }
  }

  // Les actions d'apres-resultat : partager en premier, puis rejouer.
  function zoneActions(opts) {
    var quizEl = document.getElementById('quiz-engine') || document.querySelector('[data-quiz]');
    var zone = el('div', 'quiz-reveal-enter');
    renderShareButton(zone, opts.share || opts.shareText);

    var actions = el('div', 'result-actions-grid');
    function bouton(icone, libelle, action, principal) {
      var b = el('button', 'result-action-btn' + (principal ? ' result-action-btn--primary' : ''));
      b.type = 'button';
      b.innerHTML = '<span class="result-action-icon">' + icone + '</span>' +
        '<span class="result-action-label">' + esc(libelle) + '</span>';
      b.addEventListener('click', action);
      actions.appendChild(b);
    }
    // « Autres questions » et « Recommencer » faisaient la même promesse à un
    // tirage près, côte à côte, au moment où il fallait au contraire une seule
    // sortie évidente. Il ne reste que la reprise depuis le début.
    if (opts.restart) bouton('🔄', tg('result.restartFromBeginning', 'Recommencer'), opts.restart, true);
    if (opts.changePlayers) bouton('👥', tg('result.changePlayers', 'Changer de joueurs'), opts.changePlayers);
    if (actions.childNodes.length) zone.appendChild(actions);
    return zone;
  }

  // ── Encart partenaire ──────────────────────────────────────
  // Posé sur les seuls écrans de fin dont le contenu est déjà pour adultes :
  // le quiz coquin et la version hot d'action ou vérité. Ailleurs il n'aurait
  // rien à faire.
  //
  // Le lien est un lien d'affiliation. Trois précautions, qui ne coûtent rien
  // au taux de clic :
  //   • rel="sponsored nofollow" : Google l'exige pour un lien rémunéré, et
  //     sans lui c'est le référencement du site qui est exposé ;
  //   • target="_blank" avec noopener : la partie en cours n'est pas perdue,
  //     et celui qui revient retrouve son écran de résultat ;
  //   • une mention visible sous le bouton. La section 8 des mentions légales
  //     existe déjà, mais elle est à deux clics d'ici : l'information doit
  //     être là où le lien est.
  //
  // Boutique française, textes français : l'encart ne sort qu'en français.
  // Le proposer aux autres langues gâcherait l'emplacement sans rapporter.
  var PARTENAIRES = {
    coquin: {
      fr: {
        // Lien de suivi Affilae. L'adresse directe de la boutique avec les
        // paramètres ne comptait aucun clic : c'est le redirecteur c3po.link
        // qui enregistre le passage avant de renvoyer vers la boutique.
        url: 'https://c3po.link/Quyean9abC',
        // Visuels de la marque, copies chez nous a la construction. Appeler
        // le serveur du partenaire exposerait l'encart a une image qui change
        // ou disparait sans prevenir, et ferait fuiter la visite de nos
        // lecteurs vers un domaine tiers avant meme qu'ils cliquent.
        image: '/partenaires/passage-du-desir.webp',
        imageAlt: 'Mannequin en lingerie de dentelle, campagne Le Passage du Désir',
        logo: '/partenaires/passage-du-desir-logo.svg',
        marque: 'Le Passage du Désir',
        surtitre: 'Notre partenaire',
        titre: 'Envie de découvrir les jouets pour adultes les plus discrets ? 🤭',
        texte: 'Lingerie, jeux et accessoires : de quoi prolonger la soirée bien après la dernière question.',
        // Deux arguments qui lèvent le frein réel de cet achat : ce qui arrive
        // dans la boîte aux lettres, et la confiance qu'on peut faire au
        // vendeur. Chiffre Trustpilot confirmé par l'éditeur du site ; il
        // évolue, à revoir si l'écart devient visible.
        atouts: [
          { icone: '📦', texte: 'Emballage neutre et discret' },
          { icone: '⭐', texte: '4,8/5 sur Trustpilot' }
        ],
        bouton: 'Voir la boutique',
        mention: 'Lien partenaire. Le prix que vous payez reste le même.'
      }
    }
  };

  function blocPartenaire(wrap, cle, lang) {
    var jeu = PARTENAIRES[cle];
    var p = jeu && jeu[lang || 'fr'];
    if (!p) return;

    // Toute la banniere est cliquable, pas seulement le bouton : c'est
    // l'offre entiere qui est le lien. Un span fait office de bouton, un
    // <button> dans un <a> ne serait pas du HTML valide.
    // La bannière vit dans la carte de résultat, dont la largeur dépend de la
    // présence de la colonne des tests voisins : à 1024 px de fenêtre elle ne
    // dispose que de 520 px. Elle doit donc réagir à sa propre largeur et non
    // à celle de l'écran, d'où le conteneur de requête. Sans prise en charge,
    // elle reste empilée, ce qui est la disposition sûre.
    var zone = el('div', 'partenaire-zone');
    var a = el('a', 'partenaire-banniere');
    a.href = p.url;
    a.target = '_blank';
    a.rel = 'sponsored nofollow noopener';
    a.setAttribute('aria-label', p.titre + ' - ' + p.marque);
    a.innerHTML =
      '<span class="partenaire-visuel">' +
        '<img src="' + p.image + '" alt="' + esc(p.imageAlt) + '" loading="lazy" decoding="async" width="480" height="480">' +
      '</span>' +
      '<span class="partenaire-corps">' +
        '<span class="partenaire-marque">' +
          '<img class="partenaire-logo" src="' + p.logo + '" alt="' + esc(p.marque) + '" loading="lazy" decoding="async">' +
        '</span>' +
        '<span class="partenaire-surtitre">' + esc(p.surtitre) + '</span>' +
        '<span class="partenaire-titre">' + esc(p.titre) + '</span>' +
        '<span class="partenaire-texte">' + esc(p.texte) + '</span>' +
        (p.atouts ? '<span class="partenaire-atouts">' + p.atouts.map(function(x) {
          return '<span class="partenaire-atout"><span aria-hidden="true">' + x.icone + '</span>' + esc(x.texte) + '</span>';
        }).join('') + '</span>' : '') +
        '<span class="partenaire-btn">' + esc(p.bouton) +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>' +
        '</span>' +
        '<span class="partenaire-mention">' + esc(p.mention) + '</span>' +
      '</span>';
    zone.appendChild(a);
    wrap.appendChild(zone);
  }

  function renderActionButtons(wrap, opts) {
    var quizEl = document.getElementById('quiz-engine') || document.querySelector('[data-quiz]');
    var currentKey = quizEl ? quizEl.dataset.quiz : '';
    var currentLang = quizEl ? (quizEl.dataset.lang || 'fr') : 'fr';

    // Ce que le moteur a déjà produit devient la zone « résultat ».
    var resultat = el('div', 'quiz-reveal-enter');
    while (wrap.firstChild) resultat.appendChild(wrap.firstChild);

    var avis = el('div', 'quiz-reveal-enter');
    avis.appendChild(pcReviewForm(currentLang));

    var suite = el('div', 'qr-right quiz-reveal-enter');
    renderRelatedQuizzes(suite, currentKey, currentLang);

    dispositionResultat(wrap, {
      resultat: resultat, actions: zoneActions(opts), avis: avis, suite: suite
    });
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
    var corps = [];

    // Encart de mise en garde : trois tests touchent des sujets sensibles et
    // doivent poser le cadre avant la premiere question.
    function encart(html) {
      var b = el('div', 'quiz-setup-note');
      b.innerHTML = html;
      return b;
    }
    if (this.quizType === 'toxic') {
      corps.push(encart('<p class="quiz-setup-note-intro">' + esc(tg('toxic.introQuestion', 'Vous vous posez la question :')) + '</p>' +
        '<p class="quiz-setup-note-cite">' + esc(tg('toxic.introQuote', '« Est-ce que mon couple est toxique… ou est-ce que je dramatise ? »')) + '</p>' +
        '<p class="quiz-setup-note-fin">' + esc(tg('toxic.disclaimer', 'Ce test n\'est ni un diagnostic médical, ni un jugement.')) + '</p>'));
    }
    if (this.quizType === 'pervers') {
      corps.push(encart('<p class="quiz-setup-note-intro">' + esc(tg('pervers.introQuestion', 'Vous vous posez la question :')) + '</p>' +
        '<p class="quiz-setup-note-cite">' + esc(tg('pervers.introQuote', '« Est-ce que je vis avec un pervers narcissique… ou est-ce que j\'exagère ? »')) + '</p>' +
        '<p class="quiz-setup-note-fin">' + esc(tg('pervers.disclaimer', 'Ce test n\'est ni un diagnostic, ni un jugement. C\'est un outil de réflexion pour mettre des mots sur ce que vous vivez.')) + '</p>'));
    }
    if (this.quizType === 'divorce') {
      corps.push(encart('<p class="quiz-setup-note-fin">💡 ' + esc(tg('divorce.disclaimer', 'Ce test est un outil de réflexion personnel. Il ne remplace en aucun cas l\'avis d\'un professionnel.')) + '</p>'));
    }
    // Les tests ajoutés depuis n'ont plus besoin de leur propre branche : il
    // leur suffit de déclarer leurs textes sous une clé portant le nom de leur
    // quizType, comme les trois du dessus.
    if (['toxic', 'pervers', 'divorce'].indexOf(this.quizType) === -1) {
      var lu = function (champ) {
        var v = tg(self.quizType + '.' + champ, '');
        return (v && v.indexOf(self.quizType + '.') !== 0) ? v : '';
      };
      var nQ = lu('introQuestion'), nC = lu('introQuote'), nD = lu('disclaimer');
      if (nQ || nC || nD) {
        corps.push(encart(
          (nQ ? '<p class="quiz-setup-note-intro">' + esc(nQ) + '</p>' : '') +
          (nC ? '<p class="quiz-setup-note-cite">' + esc(nC) + '</p>' : '') +
          (nD ? '<p class="quiz-setup-note-fin">' + esc(nD) + '</p>' : '')));
      }
    }

    // Le test ado demande le prenom du/de la partenaire avant de commencer.
    var nameInput = null;
    if (this.needsName) {
      var nameWrap = el('div', 'quiz-setup-nom');
      var nameLabel = el('label', 'quiz-setup-nom-label');
      nameLabel.textContent = tg('ui.yourName', 'Prénom de ton/ta partenaire');
      nameInput = el('input', 'input');
      nameInput.type = 'text';
      nameInput.placeholder = tg('ui.namePlaceholder', 'Ex : Lucas');
      nameInput.maxLength = 30;
      nameLabel.setAttribute('for', 'solo-nom');
      nameInput.id = 'solo-nom';
      nameWrap.appendChild(nameLabel);
      nameWrap.appendChild(nameInput);
      corps.push(nameWrap);
    }

    var ecran = ecranDepart({
      icone: this.labels.icon || '📝',
      titre: tg('playerSetup.readyForTest', 'Prêt pour le test ?'),
      corps: corps,
      meta: pastilleMeta(this.questions.length),
      bouton: this.labels.start || tg('playerSetup.startTest', 'Commencer le test'),
      onStart: function() {
        if (self.needsName && nameInput) {
          var name = nameInput.value.trim();
          if (!name) {
            nameInput.classList.add('input--erreur');
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
      }
    });
    this.container.appendChild(ecran.wrap);
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
        // Fin de couple : la premiere question situe la relation et ne rapporte
        // aucun point. Sa reponse decide seulement des pistes proposees a la
        // fin, un couple qui vit a distance n'ayant pas les memes questions a
        // se poser qu'un couple qui vit sous le meme toit.
        if (self.quizType === 'fin-couple' && q.id === 1) {
          self.aDistance = (opt.id === 'c');
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
    var wrap = el('div', 'quiz-engine quiz-result-card');
    var result = null;
    for (var i = 0; i < this.results.length; i++) {
      var r = this.results[i];
      if (this.totalScore >= r.min && this.totalScore <= r.max) { result = r; break; }
    }
    if (!result && this.results.length > 0) result = this.results[this.results.length - 1];

    var maxScore = this.results.length > 0 ? this.results[this.results.length - 1].max : 100;
    var pct = Math.round((this.totalScore / maxScore) * 100);

    var quizEl = document.getElementById('quiz-engine') || document.querySelector('[data-quiz]');

    // ── Le résultat : le score, puis tout de suite ce qu'il veut dire.
    // L'anneau et le verdict vivaient dans deux colonnes différentes : sur
    // téléphone, où elles s'empilent, le formulaire d'avis de la colonne
    // gauche venait donc s'intercaler entre le score et son explication.
    var resultat = el('div', 'quiz-reveal-enter');
    var entete = el('div', 'qr-entete');
    var scoreDiv = el('div', 'qr-score');
    scoreDiv.innerHTML = renderScoreRing(pct);
    entete.appendChild(scoreDiv);
    entete.appendChild(el('p', 'qr-score-label', this.totalScore + '/' + maxScore + ' ' + esc(tg('meta.pointsWord', 'points'))));
    resultat.appendChild(entete);
    if (result) {
      resultat.appendChild(el('h3', 'qr-title', esc(result.title)));
      resultat.appendChild(el('p', 'qr-desc', result.description));
      if (result.advice) {
        var advice = el('div', 'qr-advice');
        advice.innerHTML = '<strong>' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(result.advice);
        resultat.appendChild(advice);
      }
    }

    // Fin de couple : le score dit ou en est la relation, il ne dit pas
    // pourquoi. Les trois pistes ci-dessous repondent chacune a une question
    // precise que ce test-la ne pose pas, et la piste « a distance » ne
    // s'affiche que pour ceux qui ont declare vivre a distance.
    if (this.quizType === 'fin-couple') {
      var pistes = [
        { route: 'testCouche', cle: 'couche', si: true },
        { route: 'testDistanceAime', cle: 'distance', si: !!this.aDistance },
        { route: 'testToxic', cle: 'toxique', si: true }
      ].filter(function (p) {
        if (!p.si) return false;
        p.url = getRelatedQuizUrl(p.route, self.lang);
        return p.url && p.url !== '/';
      });
      if (pistes.length) {
        var orient = el('div', 'qr-orientation');
        orient.appendChild(el('p', 'qr-orientation-titre',
          esc(tg('finCouple.orientationTitre', 'Ce que ce test ne vous a pas demandé'))));
        pistes.forEach(function (p) {
          var a = document.createElement('a');
          a.className = 'qr-orientation-lien';
          a.href = p.url;
          a.innerHTML = '<span class="qr-orientation-nom">' +
            esc(tg('finCouple.orient_' + p.cle + '_nom', '')) + '</span>' +
            '<span class="qr-orientation-raison">' +
            esc(tg('finCouple.orient_' + p.cle + '_raison', '')) + '</span>' +
            '<span class="qr-orientation-fleche" aria-hidden="true">→</span>';
          orient.appendChild(a);
        });
        resultat.appendChild(orient);
      }
    }

    var avis = el('div', 'quiz-reveal-enter');
    avis.appendChild(pcReviewForm(this.lang));

    var suite = el('div', 'qr-right quiz-reveal-enter');
    renderRelatedQuizzes(suite, quizEl ? quizEl.dataset.quiz : '', quizEl ? (quizEl.dataset.lang || 'fr') : 'fr');

    dispositionResultat(wrap, {
      resultat: resultat,
      actions: zoneActions({
        share: { type: 'solo', score: this.totalScore, total: maxScore, pct: pct, verdict: result ? result.title : '' },
        restart: function() {
          if (self.hasLocalStorage) { try { localStorage.removeItem('quiz-' + self.prefix); } catch (e) {} }
          self.phase = 'intro'; self.render();
        }
      }),
      avis: avis,
      suite: suite
    });
    this.container.appendChild(wrap);
    document.body.classList.add('quiz-has-result');
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // DUO MATCH QUIZ - tester-couple, common-points
  // 2 players (optionally with gender), answer matching
  // ═══════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════
  // TEST DE COUPLE - bareme pondere de la solidite
  // ═══════════════════════════════════════════════════════════
  // Toutes les questions ne disent pas la meme chose de la solidite d'un
  // couple : ne pas se projeter a cinq ans pese plus lourd qu'un week-end
  // solo mal vecu. Chaque question porte donc une dimension et un poids.
  //   3 = fondamental (vie commune, epreuves traversees, projection, securite)
  //   2 = structurant (jalons sociaux, ancrage materiel, reparation)
  //   1 = confort     (vacances, autonomie, anciennete du dernier doute)
  var TESTER_BAREME = {
    testerC: {
      1:  { d: 'anciennete', w: 2 },
      2:  { d: 'jalons',     w: 2 },
      3:  { d: 'social',     w: 2 },
      4:  { d: 'ancrage',    w: 3 },
      5:  { d: 'jalons',     w: 1 },
      6:  { d: 'epreuves',   w: 3 },
      7:  { d: 'projection', w: 3 },
      8:  { d: 'ancrage',    w: 2 },
      9:  { d: 'epreuves',   w: 3 },
      10: { d: 'fiabilite',  w: 3 },
      11: { d: 'securite',   w: 3 },
      12: { d: 'reparation', w: 2 },
      13: { d: 'projection', w: 3 },
      14: { d: 'social',     w: 2 },
      15: { d: 'social',     w: 2 },
      16: { d: 'social',     w: 2 },
      17: { d: 'fiabilite',  w: 2 },
      18: { d: 'epreuves',   w: 2 },
      19: { d: 'reparation', w: 3 },
      20: { d: 'ancrage',    w: 2 },
      21: { d: 'projection', w: 2 },
      22: { d: 'autonomie',  w: 1 },
      23: { d: 'fiabilite',  w: 2 },
      24: { d: 'securite',   w: 3 },
      25: { d: 'jalons',     w: 1 },
      26: { d: 'epreuves',   w: 3 },
      27: { d: 'projection', w: 2 },
      28: { d: 'anciennete', w: 1 },
      29: { d: 'ancrage',    w: 2 },
      30: { d: 'securite',   w: 2 },
      31: { d: 'epreuves',   w: 2 },
      32: { d: 'anciennete', w: 2 },
      33: { d: 'autonomie',  w: 1 }
    }
  };

  // Valeur de chaque reponse selon son rang, de la plus solide a la moins
  // solide. La marche entre la 2e et la 3e reponse est volontairement plus
  // large que celle entre la 1re et la 2e : repondre « oui avec une nuance »
  // reste un bon signe, « plutot non » en est un mauvais.
  var TESTER_VALEURS = [1, 0.75, 0.4, 0];

  function DuoMatchQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.needsGender = config.needsGender || false;
    this.useScoring = config.useScoring || false;
    // En solo le couple repond ensemble : une seule serie de reponses, pas de
    // prenoms, pas de relais, et une note unique a l'arrivee.
    this.modeSolo = config.modeSolo || false;
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

  // Ecran de depart du mode solo : rien a saisir, le couple est devant l'ecran.
  DuoMatchQuiz.prototype.renderSetupSolo = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-6');
    iconWrap.innerHTML = ICONS.users;
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-3 text-center',
      esc(tg('playerSetup.soloReady', 'Prêts, tous les deux ?'))));
    wrap.appendChild(el('p', 'text-muted-foreground mb-8 text-center',
      esc(tg('playerSetup.soloIntro', 'Répondez ensemble, à voix haute, et tranchez à deux quand vous hésitez.'))));
    wrap.appendChild(el('div', 'quiz-setup-meta', pastilleMeta(this.questions.length)));

    var startBtn = el('button', 'btn btn-cta btn-gradient quiz-setup-start-btn',
      tg('playerSetup.startTest', 'Commencer le test'));
    startBtn.addEventListener('click', function() {
      self.players = [{ name: '', gender: '' }, { name: '', gender: '' }];
      self.currentQ = 0; self.currentPlayer = 0;
      self.answers = { p1: [], p2: [] };
      self.phase = 'playing'; self.render();
    });
    wrap.appendChild(startBtn);
    this.container.appendChild(wrap);
  };

  DuoMatchQuiz.prototype.renderSetup = function() {
    var self = this;
    if (this.modeSolo) return this.renderSetupSolo();
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

    var info = el('div', 'quiz-setup-meta', '📝 ' + this.questions.length + ' ' +
      tg('meta.questionsWord', 'questions') + ' &bull; ⏱ ' + tg('meta.duration', '5 min'));

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
    var color = this.needsGender ? getPlayerColor(player, this.players[this.currentPlayer === 0 ? 1 : 0], this.currentPlayer) : null;

    this.container.appendChild(relaisJoueur(this, {
      nom: player.name,
      couleur: color ? color.bg : null,
      etape: tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + this.questions.length,
      suite: function() { self.phase = 'playing'; self.render(); }
    }));
  };

  DuoMatchQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    // En solo il n'y a qu'une serie de reponses : la barre compte 20 pas, pas 40.
    var totalNeeded = this.modeSolo ? total : total * 2;
    var answered = this.modeSolo
      ? this.answers.p1.filter(function(a) { return a !== null; }).length
      : this.answers.p1.filter(function(a) { return a !== null; }).length + this.answers.p2.filter(function(a) { return a !== null; }).length;
    var player = this.players[this.currentPlayer];
    var color = (this.needsGender && !this.modeSolo) ? getPlayerColor(player, this.players[this.currentPlayer === 0 ? 1 : 0], this.currentPlayer) : null;

    var wrap = el('div', 'quiz-engine quiz-question-enter');

    renderProgressBar(wrap, answered, totalNeeded, tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + total);

    // Player indicator with color. En solo personne n'a de tour : pas de badge.
    if (!this.modeSolo) {
      var badge = el('div', 'text-center mb-4');
      if (color) {
        badge.innerHTML = '<span class="badge" style="background:' + color.bg + ';color:' + color.text + '">' + esc(player.name) + '</span>';
      } else {
        badge.innerHTML = '<span class="badge badge-primary">' + esc(player.name) + '</span>';
      }
      wrap.appendChild(badge);
    }

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
          if (self.modeSolo) {
            self.answers.p1[self.currentQ] = opt.id;
            if (self.currentQ < total - 1) { self.currentQ++; self.phase = 'playing'; }
            else { self.phase = 'results'; }
          } else if (self.currentPlayer === 0) {
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
      { min: 0, max: 19, tag: 'Alerte', title: 'Un couple en souffrance', desc: 'Vos réponses décrivent une relation qui fait plus mal que du bien en ce moment. Ce constat est dur, mais il a une vertu : il nomme ce que vous ressentez sans doute déjà. Parlez-en à quelqu\'un de confiance, et si le dialogue est rompu, un thérapeute de couple est exactement fait pour ça.' },
      { min: 20, max: 34, tag: 'Fragile', title: 'Des fondations à reprendre', desc: 'Plusieurs piliers, communication, confiance, réparation après conflit, sont abîmés en même temps. Rien d\'irréversible, mais n\'attendez pas que ça se répare seul : choisissez LE sujet qui fait le plus mal et ouvrez-le calmement, hors dispute.' },
      { min: 35, max: 49, tag: 'En chantier', title: 'Un couple qui cherche son équilibre', desc: 'Il y a du lien, et il y a des fuites. Vos réponses divergentes montrent précisément où : ce sont vos chantiers prioritaires. Le bon réflexe n\'est pas de tout traiter, c\'est d\'en choisir deux et de s\'y mettre vraiment.' },
      { min: 50, max: 62, tag: 'À consolider', title: 'Une vraie base, des chantiers connus', desc: 'Votre couple tient sur de vraies fondations, avec des zones de friction que vous connaissez probablement déjà. La différence entre les couples qui progressent et les autres : les premiers en parlent avant que ça coince, pas après.' },
      { min: 63, max: 74, tag: 'Solide', title: 'Un couple solide', desc: 'Communication et confiance répondent présent, les frictions restent gérables. Votre marge de progression est dans les sujets que vous évitez encore : c\'est souvent là que dorment les 10 points manquants.' },
      { min: 75, max: 84, tag: 'Très solide', title: 'Un couple très solide', desc: 'Vous avez construit quelque chose de stable et d\'équilibré, qui traverse les tempêtes sans prendre l\'eau. Entretenez ce qui marche, et gardez un œil sur la routine : c\'est la seule vraie menace à ce niveau.' },
      { min: 85, max: 94, tag: 'Complice', title: 'Un couple rare', desc: 'Confiance, complicité, projets, réparation : presque tout y est, et vos réponses se rejoignent là où ça compte. Ce genre d\'équilibre ne doit rien au hasard, il dit le travail que vous faites l\'un pour l\'autre au quotidien.' },
      { min: 95, max: 100, tag: 'Exceptionnel', title: 'Un accord presque parfait', desc: 'Un score pareil est exceptionnel, à une condition : que vous ayez répondu chacun avec votre vérité, pas avec la réponse qui fait plaisir. Si c\'est le cas, félicitations sincères. Si un doute subsiste, refaites-le en jouant franc-jeu : le résultat n\'en sera que plus beau.' }
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
      restart: function() { self.phase = 'setup'; self.render(); }
    });

    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // Resultat scoring (tester-couple) : score par joueur + score global, 3 blocs.
  DuoMatchQuiz.prototype.renderScoringResults = function() {
    var self = this;
    var total = this.questions.length;

    // Bareme pondere : la contribution d'une reponse vaut poids x valeur, et la
    // note est le rapport au total des poids reellement poses. Elle reste donc
    // juste quel que soit le tirage. Sans table de bareme, on retombe sur les
    // points portes par les options.
    var bareme = TESTER_BAREME[this.prefix] || null;
    function rangDe(qi, optId) {
      var opts = self.questions[qi].options || [];
      for (var k = 0; k < opts.length; k++) { if (opts[k].id === optId) return k; }
      return -1;
    }
    function valeurDe(rang) {
      if (rang < 0) return 0;
      return TESTER_VALEURS[rang] !== undefined ? TESTER_VALEURS[rang] : 0;
    }
    function ptsFor(qi, optId) {
      var opts = self.questions[qi].options || [];
      for (var k = 0; k < opts.length; k++) { if (opts[k].id === optId) return (opts[k].points || 0); }
      return 0;
    }
    var scoreA = 0, scoreB = 0, maxTotal = 0;
    for (var i = 0; i < total; i++) {
      if (bareme) {
        var fiche = bareme[this.questions[i].id];
        var poids = fiche && fiche.w ? fiche.w : 1;
        maxTotal += poids;
        scoreA += poids * valeurDe(rangDe(i, this.answers.p1[i]));
        scoreB += poids * valeurDe(rangDe(i, this.answers.p2[i]));
      } else {
        var opts = this.questions[i].options || [];
        var qMax = 0;
        for (var k = 0; k < opts.length; k++) { if ((opts[k].points || 0) > qMax) qMax = opts[k].points || 0; }
        maxTotal += qMax;
        scoreA += ptsFor(i, this.answers.p1[i]);
        scoreB += ptsFor(i, this.answers.p2[i]);
      }
    }
    if (maxTotal <= 0) maxTotal = 1;
    // En solo, une seule serie de reponses : la note du couple est celle-la,
    // sans moyenne avec une seconde grille qui n'existe pas.
    var pctA = Math.round(scoreA / maxTotal * 100);
    var pctB = Math.round(scoreB / maxTotal * 100);
    var pctG = this.modeSolo ? pctA : Math.round((scoreA + scoreB) / (2 * maxTotal) * 100);

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

    // Bloc scores individuels. En solo il n'y a qu'une grille de reponses :
    // afficher deux cartes identiques sans prenom n'apprendrait rien.
    if (!this.modeSolo) {
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
    }

    wrap.appendChild(box);

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: pctG, verdict: (bG && bG.title) || '' },
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
    // Trente questions décourageaient : beaucoup arrivaient sur la page sans
    // aller au bout. On joue donc la moitié par défaut, et on propose de
    // prolonger une fois qu'on y a pris goût. `limite` est le nombre de
    // manches réellement à jouer ; `rounds` en contient toujours le maximum,
    // ce qui garantit qu'une question déjà posée ne revient pas à la rallonge.
    this.limite = Math.min(this.demiPartie(), this.totalRounds);
    this.render();
  }

  // La moitié de la partie, arrondie au supérieur : sur trente manches, la
  // version courte en fait quinze.
  CoquinQuiz.prototype.demiPartie = function() {
    return Math.max(1, Math.ceil(this.totalRounds / 2));
  };

  // Manches effectivement jouées. Sert de dénominateur au score : celui qui
  // s'arrête à quinze doit lire « sur 15 », pas « sur 30 ».
  CoquinQuiz.prototype.jouees = function() {
    return this.rounds.filter(function(r) { return r.correct !== null; }).length;
  };

  // Score en toutes lettres, au singulier ou au pluriel. « bonne(s)
  // réponse(s) » est une facilité d'écriture, pas du français ; et l'anglais
  // dirait « 1 correct answers ». Chaque langue fournit ses deux formes.
  // `avecNombre` distingue la phrase complète de l'étiquette d'une pastille,
  // qui affiche déjà le nombre dans sa puce.
  CoquinQuiz.prototype.texteScore = function(bonnes, total, avecNombre) {
    var un = bonnes <= 1;
    var cle = avecNombre
      ? (un ? 'coquin.scoreUn' : 'coquin.scorePluriel')
      : (un ? 'coquin.etiquetteUn' : 'coquin.etiquettePluriel');
    var repli = avecNombre
      ? (un ? '{{bonnes}} bonne réponse sur {{total}}' : '{{bonnes}} bonnes réponses sur {{total}}')
      : (un ? 'bonne réponse sur {{total}}' : 'bonnes réponses sur {{total}}');
    return tg(cle, repli).replace('{{bonnes}}', bonnes).replace('{{total}}', total);
  };

  // Pastille de l'écran de départ, accordée au nombre de manches choisi.
  // Une manche demande deux réponses et un passage de téléphone : compter
  // vingt secondes est plus honnête que d'annoncer cinq minutes pour trente.
  CoquinQuiz.prototype.metaLongueur = function() {
    var minutes = Math.max(3, Math.round(this.limite * 20 / 60));
    return pastilleMeta(this.limite, null, minutes + ' min');
  };

  CoquinQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'guessing') this.renderGuessing();
    else if (this.phase === 'revealing') this.renderRevealing();
    else if (this.phase === 'feedback') this.renderFeedback();
    else if (this.phase === 'palier') this.renderPalier();
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

    // La pastille annonçait les trente questions du réservoir alors qu'on en
    // joue quinze par défaut. Elle suit maintenant le choix.
    var metaEl = el('div', 'quiz-setup-meta');
    metaEl.innerHTML = this.metaLongueur();

    // Choix de la longueur. La version courte est présélectionnée : c'est
    // l'engagement le plus facile à prendre, et on peut prolonger à la fin.
    var court = this.demiPartie();
    var longueurs = [
      { n: court, libelle: tg('coquin.longueurCourt', 'Version rapide') },
      { n: this.totalRounds, libelle: tg('coquin.longueurLong', 'Version complète') }
    ];
    var choixWrap = el('div', 'coquin-longueur');
    choixWrap.appendChild(el('p', 'coquin-longueur-titre', tg('coquin.longueurTitre', 'Vous jouez en combien de questions ?')));
    var boutonsWrap = el('div', 'coquin-longueur-choix');
    longueurs.forEach(function(o) {
      var b = el('button', 'coquin-longueur-btn' + (o.n === self.limite ? ' active' : ''));
      b.type = 'button';
      b.setAttribute('aria-pressed', o.n === self.limite ? 'true' : 'false');
      b.innerHTML = '<span class="coquin-longueur-nb">' + o.n + '</span>' +
        '<span class="coquin-longueur-unite">' + esc(tg('coquin.longueurUnite', 'questions')) + '</span>' +
        '<span class="coquin-longueur-libelle">' + esc(o.libelle) + '</span>';
      b.addEventListener('click', function() {
        self.limite = o.n;
        boutonsWrap.querySelectorAll('.coquin-longueur-btn').forEach(function(x) {
          x.classList.remove('active'); x.setAttribute('aria-pressed', 'false');
        });
        b.classList.add('active'); b.setAttribute('aria-pressed', 'true');
        if (metaEl) metaEl.innerHTML = self.metaLongueur();
      });
      boutonsWrap.appendChild(b);
    });
    choixWrap.appendChild(boutonsWrap);
    form.appendChild(choixWrap);

    var startBtn = el('button', 'btn btn-cta btn-gradient quiz-setup-start-btn', '🔥 ' + tg('coquin.lightTheFlame', 'Allumer la flamme'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('coquin-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('coquin-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.initRounds();
      self.phase = 'guessing'; self.render();
    });
    wrap.appendChild(metaEl);
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
    renderProgressBar(wrap, this.currentRound, this.limite, tg('question.roundXofY', 'Manche {{current}} sur {{total}}').replace('{{current}}', this.currentRound + 1).replace('{{total}}', this.limite));

    wrap.appendChild(el('div', 'text-center mb-2 text-sm text-muted-foreground', esc(guesser.name) + ' ' + tg('coquin.guessFor', 'devine pour') + ' ' + esc(target.name)));
    renderPlayerBadge(wrap, guesser.name + ' ' + tg('question.itsYourTurnToGuess', 'c\'est à toi de deviner !'));

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    // Replace NAME/{{name}} with target player's name
    qText = injecterPrenom(qText, target.name);
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
    renderProgressBar(wrap, this.currentRound, this.limite, tg('question.roundXofY', 'Manche {{current}} sur {{total}}').replace('{{current}}', this.currentRound + 1).replace('{{total}}', this.limite));

    wrap.appendChild(el('div', 'text-center mb-2', '📱 ' + tg('coquin.passPhone', 'Passez le téléphone à') + ' ' + esc(target.name)));
    renderPlayerBadge(wrap, target.name + ', ' + tg('coquin.revealAnswer', 'révèle ta vraie réponse !'));

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    qText = injecterPrenom(qText, target.name);
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
    var bonnes = this.rounds.filter(function(r) { return r.correct === true; }).length;
    var jouees = this.jouees();

    var wrap = el('div', 'quiz-engine coquin-verdict animate-fade-in text-center'
      + (round.correct ? ' est-juste' : ' est-rate'));

    // Le verdict tenait en un emoji et une ligne de texte gris. Il porte
    // maintenant la couleur de l'ecran : c'est le moment fort de la manche.
    var halo = el('div', 'coquin-verdict-halo');
    halo.innerHTML = '<span>' + (round.correct ? '🔥' : '🙈') + '</span>';
    wrap.appendChild(halo);
    wrap.appendChild(el('h2', 'coquin-verdict-titre', round.correct
      ? tg('coquin.correctGuess', 'Bien devine !')
      : tg('coquin.wrongGuess', 'Rate !')));

    var guessOpt = q.options.find(function(o) { return o.id === round.guess; });
    var actualOpt = q.options.find(function(o) { return o.id === round.actual; });
    var texteDevine = guessOpt ? tgd(self.prefix + '.q' + q.id + guessOpt.id, guessOpt.text) : '';
    var texteVrai = actualOpt ? tgd(self.prefix + '.q' + q.id + actualOpt.id, actualOpt.text) : '';

    if (round.correct) {
      // Les deux reponses sont identiques : les afficher deux fois n'apprend
      // rien. Une seule carte, qui dit ce qu'ils ont en commun.
      var accord = el('div', 'coquin-carte coquin-carte--accord');
      accord.innerHTML =
        '<span class="coquin-carte-etiquette">' + esc(tg('coquin.verdictAccord', 'Vous avez dit la meme chose')) + '</span>' +
        '<span class="coquin-carte-reponse">' + esc(texteVrai || texteDevine) + '</span>';
      wrap.appendChild(accord);
    } else {
      // Rate : c'est l'ecart entre les deux qui est interessant, on les met
      // face a face plutot qu'en deux lignes grises l'une sous l'autre.
      var duel = el('div', 'coquin-duel');
      var carteD = el('div', 'coquin-carte coquin-carte--devine');
      carteD.innerHTML =
        '<span class="coquin-carte-etiquette">' + esc(guesser.name) + ' ' + esc(tg('coquin.verdictDevine', 'a devine')) + '</span>' +
        '<span class="coquin-carte-reponse">' + esc(texteDevine) + '</span>';
      var carteV = el('div', 'coquin-carte coquin-carte--vraie');
      carteV.innerHTML =
        '<span class="coquin-carte-etiquette">' + esc(tg('coquin.verdictVraie', 'La vraie reponse de {{nom}}').replace('{{nom}}', target.name)) + '</span>' +
        '<span class="coquin-carte-reponse">' + esc(texteVrai) + '</span>';
      duel.appendChild(carteD);
      duel.appendChild(el('div', 'coquin-duel-vs', 'vs'));
      duel.appendChild(carteV);
      wrap.appendChild(duel);
    }

    // Le score devient une pastille, avec le total reellement joue.
    var pastille = el('div', 'coquin-score-pastille');
    pastille.innerHTML = '<span class="coquin-score-nb">' + bonnes + '</span>' +
      '<span class="coquin-score-texte">' + esc(this.texteScore(bonnes, jouees, false)) + '</span>';
    wrap.appendChild(pastille);

    var suivant = this.currentRound + 1;
    var nextBtn = el('button', 'btn btn-cta btn-lg coquin-suivant', tg('coquin.nextRound', 'Manche suivante'));
    nextBtn.addEventListener('click', function() {
      if (suivant >= self.limite) {
        // Palier atteint. On ne propose la rallonge que s'il reste vraiment
        // des questions non posees, sinon on va droit aux resultats.
        self.phase = (self.limite < self.totalRounds) ? 'palier' : 'results';
      } else {
        self.currentRound = suivant; self.phase = 'guessing';
      }
      self.render();
    });
    wrap.appendChild(nextBtn);
    this.container.appendChild(wrap);
  };

  // Palier : la version courte est finie, on continue ou on s'arrete.
  // Celui qui vient de jouer quinze manches a montre qu'il accrochait. Lui
  // proposer la suite ici convertit mieux que de l'annoncer au depart, ou
  // trente questions faisaient reculer.
  CoquinQuiz.prototype.renderPalier = function() {
    var self = this;
    var restant = this.totalRounds - this.limite;
    var bonnes = this.rounds.filter(function(r) { return r.correct === true; }).length;

    var wrap = el('div', 'quiz-engine coquin-palier animate-fade-in text-center');
    wrap.appendChild(el('div', 'coquin-palier-icone', '🔥'));
    wrap.appendChild(el('h2', 'coquin-palier-titre',
      tg('coquin.palierTitre', 'Vous avez repondu aux {{n}} questions !').replace('{{n}}', this.limite)));
    wrap.appendChild(el('p', 'coquin-palier-score', esc(this.texteScore(bonnes, this.jouees(), true))));
    wrap.appendChild(el('p', 'coquin-palier-texte',
      tg('coquin.palierTexte', 'Vous pouvez vous arreter la ou enchainer.')));

    var choix = el('div', 'coquin-palier-choix');
    var continuer = el('button', 'btn btn-cta btn-lg',
      tg('coquin.palierContinuer', 'Jouer {{n}} questions de plus').replace('{{n}}', restant));
    continuer.addEventListener('click', function() {
      self.limite = self.totalRounds;
      self.currentRound = self.currentRound + 1;
      self.phase = 'guessing';
      self.render();
      smoothScroll(self.container, 'start');
    });
    var arreter = el('button', 'btn btn-outline', tg('coquin.palierResultats', 'Voir nos resultats'));
    arreter.addEventListener('click', function() { self.phase = 'results'; self.render(); });
    choix.appendChild(continuer);
    choix.appendChild(arreter);
    wrap.appendChild(choix);
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  CoquinQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var score = this.rounds.filter(function(r) { return r.correct === true; }).length;
    // Le dénominateur est le nombre de manches réellement jouées : celui qui
    // s'arrête à quinze verrait sinon son score divisé par trente.
    var jouees = Math.max(1, this.jouees());
    var pct = Math.round((score / jouees) * 100);

    wrap.appendChild(el('div', 'text-5xl mb-4', '🔥'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2', tg('coquin.resultsOf', 'Résultats de') + ' ' + esc(this.players[0].name) + ' & ' + esc(this.players[1].name)));
    wrap.appendChild(el('div', 'quiz-score-circle mx-auto mb-4', pct + '%'));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6', score + '/' + jouees + ' ' + tg('coquin.goodGuesses', 'bonnes devinettes')));

    blocPartenaire(wrap, 'coquin', this.lang);

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: pct },
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

    var startBtn = el('button', 'btn btn-cta btn-gradient quiz-setup-start-btn', tg('playerSetup.startQuiz', 'Commencer le quiz'));
    startBtn.addEventListener('click', function() {
      var n1 = document.getElementById('knowledge-player-0').value.trim() || tg('playerSetup.player1', 'Joueur 1');
      var n2 = document.getElementById('knowledge-player-1').value.trim() || tg('playerSetup.player2', 'Joueur 2');
      self.players = [{ name: n1 }, { name: n2 }];
      self.currentQ = 0; self.scores = [0, 0];
      self.phase = 'question'; self.render();
    });
    form.appendChild(info);
    wrap.appendChild(el('div', 'quiz-setup-meta', pastilleMeta(this.questions.length)));
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

    // Qui fait quoi. Deux lignes de petit texte gris ne suffisaient pas : on
    // ne savait pas qui devait parler, et la question elle-meme ne disait pas
    // de qui elle parlait. Les deux roles sont maintenant nommes et separes.
    var roles = el('div', 'kq-roles');
    function carteRole(cls, libelle, nom) {
      var c = el('div', 'kq-role kq-role--' + cls);
      c.appendChild(el('span', 'kq-role-label', esc(libelle)));
      c.appendChild(el('span', 'kq-role-nom', esc(nom)));
      return c;
    }
    roles.appendChild(carteRole('devine', tg('question.roleGuess', 'Doit deviner'), guesser.name));
    roles.appendChild(el('span', 'kq-roles-sep', '→'));
    roles.appendChild(carteRole('valide', tg('question.roleValidate', 'Valide'), target.name));
    wrap.appendChild(roles);

    // La consigne est une phrase entiere a jetons plutot que des morceaux
    // recolles : chaque langue garde sa ponctuation, et l'espagnol peut poser
    // son « ¡ » devant le sujet au lieu de le recevoir derriere.
    wrap.appendChild(el('p', 'kq-consigne',
      tg('question.roleInstruction', '{{guesser}}, dis ta réponse à voix haute, {{target}} valide !')
        .replace('{{guesser}}', esc(guesser.name))
        .replace('{{target}}', esc(target.name))));

    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    // Le prenom de la personne visee est injecte dans le texte : sans lui, une
    // question comme « quel est son plat prefere » ne dit pas de qui on parle.
    qText = injecterPrenom(qText, target.name);
    var carte = el('div', 'kq-question');
    carte.appendChild(el('span', 'kq-question-sur', esc(tg('question.aboutPerson', 'Question sur') + ' ' + target.name)));
    carte.appendChild(el('h3', 'kq-question-texte', esc(qText)));
    wrap.appendChild(carte);

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
    // Deux colonnes sur large, deux lignes en dessous de 30rem : avec le prenom
    // dessus les libelles sont trop longs pour tenir cote a cote sur mobile.
    var validationWrap = el('div', 'kq-actions');

    // Les boutons disaient « a trouvé ! » sans sujet : on ne savait pas de qui
    // on parlait au moment de valider. Le prénom est désormais dessus.
    var correctBtn = el('button', 'quiz-validate-btn quiz-validate-correct');
    correctBtn.innerHTML = ICONS.check + ' <span>' +
      tg('question.guesserFound', '{{name}} a trouvé !').replace('{{name}}', esc(guesser.name)) + '</span>';
    correctBtn.addEventListener('click', function() {
      self.scores[guesserIdx]++;
      self.advance();
    });

    var wrongBtn = el('button', 'quiz-validate-btn quiz-validate-wrong');
    wrongBtn.innerHTML = ICONS.cross + ' <span>' +
      tg('question.guesserMissed', '{{name}} s\'est trompé(e) !').replace('{{name}}', esc(guesser.name)) + '</span>';
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
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // FUNNY QUIZ - marrant : des questions qu'on se pose l'un a
  // l'autre, a voix haute. Rien a compter, rien a deviner.
  //
  // Le moteur demandait deux prenoms qu'il n'utilisait ensuite
  // nulle part, puis affichait la question seule au milieu de
  // l'ecran. Il tire maintenant ses questions lui-meme, autant
  // dans chacune des six familles, et les presente sur une carte
  // qui annonce de quoi on parle.
  // ═══════════════════════════════════════════════════════════
  // Les familles ne sont pas ecrites ici : chaque page qui utilise ce moteur
  // apporte les siennes. Le quiz marrant en a six, le second format du quiz
  // genant en a quatre.
  var FUNNY_FAMILLES = [
    { id: 'debuts',    emoji: '💘' },
    { id: 'genant',    emoji: '😬' },
    { id: 'quotidien', emoji: '🏠' },
    { id: 'betises',   emoji: '🤣' },
    { id: 'avoue',     emoji: '🙈' },
    { id: 'siOn',      emoji: '🎬' }
  ];
  var FUNNY_TOTAL = 20;

  function FunnyQuiz(config) {
    this.container = config.container;
    this.prefix = config.prefix || 'marrant';
    this.lang = config.lang || 'fr';
    this.familles = (config.familles && config.familles.length) ? config.familles : FUNNY_FAMILLES;
    this.total = config.total || FUNNY_TOTAL;
    // Certaines series ne se melangent pas. Le quiz de premier rendez-vous
    // monte en intimite palier par palier : jouer ses trois niveaux dans le
    // desordre reviendrait a poser la question la plus intime en deuxieme,
    // ce qui est exactement ce que le format cherche a eviter. En mode
    // ordonne les familles se suivent, et un ecran annonce chaque palier.
    this.ordonne = !!config.ordonne;
    this.phase = 'setup';
    this.currentQ = 0;
    this.questions = [];
    this.tirer();
    this.render();
  }

  FunnyQuiz.prototype.lireFamille = function(id) {
    var out = [];
    for (var i = 1; i <= 60; i++) {
      var k = this.prefix + '.' + id + i;
      var t = tgd(k, null);
      if (!t || t === k) { if (i > 2) break; else continue; }
      out.push({ id: id + i, famille: id, text: t });
    }
    return out;
  };

  // On pioche autant de questions dans chaque famille : une partie passe
  // toujours par les debuts, le quotidien, les moments genants et le reste,
  // au lieu de tomber sur vingt questions de la meme veine.
  FunnyQuiz.prototype.tirer = function() {
    var parFamille = Math.ceil(this.total / this.familles.length);
    var lot = [];
    this.familles.forEach(function(f) {
      lot = lot.concat(shuffleArray(this.lireFamille(f.id)).slice(0, parFamille));
    }, this);
    // En mode ordonne on garde l'ordre des familles et on ne melange qu'a
    // l'interieur de chacune : deux parties posent des questions differentes,
    // mais toujours dans le meme sens de progression.
    this.questions = this.ordonne ? lot.slice(0, this.total) : shuffleArray(lot).slice(0, this.total);
  };

  // Rang du palier (1, 2, 3...) de la question en cours.
  FunnyQuiz.prototype.rangFamille = function(id) {
    for (var i = 0; i < this.familles.length; i++) {
      if (this.familles[i].id === id) return i + 1;
    }
    return 1;
  };

  FunnyQuiz.prototype.emojiFamille = function(id) {
    for (var i = 0; i < this.familles.length; i++) {
      if (this.familles[i].id === id) return this.familles[i].emoji;
    }
    return '💬';
  };

  FunnyQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'palier') this.renderPalier();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  // Annonce du palier. Elle sert autant a rythmer la partie qu'a prevenir :
  // le troisieme niveau se refuse, et il vaut mieux le dire avant.
  FunnyQuiz.prototype.renderPalier = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var rang = this.rangFamille(q.famille);
    var wrap = el('div', 'quiz-engine funny-palier animate-fade-in');
    wrap.appendChild(el('div', 'funny-palier-emoji', this.emojiFamille(q.famille)));
    wrap.appendChild(el('div', 'funny-palier-rang',
      String(tgd(this.prefix + '.paliersTitre', 'Niveau {{n}}')).replace('{{n}}', rang)));
    wrap.appendChild(el('h2', 'funny-palier-titre',
      esc(tgd(this.prefix + '.theme_' + q.famille, ''))));
    var desc = tgd(this.prefix + '.desc_' + q.famille, '');
    if (desc) wrap.appendChild(el('p', 'funny-palier-desc', esc(desc)));
    var btn = el('button', 'btn btn-cta btn-gradient funny-palier-btn',
      tgd(this.prefix + '.paliersBouton', 'Continuer'));
    btn.type = 'button';
    btn.addEventListener('click', function() { self.phase = 'playing'; self.render(); });
    wrap.appendChild(btn);
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  FunnyQuiz.prototype.renderSetup = function() {
    var self = this;
    // Les six familles annoncees des l'accueil : on sait a quoi s'attendre
    // avant de commencer.
    var familles = el('div', 'funny-familles');
    this.familles.forEach(function(f) {
      var puce = el('span', 'funny-famille');
      puce.innerHTML = '<span class="funny-famille-emoji" aria-hidden="true">' + f.emoji + '</span>' +
        '<span>' + esc(tgd(self.prefix + '.theme_' + f.id, f.id)) + '</span>';
      familles.appendChild(puce);
    });

    var ecran = ecranDepart({
      // le marrant rit, le gênant grimace : chaque page apporte son emoji
      icone: tgd(this.prefix + '.icone', '😂'),
      titre: tgd(this.prefix + '.setupTitre', tg('playerSetup.readyToLaugh', 'Prêts à rire ensemble ?')),
      desc: tgd(this.prefix + '.setupDesc', ''),
      corps: [familles],
      meta: pastilleMeta(this.questions.length,
        tgd(this.prefix + '.questionsMot', tg('meta.questionsWord', 'questions')),
        tgd(this.prefix + '.duree', null)),
      bouton: tgd(this.prefix + '.setupBouton', tg('playerSetup.startQuiz', 'Commencer')),
      onStart: function() { self.currentQ = 0; self.phase = self.ordonne ? 'palier' : 'playing'; self.render(); }
    });
    this.container.appendChild(ecran.wrap);
  };

  FunnyQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, this.currentQ, total);

    var carte = el('div', 'funny-carte funny-carte--' + q.famille);
    var etiquette = el('div', 'funny-carte-etiquette');
    etiquette.innerHTML = '<span aria-hidden="true">' + this.emojiFamille(q.famille) + '</span>' +
      '<span>' + esc(tgd(this.prefix + '.theme_' + q.famille, '')) + '</span>';
    carte.appendChild(etiquette);
    carte.appendChild(el('h3', 'funny-carte-question', esc(q.text)));
    carte.appendChild(el('p', 'funny-carte-consigne',
      esc(tgd(this.prefix + '.consigne', tg('question.discussTogether', 'Discutez de vos réponses ensemble !')))));
    wrap.appendChild(carte);

    var navWrap = el('div', 'funny-nav');
    if (this.currentQ > 0) {
      var backBtn = el('button', 'btn btn-ghost funny-nav-retour');
      backBtn.type = 'button';
      backBtn.innerHTML = '&larr; ' + esc(tgd(this.prefix + '.precedente', tg('question.previousQuestion', 'Précédent')));
      backBtn.addEventListener('click', function() { self.currentQ--; self.render(); });
      navWrap.appendChild(backBtn);
    } else {
      navWrap.appendChild(el('div'));
    }

    var nextBtn = el('button', 'btn btn-cta funny-nav-suivante');
    nextBtn.type = 'button';
    var dernier = this.currentQ === total - 1;
    nextBtn.innerHTML = esc(dernier
      ? tgd(this.prefix + '.derniere', tg('result.seeResults', 'Voir le résultat'))
      : tgd(this.prefix + '.suivante', tg('question.nextQuestionBtn', 'Question suivante'))) + ' &rarr;';
    nextBtn.addEventListener('click', function() {
      if (dernier) { self.phase = 'results'; self.render(); return; }
      var avant = self.questions[self.currentQ].famille;
      self.currentQ++;
      // Changement de famille en mode ordonne : on annonce le palier suivant.
      if (self.ordonne && self.questions[self.currentQ].famille !== avant) self.phase = 'palier';
      self.render();
    });
    navWrap.appendChild(nextBtn);
    wrap.appendChild(navWrap);

    this.container.appendChild(wrap);
  };

  FunnyQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    wrap.appendChild(el('div', 'text-5xl mb-4', '🎉'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-3',
      esc(tgd(this.prefix + '.finTitre', tg('result.bravo', 'Bravo') + ' !'))));
    wrap.appendChild(el('p', 'text-muted-foreground mb-6',
      esc(tgd(this.prefix + '.finTexte', tg('result.sharedMoment', 'Vous avez partagé un super moment ensemble !')))));

    renderActionButtons(wrap, {
      share: { type: 'fun' },
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

    var startBtn = el('button', 'btn btn-cta btn-gradient quiz-setup-start-btn');
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
    wrap.appendChild(el('div', 'quiz-setup-meta', pastilleMeta(this.questions.length)));
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

    // Ce quiz n'offrait que « Autres questions » et « Changer de joueurs » :
    // en retirant le premier, il ne serait plus resté aucune façon de rejouer
    // avec la même équipe. La reprise depuis le début rejoue donc ici aussi,
    // en repartant des mêmes joueurs et en remettant les compteurs à zéro.
    renderActionButtons(wrap, {
      share: { type: 'fun' },
      restart: function() {
        self.currentQ = 0;
        self.designations = {};
        self.phase = 'question';
        self.render();
        smoothScroll(self.container, 'start');
      },
      changePlayers: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // BAREME PONDERE DU TEST COUPLE SAIN
  // Chaque question porte un poids d'importance et une dimension.
  //   w: 3 = fondamental (confiance, securite, avenir, bien-etre ressenti)
  //      2 = structurant (communication, conflits, intimite, autonomie)
  //      1 = confort (repartition des taches, belle-famille, telephone)
  // s: true = question de securite. Une reponse au pire niveau empeche
  //           le verdict le plus haut, quel que soit le total.
  // La contribution d'une reponse vaut poids x valeur de la reponse,
  // ce qui evite qu'un desaccord sur les taches pese autant qu'une
  // absence totale de projets communs.
  // ═══════════════════════════════════════════════════════════
  var REPONSE_VALEURS = { a: 1, b: 0.75, c: 0.4, d: 0 };
  // Pool international : les reponses vont de la moins saine a la plus
  // saine, on lit donc la valeur de la lettre symetrique.
  var REPONSE_MIROIR = { a: 'd', b: 'c', c: 'b', d: 'a' };

  var HEALTHY_BAREME = {
    // Pool francais (prefixe 'couple', 30 questions, a = plus sain)
    couple: {
      1:  { d: 'communication', w: 2 },
      2:  { d: 'confiance',     w: 3 },
      3:  { d: 'complicite',    w: 2 },
      4:  { d: 'conflits',      w: 2 },
      5:  { d: 'soutien',       w: 2 },
      6:  { d: 'intimite',      w: 2 },
      7:  { d: 'complicite',    w: 1 },
      8:  { d: 'avenir',        w: 3 },
      9:  { d: 'autonomie',     w: 2 },
      10: { d: 'communication', w: 2 },
      11: { d: 'equite',        w: 1 },
      12: { d: 'bienetre',      w: 1 },
      13: { d: 'bienetre',      w: 3 },
      14: { d: 'conflits',      w: 2 },
      15: { d: 'communication', w: 2 },
      16: { d: 'avenir',        w: 3 },
      17: { d: 'bienetre',      w: 3 },
      18: { d: 'complicite',    w: 1 },
      19: { d: 'avenir',        w: 3 },
      20: { d: 'bienetre',      w: 2 },
      21: { d: 'equite',        w: 1 },
      22: { d: 'conflits',      w: 2 },
      23: { d: 'complicite',    w: 1 },
      24: { d: 'equite',        w: 1 },
      25: { d: 'equite',        w: 1 },
      26: { d: 'intimite',      w: 2 },
      27: { d: 'autonomie',     w: 1 },
      28: { d: 'complicite',    w: 1 },
      29: { d: 'soutien',       w: 3 },
      30: { d: 'conflits',      w: 2 }
    },
    // Pool international (prefixe 'healthy', 78 questions, d = plus sain)
    healthy: {
      1:  { d: 'communication', w: 2 },
      2:  { d: 'conflits',      w: 2 },
      3:  { d: 'communication', w: 2 },
      4:  { d: 'communication', w: 2 },
      5:  { d: 'conflits',      w: 2 },
      6:  { d: 'avenir',        w: 3 },
      7:  { d: 'complicite',    w: 1 },
      8:  { d: 'respect',       w: 3 },
      9:  { d: 'confiance',     w: 3 },
      10: { d: 'respect',       w: 3 },
      11: { d: 'securite',      w: 3, s: true },
      12: { d: 'respect',       w: 3 },
      13: { d: 'respect',       w: 3 },
      14: { d: 'confiance',     w: 3 },
      15: { d: 'confiance',     w: 2 },
      16: { d: 'communication', w: 2 },
      17: { d: 'autonomie',     w: 2 },
      18: { d: 'autonomie',     w: 2 },
      19: { d: 'autonomie',     w: 1 },
      20: { d: 'autonomie',     w: 3 },
      21: { d: 'autonomie',     w: 2 },
      22: { d: 'autonomie',     w: 3 },
      23: { d: 'autonomie',     w: 1 },
      24: { d: 'bienetre',      w: 3 },
      25: { d: 'intimite',      w: 2 },
      26: { d: 'intimite',      w: 2 },
      27: { d: 'intimite',      w: 2 },
      28: { d: 'intimite',      w: 2 },
      29: { d: 'intimite',      w: 2 },
      30: { d: 'complicite',    w: 1 },
      31: { d: 'soutien',       w: 3 },
      32: { d: 'complicite',    w: 1 },
      33: { d: 'conflits',      w: 2 },
      34: { d: 'conflits',      w: 2 },
      35: { d: 'securite',      w: 3, s: true },
      36: { d: 'conflits',      w: 2 },
      37: { d: 'equite',        w: 2 },
      38: { d: 'conflits',      w: 1 },
      39: { d: 'conflits',      w: 2 },
      40: { d: 'conflits',      w: 2 },
      41: { d: 'avenir',        w: 3 },
      42: { d: 'avenir',        w: 3 },
      43: { d: 'soutien',       w: 2 },
      44: { d: 'avenir',        w: 3 },
      45: { d: 'avenir',        w: 2 },
      46: { d: 'avenir',        w: 3 },
      47: { d: 'avenir',        w: 2 },
      48: { d: 'avenir',        w: 2 },
      49: { d: 'bienetre',      w: 3 },
      50: { d: 'bienetre',      w: 3 },
      51: { d: 'bienetre',      w: 3 },
      52: { d: 'bienetre',      w: 2 },
      53: { d: 'securite',      w: 3, s: true },
      54: { d: 'bienetre',      w: 3 },
      55: { d: 'securite',      w: 3, s: true },
      56: { d: 'bienetre',      w: 3 },
      57: { d: 'equite',        w: 1 },
      58: { d: 'equite',        w: 2 },
      59: { d: 'equite',        w: 1 },
      60: { d: 'equite',        w: 1 },
      61: { d: 'equite',        w: 1 },
      62: { d: 'equite',        w: 2 },
      63: { d: 'equite',        w: 2 },
      64: { d: 'equite',        w: 2 },
      65: { d: 'evolution',     w: 2 },
      66: { d: 'bienetre',      w: 2 },
      67: { d: 'evolution',     w: 2 },
      68: { d: 'evolution',     w: 1 },
      69: { d: 'evolution',     w: 1 },
      70: { d: 'evolution',     w: 1 },
      71: { d: 'evolution',     w: 1 },
      72: { d: 'evolution',     w: 1 },
      73: { d: 'securite',      w: 3, s: true },
      74: { d: 'securite',      w: 3, s: true },
      75: { d: 'confiance',     w: 2 },
      76: { d: 'complicite',    w: 1 },
      77: { d: 'soutien',       w: 2 },
      78: { d: 'bienetre',      w: 3 }
    }
  };

  // Paliers exprimes en pourcentage, contigus et couvrant 0 a 100.
  var HEALTHY_PALIERS = [
    { max: 34 },   // r1 fondations a reconstruire
    { max: 54 },   // r2 merite plus d'attention
    { max: 74 },   // r3 solide avec points d'amelioration
    { max: 100 }   // r4 epanouissante
  ];
  // Une question de securite au pire niveau plafonne le verdict a r3.
  var HEALTHY_PALIER_MAX_ALERTE = 2;

  // Tirage stratifie : couvre toutes les dimensions au lieu de piocher au
  // hasard, pour que deux parties du meme couple mesurent la meme chose.
  function tirageStratifieSain(questions, prefixe, combien) {
    return tirageStratifie(questions, HEALTHY_BAREME[prefixe] || {}, combien);
  }

  // Meme principe pour le test de couple : les 20 questions posees couvrent
  // toutes les dimensions du bareme, pour que deux parties du meme couple
  // mesurent la meme chose.
  function tirageStratifieTester(questions, combien) {
    return tirageStratifie(questions, TESTER_BAREME.testerC || {}, combien);
  }

  function tirageStratifie(questions, table, combien) {
    if (questions.length <= combien) return shuffleArray(questions);

    var securite = [], parDimension = {}, ordre = [];
    for (var i = 0; i < questions.length; i++) {
      var fiche = table[questions[i].id];
      if (fiche && fiche.s) { securite.push(questions[i]); continue; }
      var dim = (fiche && fiche.d) || 'autre';
      if (!parDimension[dim]) { parDimension[dim] = []; ordre.push(dim); }
      parDimension[dim].push(questions[i]);
    }

    var retenues = [];
    // Les questions de securite sont toujours representees, sans dominer.
    if (securite.length) {
      retenues = retenues.concat(shuffleArray(securite).slice(0, Math.min(3, securite.length)));
    }

    var budget = combien - retenues.length;
    if (budget <= 0) return shuffleArray(retenues).slice(0, combien);

    // Un creneau garanti par dimension, puis repartition au prorata du pool.
    var quotas = {}, restant = budget, dispo = 0, d;
    for (var a = 0; a < ordre.length; a++) {
      d = ordre[a];
      quotas[d] = 0;
      dispo += parDimension[d].length;
    }
    for (var b = 0; b < ordre.length && restant > 0; b++) {
      quotas[ordre[b]] = 1; restant--;
    }
    // Le reliquat va aux dimensions les mieux fournies, pour que le tirage
    // reflete le poids reel de chaque theme dans le questionnaire.
    var reste = ordre.slice().sort(function(x, y) {
      return parDimension[y].length - parDimension[x].length;
    });
    while (restant > 0) {
      var avance = false;
      for (var c = 0; c < reste.length && restant > 0; c++) {
        d = reste[c];
        if (quotas[d] < parDimension[d].length) { quotas[d]++; restant--; avance = true; }
      }
      if (!avance) break;
    }

    for (var e = 0; e < ordre.length; e++) {
      d = ordre[e];
      retenues = retenues.concat(shuffleArray(parDimension[d]).slice(0, quotas[d]));
    }
    return shuffleArray(retenues).slice(0, combien);
  }

  // ═══════════════════════════════════════════════════════════
  // HEALTHY QUIZ - couple-sain
  // Deux modes : SOLO (le couple repond ensemble, score unique) et
  // DUO (chacun repond aux memes questions a tour de role, scores
  // individuels + moyenne).
  // Score pondere : chaque reponse vaut poids de la question x valeur
  // de la reponse, rapporte au total des poids reellement poses.
  // ═══════════════════════════════════════════════════════════
  function HealthyQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.results = config.results;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    // Les questions 'couple' (FR) sont ecrites a = le plus sain. Les questions
    // natives 'healthy' (non-FR) sont ecrites dans l'autre sens : leurs valeurs
    // de reponse doivent donc etre inversees.
    this.reverseScore = config.reverseScore || false;
    this.bareme = HEALTHY_BAREME[this.prefix] || {};
    this.mode = null;           // 'solo' ou 'duo'
    this.phase = 'mode';
    this.players = [null, null];
    this.currentQ = 0;
    this.currentPlayer = 0;
    this.reponses = [[], []];   // en solo, seul l'indice 0 sert
    this.render();
  }

  // Valeur d'une reponse, dans le bon sens selon le pool de questions.
  // On permute les lettres et non la valeur : faire 1 - v renverserait bien
  // l'ordre mais deformerait la courbe, et noterait les langues non
  // francaises plus severement que le francais a reponses equivalentes.
  HealthyQuiz.prototype.valeurReponse = function(lettre) {
    var cle = this.reverseScore ? (REPONSE_MIROIR[lettre] || lettre) : lettre;
    var v = REPONSE_VALEURS[cle];
    return (typeof v === 'number') ? v : 0;
  };

  HealthyQuiz.prototype.poidsDe = function(question) {
    var fiche = this.bareme[question.id];
    return (fiche && fiche.w) || 1;
  };

  HealthyQuiz.prototype.estSecurite = function(question) {
    var fiche = this.bareme[question.id];
    return !!(fiche && fiche.s);
  };

  // Pourcentage pondere d'un jeu de reponses, plus le drapeau d'alerte.
  HealthyQuiz.prototype.calculer = function(reponses) {
    var poidsTotal = 0, obtenu = 0, alerte = false;
    for (var i = 0; i < reponses.length; i++) {
      var r = reponses[i];
      poidsTotal += r.poids;
      obtenu += r.poids * r.valeur;
      if (r.securite && r.valeur === 0) alerte = true;
    }
    return {
      pct: poidsTotal > 0 ? Math.round((obtenu / poidsTotal) * 100) : 0,
      alerte: alerte
    };
  };

  // Palier correspondant a un pourcentage, plafonne si alerte securite.
  HealthyQuiz.prototype.palierPour = function(pct, alerte) {
    if (!this.results || !this.results.length) return null;
    var idx = HEALTHY_PALIERS.length - 1;
    for (var i = 0; i < HEALTHY_PALIERS.length; i++) {
      if (pct <= HEALTHY_PALIERS[i].max) { idx = i; break; }
    }
    if (alerte && idx > HEALTHY_PALIER_MAX_ALERTE) idx = HEALTHY_PALIER_MAX_ALERTE;
    if (idx >= this.results.length) idx = this.results.length - 1;
    return this.results[idx];
  };

  HealthyQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'mode') this.renderMode();
    else if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'handoff') this.renderHandoff();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  // ── Choix du mode ─────────────────────────────────────────
  HealthyQuiz.prototype.renderMode = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-setup-screen animate-fade-in');

    var iconWrap = el('div', 'quiz-setup-icon mx-auto mb-6');
    iconWrap.innerHTML = ICONS.users;
    wrap.appendChild(iconWrap);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-3 text-center',
      tg('sainMode.titre', 'Comment voulez-vous passer le test ?')));
    wrap.appendChild(el('p', 'text-muted-foreground mb-8 text-center',
      tg('sainMode.sousTitre', 'Choisissez votre formule, le questionnaire est le même dans les deux cas.')));

    var modes = [
      {
        id: 'solo',
        nom: tg('sainMode.soloNom', 'SOLO'),
        desc: tg('sainMode.soloDesc', 'Vous répondez à deux aux questions'),
        score: tg('sainMode.soloScore', 'Score unique')
      },
      {
        id: 'duo',
        nom: tg('sainMode.duoNom', 'DUO'),
        desc: tg('sainMode.duoDesc', 'Vous répondez aux mêmes questions à tour de rôle'),
        score: tg('sainMode.duoScore', 'Scores individuels + moyenne')
      }
    ];

    var liste = el('div', 'choix-modes');
    modes.forEach(function(m) {
      var carte = el('button', 'choix-mode choix-mode--' + m.id);
      carte.type = 'button';
      carte.setAttribute('aria-label', m.nom + ' : ' + m.desc + '. ' + m.score);
      carte.innerHTML =
        '<span class="choix-mode-nom">' + esc(m.nom) + '</span>' +
        '<span class="choix-mode-desc">' + esc(m.desc) + '</span>' +
        '<span class="choix-mode-score">' + esc(m.score) + '</span>';
      carte.addEventListener('click', function() {
        self.mode = m.id;
        self.currentQ = 0;
        self.currentPlayer = 0;
        self.reponses = [[], []];
        if (m.id === 'solo') {
          self.players = [null, null];
          self.phase = 'playing';
        } else {
          self.phase = 'setup';
        }
        self.render();
      });
      liste.appendChild(carte);
    });
    wrap.appendChild(liste);
    wrap.appendChild(el('div', 'quiz-setup-meta', pastilleMeta(this.questions.length)));
    this.container.appendChild(wrap);
  };

  // ── Prénoms et genres (mode DUO uniquement) ───────────────
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
      self.currentQ = 0; self.currentPlayer = 0; self.reponses = [[], []];
      self.phase = 'handoff'; self.render();
    });

    wrap.appendChild(form);
    wrap.appendChild(el('div', 'quiz-setup-meta', pastilleMeta(this.questions.length)));
    wrap.appendChild(startBtn);

    var retour = el('button', 'quiz-modes-retour', '← ' + tg('sainMode.retour', 'Changer de mode'));
    retour.type = 'button';
    retour.addEventListener('click', function() { self.phase = 'mode'; self.render(); });
    wrap.appendChild(retour);

    this.container.appendChild(wrap);
  };

  HealthyQuiz.prototype.renderHandoff = function() {
    var self = this;
    var player = this.players[this.currentPlayer];
    var color = getPlayerColor(player, this.players[this.currentPlayer === 0 ? 1 : 0], this.currentPlayer);

    this.container.appendChild(relaisJoueur(this, {
      nom: player.name,
      couleur: color.bg,
      etape: tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + this.questions.length,
      suite: function() { self.phase = 'playing'; self.render(); }
    }));
  };

  HealthyQuiz.prototype.renderQuestion = function() {
    var self = this;
    var solo = this.mode === 'solo';
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var totalAnswers = solo ? total : total * 2;
    var answeredCount = solo ? this.reponses[0].length : (this.reponses[0].length + this.reponses[1].length);

    var wrap = el('div', 'quiz-engine quiz-question-enter');
    renderProgressBar(wrap, answeredCount, totalAnswers, tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + total);

    if (solo) {
      var badgeSolo = el('div', 'text-center mb-4');
      badgeSolo.innerHTML = '<span class="badge sain-badge-solo">' + esc(tg('sainMode.soloBadge', 'Votre réponse commune')) + '</span>';
      wrap.appendChild(badgeSolo);
    } else {
      var player = this.players[this.currentPlayer];
      var color = getPlayerColor(player, this.players[this.currentPlayer === 0 ? 1 : 0], this.currentPlayer);
      var badge = el('div', 'text-center mb-4');
      badge.innerHTML = '<span class="badge" style="background:' + color.bg + ';color:' + color.text + '">' + esc(player.name) + '</span>';
      wrap.appendChild(badge);
    }

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
        self.reponses[solo ? 0 : self.currentPlayer].push({
          poids: self.poidsDe(q),
          valeur: self.valeurReponse(opt.id),
          securite: self.estSecurite(q)
        });

        setTimeout(function() {
          if (solo) {
            if (self.currentQ < total - 1) { self.currentQ++; self.phase = 'playing'; }
            else { self.phase = 'results'; }
          } else if (self.currentPlayer === 0) {
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
    var solo = this.mode === 'solo';
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');

    var bilan1 = this.calculer(this.reponses[0]);
    var bilan2 = solo ? null : this.calculer(this.reponses[1]);
    var pct = solo ? bilan1.pct : Math.round((bilan1.pct + bilan2.pct) / 2);
    var alerte = solo ? bilan1.alerte : (bilan1.alerte || bilan2.alerte);

    wrap.appendChild(el('h2', 'text-2xl font-bold mb-2',
      solo ? tg('result.coupleScore', 'Score de votre couple')
           : tg('result.coupleAverage', 'Moyenne de votre couple')));
    var mainRingDiv = el('div', '');
    mainRingDiv.innerHTML = renderScoreRing(pct);
    wrap.appendChild(mainRingDiv);

    if (!solo) {
      var scoresGrid = el('div', 'grid grid-cols-2 gap-4 mb-6');
      for (var i = 0; i < 2; i++) {
        var bilan = i === 0 ? bilan1 : bilan2;
        var color = getPlayerColor(this.players[i], this.players[i === 0 ? 1 : 0], i);
        var card = el('div', 'glass-card rounded-xl p-4 text-center');
        card.innerHTML = '<p class="font-semibold mb-2" style="color:' + color.bg + '">' + esc(this.players[i].name) + '</p>' +
          renderScoreRing(bilan.pct, 'sm');
        scoresGrid.appendChild(card);
      }
      wrap.appendChild(scoresGrid);

      // Ecart significatif entre les deux perceptions
      if (Math.abs(bilan1.pct - bilan2.pct) > 15) {
        var gapAlert = el('div', 'glass-card rounded-xl p-4 mb-4 border-l-4 border-orange-400');
        gapAlert.innerHTML = '<p class="text-sm">' + esc(tg('healthy.gapWarning', '⚠️ L\'écart entre vos scores est significatif. Prenez le temps de discuter de vos perceptions respectives.')) + '</p>';
        wrap.appendChild(gapAlert);
      }
    }

    var result = this.palierPour(pct, alerte);
    if (result) {
      wrap.appendChild(el('h3', 'text-xl font-bold mb-3', esc(result.title)));
      wrap.appendChild(el('p', 'text-muted-foreground leading-relaxed max-w-lg mx-auto mb-4', result.description));
      if (result.advice) {
        var adviceEl = el('div', 'text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4 text-left max-w-lg mx-auto');
        adviceEl.innerHTML = '<strong class="block mb-2">' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(result.advice);
        wrap.appendChild(adviceEl);
      }
    }

    if (alerte) {
      var noteSecu = el('div', 'glass-card rounded-xl p-4 mt-4 border-l-4 border-rose-400 text-left max-w-lg mx-auto');
      noteSecu.innerHTML = '<p class="text-sm">' + esc(tg('healthy.securiteNote', 'Une de vos réponses porte sur la peur, la manipulation ou l\'humiliation. Ce point compte davantage que le reste du score : il mérite d\'être regardé de près, seul·e ou accompagné·e.')) + '</p>';
      wrap.appendChild(noteSecu);
    }

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: pct, verdict: result ? result.title : '' },
      restart: function() {
        self.phase = 'mode'; self.mode = null;
        self.currentQ = 0; self.currentPlayer = 0;
        self.reponses = [[], []];
        self.render();
      }
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
    wrap.appendChild(el('div', 'quiz-setup-meta',
      '📝 ' + this.questions.length + ' ' + esc(tg('meta.questionsWord', 'questions')) + ' &bull; ⏱ ' +
      esc(tg('meta.duration', '10 min')) + ' &bull; ' + esc(tg('parentalite.scoreOn60', 'Score sur 60 par personne'))));

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

    var startBtn = el('button', 'btn btn-cta btn-gradient quiz-setup-start-btn', tg('playerSetup.startTest', 'Commencer le test'));
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
    var colors = ['#ec4899', '#3b82f6'];

    this.container.appendChild(relaisJoueur(this, {
      nom: player.name,
      couleur: colors[this.currentPlayer],
      etape: tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + this.questions.length,
      suite: function() { self.phase = 'playing'; self.render(); }
    }));
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
    // Ce quiz avait son propre habillage d'introduction, un troisieme apres
    // celui des tests et celui des jeux. Il reprend l'ecran commun ; son
    // encadre « comment ca marche » reste, c'est lui qui pose la regle.
    var comment = el('div', 'quiz-setup-note');
    comment.innerHTML = '<p class="quiz-setup-note-intro">' + esc(tg('truefalse.howTitle', 'Comment ça marche ?')) + '</p>' +
      '<p class="quiz-setup-note-fin">' + esc(tg('truefalse.howDesc', 'Pour chaque affirmation, choisissez Vrai ou Faux. La bonne réponse et une explication s\'affichent après chaque question.')) + '</p>';

    var ecran = ecranDepart({
      icone: '✅',
      titre: tg('truefalse.ready', 'Prêt pour le vrai ou faux ?'),
      corps: [comment],
      meta: pastilleMeta(this.questions.length, tg('truefalse.statements', 'affirmations')),
      bouton: tg('playerSetup.startQuiz', 'Commencer le quiz'),
      onStart: function() {
        self.phase = 'playing';
        self.currentQ = 0;
        self.score = 0;
        self.answers = [];
        self.render();
      }
    });
    this.container.appendChild(ecran.wrap);
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
    badge.innerHTML = '<span class="quiz-verdict quiz-verdict--' + (isCorrect ? 'juste' : 'faux') + '">' +
      (isCorrect
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>') +
      esc(isCorrect ? tg('truefalse.correct', 'Bonne réponse !') : tg('truefalse.wrong', 'Mauvaise réponse')) + '</span>';
    wrap.appendChild(badge);

    // Statement
    var qText = tgd(this.prefix + '.q' + q.id, q.text);
    var qEl = el('h3', 'text-lg font-semibold mb-4 text-center', esc(qText));
    wrap.appendChild(qEl);

    // Les deux boutons rejoues, marques : on retrouve le sien et le bon au
    // meme endroit qu'au moment du choix, plutot qu'une ligne de texte.
    var rappel = el('div', 'grid grid-cols-2 gap-4 max-w-md mx-auto mb-5');
    ['true', 'false'].forEach(function(valeur) {
      var etat = valeur === correctAnswer ? ' quiz-tf-btn--bonne'
        : (valeur === lastAnswer.userAnswer ? ' quiz-tf-btn--mauvaise' : ' quiz-tf-btn--eteint');
      var b = el('div', 'quiz-tf-btn quiz-tf-btn--' + (valeur === 'true' ? 'true' : 'false') + etat);
      b.innerHTML = '<span class="quiz-tf-icon">' + (valeur === 'true' ? '✓' : '✗') + '</span>' +
        '<span class="quiz-tf-label">' + esc(valeur === 'true' ? tg('truefalse.true', 'Vrai') : tg('truefalse.false', 'Faux')) + '</span>' +
        (valeur === lastAnswer.userAnswer ? '<span class="quiz-tf-vous">' + esc(tg('truefalse.yourAnswer', 'votre réponse')) + '</span>' : '');
      rappel.appendChild(b);
    });
    wrap.appendChild(rappel);

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

  // Quel axe marque cette réponse. La plupart des typologies rattachent une
  // lettre à un axe une fois pour toutes. Certaines font tourner ce sens d'une
  // question à l'autre, pour qu'on ne puisse pas répondre « toujours a » sans
  // lire : celles-là fournissent une fonction plutôt qu'une table figée.
  ProfileQuiz.prototype.axePour = function(optId, questionId) {
    return typeof this.categoryMap === 'function'
      ? this.categoryMap(optId, questionId)
      : this.categoryMap[optId];
  };

  ProfileQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'intro') this.renderIntro();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  ProfileQuiz.prototype.renderIntro = function() {
    var self = this;
    var ecran = ecranDepart({
      icone: this.labels.icon || '🔗',
      titre: this.introTitle,
      meta: pastilleMeta(this.questions.length),
      bouton: tg('playerSetup.startTest', 'Commencer le test'),
      onStart: function() {
        self.phase = 'playing'; self.currentQ = 0; self.answers = [];
        self.tally = self.tallyVierge();
        self.render();
      }
    });
    this.container.appendChild(ecran.wrap);
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
        var cat = self.axePour(opt.id, q.id);
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

  // Le profil obtenu part en base, sans rien de nominatif ni aucune réponse :
  // c'est ce qui permet aux pages d'annoncer une répartition réelle plutôt
  // qu'un chiffre repris d'une étude américaine. Silencieux par nature : si la
  // table n'existe pas encore, la page se contente de masquer ses statistiques.
  ProfileQuiz.prototype.enregistreProfil = function(profil) {
    var bloc = document.getElementById('pq-reviews');
    var slug = bloc ? bloc.dataset.quizSlug : null;
    if (!slug || !profil) return;
    // Une seule fois par test et par navigateur : sinon, refaire le test pour
    // comparer deux réponses gonflerait la répartition d'un même profil.
    var cle = 'qc-profil-' + slug;
    try { if (localStorage.getItem(cle)) return; localStorage.setItem(cle, profil); } catch (e) {}
    fetch(SUPABASE_URL + '/rest/v1/profil_resultats', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json', 'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ quiz_slug: slug, profil: profil, lang: this.lang })
    }).catch(function () {});
  };

  ProfileQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var key = this.classify();
    var profile = this.profiles[key] || {};
    this.enregistreProfil(key);
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
  // PILIERS QUIZ - ame soeur
  // Un test a points, mais dont le verdict ne sort pas d'une tranche de
  // score : il sort de la FORME du profil. Un lien peut marquer tres haut
  // sur l'evidence et l'accord, et ne pas etre une ame soeur pour autant
  // si l'un des deux a disparu en chemin. C'est ce que la classification
  // regarde, et c'est ce qui distingue ce moteur des tests solo.
  //
  // L'indice affiche est la moyenne des piliers, le plus faible compte
  // double : une ame soeur ne se juge pas a son meilleur cote. Sans cette
  // regle, un profil fusionnel affichait 85 % au-dessus d'un verdict qui
  // disait le contraire.
  //
  // Deux modes : seul, sur un prenom saisi, ou a deux, chacun repondant
  // aux memes questions sur l'autre.
  // ═══════════════════════════════════════════════════════════
  function PiliersQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;
    this.prefix = config.prefix;
    this.lang = config.lang || 'fr';
    this.piliers = config.piliers || [];
    this.fiches = config.fiches || {};
    this.classe = config.classify;
    this.verdicts = config.verdicts || {};
    this.verdictsCouple = config.verdictsCouple || {};
    this.duo = !!config.duo;
    this.labels = config.labels || {};
    this.phase = 'setup';
    this.joueurs = ['', ''];
    this.courant = 0;
    this.currentQ = 0;
    this.reponses = [[], []];
    this.render();
  }

  // Le prenom de l'autre, cote joueur qui repond. En solo il n'y a qu'un
  // prenom saisi ; en duo, chacun repond sur son partenaire.
  PiliersQuiz.prototype.autre = function(i) {
    var j = (i === undefined) ? this.courant : i;
    return this.duo ? this.joueurs[1 - j] : this.joueurs[0];
  };

  // Les enonces, les reponses ET les verdicts portent le prenom. Le moteur
  // solo ne le remplacait que dans l'enonce, ce qui laissait « {{name}} »
  // a l'ecran des que la reponse en contenait un.
  PiliersQuiz.prototype.prenom = function(t, i) {
    var nom = this.autre(i);
    return nom ? String(t || '').replace(/\{\{name\}\}/g, nom) : String(t || '');
  };

  PiliersQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'relais') this.renderRelais();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  PiliersQuiz.prototype.renderSetup = function() {
    var self = this;
    var corps = [], champs = [];
    var etiquettes = this.duo
      ? [tg('playerSetup.player1', 'Joueur 1'), tg('playerSetup.player2', 'Joueur 2')]
      : [tg('ui.yourName', 'Prénom de votre partenaire')];

    for (var i = 0; i < etiquettes.length; i++) {
      (function(idx) {
        var bloc = el('div', 'quiz-setup-nom');
        var lab = el('label', 'quiz-setup-nom-label', etiquettes[idx]);
        var champ = el('input', 'input');
        champ.type = 'text';
        champ.placeholder = tg('playerSetup.firstName', 'Prénom');
        champ.maxLength = 30;
        champ.id = 'piliers-nom-' + idx;
        lab.setAttribute('for', champ.id);
        bloc.appendChild(lab);
        bloc.appendChild(champ);
        corps.push(bloc);
        champs.push(champ);
      })(i);
    }

    var ecran = ecranDepart({
      icone: this.labels.icon || '💫',
      titre: this.labels.introTitle || tg('playerSetup.readyForTest', 'Prêt pour le test ?'),
      corps: corps,
      meta: pastilleMeta(this.questions.length),
      bouton: tg('playerSetup.startTest', 'Commencer le test'),
      onStart: function() {
        for (var k = 0; k < champs.length; k++) {
          var v = champs[k].value.trim();
          if (!v) { champs[k].classList.add('input--erreur'); champs[k].focus(); return; }
          self.joueurs[k] = v;
        }
        self.currentQ = 0;
        self.courant = 0;
        self.reponses = [[], []];
        self.phase = self.duo ? 'relais' : 'playing';
        self.render();
      }
    });
    this.container.appendChild(ecran.wrap);
  };

  PiliersQuiz.prototype.renderRelais = function() {
    var self = this;
    this.container.appendChild(relaisJoueur(this, {
      nom: this.joueurs[this.courant],
      emoji: '💫',
      note: tg('question.passPhoneOrLookAway', 'Passez le téléphone ou détournez le regard'),
      suite: function() { self.phase = 'playing'; self.render(); }
    }));
  };

  PiliersQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var wrap = el('div', 'quiz-engine quiz-question-enter');

    renderProgressBar(wrap, this.currentQ, total);
    if (this.duo) renderPlayerBadge(wrap, this.joueurs[this.courant], this.courant === 0 ? 'badge-pink' : 'badge-blue');

    var texte = this.prenom(tgd(this.prefix + '.q' + q.id, q.text));
    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center', esc(texte)));

    var liste = el('div', 'space-y-2');
    var lettres = ['A', 'B', 'C', 'D', 'E'];
    q.options.forEach(function(opt, idx) {
      var libelle = self.prenom(tgd(self.prefix + '.q' + q.id + opt.id, opt.text));
      var bouton = el('button', 'quiz-option');
      bouton.innerHTML = '<span class="quiz-option-letter">' + (lettres[idx] || '') + '</span><span>' + esc(libelle) + '</span>';
      bouton.style.animationDelay = (idx * 60) + 'ms';
      bouton.addEventListener('click', function() {
        if (!answerLock(self)) return;
        bouton.classList.add('selected');
        var voisins = liste.querySelectorAll('.quiz-option');
        for (var s = 0; s < voisins.length; s++) {
          if (voisins[s] !== bouton) voisins[s].style.opacity = '0.5';
          voisins[s].style.pointerEvents = 'none';
        }
        self.reponses[self.courant].push({ id: q.id, points: opt.points || 0 });
        setTimeout(function() { self.avance(); }, 300);
      });
      liste.appendChild(bouton);
    });
    wrap.appendChild(liste);
    this.container.appendChild(wrap);
  };

  PiliersQuiz.prototype.avance = function() {
    if (this.currentQ < this.questions.length - 1) {
      this.currentQ++;
      this.render();
      return;
    }
    if (this.duo && this.courant === 0) {
      this.courant = 1;
      this.currentQ = 0;
      this.phase = 'relais';
      this.render();
      return;
    }
    this.phase = 'results';
    this.render();
  };

  // Pourcentage par pilier, puis indice global. Le maximum se recalcule a
  // partir des points reellement poses, donc le bareme peut changer sans
  // qu'aucun seuil ne soit a reecrire.
  PiliersQuiz.prototype.profil = function(joueur) {
    var obtenu = {}, maxi = {}, i, p;
    for (i = 0; i < this.piliers.length; i++) { obtenu[this.piliers[i].id] = 0; maxi[this.piliers[i].id] = 0; }
    var parId = {};
    for (i = 0; i < this.questions.length; i++) parId[this.questions[i].id] = this.questions[i];
    var reponses = this.reponses[joueur] || [];
    for (i = 0; i < reponses.length; i++) {
      var q = parId[reponses[i].id];
      if (!q) continue;
      var fiche = this.fiches[q.id];
      var pilier = fiche && fiche.d;
      if (!pilier || obtenu[pilier] === undefined) continue;
      var meilleur = 0;
      for (var o = 0; o < q.options.length; o++) if ((q.options[o].points || 0) > meilleur) meilleur = q.options[o].points;
      obtenu[pilier] += reponses[i].points;
      maxi[pilier] += meilleur;
    }
    var pct = {}, mini = null, somme = 0, nb = 0;
    for (i = 0; i < this.piliers.length; i++) {
      p = this.piliers[i].id;
      pct[p] = maxi[p] ? Math.round(obtenu[p] / maxi[p] * 100) : 0;
      somme += pct[p]; nb++;
      if (mini === null || pct[p] < mini) mini = pct[p];
    }
    var indice = nb ? Math.round((somme + (mini || 0)) / (nb + 1)) : 0;
    return { pct: pct, indice: Math.max(0, Math.min(100, indice)) };
  };

  PiliersQuiz.prototype.barres = function(pct, compact) {
    var self = this;
    var bloc = el('div', 'profile-breakdown' + (compact ? ' profile-breakdown--compact' : ' max-w-md mx-auto mb-6'));
    this.piliers.forEach(function(pi) {
      var v = pct[pi.id] || 0;
      var ligne = el('div', 'profile-axis-row');
      ligne.innerHTML =
        '<div class="profile-axis-head"><span>' + esc(pi.label || pi.id) + '</span>' +
        '<span class="profile-axis-pct">' + v + '%</span></div>' +
        '<div class="profile-axis-bar"><div class="profile-axis-fill" data-w="' + v + '" style="width:0%;background:' + pi.color + '"></div></div>';
      bloc.appendChild(ligne);
    });
    setTimeout(function() {
      var f = self.container.querySelectorAll('.profile-axis-fill');
      for (var i = 0; i < f.length; i++) f[i].style.width = f[i].getAttribute('data-w') + '%';
    }, 120);
    return bloc;
  };

  PiliersQuiz.prototype.verdictDe = function(joueur) {
    var r = this.profil(joueur);
    var cle = this.classe ? this.classe(r.pct, r.indice) : '';
    var v = this.verdicts[cle] || {};
    return {
      cle: cle, indice: r.indice, pct: r.pct,
      titre: this.prenom(v.title, joueur),
      texte: this.prenom(v.description, joueur),
      conseil: this.prenom(v.advice, joueur)
    };
  };

  PiliersQuiz.prototype.renderResults = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-result-card');

    if (!this.duo) {
      var r = this.verdictDe(0);
      var haut = el('div', 'text-center');
      haut.appendChild(el('p', 'text-sm text-muted-foreground mb-1', this.labels.resultLabel || ''));
      var anneau = el('div', '');
      anneau.innerHTML = renderScoreRing(r.indice);
      haut.appendChild(anneau);
      haut.appendChild(el('h2', 'text-2xl font-bold mt-3 mb-5 quiz-reveal-enter', esc(r.titre)));
      wrap.appendChild(haut);
      wrap.appendChild(this.barres(r.pct));
      if (r.texte) wrap.appendChild(el('p', 'text-muted-foreground leading-relaxed mb-4 max-w-lg mx-auto text-center quiz-reveal-enter', r.texte));
      if (r.conseil) {
        var enc = el('div', 'text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4 text-left max-w-lg mx-auto quiz-reveal-enter');
        enc.innerHTML = '<strong class="block mb-2">' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + esc(r.conseil);
        wrap.appendChild(enc);
      }
      renderActionButtons(wrap, {
        share: { type: 'profil', verdict: r.titre },
        restart: function() { self.phase = 'setup'; self.render(); }
      });
      this.container.appendChild(wrap);
      smoothScroll(wrap, 'center');
      return;
    }

    wrap.appendChild(el('h2', 'text-2xl font-bold text-center mb-6', tg('result.quizResults', 'Résultats du quiz')));
    var grille = el('div', 'grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6');
    var res = [this.verdictDe(0), this.verdictDe(1)];
    for (var i = 0; i < 2; i++) {
      var carte = el('div', 'glass-card rounded-xl p-4 text-center');
      carte.appendChild(el('p', 'font-semibold mb-2', esc(this.joueurs[i])));
      var bague = el('div', '');
      bague.innerHTML = renderScoreRing(res[i].indice, 'sm');
      carte.appendChild(bague);
      carte.appendChild(el('p', 'font-bold mt-2 mb-3', esc(res[i].titre)));
      carte.appendChild(this.barres(res[i].pct, true));
      if (res[i].texte) carte.appendChild(el('p', 'text-sm text-muted-foreground text-left mt-3', res[i].texte));
      grille.appendChild(carte);
    }
    wrap.appendChild(grille);

    var ecart = Math.abs(res[0].indice - res[1].indice);
    var moyenne = Math.round((res[0].indice + res[1].indice) / 2);
    var cleCouple = ecart >= 20 ? 'ecart' : (moyenne >= 70 ? 'h' : (moyenne >= 45 ? 'm' : 'l'));
    var texteCouple = this.verdictsCouple[cleCouple];
    if (texteCouple) {
      var boite = el('div', 'glass-card rounded-xl p-5 text-center mb-4');
      boite.appendChild(el('h3', 'font-bold mb-2', tg('result.coupleVerdict', 'Verdict du couple')));
      boite.appendChild(el('p', 'text-muted-foreground', texteCouple));
      wrap.appendChild(boite);
    }

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: moyenne },
      restart: function() { self.phase = 'setup'; self.render(); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // CHARGE MENTALE
  // Les autres moteurs a deux joueurs mesurent l'accord : DuoMatchQuiz
  // compte les reponses identiques. Ici l'accord n'est que la moitie du
  // sujet. Une repartition peut etre tres desequilibree et parfaitement
  // vue des deux cotes, ou tres desequilibree et vue par une seule
  // personne. Ce sont deux situations differentes, et c'est la seconde
  // qui fait le sujet de la page.
  //
  // On mesure donc deux choses :
  //   - la repartition, sur un axe a cinq crans de -2 (toujours le
  //     joueur 1) a +2 (toujours le joueur 2) ;
  //   - l'ecart de perception, la distance entre les deux reponses
  //     donnees a la meme tache.
  // En solo il n'y a qu'une serie : on ne rend que la repartition, et on
  // le dit, plutot que d'inventer un ecart qui n'existe pas.
  // ═══════════════════════════════════════════════════════════
  function ChargeMentaleQuiz(config) {
    this.container = config.container;
    this.questions = config.questions;      // [{ id, dom }]
    this.prefix = config.prefix || 'chargeMentale';
    this.lang = config.lang || 'fr';
    this.duo = !!config.duo;
    this.domaines = config.domaines || [];  // [{ id, cle, color }]
    this.verdicts = config.verdicts || {};
    this.labels = config.labels || {};
    this.phase = 'setup';
    this.joueurs = ['', ''];
    this.courant = 0;
    this.currentQ = 0;
    this.reponses = [[], []];
    this.render();
  }

  ChargeMentaleQuiz.CRANS = [-2, -1, 0, 1, 2];

  ChargeMentaleQuiz.prototype.txt = function(cle, repli) {
    return tgd(this.prefix + '.' + cle, repli);
  };

  // Les cinq reponses portent les prenoms saisis, elles ne peuvent donc pas
  // etre ecrites en dur dans gd.json. En solo la personne parle d'elle et de
  // son partenaire, en duo on nomme les deux joueurs.
  ChargeMentaleQuiz.prototype.options = function() {
    var a = this.joueurs[0], b = this.joueurs[1];
    var self = this;
    function rendre(cle, repli, nomA, nomB) {
      return String(self.txt(cle, repli))
        .replace(/\{\{a\}\}/g, nomA || '')
        .replace(/\{\{b\}\}/g, nomB || '');
    }
    if (!this.duo) {
      return [
        rendre('optToujoursMoi', 'Toujours moi'),
        rendre('optPlutotMoi', 'Plutôt moi'),
        rendre('optDeux', 'À deux, équitablement'),
        rendre('optPlutotAutre', 'Plutôt {{a}}', a),
        rendre('optToujoursAutre', 'Toujours {{a}}', a)
      ];
    }
    return [
      rendre('optToujoursA', 'Toujours {{a}}', a),
      rendre('optPlutotA', 'Plutôt {{a}}', a),
      rendre('optDeux', 'À deux, équitablement'),
      rendre('optPlutotB', 'Plutôt {{b}}', a, b),
      rendre('optToujoursB', 'Toujours {{b}}', a, b)
    ];
  };

  ChargeMentaleQuiz.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'relais') this.renderRelais();
    else if (this.phase === 'playing') this.renderQuestion();
    else if (this.phase === 'results') this.renderResults();
  };

  ChargeMentaleQuiz.prototype.renderSetup = function() {
    var self = this;
    var corps = [], champs = [];
    var etiquettes = this.duo
      ? [tg('playerSetup.player1', 'Joueur 1'), tg('playerSetup.player2', 'Joueur 2')]
      : [this.txt('nomPartenaire', 'Prénom de votre partenaire')];

    for (var i = 0; i < etiquettes.length; i++) {
      (function(idx) {
        var bloc = el('div', 'quiz-setup-nom');
        var champ = el('input', 'input');
        champ.type = 'text';
        champ.placeholder = tg('playerSetup.firstName', 'Prénom');
        champ.maxLength = 30;
        champ.id = 'cm-nom-' + idx;
        var lab = el('label', 'quiz-setup-nom-label', etiquettes[idx]);
        lab.setAttribute('for', champ.id);
        bloc.appendChild(lab);
        bloc.appendChild(champ);
        corps.push(bloc);
        champs.push(champ);
      })(i);
    }

    var ecran = ecranDepart({
      icone: '🧠',
      titre: this.labels.introTitle || tg('playerSetup.readyForTest', 'Prêt pour le test ?'),
      corps: corps,
      meta: pastilleMeta(this.questions.length),
      bouton: tg('playerSetup.startTest', 'Commencer le test'),
      onStart: function() {
        for (var k = 0; k < champs.length; k++) {
          var v = champs[k].value.trim();
          if (!v) { champs[k].classList.add('input--erreur'); champs[k].focus(); return; }
          self.joueurs[k] = v;
        }
        // En solo le second prenom sert d'etiquette a l'autre bout de l'axe.
        if (!self.duo) { self.joueurs[1] = self.joueurs[0]; self.joueurs[0] = ''; }
        self.currentQ = 0;
        self.courant = 0;
        self.reponses = [[], []];
        self.phase = self.duo ? 'relais' : 'playing';
        self.render();
      }
    });
    this.container.appendChild(ecran.wrap);
  };

  ChargeMentaleQuiz.prototype.renderRelais = function() {
    var self = this;
    this.container.appendChild(relaisJoueur(this, {
      nom: this.joueurs[this.courant],
      emoji: '🧠',
      note: tg('question.passPhoneOrLookAway', 'Passez le téléphone ou détournez le regard'),
      suite: function() { self.phase = 'playing'; self.render(); }
    }));
  };

  ChargeMentaleQuiz.prototype.renderQuestion = function() {
    var self = this;
    var q = this.questions[this.currentQ];
    var total = this.questions.length;
    var wrap = el('div', 'quiz-engine quiz-question-enter');

    // En duo chacun repond aux vingt taches : la barre compte quarante pas.
    var faits = this.duo ? (this.courant * total + this.currentQ) : this.currentQ;
    renderProgressBar(wrap, faits, this.duo ? total * 2 : total,
      tg('question.question', 'Question') + ' ' + (this.currentQ + 1) + '/' + total);
    if (this.duo) renderPlayerBadge(wrap, this.joueurs[this.courant], this.courant === 0 ? 'badge-pink' : 'badge-blue');

    wrap.appendChild(el('h3', 'text-xl font-semibold mb-6 text-center',
      esc(this.txt('q' + q.id, ''))));

    var liste = el('div', 'space-y-2');
    var lettres = ['A', 'B', 'C', 'D', 'E'];
    this.options().forEach(function(libelle, idx) {
      var bouton = el('button', 'quiz-option');
      bouton.innerHTML = '<span class="quiz-option-letter">' + lettres[idx] + '</span><span>' + esc(libelle) + '</span>';
      bouton.style.animationDelay = (idx * 60) + 'ms';
      bouton.addEventListener('click', function() {
        self.reponses[self.courant][self.currentQ] = ChargeMentaleQuiz.CRANS[idx];
        self.avance();
      });
      liste.appendChild(bouton);
    });
    wrap.appendChild(liste);
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'start');
  };

  ChargeMentaleQuiz.prototype.avance = function() {
    if (this.currentQ < this.questions.length - 1) { this.currentQ++; this.render(); return; }
    if (this.duo && this.courant === 0) {
      this.courant = 1; this.currentQ = 0; this.phase = 'relais'; this.render(); return;
    }
    this.phase = 'results';
    this.render();
  };

  // ── Le calcul ────────────────────────────────────────────────────────
  // moyenne : position sur l'axe -2..+2, negative si le joueur 1 porte.
  // partA   : part de la charge portee par le joueur 1, en pourcentage.
  // ecart   : nombre de taches sur lesquelles les deux ne sont pas d'accord,
  //           et distance moyenne entre leurs reponses.
  ChargeMentaleQuiz.prototype.calcul = function() {
    var n = this.questions.length, self = this;
    var series = this.duo ? [this.reponses[0], this.reponses[1]] : [this.reponses[0]];
    var somme = 0, compte = 0;
    series.forEach(function(s) {
      for (var i = 0; i < n; i++) { somme += (s[i] || 0); compte++; }
    });
    var moyenne = compte ? somme / compte : 0;
    // -2 => le joueur 1 porte tout (100 %), +2 => il n'en porte rien (0 %).
    var partA = Math.round((1 - (moyenne + 2) / 4) * 100);

    var desaccords = 0, distance = 0, parTache = [];
    if (this.duo) {
      for (var i = 0; i < n; i++) {
        var d = Math.abs((this.reponses[0][i] || 0) - (this.reponses[1][i] || 0));
        if (d > 0) desaccords++;
        distance += d;
        parTache.push({ id: this.questions[i].id, d: d });
      }
      parTache.sort(function(x, y) { return y.d - x.d; });
    }

    // Repartition par domaine, pour les barres de l'ecran de resultat.
    var domaines = this.domaines.map(function(dom) {
      var s = 0, c = 0;
      self.questions.forEach(function(q, i) {
        if (q.dom !== dom.id) return;
        series.forEach(function(serie) { s += (serie[i] || 0); c++; });
      });
      var m = c ? s / c : 0;
      return { id: dom.id, cle: dom.cle, color: dom.color,
               pct: Math.round((1 - (m + 2) / 4) * 100) };
    });

    return {
      partA: partA, partB: 100 - partA,
      desaccords: desaccords,
      // 0 = ils voient exactement la meme chose, 100 = ils sont a l'oppose.
      indiceEcart: this.duo ? Math.round((distance / (n * 4)) * 100) : null,
      top: parTache.slice(0, 3).filter(function(t) { return t.d > 0; }),
      domaines: domaines
    };
  };

  // Le verdict croise les deux mesures : une repartition desequilibree ne
  // dit pas la meme chose selon qu'elle est vue par les deux ou par une
  // seule personne.
  ChargeMentaleQuiz.prototype.cleVerdict = function(r) {
    var desequilibre = Math.abs(r.partA - 50) >= 15;
    if (!this.duo) return desequilibre ? 'soloDesequilibre' : 'soloEquilibre';
    var divergent = r.indiceEcart >= 20;
    if (!desequilibre && !divergent) return 'equipe';
    if (!desequilibre && divergent) return 'flou';
    if (desequilibre && !divergent) return 'assume';
    return 'invisible';
  };

  ChargeMentaleQuiz.prototype.renderResults = function() {
    var self = this;
    var r = this.calcul();
    var cle = this.cleVerdict(r);
    var v = this.verdicts[cle] || {};
    var nomA = this.duo ? this.joueurs[0] : this.txt('vous', 'Vous');
    var nomB = this.joueurs[1];
    function prenoms(t) {
      return String(t || '').replace(/\{\{a\}\}/g, nomA).replace(/\{\{b\}\}/g, nomB);
    }

    var wrap = el('div', 'quiz-engine quiz-result-card');
    var porteur = r.partA >= r.partB ? nomA : nomB;
    var partPorteur = Math.max(r.partA, r.partB);

    var hero = el('div', 'duo-result-hero duo-result-hero--' + (Math.abs(r.partA - 50) >= 15 ? 'low' : 'high'));
    hero.appendChild(el('div', 'duo-result-emoji', Math.abs(r.partA - 50) >= 15 ? '⚖️' : '🤝'));
    var ring = el('div', 'duo-result-ring');
    ring.innerHTML = renderScoreRing(partPorteur, null, false);
    hero.appendChild(ring);
    hero.appendChild(el('div', 'duo-result-match',
      prenoms(this.txt('portePart', '{{p}} porte {{n}} % de la charge'))
        .replace('{{p}}', porteur).replace('{{n}}', partPorteur)));
    if (v.title) hero.appendChild(el('h3', 'duo-result-title', esc(prenoms(v.title))));
    if (v.description) hero.appendChild(el('p', 'duo-result-desc', prenoms(v.description)));
    wrap.appendChild(hero);

    // La repartition, en une barre a deux couleurs.
    var barre = el('div', 'cm-repartition');
    barre.innerHTML =
      '<div class="cm-repartition-legende"><span>' + esc(nomA) + ' ' + r.partA + '%</span>' +
      '<span>' + esc(nomB) + ' ' + r.partB + '%</span></div>' +
      '<div class="cm-repartition-barre"><div class="cm-repartition-a" style="width:' + r.partA + '%"></div>' +
      '<div class="cm-repartition-b" style="width:' + r.partB + '%"></div></div>';
    wrap.appendChild(barre);

    // Une barre par domaine : la charge n'est presque jamais desequilibree
    // partout de la meme facon, et c'est utile de voir ou elle penche.
    var bloc = el('div', 'profile-breakdown max-w-md mx-auto mb-6');
    r.domaines.forEach(function(dom) {
      var ligne = el('div', 'profile-axis-row');
      ligne.innerHTML =
        '<div class="profile-axis-head"><span>' + esc(self.txt(dom.cle, dom.cle)) + '</span>' +
        '<span class="profile-axis-pct">' + dom.pct + '%</span></div>' +
        '<div class="profile-axis-bar"><div class="profile-axis-fill" data-w="' + dom.pct + '" style="width:0%;background:' + dom.color + '"></div></div>';
      bloc.appendChild(ligne);
    });
    wrap.appendChild(bloc);
    setTimeout(function() {
      var f = self.container.querySelectorAll('.profile-axis-fill');
      for (var i = 0; i < f.length; i++) f[i].style.width = f[i].getAttribute('data-w') + '%';
    }, 120);

    // Le coeur utile du test : les trois taches sur lesquelles les deux ne
    // sont pas d'accord. C'est ce dont il faut parler, et rien d'autre.
    if (this.duo && r.top.length) {
      var dis = el('div', 'cm-desaccords');
      dis.appendChild(el('h4', 'cm-desaccords-titre',
        this.txt('desaccordsTitre', 'Vos trois plus gros désaccords')));
      dis.appendChild(el('p', 'cm-desaccords-intro',
        this.txt('desaccordsIntro', '') .replace('{{n}}', r.desaccords)));
      var ul = el('ul', 'cm-desaccords-liste');
      r.top.forEach(function(t) {
        ul.appendChild(el('li', '', self.txt('q' + t.id, '')));
      });
      dis.appendChild(ul);
      wrap.appendChild(dis);
    }

    if (v.advice) {
      var conseil = el('div', 'duo-result-advice');
      conseil.innerHTML = '<strong>' + esc(tg('result.ourAdvice', 'Notre conseil')) + '</strong>' + prenoms(v.advice);
      wrap.appendChild(conseil);
    }

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: partPorteur, verdict: v.title ? prenoms(v.title) : '' },
      restart: function() { self.phase = 'setup'; self.render(); }
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
    return injecterPrenom(t, targetName);
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
      + '<p class="zamours-tagline">Le jeu culte de l’émission, version couple : en ligne, gratuit et sans inscription.</p>';

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
      + '<span class="zamours-recap-ans">' + esc(gOpt ? this.optText(q, gOpt) : '-') + '</span></div>'
      + '<div class="zamours-recap-row"><span class="zamours-recap-who zamours--p' + (round.target + 1) + '">' + esc(target.name) + ' a répondu</span>'
      + '<span class="zamours-recap-ans is-real">' + esc(aOpt ? this.optText(q, aOpt) : '-') + '</span></div>';
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

    renderActionButtons(wrap, {
      share: { type: 'duo', points: true, score: this.score },
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
  //  TentationQuiz - "Survivrez-vous à l'île de la tentation ?"
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

    renderActionButtons(wrap, {
      share: { type: 'solo', pct: resistance },
      restart: function () { self.phase = 'setup'; self.render(); smoothScroll(self.container, 'start'); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // PARTY GAME - action ou verite a deux
  // On saisit les deux prenoms, puis a chaque tour le joueur designe choisit
  // lui-meme entre verite et action : c'est le principe du jeu, il ne subit
  // pas le tirage. Les cartes viennent d'un paquet unique par page (les deux
  // series de la page sont fusionnees) et ne se repetent pas tant que le
  // paquet n'est pas vide. Refuser fait tomber un gage. La partie s'arrete
  // quand les joueurs le decident.
  // ═══════════════════════════════════════════════════════════
  function PartyGame(config) {
    this.container = config.container;
    this.prefix = config.prefix || 'jeu';
    this.lang = config.lang || 'fr';
    this.series = config.series || [];
    this.phase = 'setup';
    this.noms = ['', ''];
    this.piocheQ = [];
    this.piocheD = [];
    this.gages = [];
    this.carte = null;
    this.tour = 0;
    this.releves = 0;
    this.passes = 0;
    this.render();
  }

  // Lit toutes les cartes d'un type, toutes series confondues :
  // jeu.classique_q1, jeu.marrant_q1...
  PartyGame.prototype.cartes = function(type) {
    var out = [];
    for (var s = 0; s < this.series.length; s++) {
      for (var i = 1; i <= 60; i++) {
        var cle = this.prefix + '.' + this.series[s] + '_' + type + i;
        var t = tgd(cle, null);
        if (!t || t === cle) { if (i > 3) break; else continue; }
        out.push({ type: type, texte: t });
      }
    }
    return out;
  };

  PartyGame.prototype.joueur = function() {
    return this.noms[this.tour % 2] || tg('playerSetup.player' + (this.tour % 2 + 1), 'Joueur ' + (this.tour % 2 + 1));
  };

  PartyGame.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'choix') this.renderChoix();
    else if (this.phase === 'carte') this.renderCarte();
    else this.renderRecap();
  };

  PartyGame.prototype.renderSetup = function() {
    var self = this;
    var grille = cartesDeuxJoueurs('party-nom');
    var ecran = ecranDepart({
      icone: '🎲',
      titre: tg('jeu.setupTitre', 'Qui joue ce soir ?'),
      desc: tg('jeu.setupDesc', 'Entrez vos deux prénoms : le jeu annonce à qui c\'est le tour.'),
      corps: [grille],
      meta: pastilleMeta(this.cartes('q').length + this.cartes('d').length + this.cartes('g').length,
        tg('jeu.cartesMot', 'cartes')),
      bouton: tg('jeu.commencer', 'Commencer la partie'),
      onStart: function() {
        self.noms = [
          grille.querySelector('#party-nom1').value.trim() || tg('playerSetup.player1', 'Joueur 1'),
          grille.querySelector('#party-nom2').value.trim() || tg('playerSetup.player2', 'Joueur 2')
        ];
        self.piocheQ = shuffleArray(self.cartes('q'));
        self.piocheD = shuffleArray(self.cartes('d'));
        self.gages = self.cartes('g');
        if (!self.piocheQ.length && !self.piocheD.length) return;
        self.tour = 0; self.releves = 0; self.passes = 0;
        self.phase = 'choix';
        self.render();
        smoothScroll(self.container, 'start');
      }
    });
    this.container.appendChild(ecran.wrap);
  };

  PartyGame.prototype.annonce = function() {
    var nom = this.joueur();
    var voyelle = /^[aeiouyàâäéèêëîïôöùûüh]/i.test(nom);
    var prefixe = voyelle ? tg('jeu.tourDeVoyelle', tg('jeu.tourDe', 'Au tour de')) : tg('jeu.tourDe', 'Au tour de');
    return /['\u2019]$/.test(prefixe) ? prefixe + nom : prefixe + ' ' + nom;
  };

  PartyGame.prototype.entete = function(wrap) {
    var self = this;
    var entete = el('div', 'party-entete');
    entete.innerHTML = badgeDeTour(this.joueur(), this.annonce(), this.tour) +
      '<button class="party-changer" type="button">' + esc(tg('jeu.arreter', 'Terminer la partie')) + '</button>';
    wrap.appendChild(entete);
    entete.querySelector('.party-changer').addEventListener('click', function() {
      self.phase = 'recap'; self.render();
    });
  };

  // Le joueur choisit lui-meme verite ou action.
  PartyGame.prototype.renderChoix = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine quiz-question-enter');
    this.entete(wrap);

    var demande = el('p', 'party-demande', tg('jeu.demande', 'Vérité ou action ?'));
    wrap.appendChild(demande);

    var choix = el('div', 'party-choix');
    [
      { type: 'q', emoji: '💬', cle: 'question' },
      { type: 'd', emoji: '🎯', cle: 'defi' }
    ].forEach(function(o) {
      var reste = o.type === 'q' ? self.piocheQ.length : self.piocheD.length;
      var b = el('button', 'party-choix-btn party-choix-btn--' + o.cle);
      b.type = 'button';
      b.innerHTML = '<span class="party-choix-emoji">' + o.emoji + '</span>' +
        '<span class="party-choix-nom">' + esc(tg('jeu.type_' + o.cle, o.cle)) + '</span>';
      if (!reste) b.disabled = true;
      b.addEventListener('click', function() { self.piocher(o.type); });
      choix.appendChild(b);
    });
    wrap.appendChild(choix);
    wrap.appendChild(el('p', 'party-compteur', (this.releves + this.passes) + ' ' + tg('jeu.cartes', 'cartes jouées')));
    this.container.appendChild(wrap);
  };

  PartyGame.prototype.piocher = function(type) {
    var pioche = type === 'q' ? this.piocheQ : this.piocheD;
    if (!pioche.length) {
      // paquet epuise : on le remelange pour que la partie ne bloque jamais
      if (type === 'q') { this.piocheQ = shuffleArray(this.cartes('q')); pioche = this.piocheQ; }
      else { this.piocheD = shuffleArray(this.cartes('d')); pioche = this.piocheD; }
    }
    this.carte = pioche.pop();
    if (!this.carte) return;
    this.phase = 'carte';
    this.render();
  };

  PartyGame.prototype.renderCarte = function() {
    var self = this;
    var c = this.carte;
    var wrap = el('div', 'quiz-engine quiz-question-enter');
    this.entete(wrap);

    var badge = c.type === 'q' ? { e: '💬', k: 'question' } : c.type === 'd' ? { e: '🎯', k: 'defi' } : { e: '😈', k: 'gage' };
    var carte = el('div', 'party-carte party-carte--' + badge.k);
    carte.innerHTML = '<span class="party-carte-type">' + badge.e + ' ' +
      esc(tg('jeu.type_' + badge.k, badge.k)) + '</span>' +
      '<p class="party-carte-texte">' + esc(c.texte) + '</p>';
    wrap.appendChild(carte);

    var actions = el('div', 'party-actions');
    if (c.type === 'g') {
      var fini = el('button', 'btn btn-cta btn-lg', tg('jeu.gageFait', 'Gage accompli !'));
      fini.addEventListener('click', function() { self.tourSuivant(); });
      actions.appendChild(fini);
    } else {
      var fait = el('button', 'btn btn-cta btn-lg', tg('jeu.fait', 'C\'est fait !'));
      fait.addEventListener('click', function() { self.releves++; self.tourSuivant(); });
      var passe = el('button', 'btn btn-outline btn-lg', tg('jeu.passe', 'Je passe'));
      passe.addEventListener('click', function() {
        self.passes++;
        if (!self.gages.length) { self.tourSuivant(); return; }
        self.carte = shuffleArray(self.gages.slice())[0];
        self.render();
      });
      actions.appendChild(fait);
      actions.appendChild(passe);
    }
    wrap.appendChild(actions);
    wrap.appendChild(el('p', 'party-compteur', (this.releves + this.passes) + ' ' + tg('jeu.cartes', 'cartes jouées')));
    this.container.appendChild(wrap);
  };

  PartyGame.prototype.tourSuivant = function() {
    this.tour++;
    this.phase = 'choix';
    this.render();
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
    rejouer.addEventListener('click', function() {
      self.piocheQ = shuffleArray(self.cartes('q'));
      self.piocheD = shuffleArray(self.cartes('d'));
      self.tour = 0; self.releves = 0; self.passes = 0;
      self.phase = 'choix'; self.render(); smoothScroll(self.container, 'start');
    });
    wrap.appendChild(rejouer);

    // Ce moteur sert aussi la version tout public d'action ou vérité, qui ne
    // doit surtout pas porter cet encart. Seul le préfixe hot le déclenche.
    if (this.prefix === 'actionVeriteHot') blocPartenaire(wrap, 'coquin', this.lang);

    renderActionButtons(wrap, {
      share: { type: 'cartes', score: this.releves, total: total },
      restart: function() { self.phase = 'setup'; self.render(); smoothScroll(self.container, 'start'); }
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
      // Libelles radiaux : ils partent du moyeu vers la jante. Sur la moitie
      // gauche de la roue, le secteur est tourne de plus de 180 degres et le
      // texte se retrouverait la tete en bas : on le retourne alors de 180 de
      // plus et on ancre par la fin, pour qu'il coure toujours vers la jante
      // tout en restant lisible.
      var yEmoji = cy - r * 0.82, yLabel = cy - r * 0.22;
      var retourne = mid > 180;
      s += '<g transform="rotate(' + mid.toFixed(2) + ' ' + cx + ' ' + cy + ')">' +
        '<text x="' + cx + '" y="' + yLabel.toFixed(2) + '" class="roue-label"' +
        ' text-anchor="' + (retourne ? 'end' : 'start') + '"' +
        ' transform="rotate(' + (retourne ? 90 : -90) + ' ' + cx + ' ' + yLabel.toFixed(2) + ')">' +
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
    // La roue n'a pas de fin : le premier gage tire vaut partie jouee. On le
    // marque ici plutot qu'avec .quiz-result-card, dont le style ne convient
    // pas a un panneau qui se rejoue a chaque tour.
    if (this.gage) wrap.setAttribute('data-quiz-done', '1');

    var scene = el('div', 'roue-scene');
    scene.innerHTML = '<span class="roue-fleche" aria-hidden="true"></span>' +
      '<div class="roue-plateau">' + this.svg() + '</div>';
    wrap.appendChild(scene);

    // Un secteur est une famille, pas un gage : sans cette ligne on compte huit
    // secteurs et on croit que la roue ne contient que huit gages.
    var reelles = this.secteurs.filter(function(s) { return !s.joker; });
    var parFamille = reelles.length ? this.lireFamille(reelles[0].id).length : 0;
    if (parFamille > 1) {
      wrap.appendChild(el('p', 'roue-legende', esc(
        tg('roue.legende', 'Chaque secteur est une famille de {{parFamille}} gages : {{familles}} familles plus une case surprise, soit {{total}} gages en tout.')
          .replace('{{parFamille}}', parFamille)
          .replace('{{familles}}', reelles.length)
          .replace('{{total}}', reelles.length * parFamille))));
    }

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

  // ═══════════════════════════════════════════════════════════
  // BOARD GAME - le plateau du couple
  // Le seul de nos jeux qui se gagne : deux pions, un de, quarante cases et
  // une arrivee. Chaque case declenche une epreuve (verite, defi, gage,
  // souvenir, duel) ou un evenement qui deplace les pions. Les cartes et les
  // gages viennent des paquets deja ecrits pour les autres jeux, le plateau
  // n'apporte que ses souvenirs, ses duels et ses cases chance.
  // ═══════════════════════════════════════════════════════════
  var PLATEAU_CASES = [
    'depart',   'verite', 'defi',     'souvenir', 'duel',
    'chance',   'verite', 'defi',     'gage',     'souvenir',
    'duel',     'verite', 'defi',     'chance',   'souvenir',
    'verite',   'duel',   'defi',     'gage',     'verite',
    'souvenir', 'defi',   'chance',   'verite',   'duel',
    'defi',     'souvenir', 'verite', 'gage',     'chance',
    'defi',     'duel',   'verite',   'souvenir', 'defi',
    'verite',   'gage',   'duel',     'souvenir', 'arrivee'
  ];
  var PLATEAU_EMOJIS = {
    depart: '🚩', arrivee: '🏁', verite: '💬', defi: '🎯',
    gage: '😈', souvenir: '💭', duel: '⚔️', chance: '🍀'
  };
  // Chaque evenement de la case chance a son effet et son texte.
  var PLATEAU_CHANCES = [
    { id: 'avance3', pas: 3 },
    { id: 'avance2', pas: 2 },
    { id: 'recule2', pas: -2 },
    { id: 'recule1', pas: -1 },
    { id: 'rejoue', pas: 0, rejoue: true },
    { id: 'echange', pas: 0, echange: true }
  ];

  function BoardGame(config) {
    this.container = config.container;
    this.prefix = config.prefix || 'plateau';
    this.prefixCartes = config.prefixCartes || 'actionVerite';
    this.prefixGages = config.prefixGages || 'gageRoue';
    this.lang = config.lang || 'fr';
    this.cases = PLATEAU_CASES;
    this.phase = 'setup';
    this.noms = ['', ''];
    this.pos = [0, 0];
    this.tour = 0;
    this.tours = 0;
    this.de = null;
    this.epreuve = null;
    this.gagnant = null;
    this.piles = {};
    this.render();
  }

  // Lit une serie numerotee sous un prefixe : plateau.souvenir1, souvenir2...
  BoardGame.prototype.lire = function(prefixe, cle) {
    var out = [];
    for (var i = 1; i <= 60; i++) {
      var k = prefixe + '.' + cle + i;
      var t = tgd(k, null);
      if (!t || t === k) { if (i > 2) break; else continue; }
      out.push(t);
    }
    return out;
  };

  // Les cartes verite et defi viennent des deux series du jeu de cartes.
  BoardGame.prototype.lireCartes = function(type) {
    var out = [];
    var series = ['classique', 'marrant'];
    for (var s = 0; s < series.length; s++) {
      out = out.concat(this.lire(this.prefixCartes, series[s] + '_' + type));
    }
    return out;
  };

  BoardGame.prototype.piocher = function(type) {
    if (!this.piles[type] || !this.piles[type].length) {
      var source;
      if (type === 'verite') source = this.lireCartes('q');
      else if (type === 'defi') source = this.lireCartes('d');
      else if (type === 'gage') source = this.lireGages();
      else source = this.lire(this.prefix, type);
      this.piles[type] = shuffleArray(source);
    }
    return this.piles[type].pop() || null;
  };

  BoardGame.prototype.lireGages = function() {
    var familles = ['bisou', 'massage', 'show', 'aveu', 'grimace', 'photo', 'douceur'];
    var out = [];
    for (var i = 0; i < familles.length; i++) out = out.concat(this.lire(this.prefixGages, familles[i]));
    return out;
  };

  BoardGame.prototype.joueur = function(i) {
    var n = typeof i === 'number' ? i : this.tour;
    return this.noms[n] || tg('playerSetup.player' + (n + 1), 'Joueur ' + (n + 1));
  };

  BoardGame.prototype.annonce = function() {
    var nom = this.joueur();
    var voyelle = /^[aeiouyàâäéèêëîïôöùûüh]/i.test(nom);
    var prefixe = voyelle ? tg('jeu.tourDeVoyelle', tg('jeu.tourDe', 'Au tour de')) : tg('jeu.tourDe', 'Au tour de');
    return /['’]$/.test(prefixe) ? prefixe + nom : prefixe + ' ' + nom;
  };

  BoardGame.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'fin') this.renderFin();
    else this.renderPlateau();
  };

  BoardGame.prototype.renderSetup = function() {
    var self = this;
    var grille = cartesDeuxJoueurs('plateau-nom');
    var ecran = ecranDepart({
      icone: '🎲',
      titre: tg('plateau.setupTitre', 'Qui prend le départ ?'),
      desc: tg('plateau.setupDesc', 'Entrez vos prénoms : quarante cases vous séparent de l\'arrivée.'),
      corps: [grille],
      meta: pastilleMeta(this.cases.length, tg('plateau.casesMot', 'cases')),
      bouton: tg('plateau.commencer', 'Prendre le départ'),
      onStart: function() {
        self.noms = [
          grille.querySelector('#plateau-nom1').value.trim() || tg('playerSetup.player1', 'Joueur 1'),
          grille.querySelector('#plateau-nom2').value.trim() || tg('playerSetup.player2', 'Joueur 2')
        ];
        self.pos = [0, 0]; self.tour = 0; self.tours = 0;
        self.piles = {}; self.de = null; self.epreuve = null; self.gagnant = null;
        self.phase = 'jeu';
        self.render();
        smoothScroll(self.container, 'start');
      }
    });
    this.container.appendChild(ecran.wrap);
  };

  BoardGame.prototype.renderPlateau = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine plateau-jeu');

    // barre de tour
    var entete = el('div', 'party-entete');
    // Le plateau se redessine a chaque tour : le libelle du bouton doit
    // repartir de l'etat reel du bloc, sinon il annonce « voir » alors que
    // les regles sont deja ouvertes.
    var blocRegles = document.getElementById('plateau-regles');
    var reglesOuvertes = !!blocRegles && !blocRegles.hasAttribute('hidden');
    entete.innerHTML = badgeDeTour(this.joueur(), this.annonce(), this.tour) +
      '<span class="party-entete-actions">' +
      (blocRegles ? '<button class="party-changer party-regles-btn" type="button" aria-expanded="' + (reglesOuvertes ? 'true' : 'false') +
        '" aria-controls="plateau-regles">' +
        esc(reglesOuvertes ? tg('plateau.reglesFermer', 'Masquer les règles') : tg('plateau.regles', 'Voir les règles')) + '</button>' : '') +
      '<button class="party-changer party-arreter-btn" type="button">' + esc(tg('plateau.abandonner', 'Arrêter la partie')) + '</button>' +
      '</span>';
    wrap.appendChild(entete);

    // plateau : cinq colonnes sur mobile, huit sur ecran large, sinon le
    // serpentin devient une colonne interminable a faire defiler.
    var cols = this.colonnes = window.innerWidth >= 640 ? 8 : 5;
    var scene = el('div', 'plateau-scene');
    var grille = el('div', 'plateau-grille');
    grille.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    this.cases.forEach(function(type, i) {
      var ligne = Math.floor(i / cols);
      var col = ligne % 2 === 0 ? (i % cols) + 1 : cols - (i % cols);
      var c = el('div', 'plateau-case plateau-case--' + type);
      c.style.gridRow = String(ligne + 1);
      c.style.gridColumn = String(col);
      c.innerHTML = '<span class="plateau-case-emoji" aria-hidden="true">' + PLATEAU_EMOJIS[type] + '</span>' +
        '<span class="plateau-case-num">' + (i + 1) + '</span>';
      grille.appendChild(c);
    });
    scene.appendChild(grille);
    [0, 1].forEach(function(j) {
      // Le pion de celui qui joue est cercle : c'est le second rappel du tour,
      // celui qu'on lit sur le plateau sans remonter a l'entete.
      var pion = el('span', 'plateau-pion plateau-pion--' + (j + 1) + (j === self.tour ? ' plateau-pion--actif' : ''));
      pion.textContent = (self.noms[j] || '?').charAt(0).toUpperCase();
      pion.title = self.joueur(j);
      scene.appendChild(pion);
    });
    wrap.appendChild(scene);

    // legende
    var legende = el('ul', 'plateau-legende');
    ['verite', 'defi', 'duel', 'souvenir', 'gage', 'chance'].forEach(function(t) {
      var li = el('li', 'plateau-legende-item');
      li.innerHTML = '<span aria-hidden="true">' + PLATEAU_EMOJIS[t] + '</span> ' + esc(tgd(self.prefix + '.type_' + t, t));
      legende.appendChild(li);
    });
    wrap.appendChild(legende);

    if (this.phase === 'jeu') {
      var zone = el('div', 'plateau-action');
      var deAff = el('div', 'plateau-de', this.de ? String(this.de) : '?');
      zone.appendChild(deAff);
      var lancer = el('button', 'btn btn-cta btn-lg', tg('plateau.lancerDe', 'Lancer le dé'));
      lancer.type = 'button';
      lancer.addEventListener('click', function() { self.lancerDe(lancer, deAff); });
      zone.appendChild(lancer);
      wrap.appendChild(zone);
    } else {
      wrap.appendChild(this.carteEpreuve());
    }

    wrap.appendChild(el('p', 'party-compteur', tg('plateau.compteur', '{{n}} tours joués').replace('{{n}}', this.tours)));
    this.container.appendChild(wrap);

    var regles = wrap.querySelector('.party-regles-btn');
    if (regles) regles.addEventListener('click', function() { self.basculerRegles(regles); });
    var arret = wrap.querySelector('.party-arreter-btn');
    if (arret) arret.addEventListener('click', function() { self.phase = 'setup'; self.render(); });
    this.placerPions(true);
    this.suivreRedimensionnement();
  };

  // Les regles sont deja ecrites et traduites dans la page : le bouton
  // devoile ce bloc au lieu d'en dupliquer une version dans le moteur.
  BoardGame.prototype.basculerRegles = function(bouton) {
    var bloc = document.getElementById('plateau-regles');
    if (!bloc) return;
    var ouvert = !bloc.hasAttribute('hidden');
    if (ouvert) { bloc.setAttribute('hidden', ''); }
    else { bloc.removeAttribute('hidden'); smoothScroll(bloc, 'start'); }
    bouton.textContent = ouvert ? tg('plateau.regles', 'Voir les règles')
                                : tg('plateau.reglesFermer', 'Masquer les règles');
    bouton.setAttribute('aria-expanded', ouvert ? 'false' : 'true');
  };

  // Les pions sont positionnes en pixels : il faut les replacer quand la
  // largeur change, et refaire le plateau si le nombre de colonnes bascule.
  BoardGame.prototype.suivreRedimensionnement = function() {
    var self = this;
    if (this._resize) return;
    this._resize = function() {
      if (self.phase === 'setup' || self.phase === 'fin') return;
      var cols = window.innerWidth >= 640 ? 8 : 5;
      if (cols !== self.colonnes) self.render(); else self.placerPions();
    };
    window.addEventListener('resize', this._resize);
  };

  // immediat : place sans animer. Un pion vient d'etre recree par un rendu,
  // il doit apparaitre a sa place et non y glisser depuis le coin du plateau.
  BoardGame.prototype.placerPions = function(immediat) {
    var self = this;
    var grille = this.container.querySelector('.plateau-grille');
    if (!grille) return;
    // Deux pions sur la meme case se cotoient sans se recouvrir ; un pion seul
    // reste centre, sinon il parait toujours decale par rapport a sa case.
    var ensemble = this.pos[0] === this.pos[1];
    [0, 1].forEach(function(j) {
      var pion = self.container.querySelector('.plateau-pion--' + (j + 1));
      var c = grille.children[Math.min(self.pos[j], self.cases.length - 1)];
      if (!pion || !c) return;
      var ecart = ensemble ? (j === 0 ? -14 : 14) : 0;
      var dx = c.offsetLeft + c.offsetWidth / 2 - 13 + ecart;
      var dy = c.offsetTop + c.offsetHeight / 2 - 13;
      if (immediat) pion.style.transition = 'none';
      pion.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      if (immediat) { void pion.offsetWidth; pion.style.transition = ''; }
    });
  };

  // Le pion doit finir de bouger tant que c'est encore le tour de celui qui
  // joue. Le bonus d'une epreuve etait applique en meme temps que le passage
  // de main : on voyait donc son pion arriver sur l'ecran du joueur suivant.
  BoardGame.prototype.deplacerPuis = function(bouge, suite) {
    if (!bouge) return suite();
    this.placerPions();
    var doux = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(suite, doux ? 60 : 620);
  };

  // Pendant ce deplacement la carte reste a l'ecran : sans cela, un deuxieme
  // clic sur « relevé » relancerait la resolution une fois le verrou expire.
  BoardGame.prototype.figerActions = function() {
    var b = this.container.querySelectorAll('.party-actions button');
    for (var i = 0; i < b.length; i++) b[i].disabled = true;
  };

  // Un clic resolu verrouille brievement le plateau : sans cela un double-clic
  // valide deux fois la meme carte, ou relance le de a la place du joueur
  // suivant puisque le bouton reapparait au meme endroit.
  BoardGame.prototype.verrouille = function() {
    if (this._verrou) return true;
    var self = this;
    this._verrou = true;
    setTimeout(function() { self._verrou = false; }, 400);
    return false;
  };

  BoardGame.prototype.lancerDe = function(bouton, deAff) {
    var self = this;
    bouton.disabled = true;
    var doux = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var valeur = 1 + Math.floor(Math.random() * 6);
    var tours = doux ? 0 : 8, n = 0;
    deAff.classList.add('plateau-de--roule');
    var timer = setInterval(function() {
      n++;
      deAff.textContent = String(1 + Math.floor(Math.random() * 6));
      if (n >= tours) {
        clearInterval(timer);
        deAff.textContent = String(valeur);
        deAff.classList.remove('plateau-de--roule');
        self.de = valeur;
        self.avancer(valeur);
      }
    }, doux ? 1 : 70);
  };

  BoardGame.prototype.avancer = function(pas) {
    var self = this;
    var j = this.tour;
    this.pos[j] = Math.max(0, Math.min(this.cases.length - 1, this.pos[j] + pas));
    this.placerPions();
    var doux = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(function() {
      if (self.pos[j] >= self.cases.length - 1) { self.gagnant = j; self.phase = 'fin'; self.render(); return; }
      self.ouvrirCase();
    }, doux ? 60 : 620);
  };

  BoardGame.prototype.ouvrirCase = function() {
    var type = this.cases[this.pos[this.tour]];
    if (type === 'chance') {
      var ev = PLATEAU_CHANCES[Math.floor(Math.random() * PLATEAU_CHANCES.length)];
      this.epreuve = { type: 'chance', evenement: ev, texte: tgd(this.prefix + '.chance_' + ev.id, '') };
    } else {
      this.epreuve = { type: type, texte: this.piocher(type) };
    }
    this.phase = 'epreuve';
    this.render();
  };

  BoardGame.prototype.carteEpreuve = function() {
    var self = this;
    var e = this.epreuve;
    var bloc = el('div', 'plateau-epreuve');
    var carte = el('div', 'party-carte party-carte--' + (e.type === 'defi' ? 'defi' : e.type === 'gage' ? 'gage' : 'question'));
    carte.innerHTML = '<span class="party-carte-type">' + PLATEAU_EMOJIS[e.type] + ' ' +
      esc(tgd(this.prefix + '.type_' + e.type, e.type)) + '</span>' +
      '<p class="party-carte-texte">' + esc(e.texte || '') + '</p>';
    bloc.appendChild(carte);

    var actions = el('div', 'party-actions');
    if (e.type === 'chance') {
      var ok = el('button', 'btn btn-cta btn-lg', tg('plateau.ok', 'Compris !'));
      ok.addEventListener('click', function() { self.appliquerChance(e.evenement); });
      actions.appendChild(ok);
    } else if (e.type === 'duel') {
      var accord = el('button', 'btn btn-cta btn-lg', tg('plateau.dAccord', 'On est d\'accord'));
      accord.addEventListener('click', function() { self.finTour(2); });
      var desaccord = el('button', 'btn btn-outline btn-lg', tg('plateau.pasDAccord', 'Pas d\'accord'));
      desaccord.addEventListener('click', function() { self.finTour(0); });
      actions.appendChild(accord);
      actions.appendChild(desaccord);
    } else if (e.type === 'gage') {
      var fini = el('button', 'btn btn-cta btn-lg', tg('jeu.gageFait', 'Gage accompli !'));
      fini.addEventListener('click', function() { self.finTour(0); });
      actions.appendChild(fini);
    } else {
      var fait = el('button', 'btn btn-cta btn-lg', tg('plateau.releve', 'Relevé, j\'avance'));
      fait.addEventListener('click', function() { self.finTour(1); });
      var passe = el('button', 'btn btn-outline btn-lg', tg('plateau.refuse', 'Je passe, je recule'));
      passe.addEventListener('click', function() { self.finTour(-1); });
      actions.appendChild(fait);
      actions.appendChild(passe);
    }
    bloc.appendChild(actions);
    return bloc;
  };

  BoardGame.prototype.appliquerChance = function(ev) {
    if (this.verrouille()) return;
    var self = this;
    var j = this.tour;
    var avant = [this.pos[0], this.pos[1]];
    if (ev.echange) { var t = this.pos[0]; this.pos[0] = this.pos[1]; this.pos[1] = t; }
    else if (ev.pas) this.pos[j] = Math.max(0, Math.min(this.cases.length - 1, this.pos[j] + ev.pas));
    this.tours++;
    this.figerActions();
    this.deplacerPuis(this.pos[0] !== avant[0] || this.pos[1] !== avant[1], function() {
      if (self.pos[j] >= self.cases.length - 1) { self.gagnant = j; self.phase = 'fin'; self.render(); return; }
      if (self.pos[1 - j] >= self.cases.length - 1) { self.gagnant = 1 - j; self.phase = 'fin'; self.render(); return; }
      if (!ev.rejoue) self.tour = 1 - self.tour;
      self.de = null;
      self.phase = 'jeu';
      self.render();
    });
  };

  // bonus : nombre de cases gagnees (ou perdues) une fois l'epreuve resolue
  BoardGame.prototype.finTour = function(bonus) {
    if (this.verrouille()) return;
    var self = this;
    var j = this.tour;
    var avant = this.pos[j];
    if (bonus) this.pos[j] = Math.max(0, Math.min(this.cases.length - 1, this.pos[j] + bonus));
    this.tours++;
    this.figerActions();
    this.deplacerPuis(this.pos[j] !== avant, function() {
      if (self.pos[j] >= self.cases.length - 1) { self.gagnant = j; self.phase = 'fin'; self.render(); return; }
      self.tour = 1 - self.tour;
      self.de = null;
      self.phase = 'jeu';
      self.render();
    });
  };

  BoardGame.prototype.renderFin = function() {
    var self = this;
    var g = this.gagnant, p = 1 - this.gagnant;
    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    wrap.appendChild(el('div', 'text-5xl mb-3', '🏆'));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-3', esc(
      tg('plateau.victoire', '{{nom}} gagne la partie !').replace('{{nom}}', this.joueur(g)))));
    wrap.appendChild(el('p', 'text-lg mb-4', esc(
      tg('plateau.victoireTexte', 'Arrivée atteinte en {{n}} tours.').replace('{{n}}', this.tours))));

    var gage = this.piocher('gage');
    if (gage) {
      var bloc = el('div', 'plateau-gage-final');
      bloc.innerHTML = '<span class="party-carte-type">😈 ' +
        esc(tg('plateau.gagePerdant', 'Le gage du perdant').replace('{{nom}}', this.joueur(p))) + '</span>' +
        '<p class="party-carte-texte">' + esc(gage) + '</p>';
      wrap.appendChild(bloc);
    }

    var rejouer = el('button', 'btn btn-cta btn-lg mt-6 mb-2', tg('jeu.rejouer', 'Rejouer'));
    rejouer.addEventListener('click', function() {
      self.pos = [0, 0]; self.tour = 0; self.tours = 0; self.piles = {};
      self.de = null; self.epreuve = null; self.gagnant = null;
      self.phase = 'jeu'; self.render(); smoothScroll(self.container, 'start');
    });
    wrap.appendChild(rejouer);

    renderActionButtons(wrap, {
      share: { type: 'plateau', nom: this.joueur(g), score: this.tours },
      restart: function() { self.phase = 'setup'; self.render(); smoothScroll(self.container, 'start'); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ─── Qui de nous deux ─────────────────────────────────────
  // Chacun vote en secret sur son tour, puis les deux votes sont reveles
  // ensemble : le jeu mesure a quel point vous vous voyez pareil.
  var QDN_THEMES = [
    { id: 'quotidien', emoji: '🏠' },
    { id: 'amour',     emoji: '💗' },
    { id: 'caractere', emoji: '🎭' },
    { id: 'drole',     emoji: '😄' }
  ];
  var QDN_MANCHES = 12;

  // Un vote vaut 0 ou 1 (le joueur designe), NSP quand on ne sait pas, et null
  // tant que personne n'a repondu.
  var QDN_NSP = -1;

  function DuoVoteGame(config) {
    this.container = config.container;
    this.prefix = config.prefix || 'quiDeNous';
    this.lang = config.lang || 'fr';
    this.phase = 'setup';
    // « secret » : chacun vote de son cote, on revele en meme temps.
    // « ensemble » : on designe quelqu'un a voix haute, sans se cacher.
    this.mode = 'secret';
    this.noms = ['', ''];
    this.manches = [];
    this.idx = 0;
    this.votes = [null, null];
    this.accords = 0;
    this.serie = 0;
    this.meilleureSerie = 0;
    this.designations = [0, 0];   // combien de fois chacun a été désigné
    this.debatsGagnes = 0;        // désaccords que le débat a tranchés
    this.historique = [];
    this.minuteurs = [];
    this.render();
  }

  DuoVoteGame.prototype.doux = function() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };

  // Tous les minuteurs sont traces : un retour au menu en plein decompte ne
  // doit pas faire surgir l'ecran suivant par-dessus.
  DuoVoteGame.prototype.attendre = function(ms, fn) {
    var self = this;
    var id = setTimeout(function() {
      self.minuteurs = self.minuteurs.filter(function(x) { return x !== id; });
      fn();
    }, this.doux() ? Math.min(ms, 120) : ms);
    this.minuteurs.push(id);
  };

  DuoVoteGame.prototype.stopper = function() {
    this.minuteurs.forEach(clearTimeout);
    this.minuteurs = [];
  };

  DuoVoteGame.prototype.lireTheme = function(id) {
    var out = [];
    for (var i = 1; i <= 40; i++) {
      var k = this.prefix + '.' + id + i;
      var t = tgd(k, null);
      if (!t || t === k) { if (i > 2) break; else continue; }
      out.push({ theme: id, texte: t });
    }
    return out;
  };

  // Une partie pioche autant de manches dans chaque theme : personne ne tombe
  // sur douze questions coquines d'affilee.
  DuoVoteGame.prototype.tirerManches = function() {
    var parTheme = Math.ceil(QDN_MANCHES / QDN_THEMES.length);
    var lot = [];
    QDN_THEMES.forEach(function(th) {
      lot = lot.concat(shuffleArray(this.lireTheme(th.id)).slice(0, parTheme));
    }, this);
    this.manches = shuffleArray(lot).slice(0, QDN_MANCHES);
  };

  DuoVoteGame.prototype.joueur = function(i) {
    return this.noms[i] || tg('playerSetup.player' + (i + 1), 'Joueur ' + (i + 1));
  };

  DuoVoteGame.prototype.emojiTheme = function(id) {
    for (var i = 0; i < QDN_THEMES.length; i++) if (QDN_THEMES[i].id === id) return QDN_THEMES[i].emoji;
    return '💬';
  };

  DuoVoteGame.prototype.render = function() {
    this.container.innerHTML = '';
    if (this.phase === 'setup') this.renderSetup();
    else if (this.phase === 'mode') this.renderMode();
    else if (this.phase === 'passe') this.renderPasse();
    else if (this.phase === 'decompte') this.renderDecompte();
    else if (this.phase === 'reveal') this.renderReveal();
    else if (this.phase === 'debat') this.renderDebat();
    else if (this.phase === 'fin') this.renderFin();
    else this.renderVote();
  };

  // Le vote secret puis le debat est un bon principe, mais il oblige a se
  // cacher l'ecran et a se passer le telephone douze fois. Certains veulent
  // juste designer quelqu'un a voix haute. On demande, apres les prenoms.
  DuoVoteGame.prototype.renderMode = function() {
    var self = this;
    this.container.appendChild(ecranModes({
      icone: '🎲',
      titre: tg('quiDeNous.modeTitre', 'Comment voulez-vous jouer ?'),
      desc: tg('quiDeNous.modeDesc', 'Les deux façons donnent une partie différente. Vous pourrez changer entre deux parties.'),
      modes: [
        { id: 'secret', emoji: '🤫',
          titre: tg('quiDeNous.modeSecretTitre', 'Chacun vote en cachette, puis on débat'),
          desc: tg('quiDeNous.modeSecretDesc', 'On se passe le téléphone, on révèle les deux votes en même temps, et on discute quand ils ne collent pas.'),
          meta: tg('quiDeNous.modeSecretMeta', 'Le format d\'origine') },
        { id: 'ensemble', emoji: '🗣️',
          titre: tg('quiDeNous.modeEnsembleTitre', 'On choisit l\'un des deux ensemble'),
          desc: tg('quiDeNous.modeEnsembleDesc', 'Pas de cachotteries : on lit la question à voix haute et on désigne quelqu\'un d\'un commun accord.'),
          meta: tg('quiDeNous.modeEnsembleMeta', 'Plus rapide, sans passer le téléphone') }
      ],
      onChoix: function(id) { self.mode = id; self.nouvellePartie(); }
    }));
    smoothScroll(this.container, 'start');
  };

  DuoVoteGame.prototype.renderSetup = function() {
    var self = this;
    var grille = cartesDeuxJoueurs('qdn-nom');
    var ecran = ecranDepart({
      icone: '👀',
      titre: tg('quiDeNous.setupTitre', 'Qui de nous deux ?'),
      desc: tg('quiDeNous.setupDesc', 'Chacun vote en secret, on révèle les deux réponses en même temps.'),
      corps: [grille],
      meta: pastilleMeta(QDN_MANCHES, tg('quiDeNous.manchesMot', 'manches')),
      bouton: tg('quiDeNous.commencer', 'On commence !'),
      onStart: function() {
        self.noms = [
          grille.querySelector('#qdn-nom1').value.trim() || tg('playerSetup.player1', 'Joueur 1'),
          grille.querySelector('#qdn-nom2').value.trim() || tg('playerSetup.player2', 'Joueur 2')
        ];
        self.phase = 'mode';
        self.render();
      }
    });
    this.container.appendChild(ecran.wrap);
  };

  DuoVoteGame.prototype.nouvellePartie = function() {
    this.stopper();
    this.tirerManches();
    this.idx = 0; this.votes = [null, null];
    this.accords = 0; this.serie = 0; this.meilleureSerie = 0;
    this.designations = [0, 0]; this.debatsGagnes = 0;
    this.historique = [];
    this.tour = 0;
    this.phase = 'vote';
    this.render();
    smoothScroll(this.container, 'start');
  };

  // Bandeau commun a tous les ecrans de jeu : avancement, accords, serie.
  DuoVoteGame.prototype.barre = function() {
    var bloc = el('div', 'qdn-entete');
    var pct = Math.round((this.idx / this.manches.length) * 100);
    bloc.innerHTML =
      '<div class="qdn-barre"><span style="width:' + pct + '%"></span></div>' +
      '<div class="qdn-compteurs">' +
        '<span class="qdn-manche">' + esc(tg('quiDeNous.manche', 'Manche {{n}} / {{total}}')
          .replace('{{n}}', this.idx + 1).replace('{{total}}', this.manches.length)) + '</span>' +
        '<span class="qdn-accords">✅ ' + this.accords + '</span>' +
        (this.serie >= 2 ? '<span class="qdn-serie">🔥 ' + this.serie + '</span>' : '') +
      '</div>';
    return bloc;
  };

  DuoVoteGame.prototype.renderVote = function() {
    var self = this;
    var m = this.manches[this.idx];
    var j = this.tour;
    var wrap = el('div', 'quiz-engine qdn-jeu');
    wrap.appendChild(this.barre());

    var carte = el('div', 'qdn-carte animate-fade-in');
    carte.innerHTML =
      '<span class="qdn-theme">' + this.emojiTheme(m.theme) + ' ' +
        esc(tgd(this.prefix + '.theme_' + m.theme, m.theme)) + '</span>' +
      '<p class="qdn-amorce">' + esc(tg('quiDeNous.amorce', 'Qui de vous deux…')) + '</p>' +
      '<p class="qdn-question">' + esc(m.texte) + '</p>';
    wrap.appendChild(carte);

    var ensemble = this.mode === 'ensemble';
    var consigne = el('p', 'qdn-secret');
    consigne.innerHTML = ensemble
      ? '🗣️ ' + esc(tg('quiDeNous.voteEnsemble', 'Décidez ensemble, à voix haute.'))
      : '🤫 ' + esc(tg('quiDeNous.voteSecret', '{{nom}} vote en secret').replace('{{nom}}', this.joueur(j)));
    wrap.appendChild(consigne);

    var choix = el('div', 'qdn-choix');
    // Un vote enregistre puis, selon le mode, on passe le telephone ou on
    // enchaine directement sur la revelation.
    function poser(valeur, bouton) {
      // Le relais vient de s'effacer seul : sans ce délai, un doigt déjà parti
      // vers le bandeau retombe sur un nom et vote à la place du joueur.
      if (self.__answerLockUntil && Date.now() < self.__answerLockUntil) return;
      if (self.votes[j] !== null) return;
      self.votes[j] = valeur;
      if (bouton) bouton.classList.add('qdn-choix-btn--pris');
      choix.classList.add('qdn-choix--verrouille');
      self.attendre(420, function() {
        if (ensemble) { self.votes[1] = valeur; self.phase = 'reveal'; }
        else if (j === 0) { self.tour = 1; self.phase = 'passe'; }
        else { self.phase = 'decompte'; }
        self.render();
      });
    }

    [0, 1].forEach(function(cible) {
      var b = el('button', 'qdn-choix-btn qdn-choix-btn--' + (cible + 1));
      b.type = 'button';
      b.innerHTML = '<span class="qdn-choix-pastille">' + esc(self.joueur(cible).charAt(0).toUpperCase()) + '</span>' +
        '<span class="qdn-choix-nom">' + esc(self.joueur(cible)) + '</span>';
      b.addEventListener('click', function() { poser(cible, b); });
      choix.appendChild(b);
    });
    wrap.appendChild(choix);

    // Personne n'est oblige de trancher : certaines questions ne s'appliquent
    // tout simplement pas au couple qui joue.
    var nsp = el('button', 'qdn-nsp', esc(tg('quiDeNous.nsp', 'On ne sait pas')));
    nsp.type = 'button';
    nsp.addEventListener('click', function() { poser(QDN_NSP, null); });
    wrap.appendChild(nsp);

    wrap.appendChild(this.boutonArret());
    this.container.appendChild(wrap);
  };

  // Même relais que les tests à deux : l'écran s'annonçait puis attendait un
  // clic sur « C'est à moi ! » à chaque manche, soit une trentaine de clics
  // par partie en mode secret. Le bouton « arrêter » reste sous le bandeau,
  // et il est de toute façon présent sur l'écran de vote qui suit.
  DuoVoteGame.prototype.renderPasse = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine qdn-jeu text-center');
    wrap.appendChild(this.barre());
    wrap.appendChild(relaisJoueur(this, {
      nom: this.joueur(1),
      // Pas d'étape ici : le bandeau du jeu, juste au-dessus, affiche déjà le
      // numéro de manche.
      note: tg('quiDeNous.passeDesc', 'Pas de triche : le vote reste caché jusqu\'à la révélation.'),
      suite: function() { self.phase = 'vote'; self.render(); }
    }));
    wrap.appendChild(this.boutonArret());
    this.container.appendChild(wrap);
  };

  DuoVoteGame.prototype.renderDecompte = function() {
    var self = this;
    var wrap = el('div', 'quiz-engine qdn-jeu text-center');
    wrap.appendChild(this.barre());
    var bloc = el('div', 'qdn-decompte');
    var nb = el('div', 'qdn-decompte-nb', '3');
    bloc.appendChild(nb);
    bloc.appendChild(el('p', 'qdn-decompte-txt', esc(tg('quiDeNous.decompte', 'Révélation dans…'))));
    wrap.appendChild(bloc);
    this.container.appendChild(wrap);

    var suite = ['2', '1'];
    var etape = 0;
    var tic = function() {
      if (etape < suite.length) {
        nb.textContent = suite[etape++];
        nb.classList.remove('qdn-decompte-nb--pop');
        void nb.offsetWidth;
        nb.classList.add('qdn-decompte-nb--pop');
        self.attendre(650, tic);
      } else {
        self.phase = 'reveal';
        self.render();
      }
    };
    this.attendre(650, tic);
  };

  DuoVoteGame.prototype.renderReveal = function() {
    var self = this;
    var m = this.manches[this.idx];
    var ensemble = this.mode === 'ensemble';
    // « On ne sait pas » des deux cotes n'est pas un accord : c'est une manche
    // qu'on met de cote, sans point ni debat.
    var passe = this.votes[0] === QDN_NSP || this.votes[1] === QDN_NSP;
    var accord = !passe && this.votes[0] === this.votes[1];

    // Le score n'est comptabilise qu'une fois, meme si l'ecran est redessine.
    if (!this.historique[this.idx]) {
      this.historique[this.idx] = { texte: m.texte, theme: m.theme, votes: this.votes.slice(),
                                    accord: accord, passe: passe, tranche: null };
      if (accord) {
        this.accords++;
        this.serie++;
        if (this.serie > this.meilleureSerie) this.meilleureSerie = this.serie;
        if (this.votes[0] >= 0) this.designations[this.votes[0]]++;
      } else if (!passe) this.serie = 0;
    }

    var wrap = el('div', 'quiz-engine qdn-jeu text-center');
    wrap.appendChild(this.barre());
    // Le rappel reprend l'amorce : sans elle la question se lit comme un
    // fragment (« change d'avis toutes les cinq minutes ? »).
    wrap.appendChild(el('p', 'qdn-rappel', esc(tg('quiDeNous.amorce', 'Qui de vous deux…') + ' ' + m.texte)));

    var duo = el('div', 'qdn-reveal' + (ensemble ? ' qdn-reveal--seul' : ''));
    (ensemble ? [0] : [0, 1]).forEach(function(j) {
      var v = self.votes[j];
      var c = el('div', 'qdn-reveal-carte');
      c.style.animationDelay = (j * 0.18) + 's';
      var entete = ensemble
        ? tg('quiDeNous.vousAvezDit', 'Vous avez désigné')
        : tg('quiDeNous.aDit', '{{nom}} a dit').replace('{{nom}}', self.joueur(j));
      c.innerHTML =
        '<span class="qdn-reveal-qui">' + esc(entete) + '</span>' +
        (v === QDN_NSP
          ? '<span class="qdn-reveal-pastille qdn-reveal-pastille--nsp">?</span>' +
            '<span class="qdn-reveal-nom">' + esc(tg('quiDeNous.nsp', 'On ne sait pas')) + '</span>'
          : '<span class="qdn-reveal-pastille qdn-reveal-pastille--' + (v + 1) + '">' +
              esc(self.joueur(v).charAt(0).toUpperCase()) + '</span>' +
            '<span class="qdn-reveal-nom">' + esc(self.joueur(v)) + '</span>');
      duo.appendChild(c);
    });
    wrap.appendChild(duo);

    var etat = passe ? 'passe' : (accord ? 'accord' : 'clash');
    var verdict = el('div', 'qdn-verdict qdn-verdict--' + etat);
    var titres = { accord: '✅ ' + tg('quiDeNous.accordTitre', 'D\'accord !'),
                   clash: '⚡ ' + tg('quiDeNous.clashTitre', 'Débat !'),
                   passe: '🤷 ' + tg('quiDeNous.passeVerdictTitre', 'Manche mise de côté') };
    var textes = { accord: ensemble
                     ? tg('quiDeNous.ensembleTexte', 'Un nom de plus au compteur.')
                     : tg('quiDeNous.accordTexte', 'Vous avez désigné la même personne. Un point de plus.'),
                   clash: tg('quiDeNous.clashTexte', 'Vous ne vous voyez pas pareil sur ce coup-là. Expliquez-vous !'),
                   passe: tg('quiDeNous.passeVerdictTexte', 'Personne n\'a voulu trancher, et c\'est très bien. On passe à la suivante.') };
    verdict.innerHTML =
      '<span class="qdn-verdict-titre">' + esc(titres[etat]) + '</span>' +
      '<p class="qdn-verdict-texte">' + esc(textes[etat]) + '</p>';
    if (accord && !ensemble && this.serie >= 3) {
      verdict.innerHTML += '<p class="qdn-combo">🔥 ' +
        esc(tg('quiDeNous.combo', '{{n}} d\'affilée !').replace('{{n}}', this.serie)) + '</p>';
    }
    wrap.appendChild(verdict);

    if (accord && !ensemble && !this.doux()) wrap.appendChild(this.confettis());

    // Un desaccord ne se contentait pas d'un « expliquez-vous » : la manche se
    // terminait sans qu'on sache si le debat avait mene quelque part. On le
    // demande, et s'il a abouti on note qui l'a emporte.
    var h = this.historique[this.idx];
    if (!accord && !passe && h.tranche === null) {
      var demande = el('div', 'qdn-debat');
      demande.innerHTML = '<p class="qdn-debat-question">' +
        esc(tg('quiDeNous.debatQuestion', 'Débat réussi ?')) + '</p>';
      var reponses = el('div', 'qdn-debat-choix');
      var oui = el('button', 'btn btn-cta qdn-debat-oui', esc(tg('quiDeNous.debatOui', 'Oui, on s\'est mis d\'accord')));
      oui.type = 'button';
      oui.addEventListener('click', function() { self.phase = 'debat'; self.render(); });
      var non = el('button', 'btn btn-outline qdn-debat-non', esc(tg('quiDeNous.debatNon', 'Non, chacun campe sur ses positions')));
      non.type = 'button';
      non.addEventListener('click', function() { h.tranche = false; self.render(); });
      reponses.appendChild(oui); reponses.appendChild(non);
      demande.appendChild(reponses);
      wrap.appendChild(demande);
    } else if (!accord && !passe) {
      var issue = el('div', 'qdn-debat qdn-debat--fait');
      issue.innerHTML = h.tranche === false
        ? '<p class="qdn-debat-issue">🤝 ' + esc(tg('quiDeNous.debatEchecTexte', 'Chacun reste sur sa position. Ça arrive, et ça fera une histoire à raconter.')) + '</p>'
        : '<p class="qdn-debat-issue">🏆 ' + esc(tg('quiDeNous.debatReussiTexte', 'Débat tranché : {{nom}}.').replace('{{nom}}', this.joueur(h.tranche))) + '</p>';
      wrap.appendChild(issue);
    }

    // Tant que le débat n'a pas d'issue, on ne propose pas la manche suivante.
    if (accord || passe || h.tranche !== null) {
      var suivant = el('button', 'btn btn-cta btn-lg mt-6', esc(
        this.idx + 1 >= this.manches.length ? tg('quiDeNous.voirResultat', 'Voir notre score') : tg('quiDeNous.suivant', 'Manche suivante')));
      suivant.type = 'button';
      suivant.addEventListener('click', function() {
        self.idx++;
        self.votes = [null, null];
        self.tour = 0;
        self.phase = self.idx >= self.manches.length ? 'fin' : 'vote';
        self.render();
        smoothScroll(self.container, 'start');
      });
      wrap.appendChild(suivant);
    }
    wrap.appendChild(this.boutonArret());
    this.container.appendChild(wrap);
  };

  DuoVoteGame.prototype.confettis = function() {
    var box = el('div', 'qdn-confettis');
    box.setAttribute('aria-hidden', 'true');
    var teintes = ['var(--qdn-c1)', 'var(--qdn-c2)', 'var(--qdn-c3)', 'var(--qdn-c4)'];
    var html = '';
    for (var i = 0; i < 22; i++) {
      html += '<span style="left:' + (4 + Math.random() * 92).toFixed(1) + '%;' +
        'background:' + teintes[i % teintes.length] + ';' +
        'animation-delay:' + (Math.random() * 0.35).toFixed(2) + 's;' +
        'transform:rotate(' + Math.floor(Math.random() * 360) + 'deg)"></span>';
    }
    box.innerHTML = html;
    return box;
  };

  // Le debat a abouti : reste a savoir sur quel nom. Ce choix-la compte, il
  // alimente le decompte final au meme titre qu'un accord immediat.
  DuoVoteGame.prototype.renderDebat = function() {
    var self = this;
    var m = this.manches[this.idx];
    var wrap = el('div', 'quiz-engine qdn-jeu text-center');
    wrap.appendChild(this.barre());
    wrap.appendChild(el('p', 'qdn-rappel', esc(tg('quiDeNous.amorce', 'Qui de vous deux…') + ' ' + m.texte)));

    var bloc = el('div', 'qdn-debat qdn-debat--tranche');
    bloc.innerHTML = '<p class="qdn-debat-question">' +
      esc(tg('quiDeNous.debatQui', 'Alors, c\'est qui au final ?')) + '</p>';
    var choix = el('div', 'qdn-choix');
    [0, 1].forEach(function(cible) {
      var b = el('button', 'qdn-choix-btn qdn-choix-btn--' + (cible + 1));
      b.type = 'button';
      b.innerHTML = '<span class="qdn-choix-pastille">' + esc(self.joueur(cible).charAt(0).toUpperCase()) + '</span>' +
        '<span class="qdn-choix-nom">' + esc(self.joueur(cible)) + '</span>';
      b.addEventListener('click', function() {
        var h = self.historique[self.idx];
        if (h.tranche !== null) return;
        h.tranche = cible;
        self.designations[cible]++;
        self.debatsGagnes++;
        self.phase = 'reveal';
        self.render();
      });
      choix.appendChild(b);
    });
    bloc.appendChild(choix);
    wrap.appendChild(bloc);

    var retour = el('button', 'btn btn-ghost mt-4', esc(tg('quiDeNous.debatRetour', 'Finalement non, on n\'est pas d\'accord')));
    retour.type = 'button';
    retour.addEventListener('click', function() {
      self.historique[self.idx].tranche = false;
      self.phase = 'reveal';
      self.render();
    });
    wrap.appendChild(retour);
    wrap.appendChild(this.boutonArret());
    this.container.appendChild(wrap);
  };

  DuoVoteGame.prototype.boutonArret = function() {
    var self = this;
    var b = el('button', 'qdn-arret', esc(tg('quiDeNous.arreter', 'Arrêter la partie')));
    b.type = 'button';
    b.addEventListener('click', function() { self.stopper(); self.phase = 'setup'; self.render(); });
    return b;
  };

  DuoVoteGame.prototype.renderFin = function() {
    var self = this;
    var ensemble = this.mode === 'ensemble';
    // Les manches mises de cote ne comptent pas contre vous : le score se
    // calcule sur celles ou quelqu'un a bien ete designe.
    var jouees = this.historique.filter(function(h) { return h && !h.passe; }).length;
    var total = this.manches.length;
    var base = jouees || total;
    var pct = Math.round((this.accords / base) * 100);
    var palier = pct >= 80 ? 4 : pct >= 60 ? 3 : pct >= 40 ? 2 : 1;

    var wrap = el('div', 'quiz-engine quiz-result-card text-center');

    // En mode « on choisit ensemble » il n'y a pas d'accord a mesurer : le
    // resultat, c'est qui a ete designe le plus souvent.
    if (ensemble) {
      var d = this.designations;
      var vainqueur = d[0] === d[1] ? -1 : (d[0] > d[1] ? 0 : 1);
      wrap.appendChild(el('div', 'text-5xl mb-3', vainqueur === -1 ? '🤝' : '👑'));
      wrap.appendChild(el('h2', 'text-2xl font-bold mb-4', esc(vainqueur === -1
        ? tg('quiDeNous.finEgaliteTitre', 'Parfaitement à égalité')
        : tg('quiDeNous.finVainqueurTitre', '{{nom}}, c\'est vous').replace('{{nom}}', this.joueur(vainqueur)))));

      var duel = el('div', 'qdn-duel');
      [0, 1].forEach(function(j) {
        var c = el('div', 'qdn-duel-carte' + (vainqueur === j ? ' qdn-duel-carte--gagne' : ''));
        c.innerHTML =
          '<span class="qdn-duel-pastille qdn-duel-pastille--' + (j + 1) + '">' +
            esc(self.joueur(j).charAt(0).toUpperCase()) + '</span>' +
          '<span class="qdn-duel-nom">' + esc(self.joueur(j)) + '</span>' +
          '<span class="qdn-duel-score">' + d[j] + '</span>';
        duel.appendChild(c);
      });
      wrap.appendChild(duel);
      wrap.appendChild(el('p', 'qdn-fin-detail', esc(
        tg('quiDeNous.finEnsembleDetail', '{{n}} manches désignées sur {{total}}')
          .replace('{{n}}', d[0] + d[1]).replace('{{total}}', total))));
      this.finCommun(wrap, pct, tg('quiDeNous.finVerdictEnsemble', ''));
      return;
    }

    wrap.appendChild(el('div', 'text-5xl mb-3', ['🙈', '🤔', '💞', '🧠'][palier - 1]));
    wrap.appendChild(el('h2', 'text-2xl font-bold mb-4', esc(tg('quiDeNous.finTitre', 'Votre score d\'harmonie'))));

    // Anneau : le pourcentage se remplit tout seul a l'affichage.
    // Le « % » etait dans un <small> separe du nombre : sur un ecran etroit il
    // passait a la ligne tout seul. Il reste sur la meme ligne, quoi qu'il
    // arrive.
    var anneau = el('div', 'qdn-anneau');
    var circ = 2 * Math.PI * 52;
    anneau.innerHTML =
      '<svg viewBox="0 0 120 120" role="img" aria-label="' + esc(pct + ' %') + '">' +
        '<circle class="qdn-anneau-fond" cx="60" cy="60" r="52"></circle>' +
        '<circle class="qdn-anneau-jauge" cx="60" cy="60" r="52" stroke-dasharray="' + circ.toFixed(1) + '" ' +
          'stroke-dashoffset="' + circ.toFixed(1) + '"></circle>' +
      '</svg>' +
      '<span class="qdn-anneau-valeur"><span class="qdn-anneau-nb">' + pct + '</span><small>%</small></span>';
    wrap.appendChild(anneau);

    wrap.appendChild(el('p', 'qdn-fin-detail', esc(
      tg('quiDeNous.finDetail', '{{n}} accords sur {{total}} manches')
        .replace('{{n}}', this.accords).replace('{{total}}', jouees || total))));
    if (jouees < total) {
      wrap.appendChild(el('p', 'qdn-fin-passees', esc(
        tg('quiDeNous.finPassees', '{{n}} manche(s) mise(s) de côté').replace('{{n}}', total - jouees))));
    }
    if (this.debatsGagnes) {
      wrap.appendChild(el('p', 'qdn-fin-debats', '🏆 ' + esc(
        tg('quiDeNous.finDebats', '{{n}} débat(s) tranché(s)').replace('{{n}}', this.debatsGagnes))));
    }
    if (this.meilleureSerie >= 2) {
      wrap.appendChild(el('p', 'qdn-fin-serie', '🔥 ' + esc(
        tg('quiDeNous.finSerie', 'Meilleure série : {{n}} d\'affilée').replace('{{n}}', this.meilleureSerie))));
    }

    var verdict = tg('quiDeNous.palier' + palier + 'Titre', '');
    var bloc = el('div', 'qdn-fin-verdict');
    bloc.innerHTML = '<h3>' + esc(verdict) + '</h3><p>' + esc(tg('quiDeNous.palier' + palier + 'Texte', '')) + '</p>';
    wrap.appendChild(bloc);

    this.finCommun(wrap, pct, verdict);

    // Le remplissage part apres le premier rendu, sinon il n'y a pas de transition.
    var jauge = anneau.querySelector('.qdn-anneau-jauge');
    this.attendre(120, function() {
      jauge.style.strokeDashoffset = String(circ * (1 - pct / 100));
    });
  };

  // Le bas de l'ecran de fin est le meme quel que soit le mode : ce dont il
  // faut reparler, rejouer, partager.
  DuoVoteGame.prototype.finCommun = function(wrap, pct, verdict) {
    var self = this;

    // Recapitulatif : les manches sans accord, et celles qu'on a mises de côté.
    var aReparler = this.historique.filter(function(h) {
      return h && (h.passe || (!h.accord && h.tranche === false));
    });
    if (aReparler.length) {
      var liste = el('div', 'qdn-recap');
      var lignes = '<h3 class="qdn-recap-titre">⚡ ' +
        esc(tg('quiDeNous.recapTitre', 'À reparler ensemble')) + '</h3><ul>';
      var amorce = tg('quiDeNous.amorce', 'Qui de vous deux…');
      aReparler.forEach(function(h) {
        lignes += '<li><span aria-hidden="true">' + self.emojiTheme(h.theme) + '</span> ' +
          '<span><em class="qdn-recap-amorce">' + esc(amorce) + '</em> ' + esc(h.texte) + '</span></li>';
      });
      liste.innerHTML = lignes + '</ul>';
      wrap.appendChild(liste);
    }

    var rejouer = el('button', 'btn btn-cta btn-lg mt-6 mb-2', esc(tg('quiDeNous.rejouer', 'Rejouer avec de nouvelles questions')));
    rejouer.type = 'button';
    rejouer.addEventListener('click', function() { self.nouvellePartie(); });
    wrap.appendChild(rejouer);

    // On peut refaire une partie dans l'autre mode sans repasser par les prenoms.
    var autreMode = el('button', 'btn btn-outline mb-2', esc(tg('quiDeNous.changerMode', 'Changer de façon de jouer')));
    autreMode.type = 'button';
    autreMode.addEventListener('click', function() {
      self.stopper(); self.phase = 'mode'; self.render();
    });
    wrap.appendChild(autreMode);

    renderActionButtons(wrap, {
      share: { type: 'duo', pct: pct, verdict: verdict },
      restart: function() { self.stopper(); self.phase = 'setup'; self.render(); smoothScroll(self.container, 'start'); }
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // DILEMMES DE COUPLE - on accepte ou on refuse un marche
  // Cent situations « tel avantage MAIS telle contrepartie », tirees dans un
  // ordre different a chaque partie. Le couple repond OK ou PAS OK, puis
  // decouvre comment les autres couples ont tranche : deux camps, un nombre
  // de voix et un pourcentage de chaque cote.
  //
  // A ne pas confondre avec « tu preferes », qui fait choisir entre deux
  // options : ici il n'y a qu'une proposition, on la prend ou on la laisse.
  // ═══════════════════════════════════════════════════════════
  var DIL_OK = 'ok', DIL_NON = 'pasok';
  var DIL_CLE_VOTES = 'dilemmes-votes';     // ce que ce navigateur a deja vote
  var DIL_CLE_AVIS = 'dilemmes-avis-propose'; // l'invitation a laisser un avis
  var DIL_VOTES_AVANT_AVIS = 15;            // votes d'affilee avant de la poser

  function DilemmeGame(config) {
    this.container = config.container;
    this.dilemmes = shuffleArray(config.dilemmes.slice());
    this.prefix = config.prefix || 'dilemmes';
    this.lang = config.lang || 'fr';
    this.idx = 0;
    this.choix = null;          // le vote du tour en cours
    this.compte = null;         // { ok: n, pasok: n } renvoye par le serveur
    this.envoiEnCours = false;
    this.historique = [];
    this.totaux = null;         // comptes de tous les dilemmes, charges une fois
    this.dejaVotes = lireVotesLocaux(DIL_CLE_VOTES);
    this.phase = 'intro';
    this.render();
  }

  // ─── Infrastructure de vote, partagee par les jeux qui comptent les voix ──
  // Les dilemmes et le pour ou contre posent la meme question au navigateur :
  // qu'as-tu deja vote, et qui es-tu ? Les deux jeux tiennent chacun leur
  // propre cle de stockage et leur propre sel, ils ne se melangent donc pas.

  // Les votes deja emis par ce navigateur. Ils servent a deux choses : ne pas
  // recompter quelqu'un qui recharge la page, et lui remontrer son propre
  // choix quand il retombe sur une carte qu'il a deja tranchee.
  function lireVotesLocaux(cle) {
    try { return JSON.parse(localStorage.getItem(cle) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function ecrireVoteLocal(cle, id, choix) {
    try {
      var v = lireVotesLocaux(cle); v[id] = choix;
      localStorage.setItem(cle, JSON.stringify(v));
    } catch (e) {}
  }

  // Identifiant de votant. Le localStorage seul ne resiste pas a une fenetre
  // privee, alors on le combine a l'adresse IP vue par le serveur, hachee
  // avant d'etre envoyee pour qu'aucune adresse ne soit stockee en clair.
  // C'est la contrainte d'unicite en base qui fait foi, pas ce fichier.
  //
  // Le sel differe d'un jeu a l'autre, donc le meme visiteur ne porte pas le
  // meme identifiant des deux cotes : rien ne permet de recouper ses votes.
  var _votants = {};
  function identifiantVotant(cleLocale, sel) {
    if (_votants[sel]) return Promise.resolve(_votants[sel]);
    var local;
    try {
      local = localStorage.getItem(cleLocale);
      if (!local) {
        local = (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
        localStorage.setItem(cleLocale, local);
      }
    } catch (e) { local = 'x' + Math.random().toString(36).slice(2, 10); }

    return fetch(SUPABASE_URL + '/functions/v1/get-client-ip', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' }
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { return d && d.ip ? d.ip : local; })
      .catch(function () { return local; })
      .then(function (texte) { return hacher(sel, texte); })
      .then(function (h) { _votants[sel] = h; return h; });
  }
  function hacher(sel, texte) {
    if (!(window.crypto && window.crypto.subtle && window.TextEncoder)) {
      // Repli sans SubtleCrypto (contexte non securise) : un hachage court
      // suffit, il ne protege rien d'autre que la lisibilite.
      var h = 0, s = sel + texte;
      for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
      return Promise.resolve('f' + (h >>> 0).toString(36));
    }
    return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(sel + texte))
      .then(function (buf) {
        var o = '', v = new Uint8Array(buf);
        for (var i = 0; i < 16; i++) o += ('0' + v[i].toString(16)).slice(-2);
        return o;
      });
  }

  // Les deux camps sous forme de barre coupee en deux, chaque cote portant son
  // nombre de voix et son pourcentage. Le remplissage part apres le premier
  // rendu, sinon la barre arrive deja pleine et il n'y a pas d'animation.
  // opts.prefixe donne les classes : {p}-camps, {p}-camp, {p}-camp--{suffixe},
  // {p}-barre, {p}-barre-{suffixe}. Chaque jeu garde ainsi sa propre feuille
  // de style sans que le balisage soit ecrit deux fois.
  function blocDeuxCamps(opts) {
    var p = opts.prefixe;
    var camps = el('div', p + '-camps');
    function cote(c) {
      return '<div class="' + p + '-camp ' + p + '-camp--' + c.suffixe +
          (c.sien ? ' est-le-votre' : '') + '">' +
        '<span class="' + p + '-camp-lbl">' + c.emoji + ' ' + esc(c.libelle) + '</span>' +
        '<span class="' + p + '-camp-pct">' + c.pct + '%</span>' +
        '<span class="' + p + '-camp-nb">' + fmtNombre(c.voix, opts.lang) + ' ' +
          esc(c.voix === 1 ? opts.voix1 : opts.voix) + '</span>' +
      '</div>';
    }
    camps.innerHTML = cote(opts.a) + cote(opts.b);

    var barre = el('div', p + '-barre');
    barre.innerHTML = '<div class="' + p + '-barre-' + opts.a.suffixe + '" style="width:0%"></div>' +
      '<div class="' + p + '-barre-' + opts.b.suffixe + '" style="width:0%"></div>';
    setTimeout(function () {
      var ea = barre.querySelector('.' + p + '-barre-' + opts.a.suffixe);
      var eb = barre.querySelector('.' + p + '-barre-' + opts.b.suffixe);
      if (ea) ea.style.width = opts.a.pct + '%';
      if (eb) eb.style.width = opts.b.pct + '%';
    }, 60);

    return { camps: camps, barre: barre };
  }

  DilemmeGame.prototype.render = function () {
    this.container.innerHTML = '';
    if (this.phase === 'intro') this.renderIntro();
    else if (this.phase === 'vote') this.renderVote();
    else if (this.phase === 'resultat') this.renderResultat();
    else if (this.phase === 'fin') this.renderFin();
  };

  DilemmeGame.prototype.tg = function (cle, repli) { return tg('dilemme.' + cle, repli); };

  DilemmeGame.prototype.renderIntro = function () {
    var self = this;
    var ecran = ecranDepart({
      icone: '⚖️',
      titre: this.tg('introTitre', 'Prêts à trancher ?'),
      desc: this.tg('introTexte', 'Cent situations à prendre ou à laisser, à deux. Répondez ensemble, puis découvrez ce que les autres couples ont choisi.'),
      meta: '⚖️ ' + this.dilemmes.length + ' ' + this.tg('metaDilemmes', 'dilemmes') + ' &bull; ⏱ ' + this.tg('metaDuree', 'sans limite'),
      bouton: this.tg('commencer', 'Premier dilemme'),
      onStart: function () { self.phase = 'vote'; self.render(); }
    });
    this.container.appendChild(ecran.wrap);
    // Les totaux servent a afficher les deux camps sans attendre apres chaque
    // vote : on les charge une seule fois, pendant que l'ecran d'intro est la.
    this.chargerTotaux();
  };

  DilemmeGame.prototype.chargerTotaux = function () {
    var self = this;
    if (this._chargement) return this._chargement;
    this._chargement = fetch(SUPABASE_URL + '/rest/v1/rpc/get_dilemme_counts', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: '{}'
    })
      .then(function (r) { return r.json(); })
      .then(function (lignes) {
        var t = {};
        if (Array.isArray(lignes)) {
          lignes.forEach(function (l) {
            t[l.dilemme_id] = { ok: +l.ok || 0, pasok: +l.pasok || 0 };
          });
        }
        self.totaux = t;
        return t;
      })
      .catch(function () { self.totaux = {}; return {}; });
    return this._chargement;
  };

  DilemmeGame.prototype.dilemmeCourant = function () { return this.dilemmes[this.idx]; };

  // La carte, identique sur l'ecran de vote et sur celui du resultat : la
  // situation, le « MAIS » bien detache, puis la contrepartie.
  DilemmeGame.prototype.carte = function (d) {
    var c = el('div', 'dil-carte');
    c.appendChild(el('p', 'dil-haut', esc(d.haut)));
    c.appendChild(el('span', 'dil-mais', esc(this.tg('mais', 'MAIS'))));
    c.appendChild(el('p', 'dil-bas', esc(d.bas)));
    return c;
  };

  DilemmeGame.prototype.renderVote = function () {
    var self = this;
    var d = this.dilemmeCourant();
    var wrap = el('div', 'quiz-engine dil-jeu quiz-question-enter');
    wrap.appendChild(this.carte(d));

    // Un dilemme deja tranche depuis ce navigateur : on montre directement le
    // resultat plutot que de laisser voter une deuxieme fois.
    if (this.dejaVotes[d.id]) {
      this.choix = this.dejaVotes[d.id];
      this.phase = 'resultat';
      this.render();
      return;
    }

    wrap.appendChild(el('p', 'dil-consigne', esc(this.tg('consigne', 'Décidez ensemble, à voix haute.'))));

    var choix = el('div', 'dil-choix');
    [[DIL_OK, this.tg('ok', 'OK'), '👍'], [DIL_NON, this.tg('pasok', 'PAS OK'), '👎']].forEach(function (c) {
      var b = el('button', 'dil-choix-btn dil-choix-btn--' + c[0]);
      b.type = 'button';
      b.innerHTML = '<span class="dil-choix-emoji">' + c[2] + '</span><span class="dil-choix-txt">' + esc(c[1]) + '</span>';
      b.addEventListener('click', function () { self.voter(c[0], b); });
      choix.appendChild(b);
    });
    wrap.appendChild(choix);

    var passer = el('button', 'dil-passer', esc(this.tg('passer', 'Passer ce dilemme')));
    passer.type = 'button';
    passer.addEventListener('click', function () { self.suivant(); });
    wrap.appendChild(passer);

    this.container.appendChild(wrap);
  };

  DilemmeGame.prototype.voter = function (choix, bouton) {
    var self = this;
    if (this.envoiEnCours) return;
    this.envoiEnCours = true;
    var d = this.dilemmeCourant();
    if (bouton) bouton.classList.add('est-choisi');
    this.choix = choix;
    this.historique.push({ id: d.id, choix: choix });
    ecrireVoteLocal(DIL_CLE_VOTES, d.id, choix);
    this.dejaVotes[d.id] = choix;

    // On compte le vote localement tout de suite : l'ecran de resultat ne doit
    // pas attendre le reseau, et un envoi qui echoue ne doit pas bloquer le jeu.
    if (!this.totaux) this.totaux = {};
    if (!this.totaux[d.id]) this.totaux[d.id] = { ok: 0, pasok: 0 };
    this.totaux[d.id][choix]++;

    identifiantVotant('dilemmes-votant', 'quiz-couple-dilemmes:').then(function (votant) {
      return fetch(SUPABASE_URL + '/rest/v1/dilemme_votes', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json', 'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ dilemme_id: d.id, choix: choix, lang: self.lang, votant: votant })
      });
    }).catch(function () {});

    setTimeout(function () {
      self.envoiEnCours = false;
      self.phase = 'resultat';
      self.render();
    }, 320);
  };

  DilemmeGame.prototype.renderResultat = function () {
    var self = this;
    var d = this.dilemmeCourant();
    var c = (this.totaux && this.totaux[d.id]) || { ok: 0, pasok: 0 };
    var total = c.ok + c.pasok;
    // Sans aucun vote connu, le sien compte quand meme : la barre ne doit
    // jamais s'afficher vide sous les yeux de celui qui vient de voter.
    if (total === 0) { c = { ok: this.choix === DIL_OK ? 1 : 0, pasok: this.choix === DIL_NON ? 1 : 0 }; total = 1; }
    var pctOk = Math.round((c.ok / total) * 100);
    var pctNon = 100 - pctOk;

    var wrap = el('div', 'quiz-engine dil-jeu dil-jeu--resultat quiz-question-enter');
    wrap.appendChild(this.carte(d));

    // La phrase entiere vient de la traduction : l'espace avant le deux-points
    // est une regle francaise, l'anglais, l'espagnol, l'allemand et l'italien
    // ne la suivent pas et recollaient un espace en trop.
    wrap.appendChild(el('p', 'dil-votre-choix',
      esc(this.tg('votreReponse', 'Votre réponse : {{r}}'))
        .replace('{{r}}', '<strong>' + esc(this.choix === DIL_OK ? this.tg('ok', 'OK') : this.tg('pasok', 'PAS OK')) + '</strong>')));

    // Les deux camps. Une seule barre coupee en deux, chaque cote portant son
    // nombre de voix et son pourcentage : on voit d'un coup d'oeil de quel
    // cote penche la majorite, et si on est avec elle.
    var duo = blocDeuxCamps({
      prefixe: 'dil', lang: this.lang,
      voix: this.tg('voix', 'voix'), voix1: this.tg('voix1', 'voix'),
      a: { suffixe: 'ok', emoji: '👍', libelle: this.tg('ok', 'OK'),
           pct: pctOk, voix: c.ok, sien: this.choix === DIL_OK },
      b: { suffixe: 'pasok', emoji: '👎', libelle: this.tg('pasok', 'PAS OK'),
           pct: pctNon, voix: c.pasok, sien: this.choix === DIL_NON }
    });
    wrap.appendChild(duo.camps);
    wrap.appendChild(duo.barre);

    // Un seul votant, c'est le sien : la phrase doit rester au singulier.
    var phraseTotal = total === 1
      ? this.tg('surTotal1', 'Vous êtes le premier couple à trancher ce dilemme')
      : this.tg('surTotal', '{{n}} couples ont tranché ce dilemme').replace('{{n}}', fmtNombre(total, this.lang));
    wrap.appendChild(el('p', 'dil-total', esc(phraseTotal)));

    var suite = el('div', 'dil-suite');
    var dernier = this.idx + 1 >= this.dilemmes.length;
    var suivant = el('button', 'btn btn-cta dil-suivant',
      esc(dernier ? this.tg('voirBilan', 'Voir notre bilan') : this.tg('suivant', 'Dilemme suivant')));
    suivant.type = 'button';
    suivant.addEventListener('click', function () { self.suivant(); });
    suite.appendChild(suivant);
    if (this.historique.length >= 3 && !dernier) {
      var arret = el('button', 'dil-arret', esc(this.tg('arreter', 'Arrêter et voir notre bilan')));
      arret.type = 'button';
      arret.addEventListener('click', function () { self.phase = 'fin'; self.render(); });
      suite.appendChild(arret);
    }
    wrap.appendChild(suite);

    var invite = this.inviteAvis();
    if (invite) wrap.appendChild(invite);

    this.container.appendChild(wrap);
  };

  // Cent dilemmes, c'est long, et presque personne ne va au bout : l'ecran de
  // fin etait donc la seule occasion de demander un avis, et il n'arrivait
  // jamais. On la propose une fois arrive au quinzieme vote de la partie, quand
  // le couple a joue assez pour avoir un avis, et une seule fois par
  // navigateur : reposer la question tous les quinze dilemmes serait du
  // harcelement, pas une invitation.
  DilemmeGame.prototype.inviteAvis = function () {
    if (this.historique.length !== DIL_VOTES_AVANT_AVIS) return null;
    try {
      if (localStorage.getItem(DIL_CLE_AVIS)) return null;
      localStorage.setItem(DIL_CLE_AVIS, '1');
    } catch (e) { /* navigation privee : on montre l'invitation quand meme */ }
    // Le bloc n'affiche que son titre et son texte : la rangee d'etoiles y est
    // greffee par quiz-extras, qui sait deja pre-remplir le formulaire d'avis
    // de la page et y faire descendre.
    var boite = el('div', 'qr-invite dil-invite');
    boite.appendChild(el('p', 'dil-invite-titre',
      esc(this.tg('inviteAvisTitre', 'Déjà 15 dilemmes tranchés à deux 👏'))));
    boite.appendChild(el('p', 'dil-invite-texte',
      esc(this.tg('inviteAvisTexte', 'Vous vous amusez ? Dites-le en une seconde, ça nous aide énormément.'))));
    return boite;
  };

  DilemmeGame.prototype.suivant = function () {
    if (this.idx + 1 >= this.dilemmes.length) { this.phase = 'fin'; this.render(); return; }
    this.idx++;
    this.choix = null;
    this.phase = 'vote';
    this.render();
    smoothScroll(this.container, 'start');
  };

  // Le bilan porte sur tous les votes enregistres par ce navigateur, pas sur
  // la seule session en cours : quelqu'un qui revient finir les derniers
  // dilemmes verrait sinon « 1 OK sur 1 », et n'aurait jamais les
  // felicitations puisqu'il n'en aurait tranche qu'un aujourd'hui.
  DilemmeGame.prototype.bilan = function () {
    var self = this, n = 0, oks = 0;
    this.dilemmes.forEach(function (d) {
      var v = self.dejaVotes[d.id];
      if (!v) return;
      n++;
      if (v === DIL_OK) oks++;
    });
    return { n: n, oks: oks, pct: n ? Math.round((oks / n) * 100) : 0 };
  };

  DilemmeGame.prototype.renderFin = function () {
    var self = this;
    var b = this.bilan();
    var n = b.n, oks = b.oks, pct = b.pct;
    var palier = pct >= 75 ? 4 : pct >= 50 ? 3 : pct >= 25 ? 2 : 1;

    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var resultat = el('div', 'quiz-reveal-enter');
    var entete = el('div', 'qr-entete');
    var anneau = el('div', 'qr-score');
    anneau.innerHTML = renderScoreRing(pct);
    entete.appendChild(anneau);
    entete.appendChild(el('p', 'qr-score-label',
      esc(this.tg('bilanDetail', '{{ok}} OK sur {{n}} dilemmes tranchés')
        .replace('{{ok}}', oks).replace('{{n}}', n))));
    resultat.appendChild(entete);

    // Etre alle au bout des cent merite d'etre dit, et c'est le seul moment
    // ou le nombre total a un sens : pendant la partie, personne ne joue pour
    // atteindre un compteur.
    var toutFait = n >= this.dilemmes.length;
    if (toutFait) {
      var bravo = el('div', 'dil-bravo');
      bravo.appendChild(el('span', 'dil-bravo-emoji', '🎉'));
      bravo.appendChild(el('p', 'dil-bravo-titre', esc(this.tg('bravoTitre', 'Bravo, et merci !'))));
      bravo.appendChild(el('p', 'dil-bravo-texte',
        esc(this.tg('bravoTexte', 'Vous avez répondu à tous les dilemmes. Vos votes comptent maintenant dans les pourcentages que verront les prochains couples.'))));
      var urlWyr = getRelatedQuizUrl('quizTuPreferes', this.lang);
      if (urlWyr && urlWyr !== '/') {
        var lien = el('a', 'btn btn-outline dil-bravo-suite', esc(this.tg('bravoSuite', 'Essayez le tu préfères')));
        lien.href = urlWyr;
        bravo.appendChild(lien);
      }
      resultat.appendChild(bravo);
    }

    resultat.appendChild(el('h3', 'qr-title', esc(this.tg('palier' + palier + 'Titre', ''))));
    resultat.appendChild(el('p', 'qr-desc', esc(this.tg('palier' + palier + 'Texte', ''))));

    var avis = el('div', 'quiz-reveal-enter');
    avis.appendChild(pcReviewForm(this.lang));
    var quizEl = document.getElementById('quiz-engine') || document.querySelector('[data-quiz]');
    var suite = el('div', 'qr-right quiz-reveal-enter');
    renderRelatedQuizzes(suite, quizEl ? quizEl.dataset.quiz : '', this.lang);

    dispositionResultat(wrap, {
      resultat: resultat,
      actions: zoneActions({
        share: { type: 'solo', score: oks, total: n, pct: pct, verdict: this.tg('palier' + palier + 'Titre', '') },
        restart: function () {
          self.dilemmes = shuffleArray(self.dilemmes);
          self.idx = 0; self.choix = null; self.historique = [];
          self.phase = 'intro'; self.render(); smoothScroll(self.container, 'start');
        }
      }),
      avis: avis,
      suite: suite
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // ═══════════════════════════════════════════════════════════
  // POUR OU CONTRE
  //
  // Une proposition par carte, le couple tranche ensemble, et decouvre juste
  // apres combien de couples ont dit pour et combien ont dit contre.
  //
  // A ne pas confondre avec les dilemmes, qui posent un marche en deux temps
  // (« vous gagnez ceci MAIS vous perdez cela ») : ici la proposition tient en
  // une ligne, et il n'y a rien a mettre en balance a part son propre avis.
  // Les deux jeux partagent l'infrastructure de vote, pas leurs donnees.
  // ═══════════════════════════════════════════════════════════
  var PC_POUR = 'pour', PC_CONTRE = 'contre';
  var PC_CLE_VOTES = 'pour-contre-votes';

  function PourContreGame(config) {
    this.container = config.container;
    this.questions = shuffleArray(config.questions.slice());
    this.lang = config.lang || 'fr';
    this.idx = 0;
    this.choix = null;
    this.envoiEnCours = false;
    this.historique = [];
    this.totaux = null;         // comptes de toutes les cartes, charges une fois
    this.dejaVotes = lireVotesLocaux(PC_CLE_VOTES);
    this.phase = 'intro';
    this.render();
  }

  PourContreGame.prototype.render = function () {
    this.container.innerHTML = '';
    if (this.phase === 'intro') this.renderIntro();
    else if (this.phase === 'vote') this.renderVote();
    else if (this.phase === 'resultat') this.renderResultat();
    else if (this.phase === 'fin') this.renderFin();
  };

  PourContreGame.prototype.tg = function (cle, repli) { return tg('pourContre.' + cle, repli); };

  PourContreGame.prototype.renderIntro = function () {
    var self = this;
    var ecran = ecranDepart({
      icone: '👍',
      titre: this.tg('introTitre', 'Pour ou contre ?'),
      desc: this.tg('introTexte', 'Une proposition à la fois. Répondez ensemble, puis voyez ce que les autres couples en pensent.'),
      meta: '🗳️ ' + this.questions.length + ' ' + this.tg('metaQuestions', 'propositions') +
        ' &bull; ⏱ ' + this.tg('metaDuree', 'sans limite'),
      bouton: this.tg('commencer', 'Première proposition'),
      onStart: function () { self.phase = 'vote'; self.render(); }
    });
    this.container.appendChild(ecran.wrap);
    // Les totaux servent a afficher les deux camps sans attendre apres chaque
    // vote : on les charge une seule fois, pendant que l'ecran d'intro est la.
    this.chargerTotaux();
  };

  PourContreGame.prototype.chargerTotaux = function () {
    var self = this;
    if (this._chargement) return this._chargement;
    this._chargement = fetch(SUPABASE_URL + '/rest/v1/rpc/get_pour_contre_counts', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: '{}'
    })
      .then(function (r) { return r.json(); })
      .then(function (lignes) {
        var t = {};
        if (Array.isArray(lignes)) {
          lignes.forEach(function (l) {
            t[l.question_id] = { pour: +l.pour || 0, contre: +l.contre || 0 };
          });
        }
        self.totaux = t;
        return t;
      })
      .catch(function () { self.totaux = {}; return {}; });
    return this._chargement;
  };

  PourContreGame.prototype.questionCourante = function () { return this.questions[this.idx]; };

  // La carte, identique sur l'ecran de vote et sur celui du resultat : le
  // theme en petit, « Pour ou contre » en amorce, puis la proposition. Le
  // « pour ou contre » n'est pas dans les donnees, il serait recopie soixante
  // fois par langue pour rien.
  PourContreGame.prototype.carte = function (q) {
    var c = el('div', 'pc-carte');
    if (q.theme) c.appendChild(el('span', 'pc-theme', esc(q.theme)));
    c.appendChild(el('span', 'pc-amorce', esc(this.tg('amorce', 'Pour ou contre'))));
    c.appendChild(el('p', 'pc-texte', esc(q.texte)));
    return c;
  };

  PourContreGame.prototype.renderVote = function () {
    var self = this;
    var q = this.questionCourante();

    // Une proposition deja tranchee depuis ce navigateur : on montre
    // directement le resultat plutot que de laisser voter une deuxieme fois.
    if (this.dejaVotes[q.id]) {
      this.choix = this.dejaVotes[q.id];
      this.phase = 'resultat';
      this.render();
      return;
    }

    var wrap = el('div', 'quiz-engine pc-jeu quiz-question-enter');
    wrap.appendChild(this.carte(q));
    wrap.appendChild(el('p', 'pc-consigne', esc(this.tg('consigne', 'Décidez ensemble, à voix haute.'))));

    var choix = el('div', 'pc-choix');
    [[PC_POUR, this.tg('pour', 'POUR'), '👍'], [PC_CONTRE, this.tg('contre', 'CONTRE'), '👎']].forEach(function (c) {
      var b = el('button', 'pc-choix-btn pc-choix-btn--' + c[0]);
      b.type = 'button';
      b.innerHTML = '<span class="pc-choix-emoji">' + c[2] + '</span><span class="pc-choix-txt">' + esc(c[1]) + '</span>';
      b.addEventListener('click', function () { self.voter(c[0], b); });
      choix.appendChild(b);
    });
    wrap.appendChild(choix);

    var passer = el('button', 'pc-passer', esc(this.tg('passer', 'Passer cette proposition')));
    passer.type = 'button';
    passer.addEventListener('click', function () { self.suivant(); });
    wrap.appendChild(passer);

    this.container.appendChild(wrap);
  };

  PourContreGame.prototype.voter = function (choix, bouton) {
    var self = this;
    if (this.envoiEnCours) return;
    this.envoiEnCours = true;
    var q = this.questionCourante();
    if (bouton) bouton.classList.add('est-choisi');
    this.choix = choix;
    this.historique.push({ id: q.id, choix: choix });
    ecrireVoteLocal(PC_CLE_VOTES, q.id, choix);
    this.dejaVotes[q.id] = choix;

    // On compte le vote localement tout de suite : l'ecran de resultat ne doit
    // pas attendre le reseau, et un envoi qui echoue ne doit pas bloquer le jeu.
    if (!this.totaux) this.totaux = {};
    if (!this.totaux[q.id]) this.totaux[q.id] = { pour: 0, contre: 0 };
    this.totaux[q.id][choix]++;

    identifiantVotant('pour-contre-votant', 'quiz-couple-pour-contre:').then(function (votant) {
      return fetch(SUPABASE_URL + '/rest/v1/pour_contre_votes', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json', 'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ question_id: q.id, choix: choix, lang: self.lang, votant: votant })
      });
    }).catch(function () {});

    setTimeout(function () {
      self.envoiEnCours = false;
      self.phase = 'resultat';
      self.render();
    }, 320);
  };

  PourContreGame.prototype.renderResultat = function () {
    var self = this;
    var q = this.questionCourante();
    var c = (this.totaux && this.totaux[q.id]) || { pour: 0, contre: 0 };
    var total = c.pour + c.contre;
    // Sans aucun vote connu, le sien compte quand meme : la barre ne doit
    // jamais s'afficher vide sous les yeux de celui qui vient de voter.
    if (total === 0) { c = { pour: this.choix === PC_POUR ? 1 : 0, contre: this.choix === PC_CONTRE ? 1 : 0 }; total = 1; }
    var pctPour = Math.round((c.pour / total) * 100);
    var pctContre = 100 - pctPour;

    var wrap = el('div', 'quiz-engine pc-jeu pc-jeu--resultat quiz-question-enter');
    wrap.appendChild(this.carte(q));

    // La phrase entiere vient de la traduction : l'espace avant le deux-points
    // est une regle francaise, l'anglais, l'espagnol, l'allemand et l'italien
    // ne la suivent pas et recollaient un espace en trop.
    wrap.appendChild(el('p', 'pc-votre-choix',
      esc(this.tg('votreReponse', 'Votre réponse : {{r}}'))
        .replace('{{r}}', '<strong>' + esc(this.choix === PC_POUR ? this.tg('pour', 'POUR') : this.tg('contre', 'CONTRE')) + '</strong>')));

    var duo = blocDeuxCamps({
      prefixe: 'pc', lang: this.lang,
      voix: this.tg('voix', 'voix'), voix1: this.tg('voix1', 'voix'),
      a: { suffixe: 'pour', emoji: '👍', libelle: this.tg('pour', 'POUR'),
           pct: pctPour, voix: c.pour, sien: this.choix === PC_POUR },
      b: { suffixe: 'contre', emoji: '👎', libelle: this.tg('contre', 'CONTRE'),
           pct: pctContre, voix: c.contre, sien: this.choix === PC_CONTRE }
    });
    wrap.appendChild(duo.camps);
    wrap.appendChild(duo.barre);

    // Un seul votant, c'est le sien : la phrase doit rester au singulier.
    var phraseTotal = total === 1
      ? this.tg('surTotal1', 'Vous êtes le premier couple à trancher cette proposition')
      : this.tg('surTotal', '{{n}} couples ont tranché cette proposition').replace('{{n}}', fmtNombre(total, this.lang));
    wrap.appendChild(el('p', 'pc-total', esc(phraseTotal)));

    var suite = el('div', 'pc-suite');
    var dernier = this.idx + 1 >= this.questions.length;
    var suivant = el('button', 'btn btn-cta pc-suivant',
      esc(dernier ? this.tg('voirBilan', 'Voir notre bilan') : this.tg('suivant', 'Proposition suivante')));
    suivant.type = 'button';
    suivant.addEventListener('click', function () { self.suivant(); });
    suite.appendChild(suivant);
    if (this.historique.length >= 3 && !dernier) {
      var arret = el('button', 'pc-arret', esc(this.tg('arreter', 'Arrêter et voir notre bilan')));
      arret.type = 'button';
      arret.addEventListener('click', function () { self.phase = 'fin'; self.render(); });
      suite.appendChild(arret);
    }
    wrap.appendChild(suite);

    this.container.appendChild(wrap);
  };

  PourContreGame.prototype.suivant = function () {
    if (this.idx + 1 >= this.questions.length) { this.phase = 'fin'; this.render(); return; }
    this.idx++;
    this.choix = null;
    this.phase = 'vote';
    this.render();
    smoothScroll(this.container, 'start');
  };

  // Le bilan porte sur tous les votes enregistres par ce navigateur, pas sur
  // la seule session en cours : quelqu'un qui revient finir les dernieres
  // propositions verrait sinon « 1 POUR sur 1 ».
  PourContreGame.prototype.bilan = function () {
    var self = this, n = 0, pours = 0;
    this.questions.forEach(function (q) {
      var v = self.dejaVotes[q.id];
      if (!v) return;
      n++;
      if (v === PC_POUR) pours++;
    });
    return { n: n, pours: pours, pct: n ? Math.round((pours / n) * 100) : 0 };
  };

  PourContreGame.prototype.renderFin = function () {
    var self = this;
    var b = this.bilan();
    var n = b.n, pours = b.pours, pct = b.pct;
    var palier = pct >= 75 ? 4 : pct >= 50 ? 3 : pct >= 25 ? 2 : 1;

    var wrap = el('div', 'quiz-engine quiz-result-card text-center');
    var resultat = el('div', 'quiz-reveal-enter');
    var entete = el('div', 'qr-entete');
    var anneau = el('div', 'qr-score');
    anneau.innerHTML = renderScoreRing(pct);
    entete.appendChild(anneau);
    entete.appendChild(el('p', 'qr-score-label',
      esc(this.tg('bilanDetail', '{{pour}} POUR sur {{n}} propositions tranchées')
        .replace('{{pour}}', pours).replace('{{n}}', n))));
    resultat.appendChild(entete);

    // Etre alle au bout des soixante merite d'etre dit, et c'est le seul
    // moment ou le nombre total a un sens : pendant la partie, personne ne
    // joue pour atteindre un compteur.
    var toutFait = n >= this.questions.length;
    if (toutFait) {
      var bravo = el('div', 'pc-bravo');
      bravo.appendChild(el('span', 'pc-bravo-emoji', '🎉'));
      bravo.appendChild(el('p', 'pc-bravo-titre', esc(this.tg('bravoTitre', 'Bravo, et merci !'))));
      bravo.appendChild(el('p', 'pc-bravo-texte',
        esc(this.tg('bravoTexte', 'Vous avez tranché toutes les propositions. Vos votes comptent maintenant dans les pourcentages que verront les prochains couples.'))));
      var urlSuite = getRelatedQuizUrl('jeuDilemmes', this.lang);
      if (urlSuite && urlSuite !== '/') {
        var lien = el('a', 'btn btn-outline pc-bravo-suite', esc(this.tg('bravoSuite', 'Enchaînez sur les dilemmes')));
        lien.href = urlSuite;
        bravo.appendChild(lien);
      }
      resultat.appendChild(bravo);
    }

    resultat.appendChild(el('h3', 'qr-title', esc(this.tg('palier' + palier + 'Titre', ''))));
    resultat.appendChild(el('p', 'qr-desc', esc(this.tg('palier' + palier + 'Texte', ''))));

    var avis = el('div', 'quiz-reveal-enter');
    avis.appendChild(pcReviewForm(this.lang));
    var quizEl = document.getElementById('quiz-engine') || document.querySelector('[data-quiz]');
    var apres = el('div', 'qr-right quiz-reveal-enter');
    renderRelatedQuizzes(apres, quizEl ? quizEl.dataset.quiz : '', this.lang);

    dispositionResultat(wrap, {
      resultat: resultat,
      actions: zoneActions({
        share: { type: 'solo', score: pours, total: n, pct: pct, verdict: this.tg('palier' + palier + 'Titre', '') },
        restart: function () {
          self.questions = shuffleArray(self.questions);
          self.idx = 0; self.choix = null; self.historique = [];
          self.phase = 'intro'; self.render(); smoothScroll(self.container, 'start');
        }
      }),
      avis: avis,
      suite: apres
    });
    this.container.appendChild(wrap);
    smoothScroll(wrap, 'center');
  };

  // Un nombre lisible : 1 240 plutot que 1240.
  function fmtNombre(n, lang) {
    try { return Number(n).toLocaleString(lang === 'en' ? 'en-US' : lang); }
    catch (e) { return String(n); }
  }

  // ─── Public API ───────────────────────────────────────────
  return {
    loadTranslations: loadTranslations,
    loadAllTranslations: loadAllTranslations,
    tgd: tgd,
    tg: tg,
    SoloTest: SoloTest,
    DuoMatchQuiz: DuoMatchQuiz,
    CoquinQuiz: CoquinQuiz,
    KnowledgeQuiz: KnowledgeQuiz,
    FunnyQuiz: FunnyQuiz,
    MostQuiz: MostQuiz,
    HealthyQuiz: HealthyQuiz,
    ParentaliteQuiz: ParentaliteQuiz,
    TruefalseQuiz: TruefalseQuiz,
    ProfileQuiz: ProfileQuiz,
    PiliersQuiz: PiliersQuiz,
    ChargeMentaleQuiz: ChargeMentaleQuiz,
    ZamoursQuiz: ZamoursQuiz,
    TentationQuiz: TentationQuiz,
    PartyGame: PartyGame,
    WheelGame: WheelGame,
    BoardGame: BoardGame,
    DuoVoteGame: DuoVoteGame,
    DilemmeGame: DilemmeGame,
    PourContreGame: PourContreGame,
    el: el,
    esc: esc,
    shuffleArray: shuffleArray,
    tirageStratifieSain: tirageStratifieSain,
    tirageStratifieTester: tirageStratifieTester,
    // Expose pour les tests solo qui piochent dans un pool plus grand que ce
    // qu'ils posent : sans stratification, deux personnes ne repondent pas aux
    // memes dimensions et ne mesurent donc pas la meme chose.
    tirageStratifie: tirageStratifie,
    // Exposé pour les moteurs écrits directement dans un gabarit de page,
    // qui doivent partager le même bouton et le même message que les autres.
    renderShareButton: renderShareButton,
    // Exposé pour le chargeur, qui pose l'écran de choix avant de savoir quel
    // moteur il va instancier.
    ecranModes: ecranModes,
    // Exposé pour les moteurs écrits dans un gabarit de page, qui doivent
    // annoncer le changement de joueur exactement comme les autres.
    relaisJoueur: relaisJoueur,
    SUPABASE_URL: SUPABASE_URL,
    SUPABASE_KEY: SUPABASE_KEY,
  };
})();
