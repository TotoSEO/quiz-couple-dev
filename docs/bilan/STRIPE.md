# Bilan de couple : brancher Stripe et ouvrir la vente

Ce guide dit, dans l'ordre, tout ce qu'il faut faire pour que le rapport
complet du bilan se vende. Le code est prêt : il ne manque que des comptes,
des clés et trois informations légales. Compter une heure, plus le délai de
vérification de Stripe (souvent quelques minutes, parfois un ou deux jours).

Tant que rien n'est fait, rien ne se passe : la page du bilan existe mais
n'est pas indexée, aucun lien n'y mène, et l'écran de paiement dit que le
paiement « ouvre très bientôt ».

## 1. Ce qui se déploie tout seul à la fusion

- `bilan-base.yml` applique la migration `20261018120000_bilan_couple.sql`
  (table `bilans`, compteurs, ménage de chaque nuit, `get_bilan_stats`).
- `deploy-functions.yml` déploie les fonctions `bilan` (l'application) et
  `bilan-stripe` (le webhook), sans vérification de JWT
  (`supabase/config.toml`).

Rien à faire à la main pour ces deux points. Le relancer (« Run workflow »)
est toujours sans risque.

## 2. Le compte Stripe

1. Créer le compte sur stripe.com, pays France, type d'entreprise
   « Entreprise individuelle » (micro-entrepreneur), avec le SIRET, l'IBAN du
   compte où recevoir les virements et une pièce d'identité.
2. Paramètres > Informations publiques sur l'entreprise :
   - nom public : Quiz Couple ;
   - libellé sur les relevés bancaires : `QUIZ COUPLE` (c'est ce que la
     personne verra sur son relevé, un libellé inconnu fait des
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

## 3. Essayer d'abord en mode test

Stripe a un mode test (interrupteur en haut à droite du tableau de bord),
avec ses propres clés. Les paiements y sont faux. **Avec une clé de test, le
paiement s'ouvre sur la page du bilan même tant qu'elle n'est pas publique**
(la fonction prévient la page, `paiementTest`) : on peut donc tout essayer
sur le vrai site, sans que personne d'autre ne le voie.

1. Développeurs > Clés API (mode test) : copier la clé secrète `sk_test_...`.
2. Supabase > Project Settings > Edge Functions > Secrets : ajouter
   `STRIPE_SECRET_KEY` = la clé `sk_test_...`.
3. Développeurs > Webhooks (mode test) > Ajouter une destination :
   - URL : `https://<projet>.supabase.co/functions/v1/bilan-stripe`
     (`<projet>` est l'identifiant du projet Supabase, celui de
     `SUPABASE_PROJECT_REF`) ;
   - événements : `checkout.session.completed` et
     `checkout.session.async_payment_succeeded` ;
   - une fois créée, afficher sa « clé secrète de signature » `whsec_...` et
     la mettre dans le secret Supabase `STRIPE_WEBHOOK_SECRET`.
4. Faire un bilan à deux sur https://quiz-couple.com/bilan-de-couple/ (deux
   téléphones, ou deux navigateurs), aller jusqu'au résultat, cocher la case
   et payer avec la carte de test `4242 4242 4242 4242`, n'importe quelle
   date future, n'importe quel code.
5. Vérifier : le rapport s'ouvre au retour sur la page ; dans Stripe >
   Webhooks, l'événement est marqué « 200 » ; dans l'admin, onglet Bilan,
   la ligne du jour compte un bilan payé.

Le retour sur la page débloque le rapport à lui seul (la page relit la
session de paiement chez Stripe) ; le webhook est le filet de sécurité quand
la personne ferme l'onglet avant de revenir. Les deux doivent marcher.

## 4. Les mentions légales du vendeur

Dans `static-site/build/config.js`, objet `VENDEUR` :

- `siret` : le numéro SIRET ;
- `adresse` : l'adresse postale (une domiciliation suffit si on ne veut pas
  publier son adresse personnelle) ;
- `mediateur` : `{ nom, site }` du médiateur de la consommation. Tout
  vendeur à des particuliers doit en proposer un, gratuitement pour le
  client (article L612-1 du Code de la consommation). L'adhésion à un
  médiateur agréé coûte quelques dizaines d'euros par an (liste sur
  economie.gouv.fr, « médiateurs de la consommation référencés »).

Les mentions légales et les conditions de vente les affichent dès qu'ils
sont remplis. Le build prévient (« bilan ouvert sans SIRET, adresse ou
médiateur ») si on ouvre sans eux.

## 5. Passer en réel et ouvrir

1. Stripe, mode réel : Développeurs > Clés API > clé secrète `sk_live_...`
   dans le secret Supabase `STRIPE_SECRET_KEY` (elle remplace la clé de
   test).
2. Stripe, mode réel : refaire le webhook du point 3 (les webhooks du mode
   test ne servent pas en réel) et mettre sa nouvelle clé `whsec_...` dans
   `STRIPE_WEBHOOK_SECRET`.
3. `static-site/build/config.js` : `BILAN_OUVERT = true`. À la publication
   suivante, la page est indexée et entre dans le plan du site, le menu des
   tests de couple, les cartes « À faire ensuite » ; l'encart du bilan
   apparaît sous le résultat des quatorze tests listés dans `TESTS_BILAN`
   (quiz-engine-core.js) ; le pied de page gagne le lien vers les conditions
   de vente ; la politique de confidentialité gagne sa section sur le bilan.

Avec la clé réelle, le paiement n'est proposé que sur une page construite
ouverte : on ne peut pas vendre par erreur avant l'étape 3.

## 6. Ensuite

- **Rembourser** (garantie de quatorze jours, `GARANTIE_JOURS`) : Stripe >
  Paiements > le paiement > Rembourser. Le rapport reste ouvert, ce n'est
  pas grave : le but est de garder la confiance, pas de reprendre l'accès.
- **Facture** : si quelqu'un en demande une, Stripe > Paiements > le
  paiement > « Envoyer le reçu » suffit le plus souvent ; sinon une facture
  de micro-entrepreneur faite à la main, avec la mention de la TVA.
- **Changer le prix** : `PRIX_CENTIMES` dans
  `supabase/functions/_shared/bilan/coeur.mjs`. Le serveur et le site le
  lisent au même endroit (le site à la construction, la fonction au
  déploiement).
- **Suivre** : onglet Bilan de l'admin, l'entonnoir jour par jour (créés,
  rejoints, premier fini, finis à deux, payés, chiffre d'affaires).
- **Contestation** (chargeback) : Stripe prévient par e-mail. Répondre avec
  l'heure du paiement (dans Stripe) et la case de renonciation cochée avant
  de payer : sa date est dans `renonciation_le`, table `bilans`, tant que le
  bilan n'a pas été supprimé.
