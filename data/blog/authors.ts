import type { BlogAuthor } from '@/types/blog';

/**
 * Centralized author registry.
 * Each author has localized bios for SEO keyword relevance per language.
 */
export const AUTHORS: Record<string, BlogAuthor> = {
  'mathieu-courtin': {
    id: 'mathieu-courtin',
    name: 'Mathieu Courtin',
    avatar: '/authors/mathieu-courtin.webp',
    bios: {
      fr: "Mathieu Courtin est rédacteur spécialisé en relations amoureuses et psychologie du couple. Co-fondateur de Quiz Couple, il décrypte les dynamiques masculines dans la vie sentimentale avec un regard sincère, documenté et sans tabou.",
      en: "Mathieu Courtin is a writer specializing in romantic relationships and couple psychology. Co-founder of Quiz Couple, he explores male emotional dynamics in love with honesty, research-backed insights, and no taboos.",
      es: "Mathieu Courtin es redactor especializado en relaciones sentimentales y psicología de pareja. Cofundador de Quiz Couple, analiza las dinámicas masculinas en el amor con sinceridad, rigor y sin tabúes.",
      de: "Mathieu Courtin ist Autor mit Schwerpunkt auf Liebesbeziehungen und Paarpsychologie. Als Mitgründer von Quiz Couple beleuchtet er männliche emotionale Dynamiken in der Liebe — ehrlich, fundiert und ohne Tabus.",
      it: "Mathieu Courtin è autore specializzato in relazioni sentimentali e psicologia di coppia. Co-fondatore di Quiz Couple, analizza le dinamiche emotive maschili nell'amore con sincerità, rigore e senza tabù.",
    },
  },
  'lucie-courtin': {
    id: 'lucie-courtin',
    name: 'Lucie Courtin',
    avatar: '/authors/lucie-courtin.webp',
    bios: {
      fr: "Lucie Courtin est rédactrice spécialisée en relations de couple et bien-être émotionnel. Co-fondatrice de Quiz Couple, elle explore la vie sentimentale sous un angle féminin — avec empathie, profondeur et une touche de franc-parler.",
      en: "Lucie Courtin is a writer specializing in couple relationships and emotional well-being. Co-founder of Quiz Couple, she explores love from a female perspective — with empathy, depth, and a touch of straight talk.",
      es: "Lucie Courtin es redactora especializada en relaciones de pareja y bienestar emocional. Cofundadora de Quiz Couple, explora la vida sentimental desde una perspectiva femenina — con empatía, profundidad y franqueza.",
      de: "Lucie Courtin ist Autorin mit Schwerpunkt auf Paarbeziehungen und emotionalem Wohlbefinden. Als Mitgründerin von Quiz Couple beleuchtet sie die Liebe aus weiblicher Perspektive — mit Empathie, Tiefe und Klartext.",
      it: "Lucie Courtin è autrice specializzata in relazioni di coppia e benessere emotivo. Co-fondatrice di Quiz Couple, esplora la vita sentimentale da una prospettiva femminile — con empatia, profondità e schiettezza.",
    },
  },
};

/**
 * Get an author with the bio resolved for a specific language.
 */
export function getAuthor(authorId: string, lang: string): BlogAuthor {
  const author = AUTHORS[authorId];
  if (!author) {
    return { id: 'unknown', name: 'Quiz Couple', bios: {} };
  }
  return author;
}

/**
 * Get the localized bio for an author.
 */
export function getAuthorBio(author: BlogAuthor, lang: string): string {
  return author.bios?.[lang] || author.bios?.['fr'] || '';
}
