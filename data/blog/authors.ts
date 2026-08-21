import type { BlogAuthor } from '@/types/blog';

/**
 * Centralized author registry.
 * Each author has localized bios for SEO keyword relevance per language.
 */
export const AUTHORS: Record<string, BlogAuthor> = {
  thomas: {
    id: 'thomas',
    name: 'Thomas',
    avatar: '/authors/thomas.webp',
    bios: {
      fr: "Créateur de Quiz Couple, Thomas, en couple depuis 4 ans, imagine des quiz, tests et jeux pour aider les couples à mieux se connaître, rire ensemble et partager de nouveaux moments.",
      en: "Creator of Quiz Couple, Thomas has been in a relationship for 4 years. He designs quizzes, tests and games to help couples get to know each other better, laugh together and share new moments.",
      es: "Creador de Quiz Couple, Thomas lleva 4 años en pareja. Idea quizzes, tests y juegos para ayudar a las parejas a conocerse mejor, reír juntas y compartir nuevos momentos.",
      de: "Thomas, der Gründer von Quiz Couple, ist seit 4 Jahren in einer Beziehung. Er entwickelt Quiz, Tests und Spiele, die Paaren helfen, sich besser kennenzulernen, gemeinsam zu lachen und Neues zu erleben.",
      it: "Creatore di Quiz Couple, Thomas è in coppia da 4 anni. Crea quiz, test e giochi per aiutare le coppie a conoscersi meglio, ridere insieme e condividere nuovi momenti.",
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
