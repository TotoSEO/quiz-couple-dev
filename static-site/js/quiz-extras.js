/**
 * Quiz extras : compteur "realise X fois" (bulle sous le fil d'Ariane),
 * suivi des completions, et bloc avis par quiz (liste + formulaire).
 * Degrade proprement si Supabase est injoignable.
 */
(function () {
  'use strict';

  var cfg = document.getElementById('reviews-config');
  if (!cfg) return;
  var URL = cfg.dataset.url, KEY = cfg.dataset.key;
  if (!URL || !KEY) return;

  var lang = document.documentElement.lang || 'fr';
  var H = { apikey: KEY, 'Authorization': 'Bearer ' + KEY };
  var HJ = { apikey: KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' };

  var UI = {
    fr: { rate: 'Votre avis en 1 clic', more: "Plus que votre / vos prénom(s), et c'est en ligne !", name: 'Votre prénom (ou vos prénoms)', comment: 'Un mot sur votre expérience (optionnel)', submit: 'Publier mon avis', thanks: 'Merci ! Votre avis sera visible après validation.', err: 'Une erreur est survenue, réessayez.', none: 'Soyez les premiers à donner votre avis !', based: 'avis', doneTest: 'Ce test a déjà été réalisé {n} fois', doneQuiz: 'Ce quiz a déjà été joué {n} fois', doneGame: 'Ce jeu a déjà été joué {n} fois', votesTotal: '{n} votes déposés sur ces dilemmes', votesTotalPC: '{n} votes déposés sur ces propositions', votesTotalON: '{n} oui/non répondus sur ces situations' },
    en: { rate: 'Your review in 1 click', more: 'Just your first name(s), and it goes live!', name: 'Your first name(s)', comment: 'A word about your experience (optional)', submit: 'Post my review', thanks: 'Thanks! Your review will show after moderation.', err: 'Something went wrong, please retry.', none: 'Be the first to leave a review!', based: 'reviews', doneTest: 'This test has been taken {n} times', doneQuiz: 'This quiz has been played {n} times', doneGame: 'This game has been played {n} times', votesTotal: '{n} votes cast on these dilemmas', votesTotalPC: '{n} votes cast on these statements', votesTotalON: '{n} yes/no answered on these situations' },
    es: { rate: 'Tu opinión en 1 clic', more: '¡Solo tu(s) nombre(s) y se publica!', name: 'Tu nombre (o nombres)', comment: 'Unas palabras sobre tu experiencia (opcional)', submit: 'Publicar mi opinión', thanks: '¡Gracias! Tu opinión se verá tras la validación.', err: 'Ha ocurrido un error, inténtalo de nuevo.', none: '¡Sé el primero en opinar!', based: 'opiniones', doneTest: 'Este test se ha realizado {n} veces', doneQuiz: 'Este quiz se ha jugado {n} veces', doneGame: 'Este juego se ha jugado {n} veces', votesTotal: '{n} votos emitidos en estos dilemas', votesTotalPC: '{n} votos emitidos en estas propuestas', votesTotalON: '{n} sí/no respondidos en estas situaciones' },
    de: { rate: 'Deine Bewertung in 1 Klick', more: 'Nur noch dein(e) Vorname(n), dann ist sie online!', name: 'Dein Vorname (oder Vornamen)', comment: 'Ein Wort zu deiner Erfahrung (optional)', submit: 'Bewertung veröffentlichen', thanks: 'Danke! Deine Bewertung erscheint nach der Prüfung.', err: 'Ein Fehler ist aufgetreten, bitte erneut versuchen.', none: 'Sei der Erste mit einer Bewertung!', based: 'Bewertungen', doneTest: 'Dieser Test wurde {n} mal gemacht', doneQuiz: 'Dieses Quiz wurde {n} mal gespielt', doneGame: 'Dieses Spiel wurde {n} mal gespielt', votesTotal: '{n} abgegebene Stimmen zu diesen Dilemmata', votesTotalPC: '{n} abgegebene Stimmen zu diesen Aussagen', votesTotalON: '{n} Ja/Nein-Antworten zu diesen Situationen' },
    it: { rate: 'La tua opinione in 1 clic', more: 'Solo il tuo/i vostri nome(i) e va online!', name: 'Il tuo nome (o i vostri nomi)', comment: 'Una parola sulla tua esperienza (facoltativo)', submit: 'Pubblica la mia recensione', thanks: 'Grazie! La recensione sarà visibile dopo la moderazione.', err: 'Si è verificato un errore, riprova.', none: 'Sii il primo a lasciare una recensione!', based: 'recensioni', doneTest: 'Questo test è stato fatto {n} volte', doneQuiz: 'Questo quiz è stato giocato {n} volte', doneGame: 'Questo gioco è stato giocato {n} volte', votesTotal: '{n} voti espressi su questi dilemmi', votesTotalPC: '{n} voti espressi su queste proposte', votesTotalON: '{n} sì/no dati su queste situazioni' }
  };
  var t = UI[lang] || UI.fr;
  function fmt(n) { try { return Number(n).toLocaleString(lang); } catch (e) { return '' + n; } }
  function esc(s) { return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }
  function stars(r) { var h = ''; for (var i = 1; i <= 5; i++) h += '<svg viewBox="0 0 24 24" class="pqx-star ' + (i <= r ? 'on' : '') + '"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'; return h; }

  // ── Bulle "realise X fois" juste sous le fil d'Ariane ──
  // Les dilemmes ne comptent pas des parties mais des votes : une partie
  // peut en valoir trois comme cent, et c'est le total des votes qui a un
  // sens sur cette page. Ils ont donc leur propre compteur.
  // Idem pour le pour ou contre : une partie peut valoir trois votes comme
  // soixante, et il faut aller jusqu'au bilan pour qu'elle soit comptée.
  // Le compteur générique restait donc à zéro alors que les votes, eux,
  // partaient bien en base.
  // Le oui-non n'a pas de fonction de total dédiée : on somme les deux camps
  // de toutes les situations, la même réponse que le moteur charge déjà.
  var COMPTEURS_DE_VOTES = {
    jeuDilemmes: { rpc: 'get_dilemme_total', libelle: 'votesTotal' },
    pourContre:  { rpc: 'get_pour_contre_total', libelle: 'votesTotalPC' },
    jeuOuiNon:   { rpc: 'get_oui_non_counts', libelle: 'votesTotalON', somme: true }
  };

  // Le chiffre n'était lu qu'au chargement de la page. Sur un test qui vient
  // d'ouvrir, la bulle est donc restée cachée pendant toute la partie, et
  // finir le test ne la faisait pas apparaître : il fallait recharger pour
  // voir « réalisé 1 fois ». La lecture est isolée ici pour être rejouée à la
  // fin de la partie, une fois la ligne enregistrée.
  function litCompteur(slug, genre) {
    var bubble = document.getElementById('quiz-count-bubble');
    if (!bubble) return;
    function pose(texte) {
      bubble.querySelector('.qcb-text').textContent = texte;
      bubble.style.display = '';
    }
    var cv = COMPTEURS_DE_VOTES[slug];
    if (cv) {
      fetch(URL + '/rest/v1/rpc/' + cv.rpc, { method: 'POST', headers: HJ, body: '{}' })
        .then(function (r) { return r.json(); })
        .then(function (n) {
          if (cv.somme) {
            var total = 0;
            if (Array.isArray(n)) n.forEach(function (l) { total += (+l.oui || 0) + (+l.non || 0); });
            n = total;
          }
          n = +n || 0;
          if (n > 0) pose(t[cv.libelle].replace('{n}', fmt(n)));
        })
        .catch(function () {});
      return;
    }
    fetch(URL + '/rest/v1/rpc/get_quiz_counts', { method: 'POST', headers: HJ, body: '{}' })
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        if (!Array.isArray(rows)) return;
        var row = rows.filter(function (x) { return x.quiz_slug === slug; })[0];
        var n = row ? +row.total : 0;
        var phrase = genre === 'jeu' ? t.doneGame : genre === 'quiz' ? t.doneQuiz : t.doneTest;
        if (n > 0) pose(phrase.replace('{n}', fmt(n)));
      })
      .catch(function () {});
  }

  function countBubble(slug, genre) {
    var bc = document.querySelector('.breadcrumb');
    if (!bc || document.getElementById('quiz-count-bubble')) return;
    var bubble = document.createElement('div');
    bubble.id = 'quiz-count-bubble';
    bubble.className = 'quiz-count-bubble';
    bubble.style.display = 'none';
    bubble.innerHTML = '<span class="qcb-dot"></span><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7-4-9.5-8.5C.8 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.4C10.8 6.7 12 5.5 14 5.5c3.5 0 5.2 3.5 3.5 7C19.5 17 12 21 12 21z"/></svg><span class="qcb-text"></span>';
    // Place the badge on its own line just under the hero intro paragraph
    // (left-aligned), instead of right under the breadcrumb.
    var heroBlock = bc.parentNode;
    var paras = heroBlock ? heroBlock.querySelectorAll('p') : null;
    var anchor = (paras && paras.length) ? paras[paras.length - 1] : bc;
    anchor.parentNode.insertBefore(bubble, anchor.nextSibling);
    litCompteur(slug, genre);
  }

  // ── Envoi d'un evenement de partie ──────────────────────────────────
  // Le numero de visite vient de audience.js : sans lui, l'entonnoir du
  // tableau de bord rapproche des totaux calcules separement et peut annoncer
  // plus de lancements que de vues. Avec lui, les trois nombres portent sur
  // les memes visites.
  //
  // Le repli sans visite_id n'est pas de la coquetterie : si le site est
  // deploye avant que la migration qui cree la colonne soit passee, PostgREST
  // rejette la ligne entiere et on perd la mesure au lieu de perdre un champ.
  // On renvoie alors la ligne telle qu'elle etait avant.
  function envoiePartie(table, corps) {
    var visite = null;
    try { visite = window.QCAudience && window.QCAudience.visite(); } catch (e) {}
    // Exclusion demandee par le proprietaire du site : rien ne part, ni la
    // page vue, ni le lancement, ni la partie terminee.
    try { if (window.QCAudience && window.QCAudience.exclu()) return; } catch (e) {}
    var avec = visite ? Object.assign({}, corps, { visite_id: visite }) : corps;
    function poste(donnees) {
      return fetch(URL + '/rest/v1/' + table, {
        method: 'POST',
        keepalive: true,
        headers: Object.assign({ 'Prefer': 'return=minimal' }, HJ),
        body: JSON.stringify(donnees)
      });
    }
    // Un refus de la base passait totalement inapercu : la mesure disparaissait
    // sans que rien ne le signale. C'est ainsi qu'une page a pu accumuler des
    // lancements sans une seule partie terminee, alors que le navigateur
    // envoyait bien la ligne. On retente sans le numero de visite, puis on dit
    // en clair ce qui a ete refuse, avec la reponse de PostgREST : ouvrir la
    // console sur la page suffit alors a lire la cause.
    poste(avec).then(function (r) {
      if (r.ok) return null;
      if (visite) return poste(corps).then(function (r2) { return r2.ok ? null : r2; });
      return r;
    }).then(function (echec) {
      if (!echec) return;
      return echec.text().then(function (txt) {
        console.warn('[quiz-couple] ' + table + ' refuse (' + echec.status + ') : ' + txt);
      });
    }).catch(function () {});
  }

  // ── Suivi des completions (une fois par session/quiz) ──
  // On observait #quiz-engine, que trois pages n'ont pas : leur moteur est
  // ecrit dans leur propre gabarit, avec un conteneur a elles. Elles ne
  // remontaient donc aucune partie. On observe maintenant le document entier.
  //
  // Deux precautions vont avec. D'abord la visibilite : la page prenom+signe
  // porte sa carte de resultat dans le HTML, masquee jusqu'au calcul, et la
  // compter au chargement inventerait une partie a chaque visite. Ensuite
  // data-quiz-done, pour les fins de partie qui n'ont pas de carte de
  // resultat (la roue, l'ado, tu preferes, les langages de l'amour) : leur
  // ecran final est trop different pour porter le style de .quiz-result-card.
  function watch(slug, genre) {
    var key = 'qc-done-' + slug;
    function visible(n) { return !!(n && (n.offsetWidth || n.offsetHeight || n.getClientRects().length)); }
    function fini() {
      // querySelector ne rend que la premiere carte : une carte cachee placee
      // avant la vraie suffirait a masquer la fin de partie. On les passe
      // toutes en revue.
      var n = document.querySelectorAll('.quiz-result-card, [data-quiz-done]');
      for (var i = 0; i < n.length; i++) if (visible(n[i])) return true;
      return false;
    }
    function check() {
      if (sessionStorage.getItem(key) || !fini()) return;
      try { sessionStorage.setItem(key, '1'); } catch (e) {}
      envoiePartie('quiz_completions', { quiz_slug: slug, lang: lang });
      // La ligne vient de partir : on relit le total pour que la bulle se
      // mette a jour sans rechargement. Le delai laisse la base la valider.
      setTimeout(function () { litCompteur(slug, genre); }, 1200);
    }
    check();
    new MutationObserver(check).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'data-quiz-done'] });
  }

  // ── Suivi des lancements (une fois par session/quiz) ──
  // Une visite n'est pas un lancement. Quelqu'un qui lit la page et repart
  // sans rien toucher n'a pas commence le test, et le compter fausserait le
  // taux de finition dans l'autre sens. Le signal retenu est donc la
  // premiere interaction reelle a l'interieur du moteur : un clic, un appui,
  // une frappe au clavier pour saisir un prenom.
  //
  // Il n'existe pas d'ecran de depart commun aux trente moteurs du site, et
  // pas non plus de conteneur unique : la plupart montent dans #quiz-engine,
  // mais quatre moteurs autonomes ont leur propre racine. On les nomme ici
  // plutot que d'ecouter le document entier, sinon un clic sur le bandeau
  // cookies ou sur la FAQ passerait pour un lancement.
  var RACINES_MOTEUR = '#quiz-engine, [data-quiz], #astro-form, #dn-outil, #vacances-racine';

  function watchStart(slug) {
    var cle = 'qc-start-' + slug;
    try { if (sessionStorage.getItem(cle)) return; } catch (e) {}

    var envoye = false;
    function lance(e) {
      if (envoye) return;
      // closest remonte depuis la cible : un clic sur le libelle d'un bouton
      // compte autant qu'un clic sur le bouton lui-meme.
      var dans = e.target && e.target.closest && e.target.closest(RACINES_MOTEUR);
      if (!dans) return;
      envoye = true;
      document.removeEventListener('pointerdown', lance, true);
      document.removeEventListener('keydown', lance, true);
      try { sessionStorage.setItem(cle, '1'); } catch (err) {}
      envoiePartie('quiz_starts', { quiz_slug: slug, lang: lang });
    }
    // En capture : un moteur qui arrete la propagation sur ses propres
    // boutons ne doit pas rendre le lancement invisible.
    document.addEventListener('pointerdown', lance, true);
    document.addEventListener('keydown', lance, true);
  }

  // ── Bloc avis par quiz (liste + formulaire progressif) ──
  function initReviews(slug) {
    var root = document.getElementById('pq-reviews');
    if (!root) return;
    var listEl = root.querySelector('.pqx-list');
    var aggEl = root.querySelector('.pqx-agg');
    var ratePrompt = root.querySelector('.pqx-rate-prompt'); if (ratePrompt && !ratePrompt.textContent) ratePrompt.textContent = t.rate;
    var moreMsg = root.querySelector('.pqx-more-msg'); if (moreMsg) moreMsg.textContent = t.more;
    var nameI = root.querySelector('.pqx-name'); if (nameI) nameI.placeholder = t.name;
    var commentI = root.querySelector('.pqx-comment'); if (commentI) commentI.placeholder = t.comment;
    var submitB = root.querySelector('.pqx-submit'); if (submitB) submitB.textContent = t.submit;

    // Comme sur la page d'accueil, le compte et la moyenne ne peuvent pas se
    // deduire des douze avis affiches : le compteur resterait bloque a douze
    // des que le quiz depasse ce nombre. On demande donc a part la colonne
    // note pour tous les avis de ce quiz, avec le total exact renvoye par
    // PostgREST dans l'en-tete Content-Range.
    var stats = fetch(URL + '/rest/v1/reviews?select=rating&is_approved=eq.true&quiz_slug=eq.' + encodeURIComponent(slug) + '&limit=1000',
      { headers: { apikey: KEY, 'Authorization': 'Bearer ' + KEY, 'Prefer': 'count=exact' } })
      .then(function (r) {
        var plage = r.headers.get('Content-Range') || '';
        var exact = parseInt((plage.split('/')[1] || ''), 10);
        return r.json().then(function (notes) {
          if (!Array.isArray(notes) || notes.length === 0) return null;
          var s = 0; notes.forEach(function (n) { s += n.rating || 0; });
          return { total: isNaN(exact) ? notes.length : exact, avg: (s / notes.length).toFixed(1) };
        });
      }).catch(function () { return null; });

    fetch(URL + '/rest/v1/reviews?select=author_name,rating,comment,created_at&is_approved=eq.true&quiz_slug=eq.' + encodeURIComponent(slug) + '&order=created_at.desc&limit=12', { headers: H })
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        if (!Array.isArray(rows) || rows.length === 0) { if (listEl) listEl.innerHTML = '<p class="pqx-none">' + t.none + '</p>'; return; }
        stats.then(function (s) {
          if (!s) {
            var sum = 0; rows.forEach(function (x) { sum += x.rating || 0; });
            s = { total: rows.length, avg: (sum / rows.length).toFixed(1) };
          }
          if (aggEl) aggEl.innerHTML = '<span class="pqx-avg">' + s.avg + '</span><span class="pqx-stars">' + stars(Math.round(s.avg)) + '</span><span class="pqx-count">' + s.total + ' ' + t.based + '</span>';
        });
        if (listEl) listEl.innerHTML = rows.map(function (x) { return '<div class="pqx-card"><div class="pqx-card-top"><b>' + esc(x.author_name) + '</b><span class="pqx-stars">' + stars(x.rating) + '</span></div>' + (x.comment ? '<p>' + esc(x.comment) + '</p>' : '') + '</div>'; }).join('');
      })
      .catch(function () { if (listEl) listEl.innerHTML = ''; });

    var rating = 0;
    var starBtns = root.querySelectorAll('.pqx-input-stars [data-star]');
    var starsWrap = root.querySelector('.pqx-input-stars');
    var more = root.querySelector('.pqx-more');
    function paint(n) { starBtns.forEach(function (x) { x.classList.toggle('on', +x.dataset.star <= n); }); }
    starBtns.forEach(function (b) {
      b.addEventListener('mouseenter', function () { paint(+b.dataset.star); });
      b.addEventListener('click', function () {
        rating = +b.dataset.star;
        paint(rating);
        b.classList.remove('just-picked'); void b.offsetWidth; b.classList.add('just-picked');
        if (more && more.hidden) { more.hidden = false; more.classList.add('pqx-more-reveal'); }
        if (nameI) setTimeout(function () { nameI.focus({ preventScroll: true }); }, 80);
      });
    });
    if (starsWrap) starsWrap.addEventListener('mouseleave', function () { paint(rating); });
    var form = root.querySelector('.pqx-form');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = root.querySelector('.pqx-msg');
      var name = nameI ? nameI.value.trim() : '';
      if (!rating || !name) { if (msg) { msg.textContent = t.err; msg.className = 'pqx-msg err'; } return; }
      if (submitB) submitB.disabled = true;
      var body = { author_name: name.substring(0, 60), rating: rating, quiz_slug: slug, is_approved: false };
      var c = commentI ? commentI.value.trim() : ''; if (c) body.comment = c.substring(0, 200);
      fetch(URL + '/rest/v1/reviews', { method: 'POST', headers: Object.assign({ 'Prefer': 'return=minimal' }, HJ), body: JSON.stringify(body) })
        .then(function (r) { if (r.ok || r.status === 201) { form.innerHTML = '<p class="pqx-thanks">' + t.thanks + '</p>'; } else throw new Error('x'); })
        .catch(function () { if (msg) { msg.textContent = t.err; msg.className = 'pqx-msg err'; } if (submitB) submitB.disabled = false; });
    });
  }

  // ── Note rapide 1 clic sur l'ecran de resultat → renvoie vers le bloc avis ──
  // Le moteur affiche une carte .quiz-result-card a la fin de chaque quiz/test.
  // On y greffe une rangee d'etoiles ; un clic pre-remplit la note du bloc avis
  // existant et fait defiler jusqu'au formulaire (plus qu'a mettre son prenom).
  function resultRating() {
    var pqStars = document.querySelectorAll('#pq-reviews .pqx-input-stars [data-star]');
    var formWrap = document.querySelector('#pq-reviews .pqx-form-wrap');
    if (!pqStars.length || !formWrap) return;
    function paint(row, n) {
      var b = row.querySelectorAll('.qr-star');
      for (var i = 0; i < b.length; i++) b[i].classList.toggle('on', (i + 1) <= n);
    }
    function inject(card) {
      if (card.querySelector('.qr-rate')) return;
      // Les ecrans de resultat portent deja un formulaire d'avis complet, avec
      // ses propres etoiles. Y ajouter le raccourci donnait deux blocs de
      // notation dans la meme carte, a quelques centimetres l'un de l'autre.
      if (card.querySelector('.qr-review .pqx-input-stars')) return;
      var box = document.createElement('div');
      box.className = 'qr-rate';
      var label = document.createElement('p');
      label.className = 'qr-rate-label';
      label.textContent = t.rate;
      box.appendChild(label);
      var row = document.createElement('div');
      row.className = 'qr-rate-stars';
      row.setAttribute('role', 'group');
      for (var i = 1; i <= 5; i++) (function (n) {
        var btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'qr-star'; btn.setAttribute('aria-label', String(n));
        btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        btn.addEventListener('mouseenter', function () { paint(row, n); });
        btn.addEventListener('click', function () {
          paint(row, n);
          if (pqStars[n - 1]) pqStars[n - 1].click();
          try { formWrap.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
        });
        row.appendChild(btn);
      })(i);
      row.addEventListener('mouseleave', function () { paint(row, 0); });
      box.appendChild(row);
      card.appendChild(box);
    }
    // Deux cibles : l'ecran de resultat de fin de partie, et les invitations
    // qu'un moteur peut poser en cours de route (.qr-invite). Les jeux tres
    // longs n'ont sinon qu'une seule occasion de demander un avis, celle que
    // presque personne n'atteint : la toute derniere carte.
    var SELECTEUR = '.quiz-result-card, .qr-invite';
    function injecteTout() {
      var cibles = document.querySelectorAll(SELECTEUR);
      for (var i = 0; i < cibles.length; i++) {
        if (!cibles[i].querySelector('.qr-rate')) inject(cibles[i]);
      }
    }
    injecteTout();
    var obs = new MutationObserver(injecteTout);
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // ── Retour d'un « Recommencer » ────────────────────────────────────
  // Ce bouton recharge la page plutot que de redessiner le bloc sur place :
  // la reprise compte alors comme une page vue, et tout repart vraiment de
  // zero. Reste a ramener la vue sur le moteur, sinon la personne qui voulait
  // rejouer se retrouve en haut de l'article, loin du test.
  //
  // On attend que le moteur ait du contenu : il se monte apres le
  // telechargement de ses questions, donc bien apres le chargement du HTML.
  // Passe six secondes on renonce, plutot que de faire sauter la page sous les
  // doigts de quelqu'un qui a commence a lire.
  function replaceSurLeMoteur() {
    var vu;
    try {
      vu = sessionStorage.getItem('qc-rejoue');
      if (!vu) return;
      sessionStorage.removeItem('qc-rejoue');
    } catch (e) { return; }
    // La restauration automatique du defilement avait ete coupee le temps du
    // rechargement : on la rend au navigateur.
    try { history.scrollRestoration = 'auto'; } catch (e) {}
    var debut = Date.now();
    (function attends() {
      var m = document.querySelector('#quiz-engine, [data-quiz], #astro-form, #dn-outil, #vacances-racine');
      if (m && (m.textContent || '').trim().length > 20) {
        m.scrollIntoView({ block: 'start' });
        return;
      }
      if (Date.now() - debut < 6000) setTimeout(attends, 120);
    })();
  }

  function boot() {
    document.body.classList.add('quiz-page');
    var pq = document.getElementById('pq-reviews');
    var slug = pq ? pq.dataset.quizSlug : null;
    if (!slug) return;
    var genre = pq.dataset.quizKind || 'test';
    countBubble(slug, genre);
    watch(slug, genre);
    watchStart(slug);
    initReviews(slug);
    resultRating();
    replaceSurLeMoteur();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/**
 * Recadrage du moteur apres chaque ecran.
 *
 * Les moteurs redessinent tout leur bloc a chaque reponse. Quand l'ecran
 * suivant est plus court que le precedent (une question a deux reponses
 * apres une a cinq, un palier, un ecran de resultat), le bouton qu'on
 * vient de viser se retrouve hors de la fenetre et il faut remonter a la
 * main pour lire la suite.
 *
 * A chaque nouvel ecran, on remet donc la carte du moteur en place. Pas
 * collee sous l'en-tete comme le ferait une ancre : centree quand elle
 * tient dans la fenetre, et sinon posee sous l'en-tete avec une marge, ce
 * qui laisse la question en haut et le maximum de reponses dessous.
 *
 * Trois garde-fous : rien tant que la personne n'a pas touche au moteur
 * (sinon on lui volerait sa lecture du haut de page a l'arrivee), rien
 * quand un panneau modal est ouvert, et rien quand la carte est deja a sa
 * place a une vingtaine de pixels pres.
 */
(function () {
  'use strict';

  var conteneur = document.getElementById('quiz-engine');
  if (!conteneur || !window.MutationObserver) return;

  var aInteragi = false;
  ['pointerdown', 'keydown'].forEach(function (nom) {
    conteneur.addEventListener(nom, function () { aInteragi = true; }, true);
  });

  var douceur = true;
  try { douceur = !window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var minuteur = null;

  function recadrer() {
    var carte = conteneur.querySelector('.quiz-engine') || conteneur.firstElementChild;
    if (!carte) return;
    var r = carte.getBoundingClientRect();
    if (!r.height) return;

    var entete = document.getElementById('site-header');
    var hEntete = entete ? entete.getBoundingClientRect().height : 0;
    var haut = window.pageYOffset + r.top;
    var marge = Math.max(hEntete + 16, (window.innerHeight - r.height) / 2);
    var y = Math.max(0, haut - marge);
    if (Math.abs(y - window.pageYOffset) < 24) return;

    try { window.scrollTo({ top: y, behavior: douceur ? 'smooth' : 'auto' }); }
    catch (e) { window.scrollTo(0, y); }
  }

  new MutationObserver(function () {
    if (!aInteragi) return;
    clearTimeout(minuteur);
    // Le temps que le nouvel ecran soit entierement pose et mesure.
    minuteur = setTimeout(recadrer, 70);
  }).observe(conteneur, { childList: true });
})();
