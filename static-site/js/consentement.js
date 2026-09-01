/**
 * Pont entre la plateforme de consentement et le mode consentement de Google.
 *
 * La CMP parle la langue de l'IAB : une chaine TCF qui dit, finalite par
 * finalite et fournisseur par fournisseur, ce qui est autorise. Les balises
 * Google parlent leur propre langue : quatre signaux, accordes ou refuses.
 * Personne ne traduit d'office de l'une vers l'autre.
 *
 * Sans ce fichier, les quatre signaux poses a « refuse » dans l'en-tete
 * resteraient refuses pour toujours, meme apres un clic sur « Accepter » :
 * Google Analytics ne compterait plus rien du tout.
 *
 * ── La correspondance ────────────────────────────────────────────────────
 * C'est celle que retiennent les principales plateformes du marche. Elle est
 * volontairement stricte : chaque signal exige le consentement de stockage
 * (finalite 1) en plus de sa finalite propre. Mieux vaut refuser un signal
 * de trop que d'en accorder un que la personne n'a pas donne.
 *
 *   analytics_storage   finalites 1 et 8   stocker, et mesurer l'audience
 *   ad_storage          finalite  1        stocker
 *   ad_user_data        finalites 1 et 7   stocker, et mesurer la publicite
 *   ad_personalization  finalites 3 et 4   profiler, et cibler
 *
 * Si la regie active de son cote le mode consentement dans son interface,
 * les deux envois disent la meme chose : ils sont calcules a partir de la
 * meme chaine TCF. Il n'y a donc pas de conflit possible, seulement une
 * ceinture en plus de la bretelle.
 *
 * ── Hors d'Europe ────────────────────────────────────────────────────────
 * La CMP annonce alors gdprApplies a faux et n'affiche aucune banniere.
 * Sans le cas ci-dessous, ces visiteurs resteraient refuses sans avoir rien
 * refuse, et disparaitraient des statistiques.
 */
(function () {
  'use strict';

  if (typeof window.__tcfapi !== 'function' || typeof window.gtag !== 'function') return;

  var TOUT_ACCORDE = {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
  };

  // On ne renvoie que si quelque chose a change : une personne qui ouvre le
  // panneau et ressort sans rien toucher declenche plusieurs evenements pour
  // un seul et meme etat.
  var dernier = null;
  function accorde(etat) {
    var signature = etat.analytics_storage + etat.ad_storage + etat.ad_user_data + etat.ad_personalization;
    if (signature === dernier) return;
    dernier = signature;
    window.gtag('consent', 'update', etat);
  }

  function traduire(donnees) {
    var p = (donnees && donnees.purpose && donnees.purpose.consents) || {};
    function ok() {
      for (var i = 0; i < arguments.length; i++) {
        if (p[arguments[i]] !== true) return false;
      }
      return true;
    }
    return {
      analytics_storage:  ok(1, 8) ? 'granted' : 'denied',
      ad_storage:         ok(1)    ? 'granted' : 'denied',
      ad_user_data:       ok(1, 7) ? 'granted' : 'denied',
      ad_personalization: ok(3, 4) ? 'granted' : 'denied'
    };
  }

  window.__tcfapi('addEventListener', 2, function (donnees, ok) {
    if (!ok || !donnees) return;

    // Hors du champ du RGPD : aucune banniere n'est montree, donc aucun refus
    // n'a ete exprime.
    if (donnees.gdprApplies === false) { accorde(TOUT_ACCORDE); return; }

    // « tcloaded » : un choix deja fait lors d'une visite precedente.
    // « useractioncomplete » : la personne vient de repondre.
    // Les autres etats signalent une banniere affichee mais sans reponse :
    // on ne touche a rien, le refus par defaut tient.
    if (donnees.eventStatus !== 'tcloaded' && donnees.eventStatus !== 'useractioncomplete') return;

    accorde(traduire(donnees));
  });

  // ── Rouvrir le panneau depuis le pied de page ──────────────────────────
  // Pouvoir revenir sur son choix est une obligation, et le lien doit rester
  // atteignable de partout. Il est masque tant que la CMP n'a pas repondu :
  // un lien qui n'ouvre rien vaut moins que pas de lien du tout.
  var liens = document.querySelectorAll('[data-cmp-ouvrir]');
  if (!liens.length) return;

  function montrerLiens() {
    for (var i = 0; i < liens.length; i++) liens[i].hidden = false;
  }
  window.__tcfapi('ping', 2, function (etat) {
    if (etat && etat.cmpStatus === 'loaded') montrerLiens();
    else if (etat && etat.cmpStatus !== 'error') {
      // Le talon repond « stub » tant que le vrai script n'est pas arrive.
      window.__tcfapi('addEventListener', 2, function (d, bon) {
        if (bon && d && d.cmpStatus === 'loaded') montrerLiens();
      });
    }
  });

  document.addEventListener('click', function (e) {
    var lien = e.target && e.target.closest ? e.target.closest('[data-cmp-ouvrir]') : null;
    if (!lien) return;
    e.preventDefault();
    try { window.__tcfapi('displayConsentUi', 2, function () {}); } catch (err) {}
  });
})();
