# Néerlandais (nl)

Les textes néerlandais du site, rangés comme ceux des cinq autres langues
(`fr/`, `en/`, `es/`, `de/`, `it/`) : un fichier JSON par espace de noms,
même nom, mêmes clés.

La langue est construite mais cachée tant qu'elle figure dans
`LANGUES_CACHEES` (`static-site/build/config.js`) : ses pages sont publiées en
noindex, hors des sitemaps, du hreflang, des flux RSS et du sélecteur de
langue des autres pages. Une page n'existe en néerlandais qu'une fois son
adresse écrite dans `ROUTE_SLUGS`, un article qu'une fois son adresse écrite
dans `BLOG_ARTICLES` et son fichier posé dans `data/blog/nl/` ; une clé absente
d'ici retombe sur le français.

Le chantier est décrit dans `docs/langues/CADRAGE-NL.md`, son avancement dans
`docs/langues/nl/AVANCEMENT.md`, le ton et la typographie dans
`docs/langues/nl/STIJLGIDS.md`. Contrôle : `node build/verifie-langue.mjs nl`
depuis `static-site/`.
