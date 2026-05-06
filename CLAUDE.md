# Quiz Couple - Project Guide

## Architecture

Static site generator (EJS + vanilla JS) deployed to GitHub Pages.
- **Main site**: quiz-couple.com (GitHub Pages)
- **Annuaire**: annuaire.quiz-couple.com (Cloudflare Pages) — DISSOCIATED from main site
- **Backend**: Supabase (blog articles, reviews, professionals)
- **Languages**: FR (primary), EN, ES, DE, IT — frOnly pages should NOT appear in non-FR navigation

## Build

```bash
cd static-site
npm ci
npm run build          # Main site → dist/
npm run build:annuaire # Annuaire → dist/annuaire/
```

## Key Files

- `static-site/build/config.js` — Routes, languages, blog articles, helpers
- `static-site/build/generate.js` — Main site generator
- `static-site/build/generate-annuaire.js` — Annuaire generator (skip empty pages, 302 redirects)
- `static-site/templates/base.ejs` — HTML base template (meta, OG, hreflang, JSON-LD)
- `static-site/templates/pages/quiz-generic.ejs` — Generic quiz page template
- `static-site/templates/partials/related-tests.ejs` — Related tests internal linking
- `static-site/js/quiz-engine-core.js` — Quiz engine (SoloTest, DuoMatch, Coquin, etc.)
- `static-site/js/quiz-loader.js` — Quiz config & initialization
- `static-site/css/styles.css` — Main stylesheet
- `fr/*.json` — French translations (quizzes.json, common.json, home.json, gd.json, quiz-*.json)

## Quiz Engine Types

- `SoloTest` — Single player, points-based (toxic, divorce, mariage, ado, genant, jalousie, attachement, confiance)
- `DuoMatchQuiz` — 2 players, answer matching (tester-couple, common-points)
- `HealthyQuiz` — 2 players, weighted scoring (couple-sain)
- `DistanceQuiz` — 2 players, alternating turns (distance)
- `CoquinQuiz` — Guess & reveal (coquin)
- `KnowledgeQuiz` — Oral validation with check/cross (knowledge)
- `DebateQuiz` — 1-5 scale debate (amoureux)
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
