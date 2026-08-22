# Quiz Couple - Project Guide

## Architecture

Static site generator (EJS + vanilla JS) deployed to GitHub Pages.
- **Main site**: quiz-couple.com (GitHub Pages)
- **Backend**: Supabase (blog articles, reviews)
- **Languages**: FR (primary), EN, ES, DE, IT — frOnly pages should NOT appear in non-FR navigation

## Build

```bash
cd static-site
npm ci
npm run build          # Main site → dist/
```

## Key Files

- `static-site/build/config.js` — Routes, languages, blog articles, helpers
- `static-site/build/generate.js` — Main site generator
- `static-site/templates/base.ejs` — HTML base template (meta, OG, hreflang, JSON-LD)
- `static-site/templates/pages/quiz-generic.ejs` — Generic quiz page template
- `static-site/templates/partials/related-tests.ejs` — Related tests internal linking
- `static-site/js/quiz-engine-core.js` — Quiz engine (SoloTest, DuoMatch, Coquin, etc.)
- `static-site/js/quiz-loader.js` — Quiz config & initialization
- `static-site/css/styles.css` — Main stylesheet
- `fr/*.json` — French translations (quizzes.json, common.json, home.json, gd.json, quiz-*.json)

## Quiz Engine Types

- `SoloTest` — Single player, points-based (toxic, divorce, mariage, genant, jalousie, attachement, confiance)
- `DuoMatchQuiz` — 2 players, answer matching (tester-couple, common-points)
- `HealthyQuiz` — 2 players, weighted scoring (couple-sain)
- `DistanceQuiz` — 2 players, alternating turns (distance)
- `quiz-ado-multiplayer.js` — Dedicated engine for the teen quiz: 2 players, same phone or game code, score = identical answers (not part of quiz-loader)
- `CoquinQuiz` — Guess & reveal (coquin)
- `KnowledgeQuiz` — Oral validation with check/cross (knowledge)
- `FunnyQuiz` — Discussion only, no scoring (marrant)
- `MostQuiz` — 2-8 players, vote (most)
- `ParentaliteQuiz` — 2 players, explicit point values (parentalite, emmenager)
- `TruefalseQuiz` — True/false with answer reveal (vrai-faux)

## UI/UX Design Guidelines

### Visual Identity
- **Primary color**: hsl(340, 65%, 65%) — Rose/pink
- **Secondary color**: hsl(270, 40%, 50%) — Purple
- **Font stack**: Inter (body), Poppins (headings)
- **Border radius**: 1rem (--radius)
- **Dark mode**: Supported via `.dark` class + CSS variables

### Design Principles
- Modern, clean, rounded aesthetic
- Cards with subtle borders and hover effects
- Gradient backgrounds for hero sections
- Smooth transitions and subtle animations
- Mobile-first responsive design
- Accessible (ARIA labels, semantic HTML, contrast ratios)

### Component Patterns
- `.btn .btn-cta` — Primary call-to-action button
- `.btn .btn-outline` — Secondary outline button
- `.card` — Standard card container
- `.hero-*` — Homepage hero section
- `.quiz-engine` — Quiz container
- `.blog-*` — Blog article styles
- `.nav-*` — Navigation components

### When Improving UI/UX
1. Always preview in browser before reporting done
2. Test both light and dark modes
3. Verify mobile responsiveness (360px minimum)
4. Maintain consistent spacing (4px grid: 0.25rem, 0.5rem, 1rem, 1.5rem, 2rem)
5. Use existing CSS variables, don't hardcode colors
6. Keep animations subtle (150-300ms transitions)
7. Don't break existing quiz engine functionality

## Maillage interne : les règles

Les ancres contextuelles et descriptives sont les liens les plus puissants du
site. Elles renforcent la sémantique de la page cible et ne sont pas du spam.
Ce ne sont **pas** des ancres du type « notre test sur X », ni le titre exact de
la page cible collé dans une phrase.

### La méthode, dans cet ordre

1. **Le contenu d'abord.** On écrit la page comme si aucun lien n'existait.
2. **Ensuite seulement, on relit** en cherchant les endroits où une formulation
   déjà présente mène naturellement vers une autre page.
3. **Si vraiment aucun endroit ne s'y prête, on reformule** un passage pour
   qu'un lien y ait sa place. Une page créée doit porter **au minimum 2 liens
   internes sortants en plein texte**, en plus du bloc de renvoi et de la
   colonne latérale, qui ne comptent pas.

### Ce qui fait une bonne ancre

- Elle est **contextuelle** : la phrase autour du lien parle déjà du sujet de la
  page cible.
- Elle est **descriptive** : elle décrit ce qu'on va trouver, pas le nom du test.
- **Le terme exact de la page cible n'a pas à être employé.** C'est même mieux
  quand il ne l'est pas : le lien reste naturel et apporte du vocabulaire
  nouveau à la cible.
- Elle est **naturelle** : on doit pouvoir lire la phrase à voix haute sans
  deviner qu'un lien y a été posé.

Exemples réels, tous validés :

| Ancre | Cible |
|---|---|
| « Quand un couple se dispute » | test couple toxique |
| « la preuve que rien n'est fini » | test est-ce la fin de mon couple |
| « garder une porte entrouverte » | test m'aime-t-il en secret |
| « dès les premiers mois de vie commune » | test emménager ensemble |
| « deux adultes qui vivent ensemble » | test couple sain |
| « y penser avant que ce soit fait » | test charge mentale |

### À vérifier avant de dire que c'est fait

- Chaque nouvelle page a au moins 2 sortants en plein texte **et** au moins
  1 entrant éditorial venu d'une autre page.
- Le maillage est répercuté **à l'identique dans les cinq langues**, avec une
  ancre écrite dans la langue de la page, jamais traduite mot à mot du français.
- Les liens sont écrits en dur dans les fichiers `{lang}/quiz-*.json`, avec
  l'URL préfixée par la langue hors FR (`/en/…`, `/es/…`, `/de/…`, `/it/…`).
- Aucun lien mort : passer le contrôle sur `dist/` après construction.

## Typographie des listes à puces

Une puce qui commence par un intitulé en gras se termine par **deux points**,
jamais par un point. La puce porte déjà la marque de la liste : mettre un point
après l'intitulé donne une phrase coupée en deux, et le lecteur bute dessus.

```
✗  • <strong>Répondre « pareil ».</strong> C'est le seul vrai interdit du jeu.
✓  • <strong>Répondre « pareil » :</strong> C'est le seul vrai interdit du jeu.
```

L'espace avant les deux points suit la langue : `« titre : »` en français,
`"title:"` en anglais, en espagnol, en allemand et en italien.

La règle vaut pour tout intitulé en gras qui annonce ce qui suit, y compris
quand il porte un lien : les deux points se posent **après** la balise de lien,
à l'intérieur du gras.

Elle ne vaut pas pour une phrase entière mise en gras au milieu d'un texte,
qui garde sa ponctuation normale.

## Avant de dire qu'un quiz est vérifié

Simuler le moteur en Node ne suffit pas : le chargeur (`quiz-loader.js`) fait
son propre travail entre les données et le moteur, et c'est là que sont passés
les deux seuls bugs livrés en production sur les nouvelles pages (un écran de
choix de mode sans texte, un test qui ne se chargeait pas).

**Ouvrir chaque nouvelle page dans Chromium et jouer une partie entière**, dans
les cinq langues et dans chaque mode : écran de choix, saisie des prénoms, les
questions, l'écran de résultat. Vérifier au passage qu'aucune erreur ne sort
dans la console et qu'aucun libellé n'est vide.
