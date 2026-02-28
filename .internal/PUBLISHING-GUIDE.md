# Guide de Publication d'Articles - Quiz Couple

> Ce fichier est un guide interne pour Claude Code. Il décrit la procédure exacte
> pour publier un article de blog sur quiz-couple.com.

---

## 1. Créer le fichier article FR

Chemin : `data/blog/fr/<slug-interne>.ts`

Structure obligatoire :

```typescript
import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: '<slug-url-fr>',                    // slug dans l'URL (ex: 'avis-hinge-rencontre')
  title: `Titre affiché en H1`,
  metaTitle: `Titre SEO (<60 caractères)`,
  metaDescription: `Description SEO (<160 caractères)`,
  featuredImage: '/blog/<image-name>.webp',  // Image dans public/blog/
  featuredImageAlt: `description alt de l'image`,
  publishedAt: 'YYYY-MM-DD',
  author: AUTHORS['mathieu-courtin'],        // ou AUTHORS['lucie-courtin']
  excerpt: `Chapeau court (1-2 phrases)`,
  introduction: `<p>Paragraphes HTML d'introduction...</p>`,
  quickSummary: [
    `Point clé 1`,
    `Point clé 2`,
    // 4-6 points maximum
  ],
  sections: [
    {
      id: 'section-id-kebab-case',
      title: `Titre H2`,
      content: `<p>Contenu HTML...</p>`,
      // Optionnel: sous-sections
      subsections: [
        {
          id: 'sous-section-id',
          title: `Titre H3`,
          content: `<p>Contenu HTML...</p>`,
        },
      ],
      // Optionnel: bloc astuce (affiché après la section)
      tip: `Texte de l'astuce, peut contenir du <strong>HTML</strong>.`,
    },
  ],
};

export default article;
```

### Règles de contenu HTML
- Utiliser `<p>`, `<strong>`, `<ul>/<li>`, `<table>` pour le formatage
- Les blocs "astuce" utilisent le champ `tip` de la section (pas de HTML custom)
- Pour les tableaux : entourer de `<div><table>...</table></div>`
- Score final : utiliser `<p class="blog-note-score"><strong>X/10</strong></p>`

---

## 2. Ajouter l'image à la une

- Format : `.webp` (optimisé, max ~200KB)
- Chemin : `public/blog/<nom-image>.webp`
- Taille recommandée : 1200x630px (ratio OG)

---

## 3. Enregistrer l'article dans la config

Fichier : `static-site/build/config.js`

Ajouter dans le tableau `BLOG_ARTICLES` :

```javascript
{
  internalSlug: '<slug-interne>',  // = nom du fichier .ts (sans extension)
  slugs: {
    fr: '<slug-fr>',
    en: '<slug-en>',
    es: '<slug-es>',
    de: '<slug-de>',
    it: '<slug-it>',
  },
  publishedAt: 'YYYY-MM-DD',
},
```

---

## 4. Créer les traductions (4 langues)

Créer les fichiers dans :
- `data/blog/en/<slug-interne>.ts`
- `data/blog/es/<slug-interne>.ts`
- `data/blog/de/<slug-interne>.ts`
- `data/blog/it/<slug-interne>.ts`

### Règles de traduction
- **Structure identique** au fichier FR (mêmes champs, même ordre)
- **slug** : utiliser le slug de la langue cible (défini dans config.js)
- **featuredImage** : MÊME chemin que le FR
- **author** : MÊME auteur que le FR
- **publishedAt** : MÊME date que le FR
- **Section IDs** : traduire en kebab-case dans la langue cible
- **Conserver le gras** : si un mot est en `<strong>` en FR, la traduction doit aussi être en `<strong>`
- **Adapter les références géographiques** :
  - EN : "en France" → "in the US/UK", "Paris" → "major cities"
  - ES : "en France" → "en España", "Paris" → "Madrid/Barcelona"
  - DE : "en France" → "in Deutschland", "Paris" → "Berlin/München"
  - IT : "en France" → "in Italia", "Paris" → "Milano/Roma"
- **Prix** : garder en €

---

## 5. Builder le site

```bash
cd static-site && node build/generate.js
```

Le build va :
- Générer les pages article pour les 5 langues
- Mettre à jour le listing blog (automatique)
- Mettre à jour la homepage (3 derniers articles, automatique)
- Générer les JSON-LD (BreadcrumbList + Article schema)
- Générer les hreflang entre les 5 versions linguistiques

---

## 6. Vérifier

- L'article apparaît dans `/blog/` (listing)
- L'article est accessible via son slug
- Les 5 versions linguistiques existent
- Les JSON-LD sont présents et valides
- L'image à la une s'affiche
- Le sommaire fonctionne
- Les blocs astuce s'affichent correctement

---

## Checklist rapide

- [ ] Fichier FR créé dans `data/blog/fr/`
- [ ] Image `.webp` dans `public/blog/`
- [ ] Article ajouté dans `config.js` > `BLOG_ARTICLES`
- [ ] 4 traductions créées (en, es, de, it)
- [ ] Build réussi sans erreur
- [ ] Commit + push
