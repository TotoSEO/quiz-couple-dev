/* Custom quiz builder / player / public listing.
   Talks only to the `manage-custom-quiz` edge function (service-role side).
   Vanilla JS, no build step. Strings come from window.CQ_I18N (with fallbacks). */
(function () {
  var app = document.getElementById('custom-quiz-app');
  if (!app) return;

  var LANG = app.dataset.lang || 'fr';
  var SUPABASE_URL = app.dataset.supabaseUrl || '';
  var SUPABASE_KEY = app.dataset.supabaseKey || '';
  var PAGE_URL = app.dataset.pageUrl || (location.origin + location.pathname);
  var I = window.CQ_I18N || {};
  function T(k, f) { return (I[k] != null && I[k] !== '') ? I[k] : f; }

  var LIMITS = { questions: 30, answers: 4, minAnswers: 2, title: 100, desc: 300, q: 160, a: 100, pts: 100, exp: 200 };

  var PATTERNS = [
    { id: 'points', icon: '🎯', title: T('pat_points_t', 'Quiz à points'), desc: T('pat_points_d', 'Chaque question a une bonne réponse et rapporte des points. Score final à la clé.') },
    { id: 'truefalse', icon: '✅', title: T('pat_tf_t', 'Vrai ou Faux'), desc: T('pat_tf_d', 'Des affirmations auxquelles on répond par Vrai ou Faux. On compte les bonnes réponses.') },
    { id: 'fun', icon: '🎉', title: T('pat_fun_t', 'Fun / sans score'), desc: T('pat_fun_d', 'Juste pour s\'amuser et discuter : pas de bonne réponse, pas de score.') },
    { id: 'wyr', icon: '🤔', title: T('pat_wyr_t', 'Tu préfères…'), desc: T('pat_wyr_d', 'Deux choix par question, sans bonne réponse. Pour se découvrir.') }
  ];

  // ── DOM helper ──────────────────────────────────────────────────────
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on' && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    if (kids) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
      if (c == null) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  }
  function clear() { app.innerHTML = ''; }
  function api(action, payload) {
    return fetch(SUPABASE_URL + '/functions/v1/manage-custom-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_KEY, 'apikey': SUPABASE_KEY },
      body: JSON.stringify(Object.assign({ action: action, lang: LANG }, payload || {}))
    }).then(function (r) { return r.json().catch(function () { return { error: 'bad_response' }; }); });
  }
  function errMsg(code) {
    var m = {
      profanity: T('err_profanity', 'Ton quiz contient des mots inappropriés. Merci de les retirer.'),
      rate_limited: T('err_rate', 'Tu as créé trop de quiz aujourd\'hui. Réessaie demain.'),
      empty_title: T('err_title', 'Donne un titre à ton quiz.'),
      no_questions: T('err_noq', 'Ajoute au moins une question.'),
      too_many_questions: T('err_maxq', 'Maximum 30 questions.'),
      bad_answer_count: T('err_answers', 'Entre 2 et 4 réponses par question.'),
      no_correct_answer: T('err_correct', 'Chaque question doit avoir une bonne réponse.'),
      empty_question: T('err_emptyq', 'Une question est vide.'),
      empty_answer: T('err_emptya', 'Une réponse est vide.'),
      not_found: T('err_notfound', 'Ce quiz est introuvable ou a expiré.')
    };
    return m[code] || T('err_generic', 'Une erreur est survenue. Réessaie.');
  }

  // ── State (builder) ─────────────────────────────────────────────────
  var state = null;
  function blankQuestion(type) {
    if (type === 'truefalse') return { q: '', c: true, exp: '' };
    if (type === 'wyr') return { q: '', a: [{ t: '' }, { t: '' }] };
    return { q: '', a: [{ t: '', c: false }, { t: '', c: false }], pts: 1 };
  }
  function newState(type) {
    return { type: type, title: '', description: '', isPublic: false, questions: [blankQuestion(type)] };
  }

  // ── Router ──────────────────────────────────────────────────────────
  function route() {
    var params = new URLSearchParams(location.search);
    var q = params.get('q');
    if (q) { renderTaker(q); return; }
    renderHome();
  }

  // ── HOME: pattern picker + builder + public list ────────────────────
  function renderHome() {
    var y = window.scrollY; // keep the user's place when re-rendering the builder
    clear();
    if (!state) {
      app.appendChild(renderPatternPicker());
    } else {
      app.appendChild(renderBuilder());
    }
    app.appendChild(renderPublicList());
    window.requestAnimationFrame(function () { window.scrollTo(0, y); });
  }

  function renderPatternPicker() {
    var wrap = el('div', { class: 'cq-block' });
    wrap.appendChild(el('h2', { class: 'cq-h2', text: T('pick_title', 'Choisissez un modèle de quiz') }));
    wrap.appendChild(el('p', { class: 'cq-sub', text: T('pick_sub', 'Sélectionnez le fonctionnement de votre quiz pour commencer.') }));
    var grid = el('div', { class: 'cq-pattern-grid' });
    PATTERNS.forEach(function (p) {
      grid.appendChild(el('button', {
        class: 'cq-pattern-card', type: 'button',
        onclick: function () { state = newState(p.id); renderHome(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      }, [
        el('span', { class: 'cq-pattern-icon', text: p.icon }),
        el('span', { class: 'cq-pattern-title', text: p.title }),
        el('span', { class: 'cq-pattern-desc', text: p.desc })
      ]));
    });
    wrap.appendChild(grid);
    return wrap;
  }

  function counter(node, val, max) {
    var c = el('span', { class: 'cq-counter', text: (val || '').length + '/' + max });
    node._counter = c;
    return c;
  }
  function bindCount(input, max, counterNode) {
    input.addEventListener('input', function () {
      if (input.value.length > max) input.value = input.value.slice(0, max);
      counterNode.textContent = input.value.length + '/' + max;
    });
  }

  // ── Incremental builder: DOM is patched in place, never fully re-rendered ──
  var _qList = null, _qCount = null;

  function refreshQuestions() {
    if (!_qList) return;
    var nodes = _qList.querySelectorAll('.cq-q');
    for (var i = 0; i < nodes.length; i++) {
      var numEl = nodes[i].querySelector('.cq-q-num');
      if (numEl) numEl.textContent = T('question', 'Question') + ' ' + (i + 1);
      var delEl = nodes[i].querySelector('.cq-q-del');
      if (delEl) delEl.style.display = (nodes.length > 1) ? '' : 'none';
    }
    if (_qCount) _qCount.textContent = state.questions.length + '/' + LIMITS.questions;
  }

  function refreshAnswers(ansWrap) {
    var rows = ansWrap.querySelectorAll('.cq-answer');
    for (var i = 0; i < rows.length; i++) {
      var d = rows[i].querySelector('.cq-del-a');
      if (d) d.style.display = (rows.length > LIMITS.minAnswers) ? '' : 'none';
    }
  }

  function renderBuilder() {
    var pat = PATTERNS.filter(function (p) { return p.id === state.type; })[0];
    var wrap = el('div', { class: 'cq-block cq-builder' });

    var head = el('div', { class: 'cq-builder-head' }, [
      el('div', {}, [
        el('span', { class: 'cq-pill', text: (pat ? pat.icon + ' ' + pat.title : state.type) }),
        el('h2', { class: 'cq-h2', text: T('build_title', 'Construisez votre quiz') })
      ]),
      el('button', { class: 'cq-link-btn', type: 'button', text: T('change_pattern', '← Changer de modèle'),
        onclick: function () { if (confirm(T('confirm_change', 'Changer de modèle réinitialisera vos questions. Continuer ?'))) { state = null; renderHome(); } } })
    ]);
    wrap.appendChild(head);

    var titleIn = el('input', { class: 'cq-input', type: 'text', maxlength: LIMITS.title, placeholder: T('ph_title', 'Titre du quiz (ex. Me connais-tu vraiment ?)'), value: state.title });
    var titleCount = counter(titleIn, state.title, LIMITS.title);
    titleIn.addEventListener('input', function () { state.title = titleIn.value; });
    bindCount(titleIn, LIMITS.title, titleCount);

    var descIn = el('textarea', { class: 'cq-input cq-textarea', maxlength: LIMITS.desc, rows: 2, placeholder: T('ph_desc', 'Petite description (facultatif)') });
    descIn.value = state.description;
    var descCount = counter(descIn, state.description, LIMITS.desc);
    descIn.addEventListener('input', function () { state.description = descIn.value; });
    bindCount(descIn, LIMITS.desc, descCount);

    wrap.appendChild(el('label', { class: 'cq-field' }, [el('span', { class: 'cq-label', text: T('label_title', 'Titre') }), titleIn, titleCount]));
    wrap.appendChild(el('label', { class: 'cq-field' }, [el('span', { class: 'cq-label', text: T('label_desc', 'Description') }), descIn, descCount]));

    var qList = el('div', { class: 'cq-questions' });
    _qList = qList;
    state.questions.forEach(function (q) { qList.appendChild(renderQuestionEditor(q)); });
    wrap.appendChild(qList);

    var qCount = el('span', { class: 'cq-counter' });
    _qCount = qCount;
    var addBtn = el('button', { class: 'cq-add-q', type: 'button', text: '+ ' + T('add_question', 'Ajouter une question'),
      onclick: function () {
        if (state.questions.length >= LIMITS.questions) { alert(T('err_maxq', 'Maximum 30 questions.')); return; }
        var q = blankQuestion(state.type);
        state.questions.push(q);
        var node = renderQuestionEditor(q);
        qList.appendChild(node);
        refreshQuestions();
        var firstInput = node.querySelector('.cq-input');
        if (firstInput) firstInput.focus();
        node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } });
    wrap.appendChild(el('div', { class: 'cq-add-wrap' }, [addBtn, qCount]));
    refreshQuestions();

    var pubWrap = el('div', { class: 'cq-visibility' });
    var visCards = [];
    function visCard(pub, icon, title, desc) {
      var b = el('button', { type: 'button', class: 'cq-vis-card' + (state.isPublic === pub ? ' is-active' : '') }, [
        el('span', { class: 'cq-vis-icon', text: icon }),
        el('span', { class: 'cq-vis-title', text: title }),
        el('span', { class: 'cq-vis-desc', text: desc })
      ]);
      b.addEventListener('click', function () {
        state.isPublic = pub;
        visCards.forEach(function (c) { c.el.classList.toggle('is-active', c.pub === state.isPublic); });
      });
      visCards.push({ el: b, pub: pub });
      return b;
    }
    pubWrap.appendChild(visCard(false, '🔒', T('vis_private_t', 'Privé'), T('vis_private_d', 'Accessible seulement via le lien. Gardez-le ! Supprimé après 1 semaine.')));
    pubWrap.appendChild(visCard(true, '🌍', T('vis_public_t', 'Public'), T('vis_public_d', 'Publié sur cette page pour que tout le monde puisse y jouer.')));
    wrap.appendChild(el('h3', { class: 'cq-h3', text: T('vis_title', 'Visibilité') }));
    wrap.appendChild(pubWrap);

    var msg = el('div', { class: 'cq-msg', role: 'alert' });
    var submit = el('button', { class: 'btn btn-cta btn-lg cq-submit', type: 'button', text: T('create_btn', 'Créer mon quiz') });
    submit.addEventListener('click', function () { doCreate(submit, msg); });
    wrap.appendChild(msg);
    wrap.appendChild(submit);
    return wrap;
  }

  function renderQuestionEditor(q) {
    var box = el('div', { class: 'cq-q' });
    var delBtn = el('button', { class: 'cq-del cq-q-del', type: 'button', 'aria-label': T('delete', 'Supprimer'), html: '&times;',
      onclick: function () { var i = state.questions.indexOf(q); if (i >= 0) state.questions.splice(i, 1); box.remove(); refreshQuestions(); } });
    box.appendChild(el('div', { class: 'cq-q-head' }, [el('span', { class: 'cq-q-num' }), delBtn]));

    var qIn = el('input', { class: 'cq-input', type: 'text', maxlength: LIMITS.q, placeholder: T('ph_question', 'Écrivez votre question…'), value: q.q });
    var qCount = counter(qIn, q.q, LIMITS.q);
    qIn.addEventListener('input', function () { q.q = qIn.value; });
    bindCount(qIn, LIMITS.q, qCount);
    box.appendChild(el('div', { class: 'cq-field' }, [qIn, qCount]));

    if (state.type === 'truefalse') {
      var tfWrap = el('div', { class: 'cq-tf' });
      var paintTf = function () {
        var btns = tfWrap.querySelectorAll('.cq-tf-btn');
        if (btns[0]) btns[0].classList.toggle('is-active', q.c === true);
        if (btns[1]) btns[1].classList.toggle('is-active', q.c === false);
      };
      [[true, T('true', 'Vrai')], [false, T('false', 'Faux')]].forEach(function (pair) {
        var b = el('button', { type: 'button', class: 'cq-tf-btn' + (q.c === pair[0] ? ' is-active' : ''), text: pair[1] });
        b.addEventListener('click', function () { q.c = pair[0]; paintTf(); });
        tfWrap.appendChild(b);
      });
      box.appendChild(el('div', { class: 'cq-tf-label', text: T('tf_correct', 'Bonne réponse :') }));
      box.appendChild(tfWrap);
      // Optional explanation, shown to the player after they answer
      var expIn = el('textarea', { class: 'cq-input cq-textarea', rows: 2, maxlength: LIMITS.exp, placeholder: T('ph_explanation', 'Explication (facultatif), affichée après la réponse') });
      expIn.value = q.exp || '';
      var expCount = counter(expIn, q.exp || '', LIMITS.exp);
      expIn.addEventListener('input', function () { q.exp = expIn.value; });
      bindCount(expIn, LIMITS.exp, expCount);
      box.appendChild(el('div', { class: 'cq-field cq-exp-field' }, [el('span', { class: 'cq-label', text: T('label_explanation', 'Explication') }), expIn, expCount]));
      return box;
    }

    var ansWrap = el('div', { class: 'cq-answers' });
    q.a.forEach(function (a) { ansWrap.appendChild(renderAnswerEditor(q, a, ansWrap)); });
    box.appendChild(ansWrap);
    refreshAnswers(ansWrap);
    var addA = el('button', { class: 'cq-add-a', type: 'button', text: '+ ' + T('add_answer', 'Ajouter une réponse'),
      onclick: function () {
        if (q.a.length >= LIMITS.answers) { alert(T('err_answers', 'Maximum 4 réponses.')); return; }
        var a = { t: '', c: false };
        q.a.push(a);
        ansWrap.appendChild(renderAnswerEditor(q, a, ansWrap));
        refreshAnswers(ansWrap);
      } });
    if (state.type !== 'wyr') box.appendChild(addA); // "tu préfères" is fixed at 2 choices

    if (state.type === 'points') {
      var ptsIn = el('input', { class: 'cq-input cq-pts', type: 'number', min: 1, max: LIMITS.pts, value: q.pts || 1 });
      ptsIn.addEventListener('input', function () { var v = parseInt(ptsIn.value, 10); q.pts = (isFinite(v) && v > 0) ? Math.min(v, LIMITS.pts) : 1; });
      box.appendChild(el('div', { class: 'cq-pts-row' }, [el('span', { class: 'cq-label', text: T('points_label', 'Points pour la bonne réponse') }), ptsIn]));
      box.appendChild(el('p', { class: 'cq-hint', text: T('points_hint', 'Cochez la bonne réponse ci-dessus.') }));
    }
    return box;
  }

  function renderAnswerEditor(q, a, ansWrap) {
    var row = el('div', { class: 'cq-answer' });
    if (state.type === 'points') {
      var corr = el('button', { type: 'button', class: 'cq-correct' + (a.c ? ' is-correct' : ''), 'aria-label': T('mark_correct', 'Bonne réponse'),
        title: T('mark_correct', 'Bonne réponse'), html: a.c ? '✓' : '' });
      corr.addEventListener('click', function () {
        q.a.forEach(function (x) { x.c = false; });
        a.c = true;
        var rows = ansWrap.querySelectorAll('.cq-answer');
        for (var i = 0; i < rows.length; i++) {
          var c = rows[i].querySelector('.cq-correct');
          var on = q.a[i] && q.a[i].c;
          if (c) { c.classList.toggle('is-correct', !!on); c.innerHTML = on ? '✓' : ''; }
        }
      });
      row.appendChild(corr);
    }
    var aIn = el('input', { class: 'cq-input', type: 'text', maxlength: LIMITS.a, placeholder: T('ph_answer', 'Réponse…'), value: a.t });
    var aCount = counter(aIn, a.t, LIMITS.a);
    aIn.addEventListener('input', function () { a.t = aIn.value; });
    bindCount(aIn, LIMITS.a, aCount);
    row.appendChild(aIn);
    row.appendChild(aCount);
    var delA = el('button', { class: 'cq-del cq-del-a', type: 'button', 'aria-label': T('delete', 'Supprimer'), html: '&times;',
      onclick: function () { var i = q.a.indexOf(a); if (i >= 0) q.a.splice(i, 1); row.remove(); refreshAnswers(ansWrap); } });
    row.appendChild(delA);
    return row;
  }

  // client-side validation before hitting the server
  function validate() {
    if (!state.title.trim()) return errMsg('empty_title');
    if (!state.questions.length) return errMsg('no_questions');
    for (var i = 0; i < state.questions.length; i++) {
      var q = state.questions[i];
      if (!q.q.trim()) return errMsg('empty_question');
      if (state.type === 'truefalse') { if (typeof q.c !== 'boolean') return errMsg('no_correct_answer'); continue; }
      if (q.a.length < LIMITS.minAnswers) return errMsg('bad_answer_count');
      for (var j = 0; j < q.a.length; j++) if (!q.a[j].t.trim()) return errMsg('empty_answer');
      if (state.type === 'points' && !q.a.some(function (x) { return x.c; })) return errMsg('no_correct_answer');
    }
    return null;
  }

  function doCreate(btn, msg) {
    msg.textContent = ''; msg.className = 'cq-msg';
    var v = validate();
    if (v) { msg.textContent = v; msg.classList.add('is-error'); msg.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    btn.disabled = true; btn.textContent = T('creating', 'Création…');
    api('create', {
      quizType: state.type, title: state.title, description: state.description,
      isPublic: state.isPublic, questions: state.questions
    }).then(function (res) {
      btn.disabled = false; btn.textContent = T('create_btn', 'Créer mon quiz');
      if (res.error) { msg.textContent = errMsg(res.error); msg.classList.add('is-error'); return; }
      renderCreated(res.share_id, res.is_public);
    }).catch(function () {
      btn.disabled = false; btn.textContent = T('create_btn', 'Créer mon quiz');
      msg.textContent = errMsg('generic'); msg.classList.add('is-error');
    });
  }

  // ── CREATED: the all-important share link ───────────────────────────
  function shareUrl(id) { return PAGE_URL + (PAGE_URL.indexOf('?') >= 0 ? '&' : '?') + 'q=' + id; }

  function renderCreated(id, isPublic) {
    clear();
    state = null;
    var url = shareUrl(id);
    var wrap = el('div', { class: 'cq-block cq-created' });
    wrap.appendChild(el('div', { class: 'cq-created-icon', text: '🎉' }));
    wrap.appendChild(el('h2', { class: 'cq-h2', text: T('created_title', 'Votre quiz est prêt !') }));
    // The "keep this link, it's the only way back" warning only makes sense for
    // PRIVATE quizzes. A public quiz stays online and is always in the list below.
    if (!isPublic) {
      wrap.appendChild(el('div', { class: 'cq-warning', html: T('created_warn', '<strong>Gardez ce lien précieusement !</strong> C\'est le seul moyen de retrouver et de partager votre quiz. Sans lui, il sera perdu.') }));
    }

    var linkInput = el('input', { class: 'cq-input cq-link', type: 'text', readonly: 'readonly', value: url });
    var copyBtn = el('button', { class: 'btn btn-cta cq-copy', type: 'button', text: T('copy', 'Copier le lien') });
    copyBtn.addEventListener('click', function () {
      linkInput.select();
      var done = function () { copyBtn.textContent = T('copied', 'Lien copié ✓'); setTimeout(function () { copyBtn.textContent = T('copy', 'Copier le lien'); }, 2200); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { try { document.execCommand('copy'); done(); } catch (e) {} });
      else { try { document.execCommand('copy'); done(); } catch (e) {} }
    });
    wrap.appendChild(el('div', { class: 'cq-link-row' }, [linkInput, copyBtn]));

    if (isPublic) wrap.appendChild(el('p', { class: 'cq-public-note', text: T('created_public', 'Votre quiz est public : il apparaît aussi dans la liste ci-dessous.') }));

    var actions = el('div', { class: 'cq-created-actions' }, [
      el('a', { class: 'btn btn-outline', href: url, text: T('play_now', 'Jouer maintenant') }),
      el('button', { class: 'cq-link-btn', type: 'button', text: T('create_another', 'Créer un autre quiz'), onclick: function () { history.replaceState(null, '', PAGE_URL); renderHome(); } })
    ]);
    wrap.appendChild(actions);
    app.appendChild(wrap);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── TAKER ───────────────────────────────────────────────────────────
  function renderTaker(id) {
    clear();
    app.appendChild(el('div', { class: 'cq-block cq-loading', text: T('loading', 'Chargement…') }));
    api('get', { shareId: id }).then(function (res) {
      clear();
      if (res.error || !res.quiz) { renderTakerError(); return; }
      startTaker(res.quiz);
      api('play', { shareId: id });
    }).catch(function () { clear(); renderTakerError(); });
  }
  function renderTakerError() {
    var wrap = el('div', { class: 'cq-block cq-created' });
    wrap.appendChild(el('div', { class: 'cq-created-icon', text: '😕' }));
    wrap.appendChild(el('h2', { class: 'cq-h2', text: T('err_notfound', 'Ce quiz est introuvable ou a expiré.') }));
    wrap.appendChild(el('a', { class: 'btn btn-cta', href: PAGE_URL, text: T('create_own', 'Créer mon propre quiz') }));
    app.appendChild(wrap);
  }

  function startTaker(quiz) {
    var answers = [];
    var cur = 0;
    var wrap = el('div', { class: 'cq-block cq-taker' });
    app.appendChild(wrap);

    wrap.appendChild(el('a', { class: 'cq-back-link', href: PAGE_URL, text: T('back_to_quizzes', '← Tous les quiz') }));
    wrap.appendChild(el('h2', { class: 'cq-h2 cq-taker-title', text: quiz.title }));
    if (quiz.description) wrap.appendChild(el('p', { class: 'cq-sub', text: quiz.description }));
    if (quiz.plays > 0) wrap.appendChild(el('div', { class: 'cq-plays-badge', text: '🔥 ' + T('played_n', 'Joué {n} fois').replace('{n}', quiz.plays) }));
    var stage = el('div', { class: 'cq-stage' });
    wrap.appendChild(stage);

    function progress() {
      var total = quiz.questions.length;
      var pct = Math.round((cur / total) * 100);
      stage.appendChild(el('div', { class: 'cq-progress-bar' }, [el('div', { class: 'cq-progress-fill', style: 'width:' + pct + '%' })]));
      stage.appendChild(el('div', { class: 'cq-progress', text: (cur + 1) + ' / ' + total }));
    }
    function advance() { cur++; if (cur >= quiz.questions.length) showResult(); else renderQ(); }

    function renderQ() {
      stage.innerHTML = '';
      progress();
      var q = quiz.questions[cur];
      stage.appendChild(el('h3', { class: 'cq-q-text', text: q.q }));
      var opts = el('div', { class: 'cq-opts' });
      if (quiz.quiz_type === 'truefalse') {
        [[true, T('true', 'Vrai')], [false, T('false', 'Faux')]].forEach(function (p) {
          opts.appendChild(el('button', { class: 'cq-opt', type: 'button', text: p[1], onclick: function () { answers[cur] = p[0]; revealTf(q); } }));
        });
      } else {
        q.a.forEach(function (a, i) {
          opts.appendChild(el('button', { class: 'cq-opt', type: 'button', text: a.t, onclick: function () { answers[cur] = i; advance(); } }));
        });
      }
      stage.appendChild(opts);
    }

    // True/false: reveal the correct answer + optional explanation before moving on
    function revealTf(q) {
      stage.innerHTML = '';
      progress();
      var isCorrect = (answers[cur] === q.c);
      var last = (cur + 1) >= quiz.questions.length;
      var panel = el('div', { class: 'cq-reveal ' + (isCorrect ? 'is-correct' : 'is-wrong') });
      panel.appendChild(el('div', { class: 'cq-reveal-badge', text: isCorrect ? '✓' : '✗' }));
      panel.appendChild(el('h3', { class: 'cq-q-text', text: q.q }));
      panel.appendChild(el('p', { class: 'cq-reveal-verdict',
        text: (isCorrect ? T('reveal_correct', 'Bonne réponse !') : T('reveal_wrong', 'Raté !')) + ' ' +
              T('reveal_answer', 'La réponse était :') + ' ' + (q.c ? T('true', 'Vrai') : T('false', 'Faux')) }));
      if (q.exp) {
        panel.appendChild(el('div', { class: 'cq-reveal-exp' }, [
          el('span', { class: 'cq-reveal-exp-label', text: T('reveal_why', 'Explication') }),
          el('p', { text: q.exp })
        ]));
      }
      panel.appendChild(el('button', { class: 'btn btn-cta cq-reveal-next', type: 'button',
        text: last ? T('see_result', 'Voir le résultat') : T('next', 'Question suivante'), onclick: advance }));
      stage.appendChild(panel);
    }

    function showResult() {
      stage.innerHTML = '';
      var res = el('div', { class: 'cq-result' });
      var noScore = (quiz.quiz_type === 'fun' || quiz.quiz_type === 'wyr');
      res.appendChild(el('div', { class: 'cq-trophy', text: noScore ? '🎉' : '🏆' }));
      if (noScore) {
        res.appendChild(el('div', { class: 'cq-score-bubble' }, [el('span', { class: 'cq-score', text: '✓' })]));
        res.appendChild(el('h3', { class: 'cq-h2', text: T('fun_done', 'Terminé, merci d\'avoir joué !') }));
      } else {
        var score = 0, max = 0;
        quiz.questions.forEach(function (q, i) {
          if (quiz.quiz_type === 'truefalse') { max += 1; if (answers[i] === q.c) score += 1; }
          else { max += (q.pts || 1); var correct = q.a[answers[i]] && q.a[answers[i]].c; if (correct) score += (q.pts || 1); }
        });
        res.appendChild(el('div', { class: 'cq-score-bubble' }, [el('div', { class: 'cq-score', text: score + ' / ' + max })]));
        res.appendChild(el('p', { class: 'cq-sub', text: T('your_score', 'Votre score') }));
      }
      var actions = el('div', { class: 'cq-created-actions' }, [
        el('button', { class: 'btn btn-outline', type: 'button', text: T('retry', 'Rejouer'), onclick: function () {
          // La partie repart sur place, sans rechargement : l'adresse
          // annoncerait sinon un resultat devant la premiere question.
          if (window.QCResultat) window.QCResultat.retour();
          answers = []; cur = 0; renderQ();
        } }),
        el('a', { class: 'btn btn-cta', href: PAGE_URL, text: T('create_own', 'Créer mon propre quiz') })
      ]);
      res.appendChild(actions);
      stage.appendChild(res);

      // Comme sur les tests du site, l'ecran de resultat prend son adresse au
      // moment ou il s'affiche. Le « ?q= » du quiz joue est conserve.
      if (window.QCResultat) {
        window.QCResultat.arrivee(res, { lang: LANG });
      }
    }
    renderQ();
  }

  // ── PUBLIC LIST ─────────────────────────────────────────────────────
  function patternLabel(type) {
    var m = { points: T('pat_points_t', 'Quiz à points'), truefalse: T('pat_tf_t', 'Vrai ou Faux'), fun: T('pat_fun_t', 'Fun'), wyr: T('pat_wyr_t', 'Tu préfères…') };
    return m[type] || type;
  }
  function renderPublicList() {
    var wrap = el('div', { class: 'cq-block cq-public' });
    wrap.appendChild(el('h2', { class: 'cq-h2', text: T('public_title', 'Quiz publics de la communauté') }));
    wrap.appendChild(el('p', { class: 'cq-sub', text: T('public_sub', 'Découvrez et jouez aux quiz créés par d\'autres.') }));
    var grid = el('div', { class: 'cq-public-grid', text: '' });
    grid.appendChild(el('p', { class: 'cq-muted', text: T('loading', 'Chargement…') }));
    wrap.appendChild(grid);
    api('list_public', { page: 0 }).then(function (res) {
      grid.innerHTML = '';
      var list = (res && res.quizzes) || [];
      if (!list.length) { grid.appendChild(el('p', { class: 'cq-muted', text: T('public_empty', 'Aucun quiz public pour le moment. Soyez le premier !') })); return; }
      list.forEach(function (qz) {
        grid.appendChild(el('a', { class: 'cq-public-card', href: shareUrl(qz.share_id) }, [
          el('span', { class: 'cq-public-badge', text: patternLabel(qz.quiz_type) }),
          el('span', { class: 'cq-public-name', text: qz.title }),
          qz.description ? el('span', { class: 'cq-public-desc', text: qz.description }) : null,
          el('span', { class: 'cq-public-meta', text: qz.question_count + ' ' + T('questions_short', 'questions') + ' · ' + T('played_n', 'Joué {n} fois').replace('{n}', (qz.plays || 0)) })
        ]));
      });
    }).catch(function () { grid.innerHTML = ''; grid.appendChild(el('p', { class: 'cq-muted', text: T('public_empty', 'Aucun quiz public pour le moment.') })); });
    return wrap;
  }

  // ── Compteurs communautaires du hero ────────────────────────────────
  // Ils vivent dans le gabarit, pas dans l'application : le constructeur se
  // redessine à chaque frappe, un bloc rendu ici clignoterait et referait un
  // appel réseau à chaque fois. Un seul appel au chargement suffit.
  //
  // Le cumul vient de custom_quiz_totaux, alimentée par un déclencheur, et
  // non d'un comptage de custom_quizzes : les quiz privés expirent au bout
  // d'une semaine, un comptage direct reculerait tout seul.
  function chargeTotaux() {
    var boite = document.getElementById('cq-totaux');
    if (!boite || !SUPABASE_URL || !SUPABASE_KEY) return;
    fetch(SUPABASE_URL + '/rest/v1/rpc/get_custom_quiz_totaux', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
      body: '{}'
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (rows) {
      var d = Array.isArray(rows) ? rows[0] : rows;
      if (!d) return;
      var prives = Number(d.prives) || 0, publics = Number(d.publics) || 0;
      // Rien à annoncer tant que personne n'a rien créé : mieux vaut un hero
      // plus court que deux zéros.
      if (prives + publics <= 0) return;
      var fmt = function (n) { return n.toLocaleString(LANG === 'en' ? 'en-GB' : LANG); };
      document.getElementById('cq-total-prives').textContent = fmt(prives);
      document.getElementById('cq-total-publics').textContent = fmt(publics);
      boite.hidden = false;
      var merci = document.getElementById('cq-merci');
      if (merci) merci.hidden = false;
    }).catch(function () { /* la fonction n'existe pas encore : on n'affiche rien */ });
  }

  route();
  chargeTotaux();
})();
