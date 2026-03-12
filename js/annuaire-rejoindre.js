/**
 * Annuaire — Multi-step registration form
 * Handles: step navigation, validation, char counters, recap,
 *          Supabase auth registration, profile creation, photo upload
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://lojvajnnvhatfplevyvy.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvanZham5udmhhdGZwbGV2eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzk3NDIsImV4cCI6MjA4Nzg1NTc0Mn0.gdd9HRbRvfQr6io9jGN6hUCW6tBOtognhwbsTJtSTng';

  var form = document.getElementById('rejoindre-form');
  if (!form) return;

  var TOTAL_STEPS = 5;
  var currentStep = 1;
  var photoFile = null;

  var steps = form.querySelectorAll('[data-form-step]');
  var progressSteps = document.querySelectorAll('.ann-progress-step');
  var progressFill = document.getElementById('progress-fill');
  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');
  var btnSubmit = document.getElementById('btn-submit');
  var formSuccess = document.getElementById('form-success');

  // ── Supabase init ──────────────────────────────────────────────
  var supabase = null;
  function initSupabase() {
    if (supabase) return;
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  }

  function waitForSupabase(timeout) {
    return new Promise(function (resolve) {
      initSupabase();
      if (supabase) return resolve(true);
      var elapsed = 0;
      var interval = setInterval(function () {
        initSupabase();
        elapsed += 200;
        if (supabase || elapsed >= timeout) {
          clearInterval(interval);
          resolve(!!supabase);
        }
      }, 200);
    });
  }

  // ── Char Counters ────────────────────────────────────────────────
  var counters = [
    { input: 'f-prenom', counter: 'count-prenom' },
    { input: 'f-nom', counter: 'count-nom' },
    { input: 'f-titre', counter: 'count-titre' },
    { input: 'f-cabinet', counter: 'count-cabinet' },
    { input: 'f-description', counter: 'count-description' },
  ];

  counters.forEach(function (c) {
    var input = document.getElementById(c.input);
    var counter = document.getElementById(c.counter);
    if (!input || !counter) return;

    function update() { counter.textContent = input.value.length; }
    input.addEventListener('input', update);
    update();
  });

  // ── Specialty Selection (max 3) ──────────────────────────────────
  var specSelector = document.getElementById('specialty-selector');
  if (specSelector) {
    specSelector.addEventListener('change', function (e) {
      if (!e.target.matches('input[type="checkbox"]')) return;

      var checked = specSelector.querySelectorAll('input:checked');
      if (checked.length > 3) {
        e.target.checked = false;
        return;
      }

      specSelector.querySelectorAll('.ann-specialty-option').forEach(function (opt) {
        var cb = opt.querySelector('input');
        opt.classList.toggle('selected', cb.checked);
      });

      clearError('err-specialites');
    });
  }

  // ── Method/Language Tag Toggle ───────────────────────────────────
  document.querySelectorAll('.ann-method-option input').forEach(function (cb) {
    cb.addEventListener('change', function () {
      cb.closest('.ann-method-option').querySelector('.ann-method-tag').classList.toggle('selected', cb.checked);
    });
    if (cb.checked) {
      cb.closest('.ann-method-option').querySelector('.ann-method-tag').classList.add('selected');
    }
  });

  // ── Consultation Mode Toggle ─────────────────────────────────────
  document.querySelectorAll('.ann-consult-option input').forEach(function (cb) {
    cb.addEventListener('change', function () {
      cb.closest('.ann-consult-option').querySelector('.ann-consult-card').classList.toggle('selected', cb.checked);
      clearError('err-modes');
    });
  });

  // ── Radio Toggle ─────────────────────────────────────────────────
  document.querySelectorAll('.ann-toggle-option input').forEach(function (radio) {
    radio.addEventListener('change', function () {
      radio.closest('.ann-toggle-group').querySelectorAll('.ann-toggle-btn').forEach(function (btn) {
        btn.classList.remove('selected');
      });
      radio.closest('.ann-toggle-option').querySelector('.ann-toggle-btn').classList.add('selected');
    });
    if (radio.checked) {
      radio.closest('.ann-toggle-option').querySelector('.ann-toggle-btn').classList.add('selected');
    }
  });

  // ── Checkbox visual toggle ───────────────────────────────────────
  var consentCb = document.getElementById('f-consent');
  if (consentCb) {
    consentCb.addEventListener('change', function () {
      consentCb.closest('.ann-checkbox-label').classList.toggle('checked', consentCb.checked);
      clearError('err-consent');
    });
  }

  // ── Photo Upload ─────────────────────────────────────────────────
  var photoInput = document.getElementById('f-photo');
  var photoPreview = document.getElementById('photo-preview');
  var btnChoosePhoto = document.getElementById('btn-choose-photo');
  var photoZone = document.getElementById('photo-upload-zone');

  if (btnChoosePhoto && photoInput) {
    btnChoosePhoto.addEventListener('click', function () {
      photoInput.click();
    });
  }

  if (photoInput) {
    photoInput.addEventListener('change', function () {
      var file = photoInput.files[0];
      if (file) handlePhotoFile(file);
    });
  }

  // Drag & drop
  if (photoZone) {
    photoZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      photoZone.classList.add('dragover');
    });
    photoZone.addEventListener('dragleave', function () {
      photoZone.classList.remove('dragover');
    });
    photoZone.addEventListener('drop', function (e) {
      e.preventDefault();
      photoZone.classList.remove('dragover');
      var file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handlePhotoFile(file);
    });
  }

  function handlePhotoFile(file) {
    var validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showError('err-photo', 'Format non supporté. Utilisez JPEG, PNG ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('err-photo', 'Photo trop lourde (5 Mo max).');
      return;
    }

    clearError('err-photo');
    photoFile = file;

    var reader = new FileReader();
    reader.onload = function (e) {
      photoPreview.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Aperçu photo">';
    };
    reader.readAsDataURL(file);
  }

  // ── Validation ───────────────────────────────────────────────────
  function showError(id, msg) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.classList.add('visible');
    }
  }

  function clearError(id) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = '';
      el.classList.remove('visible');
    }
  }

  function clearAllErrors() {
    form.querySelectorAll('.ann-field-error').forEach(function (el) {
      el.textContent = '';
      el.classList.remove('visible');
    });
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function validateStep(step) {
    clearAllErrors();
    var valid = true;

    if (step === 1) {
      if (!val('f-prenom')) { showError('err-prenom', 'Le prénom est requis'); valid = false; }
      if (!val('f-nom')) { showError('err-nom', 'Le nom est requis'); valid = false; }
      var email = val('f-email');
      if (!email) { showError('err-email', 'L\'email est requis'); valid = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('err-email', 'Email invalide'); valid = false; }
      if (!val('f-telephone')) { showError('err-telephone', 'Le téléphone est requis'); valid = false; }
      var pw = val('f-password');
      if (!pw) { showError('err-password', 'Le mot de passe est requis'); valid = false; }
      else if (pw.length < 10) { showError('err-password', 'Minimum 10 caractères'); valid = false; }
      else if (!/[A-Z]/.test(pw)) { showError('err-password', 'Le mot de passe doit contenir au moins une majuscule'); valid = false; }
      else if (!/[^a-zA-Z0-9]/.test(pw)) { showError('err-password', 'Le mot de passe doit contenir au moins un caractère spécial'); valid = false; }
      var pw2 = val('f-password2');
      if (!pw2) { showError('err-password2', 'Confirmez le mot de passe'); valid = false; }
      else if (pw !== pw2) { showError('err-password2', 'Les mots de passe ne correspondent pas'); valid = false; }
    }

    if (step === 2) {
      var specChecked = form.querySelectorAll('input[name="specialites"]:checked');
      if (specChecked.length === 0) { showError('err-specialites', 'Sélectionnez au moins une spécialité'); valid = false; }
      if (!val('f-titre')) { showError('err-titre', 'Le titre est requis'); valid = false; }
      if (!val('f-experience')) { showError('err-experience', 'Sélectionnez votre expérience'); valid = false; }
    }

    if (step === 3) {
      if (!val('f-adresse')) { showError('err-adresse', 'L\'adresse est requise'); valid = false; }
      var cp = val('f-codepostal');
      if (!cp) { showError('err-codepostal', 'Le code postal est requis'); valid = false; }
      else if (!/^[0-9]{5}$/.test(cp)) { showError('err-codepostal', 'Code postal invalide (5 chiffres)'); valid = false; }
      if (!val('f-ville')) { showError('err-ville', 'La ville est requise'); valid = false; }
      var modesChecked = form.querySelectorAll('input[name="modes"]:checked');
      if (modesChecked.length === 0) { showError('err-modes', 'Sélectionnez au moins un mode'); valid = false; }
    }

    if (step === 4) {
      if (!photoFile && !photoInput.files.length) { showError('err-photo', 'La photo de profil est requise'); valid = false; }
      var desc = val('f-description');
      if (!desc) { showError('err-description', 'La description est requise'); valid = false; }
      else if (desc.length < 50) { showError('err-description', 'Minimum 50 caractères (' + desc.length + '/50)'); valid = false; }
      var pmin = val('f-prix-min');
      var pmax = val('f-prix-max');
      if (!pmin) { showError('err-prix-min', 'Requis'); valid = false; }
      if (!pmax) { showError('err-prix-max', 'Requis'); valid = false; }
      if (pmin && pmax && Number(pmin) > Number(pmax)) { showError('err-prix-max', 'Doit être ≥ tarif min'); valid = false; }
    }

    if (step === 5) {
      if (!document.getElementById('f-consent').checked) { showError('err-consent', 'Vous devez accepter les conditions'); valid = false; }
    }

    return valid;
  }

  // ── Navigation ───────────────────────────────────────────────────
  function goToStep(step) {
    if (step < 1 || step > TOTAL_STEPS) return;

    var currentEl = form.querySelector('[data-form-step="' + currentStep + '"]');
    if (currentEl) {
      currentEl.classList.remove('active');
      currentEl.classList.add('exit');
      setTimeout(function () { currentEl.classList.remove('exit'); }, 300);
    }

    currentStep = step;

    setTimeout(function () {
      var nextEl = form.querySelector('[data-form-step="' + step + '"]');
      if (nextEl) nextEl.classList.add('active');
      updateProgress();
      var formRect = form.getBoundingClientRect();
      if (formRect.top < 0) {
        window.scrollTo({ top: window.scrollY + formRect.top - 100, behavior: 'smooth' });
      }
    }, 150);

    if (step === 5) buildRecap();
  }

  function updateProgress() {
    var pct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    if (progressFill) progressFill.style.width = pct + '%';

    progressSteps.forEach(function (el) {
      var s = parseInt(el.getAttribute('data-step'), 10);
      el.classList.toggle('active', s === currentStep);
      el.classList.toggle('completed', s < currentStep);
    });

    btnPrev.style.display = currentStep > 1 ? '' : 'none';
    btnNext.style.display = currentStep < TOTAL_STEPS ? '' : 'none';
    btnSubmit.style.display = currentStep === TOTAL_STEPS ? '' : 'none';
  }

  btnNext.addEventListener('click', function () {
    if (validateStep(currentStep)) {
      goToStep(currentStep + 1);
    } else {
      var firstErr = form.querySelector('.ann-field-error.visible');
      if (firstErr) {
        var group = firstErr.closest('.ann-form-group');
        if (group) {
          group.classList.add('ann-shake');
          setTimeout(function () { group.classList.remove('ann-shake'); }, 500);
        }
      }
    }
  });

  btnPrev.addEventListener('click', function () {
    clearAllErrors();
    goToStep(currentStep - 1);
  });

  progressSteps.forEach(function (el) {
    el.addEventListener('click', function () {
      var target = parseInt(el.getAttribute('data-step'), 10);
      if (target < currentStep) {
        clearAllErrors();
        goToStep(target);
      }
    });
  });

  // ── Build Recap ──────────────────────────────────────────────────
  function buildRecap() {
    setText('recap-nom', val('f-prenom') + ' ' + val('f-nom'));
    setText('recap-email', val('f-email'));
    setText('recap-telephone', val('f-telephone'));

    var specs = [];
    form.querySelectorAll('input[name="specialites"]:checked').forEach(function (cb) {
      var label = cb.closest('.ann-specialty-option');
      if (label) specs.push(label.querySelector('.ann-specialty-name').textContent);
    });
    setText('recap-specialites', specs.join(', ') || '—');

    setText('recap-titre', val('f-titre'));

    var methods = [];
    form.querySelectorAll('input[name="methodes"]:checked').forEach(function (cb) { methods.push(cb.value); });
    setText('recap-methodes', methods.length ? methods.join(', ') : 'Non renseigné');

    setText('recap-experience', val('f-experience') || '—');

    var cabinetVal = val('f-cabinet');
    var cabinetRow = document.getElementById('recap-cabinet-row');
    if (cabinetVal && cabinetRow) {
      cabinetRow.style.display = '';
      setText('recap-cabinet', cabinetVal);
    } else if (cabinetRow) {
      cabinetRow.style.display = 'none';
    }

    // City: get the selected option text
    var villeSelect = document.getElementById('f-ville');
    var villeName = villeSelect && villeSelect.selectedIndex > 0 ? villeSelect.options[villeSelect.selectedIndex].text : '—';
    setText('recap-adresse', val('f-adresse') + ', ' + val('f-codepostal') + ' ' + villeName);

    var modes = [];
    form.querySelectorAll('input[name="modes"]:checked').forEach(function (cb) {
      var map = { 'cabinet': 'En cabinet', 'en-ligne': 'En ligne', 'domicile': 'À domicile' };
      modes.push(map[cb.value] || cb.value);
    });
    setText('recap-modes', modes.join(', ') || '—');

    var pmin = val('f-prix-min');
    var pmax = val('f-prix-max');
    setText('recap-tarifs', pmin && pmax ? pmin + '€ - ' + pmax + '€ / séance' : '—');

    var rdv = form.querySelector('input[name="rdv_gratuit"]:checked');
    setText('recap-rdv', rdv && rdv.value === 'oui' ? 'Oui' : 'Non');

    var langues = [];
    form.querySelectorAll('input[name="langues"]:checked').forEach(function (cb) { langues.push(cb.value); });
    setText('recap-langues', langues.length ? langues.join(', ') : 'Non renseigné');

    setText('recap-description', val('f-description'));
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ── Experience mapping ────────────────────────────────────────────
  function experienceToYears(val) {
    var map = { '0-2': 1, '2-5': 3, '5-10': 7, '10-20': 15, '20+': 25 };
    return map[val] || 0;
  }

  // ── Submit: Supabase auth + profile creation ─────────────────────
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validateStep(5)) return;

    // Wait for Supabase SDK to load (up to 5s)
    var sbReady = await waitForSupabase(5000);
    if (!sbReady) {
      showError('err-consent', 'Le service de connexion n\'a pas pu être chargé. Vérifiez votre connexion internet et rechargez la page.');
      return;
    }

    var submitBtn = document.getElementById('btn-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<svg class="ann-spinner" viewBox="0 0 24 24" style="width:1rem;height:1rem;animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="30 70" stroke-linecap="round"/></svg> Création du compte...';

    try {
      // ── 1. Collect all profile data first ──
      var email = val('f-email');
      var password = val('f-password');

      // Collect specialties (use the first one as primary)
      var specialties = [];
      form.querySelectorAll('input[name="specialites"]:checked').forEach(function (cb) {
        specialties.push(cb.value);
      });

      // Collect methods
      var methods = [];
      form.querySelectorAll('input[name="methodes"]:checked').forEach(function (cb) {
        methods.push(cb.value);
      });

      // Collect languages
      var languages = [];
      form.querySelectorAll('input[name="langues"]:checked').forEach(function (cb) {
        languages.push(cb.value);
      });

      var pmin = val('f-prix-min');
      var pmax = val('f-prix-max');

      var profileData = {
        first_name: val('f-prenom'),
        last_name: val('f-nom'),
        email: email,
        phone: val('f-telephone'),
        specialty: specialties[0] || '',
        city: val('f-ville'),
        description: val('f-description'),
        methods: methods,
        languages: languages.length ? languages : ['Français'],
        years_experience: experienceToYears(val('f-experience')),
        price_range: pmin && pmax ? pmin + '€ - ' + pmax + '€' : '',
        address: val('f-adresse') + ', ' + val('f-codepostal'),
        availability: 'Sur rendez-vous',
        is_published: false,
      };

      // ── 2. Register auth account (store profile in user_metadata) ──
      var authResult = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            annuaire_profile: profileData,
            has_pending_profile: true,
          },
          emailRedirectTo: window.location.origin + '/dashboard/',
        },
      });

      if (authResult.error) {
        if (authResult.error.message.includes('already registered')) {
          showError('err-consent', 'Un compte existe déjà avec cet email. Connectez-vous sur votre espace professionnel.');
        } else {
          showError('err-consent', authResult.error.message);
        }
        resetSubmitBtn();
        return;
      }

      var user = authResult.data.user;
      var session = authResult.data.session;

      // ── 3. Upload photo (if we have a session, upload now; otherwise store info for later) ──
      var photoUrl = null;
      if (session && photoFile) {
        submitBtn.innerHTML = '<svg class="ann-spinner" viewBox="0 0 24 24" style="width:1rem;height:1rem;animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="30 70" stroke-linecap="round"/></svg> Upload de la photo...';

        var ext = photoFile.name.split('.').pop().toLowerCase();
        var storagePath = user.id + '/photo.' + ext;

        var uploadResult = await supabase.storage
          .from('annuaire-photos')
          .upload(storagePath, photoFile, { upsert: true, contentType: photoFile.type });

        if (uploadResult.error) {
          console.warn('Photo upload failed:', uploadResult.error.message);
        } else {
          var urlResult = supabase.storage
            .from('annuaire-photos')
            .getPublicUrl(storagePath);
          photoUrl = urlResult.data.publicUrl;
        }
      }

      // If email confirmation is required (no session yet)
      if (user && !session) {
        // Photo will need to be uploaded after email confirmation on dashboard
        // Profile data is stored in user_metadata and will be auto-created on first dashboard login
        showSuccess();
        return;
      }

      if (!session) {
        showError('err-consent', 'Erreur lors de la création du compte. Réessayez.');
        resetSubmitBtn();
        return;
      }

      // ── 4. Create profile via edge function ──
      submitBtn.innerHTML = '<svg class="ann-spinner" viewBox="0 0 24 24" style="width:1rem;height:1rem;animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="30 70" stroke-linecap="round"/></svg> Création de votre fiche...';

      if (photoUrl) {
        profileData.photo_url = photoUrl;
      }

      var profileRes = await fetch(SUPABASE_URL + '/functions/v1/annuaire-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + session.access_token,
        },
        body: JSON.stringify(profileData),
      });

      var profileResult = await profileRes.json();

      if (profileResult.error) {
        console.error('Profile creation error:', profileResult.error);
        showSuccessWithMessage('Votre compte a été créé mais la fiche n\'a pas pu être enregistrée automatiquement. Connectez-vous sur votre <a href="/dashboard/" target="_blank" style="color:hsl(var(--ann-primary))">espace professionnel</a> pour compléter votre fiche.');
        return;
      }

      // ── 5. Success! ──
      showSuccess();

    } catch (err) {
      console.error('Registration error:', err);
      showError('err-consent', 'Une erreur est survenue. Vérifiez votre connexion et réessayez.');
      resetSubmitBtn();
    }
  });

  function resetSubmitBtn() {
    var submitBtn = document.getElementById('btn-submit');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1rem;height:1rem"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Soumettre pour validation';
  }

  function showSuccess() {
    form.style.display = 'none';
    document.getElementById('form-progress').style.display = 'none';
    document.getElementById('form-nav').style.display = 'none';
    formSuccess.classList.remove('hidden');
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showSuccessWithMessage(msg) {
    form.style.display = 'none';
    document.getElementById('form-progress').style.display = 'none';
    document.getElementById('form-nav').style.display = 'none';
    formSuccess.classList.remove('hidden');

    // Replace the default message
    var msgEl = formSuccess.querySelector('.ann-text-muted');
    if (msgEl) msgEl.innerHTML = msg;

    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Init
  initSupabase();
  updateProgress();
})();
