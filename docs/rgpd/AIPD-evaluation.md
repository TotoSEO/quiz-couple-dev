# Analyse d'impact (AIPD) : l'évaluation de couple

Rédigée le 22 octobre 2026, selon la démarche de la CNIL (contexte,
principes fondamentaux, risques, plan d'action), pour l'évaluation de
couple payante de Quiz Couple (« bilan » dans le code). À relire à chaque
changement du traitement, et au moins une fois par an.

## Pourquoi une analyse d'impact

Le Comité européen de la protection des données liste neuf critères. Un
traitement qui en réunit deux appelle en principe une analyse d'impact.
L'évaluation en réunit deux :

- **des données sensibles** (article 9) : la vie sexuelle, les convictions, les opinions, et la santé du couple au sens large ;
- **l'évaluation des personnes** : le rapport compare et qualifie la relation, domaine par domaine.

Elle n'est pas « à grande échelle » : 128 évaluations au 22 octobre 2026.
La liste de la CNIL des traitements pour lesquels une analyse est
obligatoire ne la cite pas nommément. L'analyse reste la façon la plus
simple de montrer que les risques ont été regardés en face.

## 1. Le contexte

### Le traitement

Deux partenaires, chacun sur son téléphone, ou une seule personne en mode
seul(e), répondent à cent questions sur leur vie à deux. Une fois le
rapport payé (9,90 €, une fois pour les deux), un rapport d'une quarantaine
de pages met leurs réponses face à face. Il est montré sur la page et
envoyé en PDF par e-mail.

- **Responsable** : Visibilitea, entreprise individuelle de Thomas Owaller (Strasbourg).
- **Sous-traitants** :
  - Supabase : base, stockage du PDF, fonctions ;
  - Stripe : paiement ;
  - Resend : envoi des e-mails, PDF compris ;
  - GitHub Pages : hébergement des pages, sans données de l'évaluation.

### Les données

| Donnée | Pour qui | Sensible |
|---|---|---|
| Prénoms, genre (facultatif) | les deux | non |
| Situation du couple (vie commune, enfants, mariage...) | le couple | non |
| Réponses aux cent questions | chacun pour soi | oui, pour une partie (intimité, valeurs, confiance) |
| En seul(e) : ce que la personne imagine des réponses de l'autre | le partenaire, absent | oui, pour une partie |
| Adresse e-mail | chacun | non |
| Empreinte salée de l'adresse IP | le créateur | non |
| Session de paiement, montant, e-mail du reçu | le payeur | non |
| Le rapport PDF | les deux | oui |

### Le cycle de vie

1. **Création** : prénoms, les deux cases (18 ans, consentement).
2. **Réponses** : la situation puis les cent questions, enregistrées au fil de l'eau.
3. **Fin** : l'adresse e-mail.
4. **Paiement** (Stripe).
5. **Rapport** : calculé à la demande ; le PDF est fabriqué dans Chrome par un workflow, rangé dans un stockage privé et envoyé par Resend.
6. **Effacement** : 60 jours après la dernière réponse sans paiement, six mois après le paiement, ou tout de suite à la demande de l'un des deux.

## 2. Les principes fondamentaux

- **Finalité** : produire le rapport, et rien d'autre. Les adresses ne servent pas aux envois de conseils ou de nouveautés : la case dit « uniquement dans le but de fournir le rapport d'évaluation ».
- **Base légale** : le consentement explicite de chacun pour ses propres réponses (article 9.2.a), donné en cochant une case distincte avant la première question, avec sous la case ce qui sera fait des réponses, qui les verra et combien de temps elles seront gardées.
- **Minimisation** : pas de nom de famille, pas de date de naissance, pas de compte ni de mot de passe. Le genre est facultatif. L'adresse IP n'est gardée qu'en empreinte salée.
- **Exactitude** : chacun peut revenir sur ses réponses tant que les deux n'ont pas fini. La situation se corrige avant la première question.
- **Durées** : 60 jours sans paiement, six mois après paiement, PDF et adresses compris (`bilan_menage`, chaque nuit). Seuls des compteurs anonymes restent.
- **Information** : sous la case du consentement, dans la politique de confidentialité (section de l'évaluation, cinq langues), dans les CGV.
- **Droits** :
  - effacement immédiat depuis le rapport, par l'un ou l'autre ;
  - retrait du consentement par la suppression ;
  - accès et portabilité : le rapport lui-même, en ligne et en PDF ;
  - les autres droits, par le formulaire de contact.
- **Âge** : 18 ans, déclaré par une case.
- **Sous-traitance** : Supabase, Stripe et Resend, chacun sous ses conditions et son accord de sous-traitance (à garder avec le registre).
- **Transferts hors de l'Union** : Resend (États-Unis), clauses contractuelles types. C'est le point le plus sensible : le PDF envoyé en pièce jointe passe par Resend (voir le risque 3).

## 3. Les risques

Pour chaque risque : ce qui peut arriver, ce qui le limite déjà, et ce qui
reste.

### Risque 1 : quelqu'un lit les réponses d'un autre (accès illégitime)

- **Sources** : un lien personnel qui circule (téléphone partagé, capture d'écran, historique), un partenaire qui prend le téléphone de l'autre, une fuite de la base.
- **Impact** : très gênant à grave. Des réponses intimes lues par un tiers, ou par le partenaire avant la fin.
- **Mesures en place** :
  - **liens** : tirés au hasard, dans le fragment de l'adresse (jamais envoyé au serveur ni écrit dans les journaux), gardés en base seulement en empreinte ;
  - **lien perdu** : « Retrouver mon évaluation » remplace le jeton, l'ancien lien meurt ;
  - **avant la fin** : chacun ne voit que ses réponses tant que les deux n'ont pas fini ;
  - **base** : la table est fermée à la clé publique, et seules les fonctions serveur l'ouvrent ;
  - **PDF** : dans un stockage privé, téléchargé par un lien signé de dix minutes ;
  - **administration** : elle ne lit jamais les réponses, seulement des compteurs.
- **Ce qui reste** : un téléphone déverrouillé laissé à l'autre. C'est inhérent à un service sans compte : le rapport le montre aux deux de toute façon.
- **Gravité et vraisemblance** : importante, limitée. Risque résiduel **modéré**.

### Risque 2 : l'évaluation sert à contrôler l'autre

- **Sources** : dans un couple où l'un domine, celui-ci impose l'évaluation, ou lit les réponses de l'autre.
- **Impact** : grave. Pression, représailles après le rapport.
- **Mesures en place** :
  - chacun ne voit pas les réponses de l'autre avant la fin ;
  - avant de commencer, un message renvoie vers le 3919 et ses équivalents par pays : « si vous avez peur de votre partenaire, elle n'est pas faite pour votre situation » ;
  - le mode seul(e) ne contacte jamais le partenaire ;
  - chacun peut tout effacer à tout moment ;
  - les tests sur l'emprise et la manipulation ne renvoient jamais vers l'évaluation.
- **Ce qui reste** : le service ne peut pas savoir qui répond sous la contrainte.
- **Gravité et vraisemblance** : grave, limitée. Risque résiduel **modéré**, à garder en tête dans les textes.

### Risque 3 : le PDF passe par un tiers hors de l'Union

- **Sources** : le PDF part en pièce jointe par Resend (États-Unis) et reste dans les boîtes de réception, chez les fournisseurs de messagerie des personnes.
- **Impact** : important. Le rapport entier, réponses sensibles comprises, chez un sous-traitant américain et dans des boîtes de messagerie qu'on ne maîtrise pas.
- **Mesures en place** :
  - clauses contractuelles types avec Resend ;
  - envoi seulement aux adresses données par les personnes elles-mêmes ;
  - huit envois au plus par évaluation ;
  - les e-mails « rapport prêt » et le rappel ne contiennent rien du rapport.
- **Ce qui reste** : le contenu sensible passe par Resend. La boîte de réception échappe à l'effacement à six mois.
- **Gravité et vraisemblance** : importante, limitée. Risque résiduel **modéré**.
- **Amélioration possible** (voir le plan d'action) : envoyer un lien de téléchargement plutôt que la pièce jointe.

### Risque 4 : des données sur une personne qui n'a rien demandé (mode seul(e))

- **Sources** : en seul(e), la personne enregistre ce qu'elle imagine des réponses de son partenaire, sujets intimes compris, sans que celui-ci le sache.
- **Impact** : limité. Ce sont les suppositions d'une personne, pas des faits. Elles ne sont rattachées qu'à un prénom, ne sont montrées qu'à elle, et le partenaire n'est jamais contacté.
- **Mesures en place** :
  - aucune donnée qui identifie le partenaire au-delà d'un prénom ;
  - effacement à 60 jours sans paiement, à six mois avec ;
  - la politique de confidentialité et les CGV le disent.
- **Ce qui reste** : le partenaire n'est pas informé. L'informer reviendrait à révéler la démarche de la personne, ce qui irait contre l'intérêt des deux. C'est l'exception de l'article 14.5.b, à condition de le documenter ici.
- **Risque résiduel** : **faible**.

### Risque 5 : perte ou modification des données

- **Sources** : panne, erreur de code, base pleine (plan gratuit).
- **Impact** : limité. Refaire les questions, ou un rapport faux.
- **Mesures en place** :
  - frein des écritures publiques, pour que la base ne se remplisse pas ;
  - avant tout envoi, deux contrôles du PDF ; un PDF qui échoue n'est jamais envoyé ;
  - tests automatiques du calcul et des vingt rapports d'exemple à chaque changement.
- **Ce qui reste** : le plan gratuit de Supabase ne garde pas de sauvegarde téléchargeable (`RECOVERY.md`). Une base perdue, c'est des évaluations à refaire, et des rapports payés à renvoyer à partir de rien.
- **Risque résiduel** : **faible** pour les personnes, mais réel pour le service.

## 4. Le plan d'action

| Action | Pourquoi | Qui | Quand |
|---|---|---|---|
| Garder les accords de sous-traitance de Supabase, Stripe et Resend avec le registre | preuve des garanties | Thomas | dès que possible |
| Vérifier la région du projet Supabase (la politique dit Union européenne) | transferts | Thomas | dès que possible |
| Envoyer le rapport par un lien de téléchargement (la page, après saisie de l'adresse) plutôt qu'en pièce jointe | risque 3 : le contenu sensible ne passerait plus par Resend ni ne resterait dans les boîtes | à décider par Thomas, qui a voulu le PDF directement par e-mail | à trancher |
| Une sauvegarde de la base (plan payant de Supabase, ou export régulier chiffré) | risque 5 | Thomas | quand les ventes commencent |
| Relire cette analyse à chaque changement de l'évaluation, et une fois par an | suivi | Thomas | octobre 2027 au plus tard |

## 5. Validation

Analyse préparée le 22 octobre 2026. Avec les mesures en place, les risques
résiduels sont jugés acceptables. La troisième action du plan reste une
décision de Thomas Owaller, responsable du traitement, qui valide
l'analyse en signant et datant ci-dessous.

Validé par : ............................ le ....................
