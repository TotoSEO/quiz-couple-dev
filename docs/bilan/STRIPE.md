# Bilan de couple : brancher Stripe, l'envoi des rapports et ouvrir la vente

Ce guide dit, dans l'ordre, tout ce qu'il faut faire pour que le bilan se
vende. Le code est prêt : il manque un compte Stripe, un compte Resend (pour
envoyer le rapport PDF par e-mail), leurs clés, et l'adresse du vendeur.
Compter une heure, plus le délai de vérification de Stripe (souvent quelques
minutes, parfois un ou deux jours).

Tant que rien n'est fait, rien ne se passe : la page du bilan existe mais
n'est pas indexée, aucun lien du site n'y mène, et l'écran de paiement dit
que le paiement « ouvre très bientôt ».

## 1. Ce qui se déploie tout seul à la fusion

- `bilan-base.yml` applique la migration `20261018120000_bilan_couple.sql` :
  table `bilans`, compteurs de l'entonnoir (`bilan_compteurs`), espace de
  stockage privé `bilan-rapports` pour les PDF, ménage de chaque nuit,
  déclenchement de la fabrique des rapports, `get_bilan_tableau` pour
  l'admin.
- `deploy-functions.yml` déploie les fonctions `bilan` (l'application) et
  `bilan-stripe` (le webhook), sans vérification de JWT
  (`supabase/config.toml`), et `admin-stats` avec `get_bilan_tableau`.
- `bilan-rapport.yml` (la fabrique des PDF) est lancé par la base elle-même,
  avec le jeton GitHub déjà rangé dans le Vault pour l'horloge des réseaux
  sociaux, et utilise les secrets `SUPABASE_ACCESS_TOKEN` et
  `SUPABASE_PROJECT_REF` déjà présents dans le dépôt.

Rien à faire à la main pour ces points. Relancer un workflow (« Run
workflow ») est toujours sans risque.

## 2. L'envoi des e-mails (Resend)

Le rapport part en PDF, en pièce jointe, depuis `noreply@quiz-couple.com`,
réponses vers `infoquizcouple@gmail.com`. Sans clé Resend, tout marche sauf
l'e-mail : le rapport reste téléchargeable sur la page.

1. Créer un compte sur resend.com (l'offre gratuite suffit : 3 000 e-mails
   par mois, 100 par jour).
2. Domains > Add domain : `quiz-couple.com`. Resend donne trois ou quatre
   enregistrements DNS (SPF, DKIM, et un MX pour le sous-domaine d'envoi) à
   ajouter chez le registraire du domaine. Attendre que le domaine passe
   « Verified » : sans ça, les e-mails partent en indésirables ou pas du
   tout.
3. API Keys > Create API key, droit « Sending access » sur ce domaine.
4. Supabase > Project Settings > Edge Functions > Secrets : ajouter
   `RESEND_API_KEY` = la clé `re_...`.

## 3. Le compte Stripe

1. Créer le compte sur stripe.com, pays France, type d'entreprise
   « Entreprise individuelle », nom Visibilitea, SIRET 940 106 800 00011,
   avec l'IBAN du compte où recevoir les virements et une pièce d'identité.
2. Paramètres > Informations publiques sur l'entreprise :
   - nom public : Quiz Couple ;
   - libellé sur les relevés bancaires : `QUIZ COUPLE` (c'est ce que la
     personne verra sur son relevé ; un libellé inconnu fait des
     contestations) ;
   - e-mail et site du support : infoquizcouple@gmail.com et
     https://quiz-couple.com/contact/.
3. Paramètres > E-mails clients : cocher « Paiements réussis » et
   « Remboursements ». Le reçu de Stripe est la confirmation de commande
   « sur un support durable » qu'exige la loi : les conditions de vente le
   disent, il doit donc partir.
4. Paramètres > Moyens de paiement : carte, Apple Pay et Google Pay sont
   actifs par défaut. Rien d'autre à activer. La page de paiement est
   hébergée par Stripe : pas de domaine à faire vérifier pour Apple Pay.

La TVA ne s'applique pas (franchise en base, article 293 B du CGI) : ne rien
configurer dans Stripe Tax.

## 4. Essayer d'abord en mode test

Stripe a un mode test (interrupteur en haut à droite du tableau de bord),
avec ses propres clés. Les paiements y sont faux. **Avec une clé de test, le
paiement s'ouvre sur la page du bilan même tant qu'elle n'est pas publique**
(la fonction prévient la page, `paiementTest`) : on peut tout essayer sur le
vrai site, sans que personne d'autre ne le voie.

1. Développeurs > Clés API (mode test) : copier la clé secrète `sk_test_...`.
2. Supabase > Project Settings > Edge Functions > Secrets : ajouter
   `STRIPE_SECRET_KEY` = la clé `sk_test_...`.
3. Développeurs > Webhooks (mode test) > Ajouter une destination :
   - URL : `https://<projet>.supabase.co/functions/v1/bilan-stripe`
     (`<projet>` est l'identifiant du projet Supabase, celui de
     `SUPABASE_PROJECT_REF`) ;
   - événements : `checkout.session.completed`,
     `checkout.session.async_payment_succeeded` et `charge.refunded` (ce
     dernier fait apparaître les remboursements dans l'admin) ;
   - une fois créée, afficher sa « clé secrète de signature » `whsec_...` et
     la mettre dans le secret Supabase `STRIPE_WEBHOOK_SECRET`.
4. Faire une évaluation à deux sur https://quiz-couple.com/evaluation-de-couple/ (deux
   téléphones, ou deux navigateurs). Le premier qui a fini ses réponses voit
   l'offre : y mettre son adresse e-mail, cocher la case et payer avec la
   carte de test `4242 4242 4242 4242`, n'importe quelle date future,
   n'importe quel code. Puis finir les réponses du second.
5. Vérifier :
   - au retour de Stripe, la page dit que le rapport est réglé et qu'il
     arrivera dès que l'autre aura fini ;
   - dans Stripe > Webhooks, l'événement est marqué « 200 » ;
   - quand le second a fini, dans les dix minutes : GitHub > Actions >
     « Bilan de couple · rapports PDF » a tourné, l'e-mail est arrivé avec
     le PDF, et la page des deux montre le rapport et le bouton « Télécharger
     le PDF » ;
   - dans l'admin, onglet Bilan : une vente, un PDF envoyé.
6. Rembourser ce paiement de test dans Stripe : l'admin le compte dans
   « remboursé » au prochain chargement.

Le retour sur la page débloque le paiement à lui seul (la page relit la
session de paiement chez Stripe) ; le webhook est le filet de sécurité quand
la personne ferme l'onglet avant de revenir. Les deux doivent marcher.

## 5. Les mentions légales du vendeur

Dans `static-site/build/config.js`, objet `VENDEUR` : le nom (Visibilitea),
le statut (entreprise individuelle de Thomas Owaller), le SIRET et, depuis le
19 octobre 2026, l'adresse (4 rue de Bruges, 67000 Strasbourg) sont remplis.
Les mentions légales et les conditions de vente les affichent ; le build
prévient (« bilan ouvert sans SIRET ou sans adresse ») si l'un des deux
manque.

Pas de médiateur de la consommation (choix de Thomas, 18 octobre 2026) : la
section « Réclamations » des conditions de vente s'écrit sans. La loi
(article L612-1 du Code de la consommation) en demande un à tout vendeur à
des particuliers ; pour en ajouter un plus tard, il suffit de déclarer
`mediateur: { nom, site }` dans `VENDEUR`, et la phrase revient d'elle-même
dans les cinq langues.

## 6. Passer en réel et ouvrir

1. Stripe, mode réel : Développeurs > Clés API > clé secrète `sk_live_...`
   dans le secret Supabase `STRIPE_SECRET_KEY` (elle remplace la clé de
   test).
2. Stripe, mode réel : refaire le webhook du point 4 (les webhooks du mode
   test ne servent pas en réel) et mettre sa nouvelle clé `whsec_...` dans
   `STRIPE_WEBHOOK_SECRET`.
3. `static-site/build/config.js` : `BILAN_OUVERT = true`. À la publication
   suivante :
   - la page est indexée et entre dans le plan du site, en tête des tests de
     couple du menu, de l'accueil et du pied de page ;
   - l'encart du bilan apparaît sous le résultat des dix-neuf tests de
     `BILAN_ENTREES` (config.js), et sa bannière au-dessus des cartes « À
     faire ensuite » de ces pages ;
   - le pied de page gagne le lien vers les conditions de vente, la
     politique de confidentialité sa section sur le bilan.

Avec la clé réelle, le paiement n'est proposé que sur une page construite
ouverte : on ne peut pas vendre par erreur avant l'étape 3.

## 7. Ensuite

- **Suivre** : onglet Bilan de l'admin. Visites de la page, bilans démarrés,
  ventes et conversion ; les ventes jour par jour ; l'entonnoir de la visite
  au paiement ; les domaines où les gens s'arrêtent ; la source de chaque
  visite (encart sous le résultat de tel test, bannière du bas de page,
  menu, accueil, direct) avec ses ventes ; les délais ; l'état des PDF et
  leurs erreurs ; les rapports payés dont le partenaire n'a pas fini.
- **Un PDF en erreur** : la fabrique refuse d'envoyer un rapport dont un
  texte sortirait de sa boîte. Le workflow échoue (GitHub prévient par
  e-mail) et l'erreur s'affiche dans l'admin. Le rapport reste lisible sur
  la page. Après correction, relancer le workflow : il reprend les rapports
  en erreur (trois essais).
- **Rembourser** (garantie de quatorze jours, `GARANTIE_JOURS`, ou un
  partenaire qui ne finit jamais) : Stripe > Paiements > le paiement >
  Rembourser. Le rapport reste ouvert : le but est de garder la confiance,
  pas de reprendre l'accès.
- **Facture** : si quelqu'un en demande une, Stripe > Paiements > le
  paiement > « Envoyer le reçu » suffit le plus souvent ; sinon une facture
  faite à la main, avec la mention de la TVA.
- **Changer le prix** : `PRIX_CENTIMES` dans
  `supabase/functions/_shared/bilan/coeur.mjs`. Le serveur et le site le
  lisent au même endroit (le site à la construction, la fonction au
  déploiement).
- **Contestation** (chargeback) : Stripe prévient par e-mail. Répondre avec
  l'heure du paiement (dans Stripe) et la case de renonciation cochée avant
  de payer : sa date est dans `renonciation_le`, table `bilans`, tant que le
  bilan n'a pas été supprimé.
